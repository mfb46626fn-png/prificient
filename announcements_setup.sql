-- Create Announcements Table
CREATE TABLE IF NOT EXISTS system_announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'error')) DEFAULT 'info',
    target_user_id UUID, -- Null means Global
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone can read active announcements that target them OR are global
CREATE POLICY "Users can read relevant announcements" 
ON system_announcements FOR SELECT
USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (target_user_id IS NULL OR target_user_id = auth.uid())
);

-- 2. Admins can manage all
CREATE POLICY "Admins can manage announcements" 
ON system_announcements FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'prificient_admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'prificient_admin' OR
    auth.email() IN ('can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com')
);

-- Realtime
alter publication supabase_realtime add table system_announcements;
