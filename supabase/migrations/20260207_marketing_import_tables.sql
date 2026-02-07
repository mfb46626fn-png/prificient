-- Create Enum for Match Type
DO $$ BEGIN
    CREATE TYPE match_type_enum AS ENUM ('exact', 'fuzzy', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: ad_campaign_mappings (The "Memory")
create table if not exists public.ad_campaign_mappings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  campaign_name_pattern text not null,
  target_product_id text, -- nullable (creates 'general' spend)
  match_type match_type_enum default 'manual',
  created_at timestamptz default now(),
  unique(user_id, campaign_name_pattern)
);

-- Table: marketing_spends (The "History")
create table if not exists public.marketing_spends (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  campaign_name text not null,
  amount decimal(10,2) not null,
  product_id text, -- nullable
  is_general_spend boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.ad_campaign_mappings enable row level security;
alter table public.marketing_spends enable row level security;

-- Policies for ad_campaign_mappings
create policy "Users can view their own mappings"
on public.ad_campaign_mappings for select
using (auth.uid() = user_id);

create policy "Users can insert their own mappings"
on public.ad_campaign_mappings for insert
with check (auth.uid() = user_id);

create policy "Users can update their own mappings"
on public.ad_campaign_mappings for update
using (auth.uid() = user_id);

-- Policies for marketing_spends
create policy "Users can view their own spends"
on public.marketing_spends for select
using (auth.uid() = user_id);

create policy "Users can insert their own spends"
on public.marketing_spends for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own spends"
on public.marketing_spends for delete
using (auth.uid() = user_id);
