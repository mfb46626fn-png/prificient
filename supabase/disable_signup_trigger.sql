-- DISABLE SIGNUP TRIGGER (Architecture Shift)
-- Reason: The database trigger 'handle_new_user' is causing relentless 'Database error saving new user' errors.
-- Solution: We are moving ALL initialization logic (Profile & Ledger) to the Application Layer (Dashboard).
-- Action: This script deletes the trigger and function entirely.

-- 1. Drop Triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_new_user on auth.users;
drop trigger if exists handle_new_user on auth.users;

-- 2. Drop Function
drop function if exists public.handle_new_user();

-- 3. Verify Profiles Table Exists (for App-side creation)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  is_onboarding_completed boolean default false,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Ensure RLS allows the App to insert profiles
alter table public.profiles enable row level security;

-- Drop verify to ensure clean slate
drop policy if exists "Users can insert own profile" on public.profiles;

-- Allow users to insert their OWN profile (Critical for App-side init)
create policy "Users can insert own profile" on public.profiles 
for insert with check (auth.uid() = id);

-- Allow users to select their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles 
for select using (auth.uid() = id);

-- Allow users to update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles 
for update using (auth.uid() = id);

-- 5. Grant Permissions
grant all on table public.profiles to postgres, service_role;
