import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { shopifyClient } from '@/lib/shopify';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow 5 mins for cleanup

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check for confirmation param to prevent accidents
        const { searchParams } = new URL(req.url);
        if (searchParams.get('confirm') !== 'true') {
            return NextResponse.json({ error: 'Please add ?confirm=true to URL to execute this destructive action.' }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();
        const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .single();

        if (!integration) return NextResponse.json({ error: 'No Shopify integration found' }, { status: 404 });

        const client = shopifyClient(integration.shop_domain, integration.access_token);

        const logs = [];

        // 1. DELETE PRODUCTS
        logs.push('Fetching products...');
        let hasProducts = true;
        while (hasProducts) {
            const productsRes: any = await client.get({ path: 'products', query: { limit: 250, fields: 'id' } });
            const products = productsRes.body?.products || [];

            if (products.length === 0) {
                hasProducts = false;
                break;
            }

            logs.push(`Deleting ${products.length} products...`);

            // Process in sequence to avoid rate limits
            for (const p of products) {
                try {
                    await client.delete({ path: `products/${p.id}` });
                } catch (e: any) {
                    logs.push(`Failed to delete product ${p.id}: ${e.message}`);
                }
            }
        }
        logs.push('All products deleted.');

        // 2. DELETE ORDERS
        logs.push('Fetching orders...');
        let hasOrders = true;
        while (hasOrders) {
            const ordersRes: any = await client.get({ path: 'orders', query: { limit: 250, status: 'any', fields: 'id' } });
            const orders = ordersRes.body?.orders || [];

            if (orders.length === 0) {
                hasOrders = false;
                break;
            }

            logs.push(`Deleting ${orders.length} orders...`);

            for (const o of orders) {
                try {
                    await client.delete({ path: `orders/${o.id}` });
                } catch (e: any) {
                    logs.push(`Failed to delete order ${o.id}: ${e.message}`);
                }
            }
        }
        logs.push('All orders deleted.');

        return NextResponse.json({ success: true, logs });

    } catch (error: any) {
        console.error('Reset Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
