-- SCORCHED EARTH: DROP ALL TRIGGERS ON AUTH.USERS
-- This script dynamically finds and drops EVERY trigger on the auth.users table.
-- Use this to clear any "zombie" triggers that are causing "Database error saving new user".

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' 
          AND event_object_table = 'users'
    )
    LOOP
        RAISE NOTICE 'Dropping trigger: %', r.trigger_name;
        EXECUTE 'DROP TRIGGER IF EXISTS "' || r.trigger_name || '" ON auth.users';
    END LOOP;
END $$;
