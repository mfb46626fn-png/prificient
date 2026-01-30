import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { shopifyClient } from '@/lib/shopify';
import { LedgerService } from '@/lib/ledger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Increase timeout

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { cursor } = body;

        // Use Admin Client for DB Ops
        const supabaseAdmin = createAdminClient();

        // 1. Get Integration
        const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .single();

        if (!integration) throw new Error('Integration not found');

        const { access_token, shop_domain } = integration;
        const client = shopifyClient(shop_domain, access_token);

        // 2. Fetch Orders (1 Day Chunk or Page)
        // Optimization: Reduce limit to 50 to process faster and avoid timeouts
        const params: any = {
            limit: 50,
            status: 'any',
            created_at_min: '2024-01-01T00:00:00Z', // Start of year or dynamic
        };

        if (cursor) {
            params.page_info = cursor;
        }

        const response = await client.get({ path: 'orders', query: params });

        // Fix for Headers (Vercel/Node adapter difference)
        const responseHeaders = (response as any).headers;
        let linkHeader = '';

        if (responseHeaders && typeof responseHeaders.get === 'function') {
            linkHeader = responseHeaders.get('Link') || '';
        } else if (responseHeaders && responseHeaders['link']) {
            linkHeader = responseHeaders['link'];
        } else if (responseHeaders && responseHeaders['Link']) {
            linkHeader = responseHeaders['Link'];
        }

        const orders = (response.body as any).orders || [];

        // 3. Process Orders (Ledger)
        if (orders.length > 0) {
            // Process in parallel but limit concurrency if needed
            await Promise.all(orders.map((order: any) =>
                LedgerService.recordEvent(
                    user.id,
                    'shopify_sync',
                    'OrderCreated',
                    order,
                    supabaseAdmin,
                    false // Full Processing!
                )
            ));
        }

        // 4. Extract Next Cursor
        let nextCursor = null;
        if (linkHeader && linkHeader.includes('rel="next"')) {
            // Basic regex to extract page_info
            const match = linkHeader.match(/page_info=([^>&]+)/);
            if (match) nextCursor = match[1];
        }

        // 5. Update Progress in DB
        await supabaseAdmin
            .from('integrations')
            .update({
                last_synced_cursor: nextCursor,
                // We could update progress here if passed from frontend, 
                // but let's keep it simple.
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('platform', 'shopify');

        return NextResponse.json({
            processed: orders.length,
            next_cursor: nextCursor
        });

    } catch (error: any) {
        console.error('[Sync Batch] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
