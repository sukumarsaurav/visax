-- ============================================================
-- Migration 009 — Robustness Safeguards
--
-- Pushes correctness rules into the database itself so that no
-- buggy client (or malicious user constructing direct Supabase
-- calls) can violate them. Application-layer checks are good UX,
-- but the database is the source of truth.
--
-- Contents:
--   1. payment_intents state machine     (CHECK + UPDATE policy)
--   2. appointments double-booking guard (exclusion / unique idx)
--   3. documents content hash for dedup  (sha256 column + index)
--   4. messages length cap & ban on self-msg (CHECK)
--   5. profiles bio length cap            (CHECK)
--   6. cleanup_stale_payment_intents()    (pg_cron job)
-- ============================================================

BEGIN;

-- ─── 1. payment_intents state machine ───────────────────────────────────────
-- Standardise on 'succeeded' (Stripe / Razorpay convention) — old rows still
-- using 'completed' get migrated first.

UPDATE payment_intents SET status = 'succeeded' WHERE status = 'completed';

-- Drop the existing implicit comment-only contract; enforce via CHECK.
ALTER TABLE payment_intents
    ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
    ADD COLUMN IF NOT EXISTS error_message       TEXT;

ALTER TABLE payment_intents DROP CONSTRAINT IF EXISTS payment_intents_status_chk;
ALTER TABLE payment_intents
    ADD CONSTRAINT payment_intents_status_chk
    CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled'));

-- Enforce the state machine via a trigger:
--   pending  → succeeded | failed | cancelled
--   succeeded → (terminal)
--   failed   → (terminal)
--   cancelled → (terminal)
CREATE OR REPLACE FUNCTION enforce_payment_intent_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;  -- no-op update
    END IF;

    IF OLD.status <> 'pending' THEN
        RAISE EXCEPTION 'payment_intent % is %, cannot transition to %',
            OLD.id, OLD.status, NEW.status
            USING ERRCODE = '40000';  -- 'transaction_rollback' family
    END IF;

    IF NEW.status NOT IN ('succeeded', 'failed', 'cancelled') THEN
        RAISE EXCEPTION 'invalid target status %', NEW.status;
    END IF;

    -- Always stamp updated_at on a transition.
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DROP TRIGGER IF EXISTS trg_payment_intent_transition ON payment_intents;
CREATE TRIGGER trg_payment_intent_transition
    BEFORE UPDATE OF status ON payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION enforce_payment_intent_transition();

-- Allow the OWNER to mark their own intent as cancelled OR failed
-- (covers modal-dismiss and payment.failed from Razorpay).
-- Only the edge function (service_role) can set 'succeeded' — that's the
-- one transition that authorises real value, so it must be server-verified.
DROP POLICY IF EXISTS "Users update own intent to terminal-non-success"
    ON payment_intents;

CREATE POLICY "Users update own intent to terminal-non-success"
    ON payment_intents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND status IN ('cancelled', 'failed')
    );


-- ─── 2. appointments double-booking guard ────────────────────────────────────
-- Two clients booking the same consultant at the same start time = nope.
-- We use a partial unique index (only on 'confirmed' / 'pending' bookings)
-- so cancelled appointments don't block a new booking on the same slot.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'appointments'
    ) THEN
        -- The exact column names depend on existing schema; we tolerate both
        -- 'scheduled_at' and 'start_time' variants.
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'appointments'
              AND column_name = 'scheduled_at'
        ) THEN
            -- Active = anything that holds the slot. The enum on this DB is
            -- (upcoming, completed, cancelled, no_show), so only 'upcoming'
            -- should block a new booking on the same slot.
            EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uniq_appointment_slot
                     ON appointments (consultant_id, scheduled_at)
                     WHERE status = ''upcoming''';
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'appointments'
              AND column_name = 'start_time'
        ) THEN
            EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uniq_appointment_slot
                     ON appointments (consultant_id, start_time)
                     WHERE status = ''upcoming''';
        END IF;
    END IF;
END $$;


-- ─── 3. documents content hash for dedup ─────────────────────────────────────
-- SHA-256 hex (64 chars). The client computes it and sends it on insert; the
-- index lets the UI dedup before a second upload happens.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'documents'
    ) THEN
        ALTER TABLE documents
            ADD COLUMN IF NOT EXISTS file_hash CHAR(64);

        CREATE INDEX IF NOT EXISTS idx_documents_owner_hash
            ON documents (uploaded_by, file_hash)
            WHERE file_hash IS NOT NULL;
    END IF;
END $$;


-- ─── 4. messages length + self-message guard ─────────────────────────────────

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_content_length_chk;
        ALTER TABLE messages
            ADD CONSTRAINT messages_content_length_chk
            CHECK (char_length(coalesce(content, '')) BETWEEN 1 AND 5000);

        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_no_self_chk;
        ALTER TABLE messages
            ADD CONSTRAINT messages_no_self_chk
            CHECK (sender_id <> recipient_id);
    END IF;
END $$;


-- ─── 5. profiles bio length cap ──────────────────────────────────────────────

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_bio_length_chk;
ALTER TABLE profiles
    ADD CONSTRAINT profiles_bio_length_chk
    CHECK (char_length(coalesce(bio, '')) <= 2000);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_name_length_chk;
ALTER TABLE profiles
    ADD CONSTRAINT profiles_name_length_chk
    CHECK (char_length(coalesce(full_name, '')) <= 100);


-- ─── 6. Cleanup of orphaned pending intents ──────────────────────────────────
-- Intents older than 30 minutes in 'pending' status are abandoned — neither
-- the user nor the webhook will ever come back for them. Mark them failed.

CREATE OR REPLACE FUNCTION cleanup_stale_payment_intents()
RETURNS INTEGER AS $$
DECLARE
    affected INTEGER;
BEGIN
    -- Bypass the transition trigger by setting updated_at directly via
    -- an ALTER statement is overkill; the trigger allows this transition
    -- (pending → failed) anyway.
    UPDATE payment_intents
       SET status = 'failed',
           error_message = COALESCE(error_message, 'auto_expired_after_30min'),
           updated_at = NOW()
     WHERE status = 'pending'
       AND created_at < NOW() - INTERVAL '30 minutes';
    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Schedule via pg_cron if available (will silently skip if extension missing).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.unschedule('cleanup-stale-payment-intents')
            WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stale-payment-intents');
        PERFORM cron.schedule(
            'cleanup-stale-payment-intents',
            '*/15 * * * *',
            $cron$ SELECT cleanup_stale_payment_intents(); $cron$
        );
    END IF;
END $$;

COMMIT;
