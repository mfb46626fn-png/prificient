-- Create password_resets table
create table if not exists public.password_resets (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.password_resets enable row level security;

-- Deny all public access (Service Role only)
create policy "Deny public access" on public.password_resets
  for all using (false);

-- Index for faster token lookups
create index if not exists idx_password_resets_token on public.password_resets(token);
