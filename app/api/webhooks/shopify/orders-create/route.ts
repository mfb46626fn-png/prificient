import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase-admin';
import { LedgerService } from '@/lib/ledger';
import { EmailService } from '@/lib/email-service';
import { shopifyClient } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // 1. Validations & Headers
        const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256');
        const shopDomain = req.headers.get('X-Shopify-Shop-Domain'); // e.g., store.myshopify.com

        if (!hmacHeader || !shopDomain) {
            return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
        }

        const rawBody = await req.text();

        // HMAC Verification (using env secret? Or per-user?)
        // Usually App has one Secret.
        const secret = process.env.SHOPIFY_API_SECRET!;
        const hash = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');

        if (hash !== hmacHeader) {
            console.error('[Webhook] HMAC Mismatch');
            return NextResponse.json({ error: 'Invalid HMAC' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);

        // 2. Identify Tenant (User)
        const supabaseAdmin = createAdminClient();
        const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('user_id, access_token, shop_name')
            .eq('platform', 'shopify')
            // Match shop_name or shop_name.myshopify.com
            // Assuming stored shop_name matches domain or part of it?
            // Usually we store "my-store.myshopify.com".
            .ilike('shop_name', `%${shopDomain.replace('.myshopify.com', '')}%`)
            .single();

        if (!integration) {
            console.log(`[Webhook] No integration found for shop: ${shopDomain}`);
            return NextResponse.json({ message: 'Ignored' });
        }

        const user_id = integration.user_id;
        const access_token = integration.access_token;

        // 3. Enrich with Costs (Fetch from Shopify)
        // We need InventoryItem costs.
        // Order -> LineItems -> Variant -> InventoryItem -> Cost

        // Collect Variant IDs
        const variantIds = payload.line_items?.map((li: any) => li.variant_id).filter(Boolean) || [];

        if (variantIds.length > 0 && access_token) {
            const client = shopifyClient(shopDomain, access_token);

            // A. Fetch Variants to get InventoryItemIDs
            // GET /variants?ids=...
            const varRes = await client.get({
                path: 'variants',
                query: { ids: variantIds.join(','), limit: 250 } // Max 250
            });
            const variants = (varRes.body as any).variants || [];

            const invItemIds = variants.map((v: any) => v.inventory_item_id).filter(Boolean);

            if (invItemIds.length > 0) {
                // B. Fetch InventoryItems to get Cost
                const invRes = await client.get({
                    path: 'inventory_items',
                    query: { ids: invItemIds.join(','), limit: 250 }
                });
                const inventoryItems = (invRes.body as any).inventory_items || [];

                // Map Variant -> Cost
                const costMap = new Map(); // VariantID -> Cost

                variants.forEach((v: any) => {
                    const inv = inventoryItems.find((i: any) => i.id === v.inventory_item_id);
                    if (inv) {
                        costMap.set(v.id, parseFloat(inv.cost || '0'));
                    }
                });

                // Inject into Payload
                payload.line_items = payload.line_items.map((li: any) => ({
                    ...li,
                    __cost: costMap.get(li.variant_id) || 0
                }));
            }
        }

        // 4. Record to Ledger
        await LedgerService.recordEvent(
            user_id,
            'shopify_webhook',
            'OrderCreated',
            payload,
            supabaseAdmin,
            false // Instant Processing
        );

        // 5. Calculate Instant Profit & Notify
        const revenue = parseFloat(payload.total_price || '0');

        // COGS
        let cogs = 0;
        if (payload.line_items) {
            cogs = payload.line_items.reduce((sum: number, item: any) => {
                const q = item.quantity || 1;
                const cost = Number(item.__cost || 0);
                return sum + (q * cost);
            }, 0);
        }

        // Fees (Est. 3%)
        const fees = revenue * 0.03;
        // Shipping Cost (Ignored/Zero for now as per plan, keeping it simple)
        const shippingCost = 0;

        const totalCosts = cogs + fees + shippingCost;
        const profit = revenue - totalCosts;

        // Get User Email
        const { data: user } = await supabaseAdmin.auth.admin.getUserById(user_id);
        const email = user.user?.email;

        if (email) {
            await EmailService.sendOrderProfitAlert(
                email,
                payload,
                {
                    revenue: revenue.toFixed(2),
                    costs: totalCosts.toFixed(2),
                    profit: profit.toFixed(2)
                }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
