import { createClient } from '@/utils/supabase/server';
import DashboardHeader from '@/components/DashboardHeader';
import SupportClientInterface from './SupportClientInterface';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch initial data on server
    const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    // Also fetch messages for the most recent ticket if exists, to pre-load state? 
    // Probably better to let the client component handle selection or fetching messages on demand.
    // But for "Split View", usually we want the first one open or empty state.

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <div className='bg-white'>
                <DashboardHeader />
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 h-[calc(100vh-80px)]">
                <SupportClientInterface
                    initialTickets={tickets || []}
                    userId={user.id}
                    userEmail={user.email}
                />
            </div>
        </div>
    );
}
