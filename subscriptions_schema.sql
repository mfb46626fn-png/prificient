-- Subscriptions Table
-- Links users to a specific plan (Clear/Control/Vision)

CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trial', 'incomplete');

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    plan_id TEXT NOT NULL, -- 'clear', 'control', 'vision'
    status subscription_status DEFAULT 'trial',
    
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ, -- If null, access might be indefinite or error
    
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    
    -- Recommended Plan (Algo output)
    recommended_plan_id TEXT, 
    recommendation_reason TEXT,
    
    -- Beta / Legacy Logic
    is_beta_access BOOLEAN DEFAULT FALSE,
    lock_date TIMESTAMPTZ, -- If set, restrict access after this date unless paid
    
    -- Payment Provider Info
    payment_provider TEXT DEFAULT 'paytr',
    provider_ref_id TEXT, -- merchant_oid or token
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id) -- One active subscription per user logic
);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" 
ON subscriptions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- System/Service Role manages inserts/updates via Webhooks or API.
-- If using client-side calls for testing (not recommended for production billing), allow update:
-- CREATE POLICY "Users can update own subscription" ...

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
