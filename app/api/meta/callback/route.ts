import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MetaService } from '@/lib/meta';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error || !code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=meta_auth_failed`);
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    try {
        // 1. Exchange Code
        const shortToken = await MetaService.exchangeCodeForToken(code);

        // 2. Get Long Lived Token
        const longToken = await MetaService.getLongLivedToken(shortToken);

        // 3. Store Token (Status: Incomplete, waiting for account selection)
        await supabase.from('integrations').upsert({
            user_id: user.id,
            provider: 'meta-ads',
            access_token: longToken,
            status: 'incomplete', // User must select account next
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, provider' });

        // 4. Redirect to Account Selection
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connect/meta/select-account`);

    } catch (err) {
        console.error("Meta Callback Error:", err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=meta_token_error`);
    }
}
