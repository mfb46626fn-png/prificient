import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { SupportService } from '@/lib/support';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { subject, message } = body;

        await SupportService.createTicket({
            userId: user.id,
            userEmail: user.email!,
            subject,
            message
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Create Ticket Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
