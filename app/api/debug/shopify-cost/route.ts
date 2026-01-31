import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { shopifyClient } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

        const { access_token, shop_domain, scope } = integration;
        const client = shopifyClient(shop_domain, access_token);

        // 2. Fetch First 5 Variants
        const varRes = await client.get({
            path: 'variants',
            query: { limit: 5 }
        });

        const variants = (varRes.body as any).variants || [];
        const variantIds = variants.map((v: any) => v.id);
        const inventoryItemIds = variants.map((v: any) => v.inventory_item_id);

        // 3. Fetch Inventory Items (Original approach)
        let invItemsRaw: any[] = [];
        let invItemsError = null;

        if (inventoryItemIds.length > 0) {
            try {
                const invRes = await client.get({
                    path: 'inventory_items',
                    query: { ids: inventoryItemIds.join(',') }
                });
                invItemsRaw = (invRes.body as any).inventory_items || [];
            } catch (e: any) {
                invItemsError = e.message;
            }
        }

        return NextResponse.json({
            meta: {
                shop: shop_domain,
                scopes_in_db: scope,
                token_preview: access_token.substring(0, 10) + '...'
            },
            variants_sample: variants.map((v: any) => ({
                id: v.id,
                title: v.title,
                inventory_item_id: v.inventory_item_id,
                price: v.price
            })),
            inventory_items_raw: invItemsRaw,
            error: invItemsError
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
