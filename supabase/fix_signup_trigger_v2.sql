-- 1. Ensure Profile Table Exists
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  is_onboarding_completed boolean default false,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Ensure Ledger Accounts Table Exists
create table if not exists public.ledger_accounts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    code text not null,
    name text not null,
    type text not null, 
    normal_balance text not null, 
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. CRITICAL: Ensure Unique Constraint Exists for (user_id, code)
-- This is required for valid ON CONFLICT behavior
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'ledger_accounts_user_id_code_key'
    ) then
        alter table public.ledger_accounts add constraint ledger_accounts_user_id_code_key unique (user_id, code);
    end if;
end $$;

-- 4. Replace the Trigger Function with CORRECT SYNTAX
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- A. Create Profile
  insert into public.profiles (id, full_name, is_onboarding_completed)
  values (new.id, new.raw_user_meta_data->>'full_name', false)
  on conflict (id) do nothing; -- Safe guard

  -- B. Initialize Default Ledger Accounts
  -- Now using explicit conflict target (user_id, code) matches the constraint above
  
  -- 100
  insert into public.ledger_accounts (user_id, code, name, type, normal_balance)
  values (new.id, '100', 'Kasa / Banka', 'ASSET', 'DEBIT')
  on conflict (user_id, code) do nothing;

  -- 600
  insert into public.ledger_accounts (user_id, code, name, type, normal_balance)
  values (new.id, '600', 'Yurt İçi Satışlar', 'REVENUE', 'CREDIT')
  on conflict (user_id, code) do nothing;

  -- 760
  insert into public.ledger_accounts (user_id, code, name, type, normal_balance)
  values (new.id, '760', 'Pazarlama Giderleri', 'EXPENSE', 'DEBIT')
  on conflict (user_id, code) do nothing;

  -- 770
  insert into public.ledger_accounts (user_id, code, name, type, normal_balance)
  values (new.id, '770', 'Genel Yönetim Giderleri', 'EXPENSE', 'DEBIT')
  on conflict (user_id, code) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- 5. Recreate the Trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Permissions
grant all on table public.profiles to postgres;
grant all on table public.profiles to service_role;
alter table public.profiles enable row level security;
