import { createAdminClient } from './supabase-admin';
import { EmailService } from './email';

export const SupportService = {
    async createTicket(ticket: { userId: string, userEmail: string, subject: string, message: string }) {
        const supabaseAdmin = createAdminClient();

        // 1. Create Ticket
        const { data: ticketData, error: ticketError } = await supabaseAdmin
            .from('support_tickets')
            .insert({
                user_id: ticket.userId,
                subject: ticket.subject,
                status: 'open',
            })
            .select()
            .single();

        if (ticketError) throw ticketError;

        // 2. Create Message
        const { error: messageError } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: ticketData.id,
                user_id: ticket.userId,
                message: ticket.message,
            });

        if (messageError) throw messageError;

        // 3. Send Email
        await EmailService.sendTicketNotification(ticket.userEmail, ticketData.id, ticket.subject);

        return ticketData;
    },

    async replyToTicket(params: { ticketId: string, userId: string, message: string, isAdmin: boolean, userEmail?: string }) {
        const supabaseAdmin = createAdminClient();

        // 1. Add Message
        const { error: messageError } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: params.ticketId,
                user_id: params.userId,
                message: params.message,
                is_internal: false
            });

        if (messageError) throw messageError;

        // 2. Update Ticket Status
        const newStatus = params.isAdmin ? 'answered' : 'open';
        await supabaseAdmin
            .from('support_tickets')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', params.ticketId);

        // 3. Send Email if Admin replied
        if (params.isAdmin) {
            let emailToSend = params.userEmail;

            if (!emailToSend) {
                const { data: ticket } = await supabaseAdmin.from('support_tickets').select('user_id').eq('id', params.ticketId).single();
                if (ticket) {
                    const { data: { user: ticketowner } } = await supabaseAdmin.auth.admin.getUserById(ticket.user_id);
                    emailToSend = ticketowner?.email;
                }
            }

            if (emailToSend) {
                console.log('Sending reply email to:', emailToSend);
                // Fetch ticket details for subject if not already available
                const { data: ticketDetails } = await supabaseAdmin.from('support_tickets').select('subject, user_id').eq('id', params.ticketId).single();

                await EmailService.sendTicketReply(
                    emailToSend,
                    params.ticketId,
                    ticketDetails?.subject || 'Destek Talebi',
                    params.message,
                    `${process.env.NEXT_PUBLIC_APP_URL}/support`
                );
            } else {
                const { data: ticketDetails } = await supabaseAdmin.from('support_tickets').select('user_id').eq('id', params.ticketId).single();
                console.error('Could not find email address for user:', ticketDetails?.user_id);
            }
        }
    }
}
