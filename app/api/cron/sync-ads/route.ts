import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { syncDailyAdSpend } from '@/lib/sync/meta-ads';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const supabaseAdmin = createAdminClient();

        // 1. Get all users with active Meta integration
        const { data: integrations, error } = await supabaseAdmin
            .from('integrations')
            .select('user_id')
            .eq('provider', 'meta-ads')
            .eq('status', 'active');

        if (error) throw error;
        if (!integrations || integrations.length === 0) {
            return NextResponse.json({ message: 'No active integrations found.' });
        }

        // Deduplicate users (one sync per user even if multiple rows - though constraint is unique)
        const userIds = Array.from(new Set(integrations.map(i => i.user_id)));

        // 2. Run Sync for each user
        const results = await Promise.allSettled(userIds.map(async (uid) => {
            // Add random delay to prevent rate limits
            const delay = Math.floor(Math.random() * 2000);
            await new Promise(r => setTimeout(r, delay));

            return syncDailyAdSpend(uid);
        }));

        return NextResponse.json({
            success: true,
            processed: results.length,
            status: results.map(r => r.status)
        });

    } catch (error: any) {
        console.error('Meta Sync Cron Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
