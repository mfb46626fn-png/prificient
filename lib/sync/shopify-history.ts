import shopify from '@/lib/shopify';
import { LedgerService } from '@/lib/ledger';
import { createAdminClient } from '@/lib/supabase-admin';
import { Session } from '@shopify/shopify-api';

export const ShopifyHistoryScanner = {
    async scanPastShopifyData(userId: string, shopDomain: string, accessToken: string, daysToScan = 7) { // Reduced to 7 days for stability
        console.log(`[HistoryScan] === STARTING SYNC ===`);
        console.log(`[HistoryScan] User: ${userId}`);
        console.log(`[HistoryScan] Shop: ${shopDomain}`);
        console.log(`[HistoryScan] Days to scan: ${daysToScan}`);

        const session = new Session({
            id: `offline_${shopDomain}`,
            shop: shopDomain,
            state: 'state',
            isOnline: false,
            accessToken: accessToken
        });

        const client = new shopify.clients.Rest({ session });
        const supabase = createAdminClient();

        // 1. Fetch Product Costs (Global Map: VariantID -> Cost)
        let variantCostMap: Record<string, number> = {};
        /* 
        try {
            console.log(`[HistoryScan] Fetching product costs...`);
            variantCostMap = await fetchVariantCosts(client);
            console.log(`[HistoryScan] Cost Map built for ${Object.keys(variantCostMap).length} variants.`);
        } catch (e: any) {
            console.error(`[HistoryScan] Failed to fetch costs (Check scopes?):`, e.message);
        }
        */

        // Calculate Date Range
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - daysToScan);
        const sinceIso = sinceDate.toISOString();

        console.log(`[HistoryScan] Fetching orders since: ${sinceIso}`);

        let nextPageInfo: string | undefined = undefined;
        let totalProcessed = 0;
        let totalSkipped = 0;
        let errors: string[] = [];

        try {
            do {
                // Fetch Orders
                console.log(`[HistoryScan] Fetching order batch...`);

                // Prepare Query
                // Important: If page_info is present, it contains all filters. We should NOT send other params.
                const queryParams = nextPageInfo
                    ? { limit: 250, page_info: nextPageInfo }
                    : {
                        status: 'any',
                        created_at_min: sinceIso,
                        limit: 250
                    };

                const response: any = await client.get({
                    path: 'orders',
                    query: queryParams as any
                });

                const orders = response.body?.orders || [];
                console.log(`[HistoryScan] Received ${orders.length} orders in this batch`);

                nextPageInfo = response.pageInfo?.nextPage?.query?.page_info;

                for (const order of orders) {
                    try {
                        // Deduplication Check
                        const { count, error: countError } = await supabase
                            .from('financial_event_log')
                            .select('event_id', { count: 'exact', head: true })
                            .eq('user_id', userId)
                            .eq('event_type', 'OrderCreated')
                            .contains('payload', { id: order.id });

                        if (countError) {
                            console.error(`[HistoryScan] Count check error for order ${order.id}:`, countError);
                        }

                        if (count && count > 0) {
                            totalSkipped++;
                            continue;
                        }

                        // INJECT COST DATA
                        if (order.line_items) {
                            order.line_items = order.line_items.map((item: any) => {
                                // Variant ID might be null (custom item), number or string
                                const vId = item.variant_id;
                                const cost = vId && variantCostMap[String(vId)] ? variantCostMap[String(vId)] : 0;
                                return { ...item, __cost: cost };
                            });
                        }

                        // Record Event - Pass admin client
                        await LedgerService.recordEvent(
                            userId,
                            'shopify_history_scan',
                            'OrderCreated',
                            order,
                            supabase
                        );

                        totalProcessed++;

                        if (totalProcessed % 10 === 0) {
                            console.log(`[HistoryScan] Progress: ${totalProcessed} orders processed`);
                        }
                    } catch (orderError: any) {
                        console.error(`[HistoryScan] Error processing order ${order.id}:`, orderError.message);
                        errors.push(`Order ${order.id}: ${orderError.message}`);
                    }
                }

            } while (nextPageInfo);

            console.log(`[HistoryScan] === SYNC COMPLETE ===`);
            console.log(`[HistoryScan] Total Processed: ${totalProcessed}`);
            console.log(`[HistoryScan] Total Skipped (duplicates): ${totalSkipped}`);
            console.log(`[HistoryScan] Errors: ${errors.length}`);

            return totalProcessed;

        } catch (apiError: any) {
            console.error(`[HistoryScan] FATAL API ERROR:`, apiError);
            throw apiError;
        }
    }
};

// --- HELPER FUNC ---
async function fetchVariantCosts(client: any): Promise<Record<string, number>> {
    const costMap: Record<string, number> = {};

    // 1. Fetch Products to get Variant->InventoryItem mapping
    // Assuming < 250 products for MVP. If more, need pagination.
    const productsRes: any = await client.get({ path: 'products', query: { limit: 250, fields: 'id,variants' } });
    const products = productsRes.body.products || [];

    const inventoryItemIds: number[] = [];
    const invIdToVariantId: Record<string, string[]> = {}; // One InvItem could belong to multiple variants theoretically

    products.forEach((p: any) => {
        p.variants?.forEach((v: any) => {
            if (v.inventory_item_id) {
                inventoryItemIds.push(v.inventory_item_id);
                const iid = String(v.inventory_item_id);
                if (!invIdToVariantId[iid]) invIdToVariantId[iid] = [];
                invIdToVariantId[iid].push(String(v.id));
            }
        });
    });

    // 2. Fetch Inventory Items Cost
    // Batch into 50s
    const chunks = [];
    for (let i = 0; i < inventoryItemIds.length; i += 50) {
        chunks.push(inventoryItemIds.slice(i, i + 50));
    }

    for (const chunk of chunks) {
        if (chunk.length === 0) continue;
        const invRes: any = await client.get({
            path: 'inventory_items',
            query: { ids: chunk.join(','), limit: 50 }
        });

        const items = invRes.body.inventory_items || [];
        items.forEach((item: any) => {
            const cost = parseFloat(item.cost || '0');
            const iid = String(item.id);
            // Map cost back to Variant ID(s)
            const variantIds = invIdToVariantId[iid];
            if (variantIds) {
                variantIds.forEach(vid => {
                    costMap[vid] = cost;
                });
            }
        });
    }

    return costMap;
}
