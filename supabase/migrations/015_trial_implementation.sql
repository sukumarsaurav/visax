-- ============================================================
-- 015_trial_implementation.sql
--
-- Implement trial system for individual consultants.
-- - Individuals get 15-day free trial automatically on signup
-- - Agencies must pay immediately (no trial)
-- - Track trial dates and expiry in profiles table
-- - Email notifications at day 10 and day 15
-- ============================================================

-- ── 1. Add trial tracking columns to profiles ──────────────
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_expired BOOLEAN DEFAULT FALSE;

-- Index for efficient trial expiry queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at)
WHERE trial_ends_at IS NOT NULL AND trial_expired = FALSE;

-- ── 2. Function: auto-set trial on individual signup ──────
-- This is called by the application on successful signup
CREATE OR REPLACE FUNCTION set_trial_for_individual(p_profile_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profiles
    SET
        trial_starts_at = NOW(),
        trial_ends_at = NOW() + INTERVAL '15 days',
        trial_expired = FALSE
    WHERE id = p_profile_id
      AND role = 'individual';
END;
$$;

-- ── 3. Function: check if user's trial has expired ────────
CREATE OR REPLACE FUNCTION is_trial_expired(p_profile_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_trial_ends_at TIMESTAMPTZ;
BEGIN
    SELECT trial_ends_at INTO v_trial_ends_at
    FROM profiles WHERE id = p_profile_id;

    -- Trial expired if trial_ends_at exists and is in the past
    RETURN v_trial_ends_at IS NOT NULL AND v_trial_ends_at < NOW();
END;
$$;

-- ── 4. Function: days remaining in trial ──────────────────
CREATE OR REPLACE FUNCTION trial_days_remaining(p_profile_id UUID)
RETURNS INT LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_trial_ends_at TIMESTAMPTZ;
    v_days_remaining INT;
BEGIN
    SELECT trial_ends_at INTO v_trial_ends_at
    FROM profiles WHERE id = p_profile_id;

    IF v_trial_ends_at IS NULL THEN
        RETURN NULL;  -- No trial
    END IF;

    IF v_trial_ends_at < NOW() THEN
        RETURN 0;  -- Expired
    END IF;

    v_days_remaining := EXTRACT(DAY FROM (v_trial_ends_at - NOW()))::INT;
    RETURN GREATEST(v_days_remaining, 0);
END;
$$;

-- ── 5. Trigger: update trial_expired flag ─────────────────
CREATE OR REPLACE FUNCTION update_trial_expired_flag()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.trial_ends_at IS NOT NULL AND NEW.trial_ends_at < NOW() AND NEW.trial_expired = FALSE THEN
        NEW.trial_expired = TRUE;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_trial_expired ON profiles;
CREATE TRIGGER check_trial_expired
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_trial_expired_flag();

-- ── 6. Audit table for trial events ───────────────────────
CREATE TABLE IF NOT EXISTS trial_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'trial_started',
        'trial_day10_reminder_sent',
        'trial_day15_warning_sent',
        'trial_expired',
        'trial_converted_to_paid',
        'trial_manually_extended'
    )),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trial_events_profile_id ON trial_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_trial_events_created_at ON trial_events(created_at DESC);

-- ── 7. Procedure: mark trial as expired and log event ─────
CREATE OR REPLACE FUNCTION mark_trial_expired(p_profile_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profiles
    SET trial_expired = TRUE
    WHERE id = p_profile_id;

    INSERT INTO trial_events (profile_id, event_type)
    VALUES (p_profile_id, 'trial_expired');
END;
$$;

-- ── 8. Data: seed existing individual accounts with trials
-- (Only for individuals who don't already have trial dates)
UPDATE profiles
SET
    trial_starts_at = COALESCE(trial_starts_at, created_at),
    trial_ends_at = COALESCE(trial_ends_at, created_at + INTERVAL '15 days'),
    trial_expired = COALESCE(trial_expired, created_at + INTERVAL '15 days' < NOW())
WHERE role = 'individual'
  AND trial_starts_at IS NULL;

-- ── 9. Comments ───────────────────────────────────────────
COMMENT ON FUNCTION set_trial_for_individual IS 'Called by app after individual signup to initialize 15-day trial';
COMMENT ON FUNCTION is_trial_expired IS 'Check if profile trial has already expired';
COMMENT ON FUNCTION trial_days_remaining IS 'Calculate days left in trial (returns null if no trial, 0 if expired)';
COMMENT ON FUNCTION mark_trial_expired IS 'Mark trial as expired and log the event for audit';
COMMENT ON TABLE trial_events IS 'Audit log of trial events for analytics and debugging';
