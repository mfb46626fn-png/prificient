import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ShopifyHistoryScanner } from '@/lib/sync/shopify-history';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Get Integration Credentials
        const { data: integration } = await supabase
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .eq('status', 'active')
            .single();

        if (!integration) {
            return NextResponse.json({ error: 'No active Shopify integration found' }, { status: 404 });
        }

        // 3. Trigger Scan (Async or Await? Scanning 90 days might take time)
        // Vercel serverless has timeout. 90 days of orders might timeout.
        // For MVP, we await it but limit range or hope it's fast enough.
        // Better: Return immediately and run in background (but Vercel kills background tasks).
        // Best for MVP: Await but warn user it might take time. Or use Inngest/Queue (out of scope).
        // We'll await for now, if it timeouts, we might need to reduce range.
        const count = await ShopifyHistoryScanner.scanPastShopifyData(
            user.id,
            integration.shop_domain,
            integration.access_token
        );

        return NextResponse.json({ success: true, count });

    } catch (error: any) {
        console.error('History Scan Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
