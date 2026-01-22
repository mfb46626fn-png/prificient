-- DIAGNOSTIC: CHECK FOR ACTIVE TRIGGERS
-- Use this to see if any unexpected triggers are still attached to auth.users

select 
    event_object_schema as schema_name,
    event_object_table as table_name,
    trigger_schema,
    trigger_name,
    event_manipulation as event,
    action_timing as timing,
    action_statement as definition
from information_schema.triggers
where event_object_table = 'users'
  and event_object_schema = 'auth';
