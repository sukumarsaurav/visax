-- ============================================================
-- Migration 010 — Security Hotfix
--
-- Surfaced by `get_advisors` after migrations 006/007/009 landed.
-- Three real issues, plus a long tail of "SECURITY DEFINER function
-- callable by anon/authenticated" warnings that we narrow correctly.
--
-- CRITICAL:
--   1. `profiles_public` was created as SECURITY DEFINER — bypasses RLS,
--      so ANY user querying the view sees every profile's columns even
--      after the PII narrowing in 007. Recreate with SECURITY INVOKER.
--   2. `consultant_marketplace_meta` same issue.
--   3. `soft_delete_profile(p_profile_id UUID)` accepts ANY UUID — an
--      authenticated user could pass another user's id and wipe their
--      account. Add an auth.uid() guard so only the owner (or admin) can
--      invoke it.
--
-- HARDENING:
--   4. Revoke EXECUTE from anon/authenticated on internal-only functions:
--      • enforce_payment_intent_transition() — trigger only
--      • cleanup_stale_payment_intents() — pg_cron only
--   5. Restrict get_agency_analytics() / get_consultant_analytics() to
--      authenticated only (anon should never call them).
--   6. Lock search_path on update_updated_at_column().
-- ============================================================

BEGIN;

-- ── 1 & 2. Recreate views as SECURITY INVOKER ───────────────────────────────
-- DROP + CREATE so the new options stick; CASCADE captures any downstream
-- objects that might depend on the old definition (none expected, but safe).

DROP VIEW IF EXISTS profiles_public CASCADE;
CREATE VIEW profiles_public
WITH (security_invoker = true) AS
SELECT
    id, full_name, avatar_url, role, application_status,
    bio, country, languages, years_experience, specializations,
    is_verified, created_at,
    (email IS NOT NULL) AS has_email
FROM profiles;

GRANT SELECT ON profiles_public TO anon, authenticated;

DROP VIEW IF EXISTS consultant_marketplace_meta CASCADE;
CREATE VIEW consultant_marketplace_meta
WITH (security_invoker = true) AS
WITH service_min_price AS (
    SELECT provider_id, MIN(price) AS min_price
    FROM services
    WHERE is_active = true AND price IS NOT NULL
    GROUP BY provider_id
),
agency_member_counts AS (
    SELECT agency_id, COUNT(*)::INTEGER AS member_count
    FROM agency_members
    WHERE status = 'active'
    GROUP BY agency_id
),
member_to_agency AS (
    SELECT
        am.profile_id,
        am.agency_id,
        ag.name AS agency_name
    FROM agency_members am
    JOIN agencies ag ON ag.id = am.agency_id
    WHERE am.status = 'active'
)
SELECT
    p.id                                  AS consultant_id,
    p.role,
    rs.avg_rating,
    rs.review_count,
    smp.min_price,
    owned.id                              AS owned_agency_id,
    owned.name                            AS owned_agency_name,
    COALESCE(amc.member_count, 0)         AS owned_agency_member_count,
    mta.agency_id                         AS member_agency_id,
    mta.agency_name                       AS member_agency_name
FROM profiles p
LEFT JOIN consultant_rating_summary rs ON rs.consultant_id = p.id
LEFT JOIN service_min_price         smp ON smp.provider_id = p.id
LEFT JOIN agencies                  owned ON owned.owner_id = p.id
LEFT JOIN agency_member_counts      amc   ON amc.agency_id  = owned.id
LEFT JOIN member_to_agency          mta   ON mta.profile_id = p.id
WHERE p.application_status = 'approved'
  AND p.role IN ('individual', 'agency_admin', 'agency_member');

GRANT SELECT ON consultant_marketplace_meta TO anon, authenticated;


-- ── 3. soft_delete_profile auth guard ───────────────────────────────────────
-- The previous version had IDOR — a logged-in user could pass any UUID and
-- wipe another user's account. Now requires auth.uid() = p_profile_id OR admin.

CREATE OR REPLACE FUNCTION soft_delete_profile(p_profile_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
DECLARE
    caller_role TEXT;
BEGIN
    -- Caller must be either the owner or an admin.
    SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
    END IF;
    IF auth.uid() <> p_profile_id AND COALESCE(caller_role, '') <> 'admin' THEN
        RAISE EXCEPTION 'forbidden: can only soft-delete your own profile' USING ERRCODE = '42501';
    END IF;

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

    UPDATE audit_logs SET
        details = jsonb_build_object('redacted', true)
    WHERE user_id = p_profile_id;
END;
$$;

-- Only authenticated users can call; anon must never delete profiles.
REVOKE ALL ON FUNCTION soft_delete_profile(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION soft_delete_profile(UUID) TO authenticated;


-- ── 4. Lock down internal-only SECURITY DEFINER functions ───────────────────
-- These should NEVER be reachable via PostgREST. enforce_payment_intent_transition
-- is a trigger function; cleanup_stale_payment_intents is for pg_cron only.

REVOKE ALL ON FUNCTION enforce_payment_intent_transition() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION cleanup_stale_payment_intents()     FROM PUBLIC, anon, authenticated;

-- handle_new_user is wired as an auth.users trigger — also internal.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;
    END IF;
END $$;

-- refresh_consultant_rating_summary now runs via pg_cron — revoke direct exec.
REVOKE ALL ON FUNCTION refresh_consultant_rating_summary() FROM PUBLIC, anon, authenticated;


-- ── 5. Narrow analytics RPCs to authenticated only ──────────────────────────
-- Anon should never see agency/consultant analytics.

REVOKE ALL ON FUNCTION get_agency_analytics(UUID)     FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_agency_analytics(UUID)  TO authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_consultant_analytics') THEN
        REVOKE ALL ON FUNCTION get_consultant_analytics(UUID) FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION get_consultant_analytics(UUID) TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_invoice_stats') THEN
        REVOKE ALL ON FUNCTION get_invoice_stats() FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION get_invoice_stats() TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_admin_dashboard_stats') THEN
        REVOKE ALL ON FUNCTION get_admin_dashboard_stats() FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_configured_integration_providers') THEN
        REVOKE ALL ON FUNCTION get_configured_integration_providers() FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION get_configured_integration_providers() TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'upsert_integration_secret') THEN
        REVOKE ALL ON FUNCTION upsert_integration_secret(text, jsonb) FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION upsert_integration_secret(text, jsonb) TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_audit_event') THEN
        REVOKE ALL ON FUNCTION log_audit_event(text, text, uuid, jsonb) FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION log_audit_event(text, text, uuid, jsonb) TO authenticated;
    END IF;
END $$;


-- ── 6. Lock search_path on update_updated_at_column ─────────────────────────

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        EXECUTE 'ALTER FUNCTION update_updated_at_column() SET search_path = public, pg_catalog';
    END IF;
END $$;

COMMIT;