import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { LedgerService } from '@/lib/ledger';
import shopify from '@/lib/shopify';
import { Session } from '@shopify/shopify-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro limit

/**
 * Chunked Shopify Sync - Progressive Architecture (Optimized)
 * 
 * Syncs orders in small date range chunks (5 days each) to avoid timeout.
 * Uses batch deduplication for efficiency.
 * Returns next chunk info so frontend can continue the loop.
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        console.log('[ChunkedSync] === STARTING CHUNK ===');

        // Auth check
        const supabaseUser = await createClient();
        const { data: { user } } = await supabaseUser.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Get request body
        const body = await req.json().catch(() => ({}));
        const { startDate, endDate, pageInfo } = body;

        // Get Shopify integration
        const supabaseAdmin = createAdminClient();
        const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .eq('status', 'active')
            .single();

        if (!integration) {
            return NextResponse.json({ error: 'No active Shopify integration' }, { status: 404 });
        }

        // Calculate date ranges - 5 day chunks (ultra-safe for API limits)
        const CHUNK_DAYS = 5;
        const now = new Date();

        // Default: 90 days ago to today
        const rangeStart = startDate ? new Date(startDate) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const rangeEnd = endDate ? new Date(endDate) : now;

        // Current chunk boundaries
        const chunkEnd = rangeEnd;
        const chunkStart = new Date(Math.max(chunkEnd.getTime() - CHUNK_DAYS * 24 * 60 * 60 * 1000, rangeStart.getTime()));

        console.log(`[ChunkedSync] Chunk range: ${chunkStart.toISOString()} to ${chunkEnd.toISOString()}`);

        // Create Shopify session
        const session = new Session({
            id: `offline_${integration.shop_domain}`,
            shop: integration.shop_domain,
            state: 'state',
            isOnline: false,
            accessToken: integration.access_token
        });

        const client = new shopify.clients.Rest({ session });

        // Fetch orders for this chunk (reduce limit to 100 for safety)
        const queryParams = pageInfo
            ? { limit: 100, page_info: pageInfo }
            : {
                status: 'any',
                created_at_min: chunkStart.toISOString(),
                created_at_max: chunkEnd.toISOString(),
                limit: 100
            };

        const response: any = await client.get({
            path: 'orders',
            query: queryParams as any
        });

        const orders = response.body?.orders || [];
        const nextPageInfo = response.pageInfo?.nextPage?.query?.page_info;

        console.log(`[ChunkedSync] Received ${orders.length} orders`);

        // --- BATCH DEDUPLICATION ---
        // Get all existing order IDs in one query (much faster)
        const orderIds = orders.map((o: any) => o.id);
        let existingOrderIds = new Set<number>();

        if (orderIds.length > 0) {
            // Query existing orders using JSONB contains for each ID
            // Since Supabase doesn't support JSONB `ANY` easily, we'll do a workaround
            // by checking external_id field if exists, or fallback to simple approach
            const { data: existingEvents } = await supabaseAdmin
                .from('financial_event_log')
                .select('payload')
                .eq('user_id', user.id)
                .eq('event_type', 'OrderCreated')
                .gte('event_time', chunkStart.toISOString())
                .lte('event_time', chunkEnd.toISOString());

            if (existingEvents) {
                existingEvents.forEach((e: any) => {
                    if (e.payload?.id) {
                        existingOrderIds.add(e.payload.id);
                    }
                });
            }
        }

        console.log(`[ChunkedSync] Found ${existingOrderIds.size} existing orders in DB`);

        let processed = 0;
        let skipped = 0;

        for (const order of orders) {
            try {
                // Fast deduplication check using Set
                if (existingOrderIds.has(order.id)) {
                    skipped++;
                    continue;
                }

                // Record to ledger
                await LedgerService.recordEvent(
                    user.id,
                    'shopify_history_scan',
                    'OrderCreated',
                    order,
                    supabaseAdmin
                );

                processed++;
            } catch (e: any) {
                console.error(`[ChunkedSync] Order ${order.id} error:`, e.message);
            }
        }

        const duration = Date.now() - startTime;
        console.log(`[ChunkedSync] Processed: ${processed}, Skipped: ${skipped}, Duration: ${duration}ms`);

        // Determine if we need more pagination within this chunk
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

        // Determine if we need another chunk
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

        // All done - fetch currency
        try {
            const shopInfo: any = await client.get({ path: 'shop' });
            const currency = shopInfo.body?.shop?.currency;
            if (currency) {
                await supabaseAdmin.from('store_settings').update({ currency }).eq('user_id', user.id);
            }
        } catch (e) {
            console.error('[ChunkedSync] Currency update warning:', e);
        }

        return NextResponse.json({
            complete: true,
            syncedOrders: processed,
            skippedOrders: skipped,
            durationMs: duration
        });

    } catch (error: any) {
        console.error('[ChunkedSync] FATAL ERROR:', error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
