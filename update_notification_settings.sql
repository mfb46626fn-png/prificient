
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    report_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (report_frequency IN ('daily', 'weekly', 'monthly', 'never')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" 
ON notification_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON notification_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON notification_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-create settings for new users could be added, but for now we'll handle it in the API or UI (lazy init).
