-- 1. Create store_settings if not exists
CREATE TABLE IF NOT EXISTS public.store_settings (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    currency TEXT DEFAULT 'TRY',
    company_type TEXT DEFAULT 'other',
    active_channels JSONB DEFAULT '{}'::jsonb,
    payment_gateways JSONB DEFAULT '{}'::jsonb,
    avg_shipping_cost NUMERIC DEFAULT 0,
    avg_packaging_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies for store_settings
DROP POLICY IF EXISTS "Users can view own store settings" ON public.store_settings;
CREATE POLICY "Users can view own store settings" 
ON public.store_settings FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own store settings" ON public.store_settings;
CREATE POLICY "Users can insert own store settings" 
ON public.store_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own store settings" ON public.store_settings;
CREATE POLICY "Users can update own store settings" 
ON public.store_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Policies for integrations (Fixing 'Integration not found' if it's an RLS issue)
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own integrations" ON public.integrations;
CREATE POLICY "Users can view own integrations" 
ON public.integrations FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert/update own integrations" ON public.integrations;
CREATE POLICY "Users can insert/update own integrations" 
ON public.integrations FOR ALL 
USING (auth.uid() = user_id);

-- 5. Grant permissions to authenticated users
GRANT ALL ON public.store_settings TO authenticated;
GRANT ALL ON public.integrations TO authenticated;
