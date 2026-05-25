-- ============================================================
-- 014_plan_limits.sql
-- Adds plan_id to profiles and enforces per-plan limits on
-- cases, client invitations, and agency team members at the
-- DB level (triggers). Client-side hook (usePlanLimits) shows
-- usage indicators and disables add buttons proactively.
-- ============================================================

-- ── 1. Column ────────────────────────────────────────────────
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'solo_basic'
    CHECK (plan_id IN (
        'solo_basic',
        'solo_pro',
        'agency_starter',
        'agency_growth',
        'agency_enterprise'
    ));

-- Seed reasonable defaults for existing rows.
-- Agency admins who already registered get agency_starter.
UPDATE profiles
SET plan_id = 'agency_starter'
WHERE role = 'agency_admin' AND plan_id = 'solo_basic';

-- ── 2. Helper: return limit values for a given plan ──────────
CREATE OR REPLACE FUNCTION get_plan_limits(p_plan_id TEXT)
RETURNS TABLE (max_cases INT, max_clients INT, max_members INT)
LANGUAGE plpgsql STABLE AS $$
BEGIN
    RETURN QUERY SELECT
        -- max_cases
        CASE p_plan_id
            WHEN 'solo_basic'        THEN 10
            WHEN 'solo_pro'          THEN 30
            WHEN 'agency_starter'    THEN 50
            WHEN 'agency_growth'     THEN 200
            WHEN 'agency_enterprise' THEN NULL::INT
            ELSE 10
        END,
        -- max_clients
        CASE p_plan_id
            WHEN 'solo_basic'        THEN 10
            WHEN 'solo_pro'          THEN 30
            WHEN 'agency_starter'    THEN 50
            WHEN 'agency_growth'     THEN 200
            WHEN 'agency_enterprise' THEN NULL::INT
            ELSE 10
        END,
        -- max_members (NULL = not applicable / unlimited)
        CASE p_plan_id
            WHEN 'solo_basic'        THEN NULL::INT
            WHEN 'solo_pro'          THEN NULL::INT
            WHEN 'agency_starter'    THEN 3
            WHEN 'agency_growth'     THEN 10
            WHEN 'agency_enterprise' THEN NULL::INT
            ELSE NULL::INT
        END;
END;
$$;

-- ── 3. Trigger: enforce case limit ───────────────────────────
CREATE OR REPLACE FUNCTION enforce_case_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_plan_id   TEXT;
    v_max_cases INT;
    v_cur_count BIGINT;
BEGIN
    IF NEW.consultant_id IS NULL THEN RETURN NEW; END IF;

    SELECT plan_id INTO v_plan_id
    FROM profiles WHERE id = NEW.consultant_id;

    SELECT max_cases INTO v_max_cases
    FROM get_plan_limits(v_plan_id);

    IF v_max_cases IS NULL THEN RETURN NEW; END IF;  -- unlimited

    SELECT COUNT(*) INTO v_cur_count
    FROM cases WHERE consultant_id = NEW.consultant_id;

    IF v_cur_count >= v_max_cases THEN
        RAISE EXCEPTION
            'Plan limit reached: your % plan allows up to % cases. Upgrade to add more.',
            v_plan_id, v_max_cases
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_case_limit ON cases;
CREATE TRIGGER check_case_limit
    BEFORE INSERT ON cases
    FOR EACH ROW EXECUTE FUNCTION enforce_case_limit();

-- ── 4. Trigger: enforce client-invitation limit ───────────────
CREATE OR REPLACE FUNCTION enforce_client_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_plan_id     TEXT;
    v_max_clients INT;
    v_cur_count   BIGINT;
BEGIN
    SELECT plan_id INTO v_plan_id
    FROM profiles WHERE id = NEW.consultant_id;

    SELECT max_clients INTO v_max_clients
    FROM get_plan_limits(v_plan_id);

    IF v_max_clients IS NULL THEN RETURN NEW; END IF;

    SELECT COUNT(*) INTO v_cur_count
    FROM client_invitations
    WHERE consultant_id = NEW.consultant_id
      AND status IN ('pending', 'accepted');

    IF v_cur_count >= v_max_clients THEN
        RAISE EXCEPTION
            'Plan limit reached: your % plan allows up to % clients. Upgrade to add more.',
            v_plan_id, v_max_clients
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_client_limit ON client_invitations;
CREATE TRIGGER check_client_limit
    BEFORE INSERT ON client_invitations
    FOR EACH ROW EXECUTE FUNCTION enforce_client_limit();

-- ── 5. Trigger: enforce agency-member limit ───────────────────
CREATE OR REPLACE FUNCTION enforce_member_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_owner_id    UUID;
    v_plan_id     TEXT;
    v_max_members INT;
    v_cur_count   BIGINT;
BEGIN
    SELECT owner_id INTO v_owner_id
    FROM agencies WHERE id = NEW.agency_id;

    IF v_owner_id IS NULL THEN RETURN NEW; END IF;

    SELECT plan_id INTO v_plan_id
    FROM profiles WHERE id = v_owner_id;

    SELECT max_members INTO v_max_members
    FROM get_plan_limits(v_plan_id);

    IF v_max_members IS NULL THEN RETURN NEW; END IF;

    SELECT COUNT(*) INTO v_cur_count
    FROM agency_members
    WHERE agency_id = NEW.agency_id
      AND status != 'inactive';

    IF v_cur_count >= v_max_members THEN
        RAISE EXCEPTION
            'Plan limit reached: your % plan allows up to % team members. Upgrade to add more.',
            v_plan_id, v_max_members
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_member_limit ON agency_members;
CREATE TRIGGER check_member_limit
    BEFORE INSERT ON agency_members
    FOR EACH ROW EXECUTE FUNCTION enforce_member_limit();
