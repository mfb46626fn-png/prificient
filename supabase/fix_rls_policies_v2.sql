-- FINAL SECURITY POLISH (FIXED)
-- Ensures that INSERT permissions are crystal clear.
-- Includes DROP statements to prevent "policy already exists" errors.

alter table public.ledger_accounts enable row level security;

-- Drop catch-all if exists
drop policy if exists "Users can manage own accounts" on public.ledger_accounts;

-- Drop specific policies if they exist (to allow recreating them)
drop policy if exists "Users can select own accounts" on public.ledger_accounts;
drop policy if exists "Users can insert own accounts" on public.ledger_accounts;
drop policy if exists "Users can update own accounts" on public.ledger_accounts;
drop policy if exists "Users can delete own accounts" on public.ledger_accounts;

-- Create EXPLICIT policies
create policy "Users can select own accounts" on public.ledger_accounts 
for select using (auth.uid() = user_id);

create policy "Users can insert own accounts" on public.ledger_accounts 
for insert with check (auth.uid() = user_id);

create policy "Users can update own accounts" on public.ledger_accounts 
for update using (auth.uid() = user_id);

create policy "Users can delete own accounts" on public.ledger_accounts 
for delete using (auth.uid() = user_id);

grant all on table public.ledger_accounts to postgres, service_role;
