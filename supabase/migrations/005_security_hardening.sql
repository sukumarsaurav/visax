-- ============================================
-- VISAX - Security Hardening
-- Tightens permissive RLS policies discovered in May 2026 audit.
-- Safe to apply on a live database (replaces policies in-place).
-- ============================================

-- ============================================
-- 1. AUDIT LOGS — restrict INSERT to own user_id
--    The previous "System insert audit logs" policy used
--    WITH CHECK (true), allowing any authenticated user to
--    forge audit entries claiming to be any other user.
--    Admins also need a path to write system-level entries
--    (e.g. user_id = NULL for unauthenticated events).
-- ============================================

DROP POLICY IF EXISTS "System insert audit logs" ON audit_logs;

CREATE POLICY "Users insert own audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR (user_id IS NULL AND get_my_role() = 'admin')
    );

-- ============================================
-- 2. PLATFORM SETTINGS — explicit public-read for the
--    handful of keys the public site needs (maintenance_mode,
--    integrations.analytics). The "Admins manage" FOR ALL
--    policy already restricts writes; this adds an anon read
--    path so the marketing site doesn't need a service-role
--    proxy for non-sensitive flags.
-- ============================================

-- Mark which platform_settings keys are public-readable.
ALTER TABLE platform_settings
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- Seed: maintenance_mode and a few integration flags are read pre-auth.
UPDATE platform_settings
SET is_public = TRUE
WHERE key IN ('maintenance_mode', 'integrations');

CREATE POLICY "Public settings readable by anon"
    ON platform_settings FOR SELECT
    USING (is_public = TRUE);

-- ============================================
-- 3. AGENCY_MEMBERS — add the index that get_my_agency_id()
--    falls back to when JWT claim is absent. Tiny win, but
--    free given the existing schema.
-- ============================================

CREATE INDEX IF NOT EXISTS idx_agency_members_profile_active
    ON agency_members(profile_id)
    WHERE status = 'active';

-- ============================================
-- NOTES
-- ============================================
-- After applying this migration:
--   1. Deploy the custom-claims edge function (supabase/functions/custom-claims).
--   2. Register it in Supabase Dashboard → Auth → Hooks → Customize Access Token.
--   3. Once registered, get_my_role() / get_my_agency_id() will use JWT claims
--      and skip the DB fallback entirely.
