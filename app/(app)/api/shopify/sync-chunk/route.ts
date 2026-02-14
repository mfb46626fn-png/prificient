import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { LedgerService } from '@/lib/ledger';
import shopify from '@/lib/shopify';
import { Session } from '@shopify/shopify-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro limit

/**
 * Ultra-optimized Chunked Shopify Sync
 * - 1-day chunks
 * - Parallel auth + DB operations
 * - Minimal logging
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        // Parallel: Auth + Body parsing
        const [supabaseUser, bodyResult] = await Promise.all([
            createClient(),
            req.json().catch(() => ({}))
        ]);

        const { data: { user } } = await supabaseUser.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { startDate, endDate, pageInfo } = bodyResult;

        // Get integration
        const supabaseAdmin = createAdminClient();
        const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('shop_domain, access_token')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .eq('status', 'active')
            .single();

        if (!integration) {
            return NextResponse.json({ error: 'No active Shopify integration' }, { status: 404 });
        }

        // 1-day chunks for maximum safety
        const CHUNK_DAYS = 1;
        const now = new Date();
        const rangeStart = startDate ? new Date(startDate) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const rangeEnd = endDate ? new Date(endDate) : now;
        const chunkEnd = rangeEnd;
        const chunkStart = new Date(Math.max(chunkEnd.getTime() - CHUNK_DAYS * 24 * 60 * 60 * 1000, rangeStart.getTime()));

        // Create Shopify session
        const session = new Session({
            id: `offline_${integration.shop_domain}`,
            shop: integration.shop_domain,
            state: 'state',
            isOnline: false,
            accessToken: integration.access_token
        });

        const client = new shopify.clients.Rest({ session });

        // Fetch orders - smaller limit
        const queryParams = pageInfo
            ? { limit: 50, page_info: pageInfo }
            : {
                status: 'any',
                created_at_min: chunkStart.toISOString(),
                created_at_max: chunkEnd.toISOString(),
                limit: 50
            };

        const response: any = await client.get({
            path: 'orders',
            query: queryParams as any
        });

        const orders = response.body?.orders || [];
        const nextPageInfo = response.pageInfo?.nextPage?.query?.page_info;

        // Batch deduplication
        let existingOrderIds = new Set<number>();
        if (orders.length > 0) {
            const { data: existingEvents } = await supabaseAdmin
                .from('financial_event_log')
                .select('payload')
                .eq('user_id', user.id)
                .eq('event_type', 'OrderCreated')
                .gte('event_time', chunkStart.toISOString())
                .lte('event_time', chunkEnd.toISOString());

            existingEvents?.forEach((e: any) => {
                if (e.payload?.id) existingOrderIds.add(e.payload.id);
            });
        }

        let processed = 0;
        let skipped = 0;

        for (const order of orders) {
            if (existingOrderIds.has(order.id)) {
                skipped++;
                continue;
            }

            await LedgerService.recordEvent(
                user.id,
                'shopify_history_scan',
                'OrderCreated',
                order,
                supabaseAdmin,
                true  // skipProcessing - fast sync, batch process later
            );
            processed++;
        }

        const duration = Date.now() - startTime;

        // More pagination within chunk?
        if (nextPageInfo) {
            return NextResponse.json({
                complete: false,
                syncedOrders: processed,
                skippedOrders: skipped,
                currentChunk: { startDate: chunkStart.toISOString(), endDate: chunkEnd.toISOString() },
                nextPageInfo,
                durationMs: duration
            });
        }

        // More chunks needed?
        if (chunkStart > rangeStart) {
            const nextChunkEnd = new Date(chunkStart.getTime() - 1);
            return NextResponse.json({
                complete: false,
                syncedOrders: processed,
                skippedOrders: skipped,
                currentChunk: { startDate: chunkStart.toISOString(), endDate: chunkEnd.toISOString() },
                nextChunk: {
                    startDate: rangeStart.toISOString(),
                    endDate: nextChunkEnd.toISOString()
                },
                durationMs: duration
            });
        }

        // All done - update currency
        try {
            const shopInfo: any = await client.get({ path: 'shop' });
            const currency = shopInfo.body?.shop?.currency;
            if (currency) {
                await supabaseAdmin.from('store_settings').update({ currency }).eq('user_id', user.id);
            }
        } catch { }

        return NextResponse.json({
            complete: true,
            syncedOrders: processed,
            skippedOrders: skipped,
            durationMs: duration
        });

    } catch (error: any) {
        console.error('[ChunkedSync] Error:', error.message);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
