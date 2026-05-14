-- ============================================
-- VISAX - Production Optimizations (matches live DB)
-- Applied via Supabase MCP: migrations 20260514040818–20260514040919
-- Target: 1000+ concurrent users
-- ============================================

-- ============================================
-- 1. JWT-CACHED RLS HELPER FUNCTIONS
--    Per-row DB sub-queries in RLS policies are
--    catastrophic at scale. Cache role/agency_id
--    from JWT app_metadata (set via Supabase Auth Hook).
-- ============================================

-- Replaces any earlier get_my_role() / get_my_agency_id() definitions.
-- The functions are already created in 002_rls_policies.sql;
-- this section documents that they were optimized here.

-- To eliminate all DB fallbacks, configure a Supabase Auth Hook (Edge Function)
-- that sets app_metadata.user_role and app_metadata.agency_id on login.

-- ============================================
-- 2. COMPOSITE AND PARTIAL INDEXES
--    27 indexes targeting the hottest query patterns.
-- ============================================

-- cases
CREATE INDEX IF NOT EXISTS idx_cases_consultant_status   ON cases(consultant_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_client_status       ON cases(client_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_consultant_created  ON cases(consultant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_client_created      ON cases(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_agency_id           ON cases(agency_id);

-- Partial: active cases only (excludes terminal statuses — smaller index)
CREATE INDEX IF NOT EXISTS idx_cases_active
    ON cases(consultant_id, updated_at DESC)
    WHERE status <> ALL (ARRAY['approved'::case_status, 'rejected'::case_status, 'closed'::case_status]);

-- appointments
CREATE INDEX IF NOT EXISTS idx_appointments_consultant_scheduled ON appointments(consultant_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_consultant_status    ON appointments(consultant_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_status        ON appointments(client_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at         ON appointments(scheduled_at);

-- invoices
CREATE INDEX IF NOT EXISTS idx_invoices_consultant_status  ON invoices(consultant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_status      ON invoices(client_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_consultant_created ON invoices(consultant_id, created_at DESC);

-- Partial: pending invoices (due-date chasing)
CREATE INDEX IF NOT EXISTS idx_invoices_pending
    ON invoices(consultant_id, due_date)
    WHERE status = 'pending'::invoice_status;

-- messages (direct sender/recipient — no conversations table)
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created ON messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created    ON messages(sender_id, created_at DESC);

-- Partial: unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread
    ON messages(recipient_id, created_at DESC)
    WHERE is_read = false;

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);

-- Partial: unread notifications (badge count hot path)
CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON notifications(user_id, created_at DESC)
    WHERE is_read = false;

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_consultant_rating ON reviews(consultant_id, rating);

-- agency_members
CREATE INDEX IF NOT EXISTS idx_agency_members_agency_status  ON agency_members(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_agency_members_profile_status ON agency_members(profile_id, status);

-- Partial: active agency members
CREATE INDEX IF NOT EXISTS idx_agency_members_active
    ON agency_members(agency_id, profile_id)
    WHERE status = 'active'::member_status;

-- profiles (marketplace search)
CREATE INDEX IF NOT EXISTS idx_profiles_role_app_status ON profiles(role, application_status);

-- case_activities
CREATE INDEX IF NOT EXISTS idx_case_activities_case_created ON case_activities(case_id, created_at DESC);

-- services
-- Partial: active services (marketplace default filter)
CREATE INDEX IF NOT EXISTS idx_services_active_provider
    ON services(provider_id)
    WHERE is_active = true;

-- promotions
-- Partial: active promotions
CREATE INDEX IF NOT EXISTS idx_promotions_active
    ON promotions(expires_at)
    WHERE status = 'active';

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

-- consultant_availability
CREATE INDEX IF NOT EXISTS idx_consultant_availability_consultant_active
    ON consultant_availability(consultant_id, is_active);

-- ============================================
-- 3. TRIGRAM FULL-TEXT SEARCH INDEXES
--    ILIKE without a leading anchor forces seq scans.
--    GIN trigram indexes support arbitrary substring search.
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm ON profiles USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_bio_trgm        ON profiles USING gin(bio gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_title_trgm      ON services  USING gin(title gin_trgm_ops);

-- ============================================
-- 4. MATERIALIZED VIEW: consultant_rating_summary
--    Eliminates full reviews table scans on every
--    page load (FindProfessionals, HomePage, Compare).
--    Unique index on consultant_id enables CONCURRENTLY refresh.
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS consultant_rating_summary AS
SELECT
    consultant_id,
    COUNT(*)::INTEGER                  AS review_count,
    ROUND(AVG(rating)::NUMERIC, 2)     AS avg_rating,
    MIN(rating)                        AS min_rating,
    MAX(rating)                        AS max_rating
FROM reviews
WHERE consultant_id IS NOT NULL
GROUP BY consultant_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_consultant_rating_summary_consultant
    ON consultant_rating_summary(consultant_id);

-- Auto-refresh: fires AFTER INSERT/UPDATE/DELETE on reviews (per statement)
CREATE OR REPLACE FUNCTION refresh_consultant_rating_summary()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY consultant_rating_summary;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_refresh_rating_summary ON reviews;
CREATE TRIGGER tr_refresh_rating_summary
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_consultant_rating_summary();

-- Grant read access to authenticated and anon roles
GRANT SELECT ON consultant_rating_summary TO anon, authenticated;

-- ============================================
-- 5. RPC FUNCTIONS
--    Pre-aggregated server-side functions replace
--    loading large datasets into JS memory.
-- ============================================

-- get_platform_stats() — replaces full reviews scan on HomePage
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT json_build_object(
        'consultant_count', (
            SELECT COUNT(*) FROM profiles
            WHERE role IN ('individual', 'agency_admin', 'agency_member')
              AND application_status = 'approved'
        ),
        'total_reviews', (SELECT COUNT(*) FROM reviews),
        'avg_rating',    (SELECT ROUND(AVG(rating)::NUMERIC, 1) FROM reviews),
        'total_cases',   (SELECT COUNT(*) FROM cases)
    );
$$;

-- get_conversations(p_user_id) — replaces fetching all messages and grouping in JS
CREATE OR REPLACE FUNCTION get_conversations(p_user_id UUID)
RETURNS TABLE (
    other_user_id   UUID,
    other_name      TEXT,
    other_avatar    TEXT,
    last_message    TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count    BIGINT
) LANGUAGE sql SECURITY DEFINER STABLE AS $$
    WITH latest AS (
        SELECT DISTINCT ON (
            CASE WHEN sender_id = p_user_id THEN recipient_id ELSE sender_id END
        )
            CASE WHEN sender_id = p_user_id THEN recipient_id ELSE sender_id END AS other_id,
            content,
            created_at,
            is_read,
            sender_id
        FROM messages
        WHERE sender_id = p_user_id OR recipient_id = p_user_id
        ORDER BY
            CASE WHEN sender_id = p_user_id THEN recipient_id ELSE sender_id END,
            created_at DESC
    ),
    unread AS (
        SELECT sender_id AS other_id, COUNT(*) AS cnt
        FROM messages
        WHERE recipient_id = p_user_id AND is_read = false
        GROUP BY sender_id
    )
    SELECT
        l.other_id              AS other_user_id,
        p.full_name             AS other_name,
        p.avatar_url            AS other_avatar,
        l.content               AS last_message,
        l.created_at            AS last_message_at,
        COALESCE(u.cnt, 0)      AS unread_count
    FROM latest l
    JOIN profiles p ON p.id = l.other_id
    LEFT JOIN unread u ON u.other_id = l.other_id
    ORDER BY l.created_at DESC;
$$;

-- get_consultant_analytics(p_consultant_id) — all KPIs in one DB round-trip
CREATE OR REPLACE FUNCTION get_consultant_analytics(p_consultant_id UUID)
RETURNS JSON LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT json_build_object(
        'total_cases',            (SELECT COUNT(*) FROM cases WHERE consultant_id = p_consultant_id),
        'active_cases',           (SELECT COUNT(*) FROM cases WHERE consultant_id = p_consultant_id
                                       AND status NOT IN ('approved','rejected','closed')),
        'total_appointments',     (SELECT COUNT(*) FROM appointments WHERE consultant_id = p_consultant_id),
        'completed_appointments', (SELECT COUNT(*) FROM appointments WHERE consultant_id = p_consultant_id
                                       AND status = 'completed'),
        'total_revenue',          COALESCE((SELECT SUM(amount) FROM invoices
                                       WHERE consultant_id = p_consultant_id AND status = 'paid'), 0),
        'pending_revenue',        COALESCE((SELECT SUM(amount) FROM invoices
                                       WHERE consultant_id = p_consultant_id AND status = 'pending'), 0),
        'total_invoices',         (SELECT COUNT(*) FROM invoices WHERE consultant_id = p_consultant_id),
        'avg_rating',             (SELECT avg_rating FROM consultant_rating_summary
                                       WHERE consultant_id = p_consultant_id)
    );
$$;

GRANT EXECUTE ON FUNCTION get_platform_stats()               TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_conversations(UUID)            TO authenticated;
GRANT EXECUTE ON FUNCTION get_consultant_analytics(UUID)     TO authenticated;

-- ============================================
-- USAGE NOTES
-- ============================================
-- Frontend patterns to use with these optimizations:
--
-- HomePage stats:
--   supabase.rpc('get_platform_stats')
--
-- Ratings on any list page:
--   supabase.from('consultant_rating_summary')
--     .select('consultant_id, avg_rating, review_count')
--     .in('consultant_id', ids)
--
-- Message conversations:
--   supabase.rpc('get_conversations', { p_user_id: user.id })
--
-- Consultant analytics dashboard:
--   supabase.rpc('get_consultant_analytics', { p_consultant_id: profile.id })
