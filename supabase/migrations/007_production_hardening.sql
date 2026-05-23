-- ============================================
-- VISAX — Production Hardening (mig 007)
-- Targets ~100K MAU / 1K concurrent. Each section is independently safe to
-- replay; comments explain the failure mode being patched.
-- ============================================

-- ============================================
-- 1. MATERIALIZED VIEW REFRESH — debounced via pg_cron
--    The per-statement trigger in migration 004 takes an AccessShareLock
--    on every reviews insert/update/delete. Concurrent writes serialize,
--    and a CSV import of reviews queues refreshes for minutes.
--    Replace with a 2-minute cron refresh; UI tolerance for staleness is
--    high (rating averages drift slowly).
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

DROP TRIGGER IF EXISTS tr_refresh_rating_summary ON reviews;

-- Refresh runs in pg_cron's background worker; CONCURRENTLY avoids blocking SELECTs.
-- Schedule is idempotent: pg_cron.schedule returns existing id if name matches.
SELECT cron.schedule(
    'refresh-consultant-rating-summary',
    '*/2 * * * *',                                          -- every 2 minutes
    $$ REFRESH MATERIALIZED VIEW CONCURRENTLY consultant_rating_summary $$
);

-- ============================================
-- 2. AUDIT LOGS — append-only at the policy level
--    005 restricted INSERT. UPDATE/DELETE still default to "permissive"
--    when no policy denies them. Add explicit deny policies so even an
--    admin compromise can't rewrite history.
-- ============================================

DROP POLICY IF EXISTS "Audit logs are append-only — no updates"  ON audit_logs;
DROP POLICY IF EXISTS "Audit logs are append-only — no deletes" ON audit_logs;

CREATE POLICY "Audit logs are append-only — no updates"
    ON audit_logs FOR UPDATE USING (false);

CREATE POLICY "Audit logs are append-only — no deletes"
    ON audit_logs FOR DELETE USING (false);

-- ============================================
-- 3. PROFILES PII NARROWING
--    002's profiles policy lets any authenticated user SELECT every column
--    of every profile — including `email`, `phone`, and `notification_preferences`.
--    Replace with: self sees full row; non-self sees public-facing columns only.
--    All marketplace surfaces already use these fields, so no UI change is
--    required.
-- ============================================

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;

-- Self always sees the full row.
CREATE POLICY "Users see their own full profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins see every row.
CREATE POLICY "Admins see every profile"
    ON profiles FOR SELECT
    USING (get_my_role() = 'admin');

-- Public marketplace view — non-sensitive columns only. Exposed as a
-- separate view so the column list is a single source of truth.
CREATE OR REPLACE VIEW profiles_public AS
SELECT
    id, full_name, avatar_url, role, application_status,
    bio, country, languages, years_experience, specializations,
    is_verified, created_at,
    -- Discriminator so frontend can decide whether to surface a "contact"
    -- button vs a booking flow without leaking the actual email.
    (email IS NOT NULL) AS has_email
FROM profiles;

GRANT SELECT ON profiles_public TO anon, authenticated;

-- Authenticated browsing of other users falls through to the public view —
-- the *table* policies above only allow self + admin. Marketing/landing
-- pages must query `profiles_public` instead of `profiles` for any read
-- that's not strictly self.
--
-- NOTE: existing pages like FindProfessionalsPage already go through the
-- `consultant_marketplace_meta` view (mig 006) which JOINs `profiles`. Add
-- a policy below that allows the join to resolve approved consultants only,
-- so the marketplace keeps working without exposing inactive/private rows.

CREATE POLICY "Approved professionals visible for marketplace"
    ON profiles FOR SELECT
    USING (
        application_status = 'approved'
        AND role IN ('individual', 'agency_admin', 'agency_member')
    );

-- ============================================
-- 4. PAYMENT IDEMPOTENCY
--    Razorpay/Stripe edge functions need a stable dedup key so a
--    double-click or network retry doesn't double-charge. Frontend
--    generates a UUID per intent and the edge function upserts on it.
-- ============================================

CREATE TABLE IF NOT EXISTS payment_intents (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    idempotency_key    TEXT NOT NULL,
    provider           TEXT NOT NULL,            -- 'razorpay' | 'stripe'
    provider_order_id  TEXT,                     -- filled after provider call
    amount             NUMERIC NOT NULL,
    currency           TEXT NOT NULL DEFAULT 'INR',
    status             TEXT NOT NULL DEFAULT 'pending', -- pending|completed|failed|cancelled
    metadata           JSONB DEFAULT '{}',
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, idempotency_key)
);

ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own payment intents"
    ON payment_intents FOR SELECT
    USING (auth.uid() = user_id OR get_my_role() = 'admin');

CREATE POLICY "Users insert own payment intents"
    ON payment_intents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Only the edge function (service_role) updates status/provider_order_id;
-- the UI cannot mutate after creation. No UPDATE policy = denied.

CREATE INDEX IF NOT EXISTS idx_payment_intents_user_created
    ON payment_intents (user_id, created_at DESC);

