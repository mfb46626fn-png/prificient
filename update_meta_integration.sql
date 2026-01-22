
-- Create integrations table for connecting third-party platforms
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'meta-ads', 'google-ads', etc.
    access_token TEXT NOT NULL,
    refresh_token TEXT, -- Optional, for platforms that use it
    metadata JSONB DEFAULT '{}'::jsonb, -- configuration like ad_account_id
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'error'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- RLS Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own integrations" 
ON integrations FOR ALL 
USING (auth.uid() = user_id);

-- Add index
CREATE INDEX idx_integrations_user_provider ON integrations(user_id, provider);
