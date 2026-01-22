-- COMPREHENSIVE AUTH & INFRASTRUCTURE REPAIR
-- Goal: Fix both Signup (Insert) and Login (Update/Select) issues.
-- Strategy: Remove all custom triggers, ensure tables exist, reset RLS.

-- 1. DROP ALL TRIGGERS ON auth.users (INSERT, UPDATE, DELETE)
-- This ensures no "zombie" logic blocks user login (which updates last_sign_in) or signup.
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_new_user on auth.users;
drop trigger if exists handle_new_user on auth.users;
drop trigger if exists on_auth_user_updated on auth.users; -- Potential update blocker
drop trigger if exists on_user_update on auth.users;

-- Drop related functions
drop function if exists public.handle_new_user();
drop function if exists public.handle_user_update();

-- 2. ENSURE CORE TABLES EXIST
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  username text,
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

-- Ensure Subscriptions Table Exists (Middleware depends on this!)
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  status text check (status in ('active', 'trial', 'expired', 'canceled')),
  plan_type text, -- 'pro', 'starter' etc.
  trial_end_date timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);


-- 3. RESET RLS POLICIES (OPEN ACCESS FOR OWNERS)

-- A. Profiles
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- B. Ledger Accounts
alter table public.ledger_accounts enable row level security;
drop policy if exists "Users can manage own accounts" on public.ledger_accounts; 
create policy "Users can manage own accounts" on public.ledger_accounts for all using (auth.uid() = user_id);

-- C. Subscriptions (CRITICAL FOR MIDDLEWARE)
alter table public.subscriptions enable row level security;
drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- 4. GRANT PERMISSIONS
grant all on all tables in schema public to postgres, service_role;
