-- ============================================================
-- Migration 013: Server-side message rate limiting
-- ============================================================
--
-- Problem (F-MS01 from audit): The messages table has no server-side
-- guard against spam. A determined user can bypass client-side
-- useRateLimit by reloading the page or calling the API directly.
--
-- Fix:
--   A BEFORE INSERT trigger fn_check_message_rate() counts how many
--   messages the sender has inserted in the last 60 seconds. If the
--   count exceeds the threshold (30 messages/minute), the insert is
--   rejected with a SQLSTATE P0001 error.
--
--   The error propagates to the client via supabase-js and is surfaced
--   by the friendlyError helper as a readable message.
--
-- Limits chosen:
--   30 messages / 60 seconds  — generous enough for fast typists,
--   tight enough to prevent flooding. Adjust via the constant below.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION fn_check_message_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_count INTEGER;
    v_limit CONSTANT INTEGER := 30;   -- max messages per window
    v_window CONSTANT INTERVAL := '60 seconds';
BEGIN
    SELECT COUNT(*)
      INTO v_count
      FROM messages
     WHERE sender_id  = NEW.sender_id
       AND created_at > NOW() - v_window;

    IF v_count >= v_limit THEN
        RAISE EXCEPTION
            'Rate limit exceeded: you can send at most % messages per minute. '
            'Please wait before sending more.',
            v_limit
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_check_message_rate() IS
    'F-MS01: Prevents message flooding by rejecting inserts that exceed '
    '30 messages per 60-second window per sender. '
    'Error code P0001 propagates to the client via supabase-js.';

-- Attach only if the messages table exists (safe on fresh schemas).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name   = 'messages'
    ) THEN
        EXECUTE '
            DROP TRIGGER IF EXISTS trg_message_rate_limit ON messages;
            CREATE TRIGGER trg_message_rate_limit
                BEFORE INSERT ON messages
                FOR EACH ROW
                EXECUTE FUNCTION fn_check_message_rate();
        ';
    END IF;
END $$;

COMMIT;
