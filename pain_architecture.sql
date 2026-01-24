-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. MERCHANT HEALTH SCORES
-- Stores the calculated Pain Score (0-100) and its breakdown.
create table if not exists public.merchant_health_scores (
    user_id uuid references auth.users(id) on delete cascade primary key,
    pain_score integer not null default 0 check (pain_score >= 0 and pain_score <= 100),
    pain_level text not null check (pain_level in ('safe', 'unaware', 'painful', 'critical')),
    factors jsonb not null default '{}'::jsonb, -- e.g. { "refund_impact": 20, "ad_bleed": 30 }
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.merchant_health_scores enable row level security;

create policy "Users can view their own health score"
    on public.merchant_health_scores for select
    using (auth.uid() = user_id);

create policy "Service role can manage health scores"
    on public.merchant_health_scores for all
    using (true); -- Usually restricted to service_role in production, simplified for MVP


-- 2. OPPORTUNITY LOSS LOG (The "Cost of Inaction" Ledger)
-- Logs specific issues (like a toxic product) and their calculated daily loss.
create table if not exists public.opportunity_loss_log (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    issue_type text not null, -- e.g. 'negative_margin_product', 'high_refund_rate'
    entity_id text, -- e.g. Product ID '123456'
    detected_at timestamptz default timezone('utc'::text, now()) not null,
    daily_loss_amount decimal(10,2) not null, -- The daily bleeding amount at detection time
    status text not null default 'ignored' check (status in ('ignored', 'resolved')),
    resolved_at timestamptz
);

-- Index for fast lookup of active issues
create index idx_opp_loss_user_status on public.opportunity_loss_log(user_id, status);

-- RLS
alter table public.opportunity_loss_log enable row level security;

create policy "Users can view their own loss log"
    on public.opportunity_loss_log for select
    using (auth.uid() = user_id);

create policy "Service role can manage loss logs"
    on public.opportunity_loss_log for all
    using (true);
