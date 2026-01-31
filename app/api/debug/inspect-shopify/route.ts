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

        const supabaseAdmin = createAdminClient();
        const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .single();

        if (!integration) return NextResponse.json({ error: 'No Shopify integration found' });

        const client = shopifyClient(integration.shop_domain, integration.access_token);

        // 1. Fetch 1 Order
        const orderRes = await client.get({ path: 'orders', query: { limit: 1, status: 'any' } });
        const orders = (orderRes.body as any).orders || [];
        const firstOrder = orders[0] || null;

        // 2. Fetch 1 Variant (from order if possible)
        let variant = null;
        let inventory = null;
        let costError = null;

        if (firstOrder && firstOrder.line_items?.[0]?.variant_id) {
            try {
                const vid = firstOrder.line_items[0].variant_id;
                const varRes = await client.get({ path: `variants/${vid}` });
                variant = (varRes.body as any).variant;

                if (variant?.inventory_item_id) {
                    try {
                        const invRes = await client.get({ path: `inventory_items/${variant.inventory_item_id}` });
                        inventory = (invRes.body as any).inventory_item;
                    } catch (e: any) {
                        costError = `Inventory Fetch Failed: ${e.message}`;
                    }
                }
            } catch (e: any) {
                variant = `Variant Fetch Failed: ${e.message}`;
            }
        }

        return NextResponse.json({
            instruction: "Please share this JSON with the developer.",
            order_keys: firstOrder ? Object.keys(firstOrder) : [],
            created_at_snake: firstOrder?.created_at,
            createdAt_camel: firstOrder?.createdAt,
            processed_at: firstOrder?.processed_at,
            sample_variant: variant,
            sample_inventory: inventory,
            cost_status: costError ? "Error" : "Success",
            cost_error: costError
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