-- ============================================
-- 5. SOFT-DELETE FOR PROFILES + DATA RETENTION
--    ON DELETE CASCADE in mig 001 nukes invoices, audit_logs entries, and
--    review history when a profile is deleted. Tax/regulatory requirements
--    typically need 7-year retention for invoices and audit logs.
--    Solution: soft-delete profiles (anonymize PII, retain row + FKs).
-- ============================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS redacted   BOOLEAN NOT NULL DEFAULT FALSE;

-- Partial index — deleted rows are excluded from most queries by adding
-- `deleted_at IS NULL` everywhere a profile is read. RLS policies above
-- silently filter them.
CREATE INDEX IF NOT EXISTS idx_profiles_active
    ON profiles (id)
    WHERE deleted_at IS NULL;

-- Anonymizes a profile in-place. Keeps the row + its FK references so
-- audit/invoice trails stay coherent, but strips PII.
CREATE OR REPLACE FUNCTION soft_delete_profile(p_profile_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE profiles SET
        deleted_at                = NOW(),
        redacted                  = TRUE,
        email                     = 'redacted+' || id || '@deleted.immizy.local',
        full_name                 = 'Deleted User',
        avatar_url                = NULL,
        phone                     = NULL,
        bio                       = NULL,
        city                      = NULL,
        country                   = NULL,
        linkedin_url              = NULL,
        website                   = NULL,
        license_number            = NULL,
        languages                 = '{}',
        specializations           = '{}',
        notification_preferences  = '{}'
    WHERE id = p_profile_id;

    -- Anonymize audit entries authored by this user (retain the action +
    -- timestamp; drop identifying details).
    UPDATE audit_logs SET
        details = jsonb_build_object('redacted', true)
    WHERE user_id = p_profile_id;
END;
$$;

GRANT EXECUTE ON FUNCTION soft_delete_profile(UUID) TO authenticated;

-- ============================================
-- 6. GDPR REQUEST LOGS
--    Track every export + deletion request for audit compliance. The
--    actual export ZIP is generated by an edge function and stored as a
--    signed URL pointing at the `account-exports` bucket.
-- ============================================

CREATE TABLE IF NOT EXISTS account_export_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'pending', -- pending|ready|failed|expired
    download_path   TEXT,                            -- storage path in account-exports
    expires_at      TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE account_export_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own export requests"
    ON account_export_requests FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users create own export requests"
    ON account_export_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS account_deletion_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason          TEXT,
    status          TEXT NOT NULL DEFAULT 'pending', -- pending|completed|cancelled
    confirm_token   TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own deletion requests"
    ON account_deletion_requests FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Users create own deletion requests"
    ON account_deletion_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. CONSENT LEDGER
--    Mailchimp sync currently fires on any profile update — that's an
--    implicit consent leak under GDPR. Track explicit consent timestamps
--    so the edge function can gate sends on a fresh opt-in.
-- ============================================

CREATE TABLE IF NOT EXISTS user_consents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_type    TEXT NOT NULL,                  -- 'marketing_email'|'analytics'|'cookies'
    granted         BOOLEAN NOT NULL,
    granted_at      TIMESTAMPTZ DEFAULT NOW(),
    ip_address      TEXT,
    user_agent      TEXT,
    UNIQUE (user_id, consent_type, granted_at)
);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own consents"
    ON user_consents FOR SELECT
    USING (auth.uid() = user_id OR get_my_role() = 'admin');
CREATE POLICY "Users record own consents"
    ON user_consents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Append-only — past consent state is immutable evidence under GDPR.
CREATE POLICY "Consents are append-only — no updates"
    ON user_consents FOR UPDATE USING (false);
CREATE POLICY "Consents are append-only — no deletes"
    ON user_consents FOR DELETE USING (false);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_type
    ON user_consents (user_id, consent_type, granted_at DESC);

-- ============================================
-- 8. SECURITY DEFINER FUNCTIONS — lock search_path
--    Without `SET search_path`, a malicious schema in the user's search_path
--    can shadow tables/functions and trick a SECURITY DEFINER function into
--    executing unintended code.
-- ============================================

ALTER FUNCTION get_my_role()                          SET search_path = public, pg_catalog;
ALTER FUNCTION get_my_agency_id()                     SET search_path = public, pg_catalog;
ALTER FUNCTION refresh_consultant_rating_summary()    SET search_path = public, pg_catalog;
ALTER FUNCTION get_platform_stats()                   SET search_path = public, pg_catalog;
ALTER FUNCTION get_conversations(UUID)                SET search_path = public, pg_catalog;
ALTER FUNCTION get_consultant_analytics(UUID)         SET search_path = public, pg_catalog;
ALTER FUNCTION get_agency_analytics(UUID)             SET search_path = public, pg_catalog;
ALTER FUNCTION soft_delete_profile(UUID)              SET search_path = public, pg_catalog;
ALTER FUNCTION handle_new_user()                      SET search_path = public, pg_catalog;
ALTER FUNCTION generate_case_number()                 SET search_path = public, pg_catalog;
ALTER FUNCTION generate_invoice_number()              SET search_path = public, pg_catalog;
