-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS store_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'TRY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own settings" ON store_settings;
    DROP POLICY IF EXISTS "Users can update own settings" ON store_settings;
    DROP POLICY IF EXISTS "Users can insert own settings" ON store_settings;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Users can view own settings" ON store_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON store_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON store_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Initial Seed (Optional: Create default for existing users who miss it, via trigger or manual)
-- We won't force insert here to avoid overwriting, but app should handle upsert.
