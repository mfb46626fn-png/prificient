import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify Admin Status
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { targetUserId } = body;

        if (!targetUserId) {
            return NextResponse.json({ error: 'Missing targetUserId' }, { status: 400 });
        }

        // 2. Set Impersonation Cookie
        // We set it as httpOnly so client JS cannot tamper with it easily, though admin implies trust.
        const response = NextResponse.json({ success: true });

        response.cookies.set('impersonated_user_id', targetUserId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 // 1 hour expiration
        });

        return response;

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
