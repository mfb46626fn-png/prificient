import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
        return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
    }

    try {
        const supabaseAdmin = createAdminClient();

        // 1. Fetch Ticket
        const { data: ticket, error: ticketError } = await supabaseAdmin
            .from('support_tickets')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) {
            return NextResponse.json({ error: 'Ticket Not Found', details: ticketError }, { status: 404 });
        }

        // 2. Fetch User
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(ticket.user_id);

        return NextResponse.json({
            success: true,
            ticket: {
                id: ticket.id,
                user_id: ticket.user_id,
                subject: ticket.subject
            },
            user: {
                id: user?.id,
                email: user?.email,
                role: user?.role
            },
            userError: userError
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
