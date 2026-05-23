-- ============================================
-- VISAX - Aggregated RPC + view for analytics & marketplace meta
-- Eliminates two N+1 patterns:
--   1. AnalyticsPage fired get_consultant_analytics() once per agency member.
--   2. FindProfessionalsPage pulled the entire `services` table and the
--      entire `agency_members` table on every visit to build price/agency
--      lookup maps.
-- ============================================

-- ============================================
-- 1. get_agency_analytics(p_agency_id)
--    Returns agency-wide rollup totals plus a per-member breakdown — all
--    in a single round-trip. Replaces the parallel get_consultant_analytics
--    fan-out in AnalyticsPage.fetchAgencyStats.
-- ============================================

CREATE OR REPLACE FUNCTION get_agency_analytics(p_agency_id UUID)
RETURNS JSON LANGUAGE sql SECURITY DEFINER STABLE AS $$
    WITH member_rows AS (
        -- Owner row first so the JSON `members` array starts with the admin.
        SELECT
            a.owner_id          AS profile_id,
            'Agency Admin'      AS member_role,
            true                AS is_owner
        FROM agencies a
        WHERE a.id = p_agency_id
        UNION ALL
        SELECT
            am.profile_id,
            COALESCE(am.role, 'Member'),
            false
        FROM agency_members am
        WHERE am.agency_id = p_agency_id
          AND am.status    = 'active'
    ),
    enriched AS (
        SELECT
            m.profile_id,
            m.member_role,
            m.is_owner,
            p.full_name,
            p.avatar_url,
            (SELECT COUNT(*)::bigint FROM cases
                WHERE consultant_id = m.profile_id)              AS total_cases,
            (SELECT COUNT(*)::bigint FROM cases
                WHERE consultant_id = m.profile_id
                  AND status NOT IN ('approved','rejected','closed')
            )                                                    AS active_cases,
            (SELECT COUNT(*)::bigint FROM appointments
                WHERE consultant_id = m.profile_id)              AS total_appointments,
            (SELECT COUNT(*)::bigint FROM appointments
                WHERE consultant_id = m.profile_id
                  AND status = 'completed')                      AS completed_appointments,
            COALESCE((SELECT SUM(amount) FROM invoices
                WHERE consultant_id = m.profile_id
                  AND status = 'paid'), 0)                       AS total_revenue,
            COALESCE((SELECT SUM(amount) FROM invoices
                WHERE consultant_id = m.profile_id
                  AND status = 'pending'), 0)                    AS pending_revenue,
            (SELECT COUNT(*)::bigint FROM invoices
                WHERE consultant_id = m.profile_id)              AS total_invoices,
            (SELECT avg_rating FROM consultant_rating_summary
                WHERE consultant_id = m.profile_id)              AS avg_rating
        FROM member_rows m
        JOIN profiles p ON p.id = m.profile_id
    )
    SELECT json_build_object(
        'totals', json_build_object(
            'total_cases',            COALESCE(SUM(total_cases), 0),
            'active_cases',           COALESCE(SUM(active_cases), 0),
            'total_appointments',     COALESCE(SUM(total_appointments), 0),
            'completed_appointments', COALESCE(SUM(completed_appointments), 0),
            'total_revenue',          COALESCE(SUM(total_revenue), 0),
            'pending_revenue',        COALESCE(SUM(pending_revenue), 0),
            'total_invoices',         COALESCE(SUM(total_invoices), 0),
            'avg_rating',             ROUND(AVG(avg_rating)::NUMERIC, 2),
            -- Owner is counted separately by the frontend (`teamSize + 1`),
            -- so report only non-owner active members here.
            'team_size',              COUNT(*) FILTER (WHERE NOT is_owner)
        ),
        'members', COALESCE(
            json_agg(
                json_build_object(
                    'profile_id',             profile_id,
                    'role',                   member_role,
                    'profile', json_build_object(
                        'id',         profile_id,
                        'full_name',  full_name,
                        'avatar_url', avatar_url
                    ),
                    'total_cases',            total_cases,
                    'active_cases',           active_cases,
                    'total_appointments',     total_appointments,
                    'completed_appointments', completed_appointments,
                    'total_revenue',          total_revenue,
                    'avg_rating',             avg_rating
                )
                ORDER BY is_owner DESC, total_cases DESC
            ),
            '[]'::json
        )
    )
    FROM enriched;
$$;

GRANT EXECUTE ON FUNCTION get_agency_analytics(UUID) TO authenticated;


-- ============================================
-- 2. consultant_marketplace_meta view
--    One row per approved consultant with the meta the marketplace card
--    needs: avg rating, review count, min active service price, agency
--    membership info. Replaces three separate full-table reads on
--    FindProfessionalsPage (services / agencies / agency_members).
-- ============================================

CREATE OR REPLACE VIEW consultant_marketplace_meta AS
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
    -- Agency owned by this profile (for role = 'agency_admin')
    owned.id                              AS owned_agency_id,
    owned.name                            AS owned_agency_name,
    COALESCE(amc.member_count, 0)         AS owned_agency_member_count,
    -- Agency this profile is a member of (for role = 'agency_member')
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
