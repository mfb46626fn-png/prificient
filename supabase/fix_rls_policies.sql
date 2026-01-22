-- FINAL SECURITY POLISH: EXPLICIT RLS
-- Ensures that INSERT permissions are crystal clear for ledger_accounts.

-- 1. Ledger Accounts
alter table public.ledger_accounts enable row level security;

-- Drop previous "catch-all"
drop policy if exists "Users can manage own accounts" on public.ledger_accounts;

-- Create explicit policies
create policy "Users can select own accounts" on public.ledger_accounts 
for select using (auth.uid() = user_id);

create policy "Users can insert own accounts" on public.ledger_accounts 
for insert with check (auth.uid() = user_id);

create policy "Users can update own accounts" on public.ledger_accounts 
for update using (auth.uid() = user_id);

create policy "Users can delete own accounts" on public.ledger_accounts 
for delete using (auth.uid() = user_id);

-- 2. Grant Permissions (Just to be sure)
grant all on table public.ledger_accounts to postgres, service_role;
