import { createAdminClient } from '@/lib/supabase-admin';
import Link from 'next/link';
import AdminTicketList from './AdminTicketList';

export const dynamic = 'force-dynamic';

export default async function AdminSupportPage() {
    // Note: In a real app, you would verify the user is an admin here.
    // For MVP, we assume this route is protected or only accessible by staff.
    // However, we still need to fetch tickets.

    const supabase = createAdminClient();

    const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error(error);
        return <div>Error loading tickets</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Destek Paneli</h1>
                        <p className="text-sm text-gray-500 font-medium">Kullanıcı taleplerini buradan yönetebilirsiniz.</p>
                    </div>
                </div>
                <AdminTicketList initialTickets={tickets || []} />
            </div>
        </div>
    );
}
