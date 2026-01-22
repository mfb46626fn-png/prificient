-- MASTER RESET SCRIPT
-- 1. Updates Roles (Info=Admin, Mcakar31=User)
-- 2. Wipes ALL Application Data (Ledger, Support, etc.) for a clean slate.
-- 3. Deletes ALL Users except the whitelist.

-- A. UPDATE ROLES
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{role}', '"prificient_admin"'),
  raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"prificient_admin"')
WHERE email ILIKE 'info@prificient.com';

UPDATE auth.users
SET 
  raw_app_meta_data = raw_app_meta_data - 'role',
  raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email ILIKE 'mcakar31@icloud.com';


-- B. WIPE APPLICATION DATA (Order matters for Foreign Keys!)

-- 1. Financials (Deepest dependencies)
DELETE FROM public.ledger_entries;      -- Depends on Transactions and Accounts
DELETE FROM public.ledger_transactions; -- Depends on Users (and sometimes Accounts?)
DELETE FROM public.ledger_accounts;     -- Depends on Users

-- delete 'financial_event_log' if exists? (Skipping as logic implies standard tables only, but adding check/delete if valid SQL)
-- DELETE FROM public.financial_event_log;

-- 2. Support System
DELETE FROM public.support_messages;
DELETE FROM public.support_tickets;

-- 3. Announcements
DELETE FROM public.system_announcements;

-- 4. User Specifics
DELETE FROM public.subscriptions;
DELETE FROM public.notifications;
DELETE FROM public.ai_chat_history;
-- DELETE FROM public.profiles; -- Usually cascades from auth.users, but good to clean if RLS permits.


-- C. DELETE UNWANTED USERS
DELETE FROM auth.users 
WHERE email NOT ILIKE 'mcakar31@icloud.com' 
AND email NOT ILIKE 'info@prificient.com';


SELECT 'System Reset Complete. Roles Updated. All Data Wiped. Users Cleaned.' as status;
