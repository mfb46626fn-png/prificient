import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import SupportChatClient from '@/components/SupportChatClient'
import { Ticket, TicketMessage } from '@/lib/support'

export const dynamic = 'force-dynamic'

export default async function SupportDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Fetch Ticket & Messages
    // Since we have separate calls, let's do parallel
    const ticketPromise = supabase
        .from('support_tickets')
        .select('*')
        .eq('id', params.id)
        .single()

    const messagesPromise = supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', params.id)
        .order('created_at', { ascending: true })

    const [ticketRes, messagesRes] = await Promise.all([ticketPromise, messagesPromise])

    if (ticketRes.error || !ticketRes.data) {
        // Ticket not found or access denied (RLS works here)
        if (ticketRes.error) console.error("Error fetching ticket:", ticketRes.error)
        redirect('/dashboard/support')
    }

    // Verify ownership explicitly just in case, though RLS handles it
    if (ticketRes.data.user_id !== user.id) {
        redirect('/dashboard/support')
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader />
            <main className="py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <SupportChatClient
                        ticket={ticketRes.data as Ticket}
                        initialMessages={messagesRes.data as TicketMessage[] || []}
                    />
                </div>
            </main>
        </div>
    )
}
