-- 1. Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  is_onboarding_completed boolean default false,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create ledger_accounts table if it doesn't exist (dependencies)
create table if not exists public.ledger_accounts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    code text not null,
    name text not null,
    type text not null, -- ASSET, LIABILITY, REVENUE, EXPENSE, EQUITY
    normal_balance text not null, -- DEBIT, CREDIT
    created_at timestamp with time zone default timezone('utc'::text, now()),
    unique(user_id, code)
);

-- 3. Define the function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- A. Create Profile
  insert into public.profiles (id, full_name, is_onboarding_completed)
  values (new.id, new.raw_user_meta_data->>'full_name', false);

  -- B. Initialize Default Ledger Accounts (Safe Insert)
  -- 100 Kasa / Banka
  insert into public.ledger_accounts (user_id, code, name, type, normal_balance)
  values (new.id, '100', 'Kasa / Banka', 'ASSET', 'DEBIT')
  on conflict do nothing;

  -- 600 Yurt İçi Satışlar
  insert into public.ledger_accounts (user_id, code, name, type, normal_balance)
  values (new.id, '600', 'Yurt İçi Satışlar', 'REVENUE', 'CREDIT')
  on conflict do nothing;

  -- 760 Pazarlama Giderleri
  insert into public.ledger_accounts (user_id, code, name, type, normal_balance)
  values (new.id, '760', 'Pazarlama Giderleri', 'EXPENSE', 'DEBIT')
  on conflict do nothing;

  -- 770 Genel Yönetim Giderleri
  insert into public.ledger_accounts (user_id, code, name, type, normal_balance)
  values (new.id, '770', 'Genel Yönetim Giderleri', 'EXPENSE', 'DEBIT')
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- 4. Recreate the Trigger
-- First drop if exists to ensure clean slate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Grant permissions just in case
grant all on table public.profiles to postgres;
grant all on table public.profiles to service_role;
-- Allow authenticated users to insert/select their own profile if using RLS
-- (RLS Policies should be handled separately but ensuring basic access helps)
alter table public.profiles enable row level security;
