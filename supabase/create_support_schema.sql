-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'answered', 'closed')) DEFAULT 'open',
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id), -- Nullable for system messages or external logic
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON public.support_tickets
    FOR SELECT
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role' = 'prificient_admin') OR
        (auth.jwt() -> 'user_metadata' ->> 'role' = 'prificient_admin')
    );

-- Admins can update tickets
CREATE POLICY "Admins can update tickets" ON public.support_tickets
    FOR UPDATE
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role' = 'prificient_admin') OR
        (auth.jwt() -> 'user_metadata' ->> 'role' = 'prificient_admin')
    );

-- RLS Policies for support_messages

-- Users can view messages of their own tickets (excluding internal notes)
CREATE POLICY "Users can view messages of own tickets" ON public.support_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = support_messages.ticket_id
            AND user_id = auth.uid()
        )
        AND is_internal = false
    );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON public.support_messages
    FOR SELECT
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role' = 'prificient_admin') OR
        (auth.jwt() -> 'user_metadata' ->> 'role' = 'prificient_admin')
    );

-- Users can insert messages to their own tickets
CREATE POLICY "Users can insert messages to own tickets" ON public.support_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_id
            AND user_id = auth.uid()
        )
    );

-- Admins can insert messages
CREATE POLICY "Admins can insert messages" ON public.support_messages
    FOR INSERT
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role' = 'prificient_admin') OR
        (auth.jwt() -> 'user_metadata' ->> 'role' = 'prificient_admin')
    );

-- Trigger to update updated_at on ticket when a message is added
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.support_tickets
    SET updated_at = now()
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ticket_timestamp ON public.support_messages;
CREATE TRIGGER update_ticket_timestamp
AFTER INSERT ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION update_ticket_updated_at();
