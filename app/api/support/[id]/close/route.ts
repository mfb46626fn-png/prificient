import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin'; // Use admin client for updates
import { EmailService } from '@/lib/email';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient(); // For auth check
        const { data: { user } } = await supabase.auth.getUser();

        // Admin check (simple MVP check compatible with lib/auth.ts logic implicitly)
        // Ideally reuse isAdmin() from lib/auth, but need to pass userId. 
        // For now, let's rely on the metadata/email check again or middleware if setup.
        const isAdmin = user && (
            user.app_metadata?.role === 'prificient_admin' ||
            user.user_metadata?.role === 'prificient_admin' ||
            ['can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com'].includes(user.email || '')
        );

        if (!isAdmin) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id: ticketId } = await params;
        const supabaseAdmin = createAdminClient();

        // 1. Update status
        const { error } = await supabaseAdmin
            .from('support_tickets')
            .update({ status: 'closed', updated_at: new Date().toISOString() })
            .eq('id', ticketId);

        if (error) throw error;

        // 2. Fetch ticket details for email
        const { data: ticket } = await supabaseAdmin.from('support_tickets').select('subject, user_id').eq('id', ticketId).single();

        // 3. Send Notification
        if (ticket) {
            const { data: { user: ticketUser } } = await supabaseAdmin.auth.admin.getUserById(ticket.user_id);
            if (ticketUser?.email) {
                await EmailService.sendTicketClosed(ticketUser.email, ticketId, ticket.subject);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Close Ticket Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
