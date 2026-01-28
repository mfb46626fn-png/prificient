import shopify from '@/lib/shopify';
import { LedgerService } from '@/lib/ledger';
import { createAdminClient } from '@/lib/supabase-admin';

export const ShopifyHistoryScanner = {
    async scanPastShopifyData(userId: string, shopDomain: string, accessToken: string, daysToScan = 90) {
        console.log(`[HistoryScan] === STARTING SYNC ===`);
        console.log(`[HistoryScan] User: ${userId}`);
        console.log(`[HistoryScan] Shop: ${shopDomain}`);
        console.log(`[HistoryScan] Days to scan: ${daysToScan}`);

        const session = {
            shop: shopDomain,
            accessToken: accessToken,
        };

        const client = new shopify.clients.Rest({ session: session as any });

        // Use ADMIN client to bypass RLS policies
        const supabase = createAdminClient();

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

                const response: any = await client.get({
                    path: 'orders',
                    query: {
                        status: 'any',
                        created_at_min: sinceIso,
                        limit: 250,
                        page_info: nextPageInfo as any
                    }
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

