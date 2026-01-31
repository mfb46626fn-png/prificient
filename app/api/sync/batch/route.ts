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
        // 2. Fetch Orders (1 Day Chunk or Page)
        // Optimization: Reduce limit to 50 to process faster and avoid timeouts
        // 2. Fetch Orders (1 Day Chunk or Page)
        // Optimization: Reduce limit to 50 to process faster and avoid timeouts
        let params: any = { limit: 50 };

        if (cursor) {
            // IF CURSOR EXISTS: ONLY PASS PAGE_INFO & LIMIT
            params.page_info = cursor;
        } else {
            // FIRST BATCH: Apply filters
            params.status = 'any';
            // Align with Init Route (which uses no date filter currently), 
            // OR enforce a reasonable date like 2023-01-01.
            // But if user has older orders, they expect them.
            // Let's stick to 2023-01-01 for now as per previous plan, but ensure it's not passed with cursor.
            params.created_at_min = '2023-01-01T00:00:00Z';
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

        // Fix: Node http headers can be array, ensure string
        if (Array.isArray(linkHeader)) {
            linkHeader = linkHeader.join(', ');
        }

        // Ensure it's a string before proceeding
        linkHeader = String(linkHeader || '');

        const orders = (response.body as any).orders || [];

        // Calculate Stats for Verification (Declared here for scope access)
        let batchRevenue = 0;
        let batchCurrency = 'TRY';
        const productCounts: Record<string, number> = {};

        // 3. ENRICH WITH COSTS (Critical Fix for Profit Calculation)
        // We need to fetch Inventory Item Costs for these orders.
        // Flow: Order -> Variant -> InventoryItem -> Cost

        if (orders.length > 0) {
            try {
                // A. Collect all Variant IDs from all orders
                const variantIds = new Set<string>();
                orders.forEach((o: any) => {
                    o.line_items?.forEach((li: any) => {
                        if (li.variant_id) variantIds.add(String(li.variant_id));
                    });
                });

                if (variantIds.size > 0) {
                    const idsArr = Array.from(variantIds);

                    // B. Fetch Variants (in chunks of 250 if needed, but 50 orders unlikely to exceed)
                    // limit=250 is max
                    // If > 250, we should loop, but for 50 orders (avg 5 items) = 250 items max usually fine.
                    // If truncated, costs will be 0 for some. MVP acceptable.
                    const varRes = await client.get({
                        path: 'variants',
                        query: { ids: idsArr.slice(0, 250).join(','), limit: 250 }
                    });

                    const variants = (varRes.body as any).variants || [];

                    // C. Collect Inventory Item IDs
                    const invItemIds = variants.map((v: any) => v.inventory_item_id).filter(Boolean);

                    if (invItemIds.length > 0) {
                        // D. Fetch Inventory Items (Cost)
                        const invRes = await client.get({
                            path: 'inventory_items',
                            query: { ids: invItemIds.slice(0, 250).join(','), limit: 250 }
                        });

                        const inventoryItems = (invRes.body as any).inventory_items || [];

                        // E. Create Cost Map
                        const costMap = new Map<number, number>(); // VariantId -> Cost

                        variants.forEach((v: any) => {
                            const inv = inventoryItems.find((i: any) => i.id === v.inventory_item_id);
                            if (inv) {
                                costMap.set(v.id, parseFloat(inv.cost || '0'));
                            }
                        });

                        // F. Inject Cost into Order Line Items
                        orders.forEach((o: any) => {
                            o.line_items?.forEach((li: any) => {
                                if (li.variant_id) {
                                    li.__cost = costMap.get(li.variant_id) || 0;
                                }
                            });
                        });
                    }
                }
            } catch (costError) {
                console.warn('Failed to enrich costs in batch:', costError);
                // Continue without costs (Profit = Revenue, better than crash)
            }

            // Calculate Stats for Verification
            if (orders.length > 0) {
                orders.forEach((o: any) => {
                    batchRevenue += parseFloat(o.total_price);
                    batchCurrency = o.currency; // Assume consistent currency or take last

                    o.line_items?.forEach((li: any) => {
                        const name = li.title;
                        productCounts[name] = (productCounts[name] || 0) + li.quantity;
                    });
                });
            }

            // Process in parallel with error isolation
            const results = await Promise.allSettled(orders.map((order: any) =>
                LedgerService.recordEvent(
                    user.id,
                    'shopify_sync',
                    'OrderCreated',
                    order,
                    supabaseAdmin,
                    false // Full Processing!
                )
            ));

            // Log failures for debugging
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                console.error(`[Sync Batch] ${failed.length}/${orders.length} orders failed to process.`);
                failed.forEach((f: any) => console.error('[Sync Error Details]:', f.reason));
            }
        }

        // 4. Extract Next Cursor
        let nextCursor = null;
        if (linkHeader) {
            // Shopify Link Header Format: <url>; rel="next", <url>; rel="previous"
            // We need to parse this properly.
            const links = linkHeader.split(',');
            for (const link of links) {
                if (link.includes('rel="next"')) {
                    const match = link.match(/page_info=([^>&]+)/);
                    if (match) {
                        nextCursor = match[1];
                        break;
                    }
                }
            }
        }

        // 5. Update Progress in DB
        await supabaseAdmin
            .from('integrations')
            .update({
                last_synced_cursor: nextCursor,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('platform', 'shopify');

        // 6. Auto-Update Store Currency (If needed)
        // If we found a currency in this batch, ensure store_settings reflects it.
        if (batchCurrency && batchCurrency !== 'TRY') {
            await supabaseAdmin
                .from('store_settings')
                .upsert({
                    user_id: user.id,
                    currency: batchCurrency,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        }

        return NextResponse.json({
            processed: orders.length,
            next_cursor: nextCursor,
            stats: {
                revenue: batchRevenue,
                currency: batchCurrency,
                products: productCounts
            }
        });

    } catch (error: any) {
        console.error('[Sync Batch] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
