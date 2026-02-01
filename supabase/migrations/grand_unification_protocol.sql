-- Grand Unification Protocol - Database Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. MERCHANT EVENTS (Event Sourcing)
-- ============================================
CREATE TABLE IF NOT EXISTS merchant_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- PRICE_CHANGED, AD_BUDGET_INCREASED, RETURN_RATE_SPIKE, NET_PROFIT_NEGATIVE, PRODUCT_DISABLED
  entity_type TEXT, -- product, campaign, order
  entity_id TEXT,
  payload JSONB DEFAULT '{}',
  outcome JSONB DEFAULT NULL, -- filled 14 days later by background job
  outcome_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_merchant_events_user ON merchant_events(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_events_type ON merchant_events(event_type);
CREATE INDEX IF NOT EXISTS idx_merchant_events_created ON merchant_events(created_at);

-- RLS Policy
ALTER TABLE merchant_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON merchant_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON merchant_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. BETA USAGE LOGS (Usage Scoring for Package Assignment)
-- ============================================
CREATE TABLE IF NOT EXISTS beta_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- api_call, report_export, scenario_run, dashboard_view, product_analysis
  points INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for scoring queries
CREATE INDEX IF NOT EXISTS idx_beta_usage_user ON beta_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_usage_action ON beta_usage_logs(action_type);

-- RLS Policy
ALTER TABLE beta_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON beta_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON beta_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. AD IMPORTS (Meta Ads CSV Data)
-- ============================================
CREATE TABLE IF NOT EXISTS ad_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reporting_date DATE NOT NULL,
  campaign_name TEXT,
  ad_set_name TEXT,
  ad_name TEXT,
  amount_spent DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  cpm DECIMAL(10,2) DEFAULT 0,
  ctr DECIMAL(6,2) DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  conversion_value DECIMAL(12,2) DEFAULT 0,
  matched_product_id TEXT, -- Linked Shopify product variant_id
  matched_product_title TEXT,
  import_batch_id UUID, -- Group imports by upload session
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ad_imports_user ON ad_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_imports_date ON ad_imports(reporting_date);
CREATE INDEX IF NOT EXISTS idx_ad_imports_campaign ON ad_imports(campaign_name);
CREATE INDEX IF NOT EXISTS idx_ad_imports_product ON ad_imports(matched_product_id);

-- RLS Policy
ALTER TABLE ad_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ads" ON ad_imports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ads" ON ad_imports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ads" ON ad_imports
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. USERS TABLE (Create if not exists, then add Beta & Multi-Currency columns)
-- ============================================

-- First, create the users table in public schema if it doesn't exist
-- This table extends auth.users with app-specific fields
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  shopify_store_url TEXT,
  shopify_access_token TEXT,
  is_beta_user BOOLEAN DEFAULT true,
  beta_package TEXT DEFAULT 'vision',
  usage_score INTEGER DEFAULT 0,
  demo_mode_enabled BOOLEAN DEFAULT false,
  store_currency TEXT DEFAULT 'TRY',
  pain_score INTEGER DEFAULT 0,
  pain_segment TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Beta fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_beta_user') THEN
    ALTER TABLE public.users ADD COLUMN is_beta_user BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'beta_package') THEN
    ALTER TABLE public.users ADD COLUMN beta_package TEXT DEFAULT 'vision';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'usage_score') THEN
    ALTER TABLE public.users ADD COLUMN usage_score INTEGER DEFAULT 0;
  END IF;
  
  -- Demo mode
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'demo_mode_enabled') THEN
    ALTER TABLE public.users ADD COLUMN demo_mode_enabled BOOLEAN DEFAULT false;
  END IF;
  
  -- Multi-currency
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'store_currency') THEN
    ALTER TABLE public.users ADD COLUMN store_currency TEXT DEFAULT 'TRY';
  END IF;
  
  -- Pain score cache
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'pain_score') THEN
    ALTER TABLE public.users ADD COLUMN pain_score INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'pain_segment') THEN
    ALTER TABLE public.users ADD COLUMN pain_segment TEXT DEFAULT 'unknown';
  END IF;
END $$;

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to calculate total ad spend for a date range
CREATE OR REPLACE FUNCTION get_total_ad_spend(p_user_id UUID, p_start DATE, p_end DATE)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount_spent), 0)
  FROM ad_imports
  WHERE user_id = p_user_id
    AND reporting_date >= p_start
    AND reporting_date <= p_end;
$$ LANGUAGE SQL;

-- Function to get user's usage score
CREATE OR REPLACE FUNCTION get_usage_score(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(points), 0)::INTEGER
  FROM beta_usage_logs
  WHERE user_id = p_user_id;
$$ LANGUAGE SQL;
