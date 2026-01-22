-- Create decision_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.decision_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    decision_text TEXT NOT NULL,
    category TEXT, -- e.g., 'pricing', 'marketing', 'inventory'
    rationale TEXT,
    impact_score INTEGER, -- Optional: 1-10 scale of expected impact
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create financial_event_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.financial_event_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    event_type TEXT NOT NULL, -- e.g., 'spike_detected', 'threshold_breach'
    description TEXT,
    data JSONB DEFAULT '{}'::jsonb, -- Store related values like { "amount": 5000, "threshold": 1000 }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.decision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_event_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decision_log
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'decision_log' AND policyname = 'Users can view their own decisions') THEN
        CREATE POLICY "Users can view their own decisions" 
        ON public.decision_log FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'decision_log' AND policyname = 'Users can insert their own decisions') THEN
        CREATE POLICY "Users can insert their own decisions" 
        ON public.decision_log FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- RLS Policies for financial_event_log
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_event_log' AND policyname = 'Users can view their own events') THEN
        CREATE POLICY "Users can view their own events" 
        ON public.financial_event_log FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_event_log' AND policyname = 'System can insert events') THEN
       -- Typically, events are inserted by the system/AI. If triggered by user action, auth.uid() = user_id applies.
       -- For simplicity, assuming user-triggered actions for now.
        CREATE POLICY "Users can insert their own events" 
        ON public.financial_event_log FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
