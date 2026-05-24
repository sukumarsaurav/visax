-- ============================================================
-- Migration 012: Prevent removing the last platform administrator
-- ============================================================
--
-- Problem (F-UM02 from audit): An admin could demote themselves
-- (or another admin) to a non-admin role, leaving zero admins on
-- the platform. Recovery requires direct DB access (Supabase Studio).
--
-- Fix:
--   1. A BEFORE UPDATE trigger on the profiles table checks whether
--      a role change would remove the last remaining admin.
--   2. If the update would leave 0 admins, it raises an EXCEPTION
--      which propagates to the client as a Postgres error (code P0001).
--   3. Handled in UserManagementPage.jsx — the friendlyError helper
--      maps the Postgres error to a readable message.
--
-- Scope: platform-level admin role only ('admin' value in profiles.role).
-- Agency admin roles (agency_admin) are separate and not constrained here.
-- ============================================================

-- ── Trigger function ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_prevent_last_admin_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only fires when role is changing AWAY from 'admin'
    IF OLD.role = 'admin' AND NEW.role IS DISTINCT FROM 'admin' THEN
        -- Count remaining admins excluding this row
        IF (
            SELECT COUNT(*)
            FROM profiles
            WHERE role = 'admin'
              AND id <> OLD.id
        ) = 0 THEN
            RAISE EXCEPTION
                'Cannot remove the last platform administrator. '
                'Assign another admin first, then demote this account.'
                USING ERRCODE = 'P0001';
        END IF;
    END IF;

    -- Also block suspending the last admin (application_status changes)
    IF OLD.role = 'admin'
       AND OLD.application_status <> 'suspended'
       AND NEW.application_status = 'suspended'
    THEN
        IF (
            SELECT COUNT(*)
            FROM profiles
            WHERE role = 'admin'
              AND application_status <> 'suspended'
              AND id <> OLD.id
        ) = 0 THEN
            RAISE EXCEPTION
                'Cannot suspend the last active platform administrator. '
                'Promote or unsuspend another admin first.'
                USING ERRCODE = 'P0001';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ── Attach trigger to profiles table ─────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_prevent_last_admin_removal ON profiles;

CREATE TRIGGER trg_prevent_last_admin_removal
    BEFORE UPDATE OF role, application_status
    ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_last_admin_removal();

-- ── Comment for maintainers ───────────────────────────────────────────────────
COMMENT ON FUNCTION fn_prevent_last_admin_removal() IS
    'Prevents the platform from being left without a platform-level admin. '
    'Fires before UPDATE on profiles when role or application_status changes.';
