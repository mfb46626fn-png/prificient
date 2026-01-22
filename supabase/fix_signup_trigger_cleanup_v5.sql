-- FIX SIGNUP & PERMISSIONS V5 (FINAL CLEANUP & RESILIENCE)

-- 1. DROP ALL POSSIBLE PREVIOUS TRIGGERS (ZOMBIE KILLER)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_new_user on auth.users; -- Common alternative name
drop trigger if exists handle_new_user on auth.users; -- Common alternative name
-- If you have other custom triggers, this ensures we start clean.

-- 2. Ensure Tables Exist
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  is_onboarding_completed boolean default false,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.ledger_accounts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    code text not null,
    name text not null,
    type text not null, 
    normal_balance text not null, 
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure Unique Constraint
do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'ledger_accounts_user_id_code_key') then
        alter table public.ledger_accounts add constraint ledger_accounts_user_id_code_key unique (user_id, code);
    end if;
end $$;

-- 3. RESILIENT TRIGGER FUNCTION (EXCEPTION HANDLING)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Try to create profile, but NEVER fail the transaction block.
  begin
      insert into public.profiles (id, full_name, is_onboarding_completed)
      values (new.id, new.raw_user_meta_data->>'full_name', false)
      on conflict (id) do nothing;
  exception when others then
      -- Log error but do not stop user creation
      raise warning 'Profile creation failed for user %: %', new.id, SQLERRM;
  end;

  return new;
end;
$$ language plpgsql security definer;

-- 4. RECREATE TRIGGER
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. RLS POLICIES (DROP IF EXISTS FIRST)

-- PROFILES
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- LEDGER ACCOUNTS
alter table public.ledger_accounts enable row level security;
drop policy if exists "Users can output own accounts" on public.ledger_accounts;
create policy "Users can output own accounts" on public.ledger_accounts for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own accounts" on public.ledger_accounts;
create policy "Users can insert own accounts" on public.ledger_accounts for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own accounts" on public.ledger_accounts;
create policy "Users can update own accounts" on public.ledger_accounts for update using (auth.uid() = user_id);

-- LEDGER ENTRIES
create table if not exists public.ledger_entries (id uuid default gen_random_uuid() primary key);
alter table public.ledger_entries enable row level security;
drop policy if exists "Users can view own entries" on public.ledger_entries;
create policy "Users can view own entries" on public.ledger_entries for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own entries" on public.ledger_entries;
create policy "Users can insert own entries" on public.ledger_entries for insert with check (auth.uid() = user_id);

-- LEDGER TRANSACTIONS
create table if not exists public.ledger_transactions (id uuid default gen_random_uuid() primary key);
alter table public.ledger_transactions enable row level security;
drop policy if exists "Users can view own transactions" on public.ledger_transactions;
create policy "Users can view own transactions" on public.ledger_transactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own transactions" on public.ledger_transactions;
create policy "Users can insert own transactions" on public.ledger_transactions for insert with check (auth.uid() = user_id);

-- 6. Grant Permissions
grant all on all tables in schema public to postgres, service_role;
