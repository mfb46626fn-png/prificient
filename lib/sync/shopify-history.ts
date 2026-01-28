import shopify from '@/lib/shopify';
import { LedgerService } from '@/lib/ledger';
import { createClient } from '@/utils/supabase/server';

export const ShopifyHistoryScanner = {
    async scanPastShopifyData(userId: string, shopDomain: string, accessToken: string, daysToScan = 90) {
        const session = {
            shop: shopDomain,
            accessToken: accessToken,
        };

        const client = new shopify.clients.Rest({ session: session as any });
        const supabase = await createClient();

        // Calculate Date Range
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - daysToScan);
        const sinceIso = sinceDate.toISOString();

        console.log(`[HistoryScan] Starting scan for ${shopDomain} since ${sinceIso}`);

        let nextPageInfo: string | undefined = undefined;
        let totalProcessed = 0;

        do {
            // Fetch Orders
            // Type definition for get requests might vary, explicit casting or loose typing used here
            const response: any = await client.get({
                path: 'orders',
                query: {
                    status: 'any',
                    created_at_min: sinceIso,
                    limit: 250, // Max limit
                    page_info: nextPageInfo as any
                }
            });

            const orders = response.body.orders;
            nextPageInfo = response.pageInfo?.nextPage?.query?.page_info;

            for (const order of orders) {
                // Deduplication Check
                // We check if we already have an event for this order ID
                const { count } = await supabase
                    .from('financial_event_log')
                    .select('event_id', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('event_type', 'OrderCreated')
                    .contains('payload', { id: order.id });

                if (count && count > 0) {
                    console.log(`[HistoryScan] Skipping Order ${order.id} (Already Exists)`);
                    continue;
                }

                // Prepare Payload (Map to webhook structure ideally, or just use Order object)
                // Webhook payload usually is the Order JSON.

                // Record Event - Pass server supabase client
                await LedgerService.recordEvent(
                    userId,
                    'shopify_history_scan',
                    'OrderCreated',
                    order,
                    supabase // Pass server-side client
                );

                totalProcessed++;
            }

            console.log(`[HistoryScan] Processed batch. Total: ${totalProcessed}`);

        } while (nextPageInfo);

        console.log(`[HistoryScan] Completed. Total Orders Backfilled: ${totalProcessed}`);
        return totalProcessed;
    }
};
