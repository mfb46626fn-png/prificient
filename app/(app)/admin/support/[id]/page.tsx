import { createAdminClient } from '@/lib/supabase-admin';
import AdminChatInterface from './AdminChatInterface';
import { notFound } from 'next/navigation';

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: ticket } = await supabase.from('support_tickets').select('*').eq('id', id).single();

    if (!ticket) return notFound();

    // Determine user email to display
    const { data: { user: ticketUser } } = await supabase.auth.admin.getUserById(ticket.user_id);

    const { data: messages } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

    return (
        <div className="h-screen flex flex-col p-6 bg-gray-50">
            <div className="mb-6 bg-white p-4 rounded shadow-sm border">
                <div className="flex justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <a href="/admin/support" className="text-gray-400 hover:text-black transition-colors">← Geri</a>
                            <h1 className="text-xl font-bold">{ticket.subject}</h1>
                        </div>
                        <div className="text-sm text-gray-500 space-x-4">
                            <span><span className="font-semibold">Kullanıcı:</span> {ticketUser?.email}</span>
                            <span><span className="font-semibold">ID:</span> {ticket.user_id}</span>
                        </div>
                    </div>
                    <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                        ${ticket.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {ticket.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pass admin-specific props */}
            <AdminChatInterface
                ticketId={id}
                initialMessages={messages || []}
                adminId="SYSTEM_ADMIN" // Or actual admin ID if logged in
                userEmail={ticketUser?.email}
                status={ticket.status}
                ticketOwnerId={ticket.user_id}
            />
        </div>
    );
}
