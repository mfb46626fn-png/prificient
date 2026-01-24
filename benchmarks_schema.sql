-- 1. Merchant Daily Stats
-- Holds daily performance metrics for each merchant
CREATE TABLE IF NOT EXISTS merchant_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    revenue NUMERIC DEFAULT 0,
    net_profit NUMERIC DEFAULT 0,
    profit_margin NUMERIC DEFAULT 0, -- (Net Profit / Revenue)
    refund_rate NUMERIC DEFAULT 0,   -- (Refund Amount / Gross Sales) * 100
    ad_spend_ratio NUMERIC DEFAULT 0, -- (Ad Spend / Revenue) * 100
    
    cohort_tag TEXT, -- e.g. '0-10k', '10k-50k', '50k+'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Index for fast cohort aggregation
CREATE INDEX IF NOT EXISTS idx_daily_stats_cohort ON merchant_daily_stats(cohort_tag, date);

-- 2. Global Benchmarks (Aggregated)
-- Holds percentile values for each metric within each cohort
CREATE TABLE IF NOT EXISTS global_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL, -- Date of calculation (usually yesterday)
    cohort_tag TEXT NOT NULL,
    metric_name TEXT NOT NULL, -- 'revenue', 'profit_margin', 'refund_rate', 'ad_spend_ratio'
    
    p10 NUMERIC, -- Bottom 10% value
    p25 NUMERIC,
    p50 NUMERIC, -- Median
    p75 NUMERIC,
    p90 NUMERIC, -- Top 10% value
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, cohort_tag, metric_name)
);

-- RLS Policies
ALTER TABLE merchant_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_benchmarks ENABLE ROW LEVEL SECURITY;

-- Users can convert their own stats
CREATE POLICY "Users can read own daily stats" 
ON merchant_daily_stats FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Global benchmarks are public to authenticated users (Anonymous Aggregation)
CREATE POLICY "Users can read global benchmarks" 
ON global_benchmarks FOR SELECT 
TO authenticated 
USING (true);
