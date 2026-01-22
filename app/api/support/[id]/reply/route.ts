import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { SupportService } from '@/lib/support';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id: ticketId } = await params;
        const body = await request.json();
        const { message } = body;

        const isAdmin = user.app_metadata?.role === 'prificient_admin' ||
            user.user_metadata?.role === 'prificient_admin' ||
            ['can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com'].includes(user.email || '');

        await SupportService.replyToTicket({
            ticketId,
            userId: user.id,
            message,
            isAdmin
            // userEmail is handled in SupportService if admin
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reply Ticket Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
