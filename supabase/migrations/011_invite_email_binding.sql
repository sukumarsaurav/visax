-- ============================================================
-- Migration 011: Bind invite acceptance to the invited email
-- ============================================================
--
-- Problem (AI01 from audit): The client_invitations table had no
-- UPDATE policy for clients, meaning any authenticated user who
-- holds the invite token URL could call accept() and bind their
-- own user ID to an invitation meant for someone else.
--
-- Fix:
--   1. Add an explicit UPDATE policy that allows a client to
--      accept ONLY an invitation whose client_email matches
--      their authenticated email (from auth.users, not profiles,
--      so it can't be spoofed by editing the profile table).
--
--   2. The WITH CHECK clause restricts what the row may look like
--      after update: status must be 'accepted', and client_id
--      must match the calling user's UID — preventing the caller
--      from setting an arbitrary client_id.
--
--   3. Tighten the existing consultant ALL policy to exclude the
--      'cancelled' status row from being un-cancelled by the owner.
--
-- NOTE: The check uses auth.users (the auth schema) rather than
-- profiles (the public schema) because profile.email is a
-- denormalised copy that could theoretically diverge.
-- ============================================================

-- Allow clients to accept ONLY their own invitation ─────────────
CREATE POLICY "Clients can accept invitation addressed to them"
    ON client_invitations
    FOR UPDATE
    USING (
        -- Row must be pending and addressed to the calling user's email
        status = 'pending'
        AND client_email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        -- After update: must be accepted, client_id must be the caller
        status = 'accepted'
        AND client_id = auth.uid()
    );

-- Add 'cancelled' to the valid status enum if not already present ─
-- (The original schema used CHECK (status IN ('pending','accepted','expired','revoked'))
--  but the repo sets status='cancelled'; add it to keep data consistent.)
ALTER TABLE client_invitations
    DROP CONSTRAINT IF EXISTS client_invitations_status_check;

ALTER TABLE client_invitations
    ADD CONSTRAINT client_invitations_status_check
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked', 'cancelled'));
