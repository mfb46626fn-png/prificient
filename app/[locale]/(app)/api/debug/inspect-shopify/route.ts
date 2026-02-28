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

        // 1. Fetch 10 Orders
        const orderRes = await client.get({ path: 'orders', query: { limit: 10, status: 'any' } });
        const orders = (orderRes.body as any).orders || [];

        // 2. Build HTML Table
        let html = `
        <html>
            <head>
                <style>
                    body { font-family: sans-serif; background: #111; color: #eee; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #333; padding: 8px; text-align: left; }
                    th { background: #222; }
                    .pass { color: #4ade80; }
                    .fail { color: #f87171; }
                    .warn { color: #fbbf24; }
                </style>
            </head>
            <body>
                <h1>Shopify Data Inspection (Last 10 Orders)</h1>
                <p>This table shows exactly what Shopify sends. If dates are same here, they are same in Shopify.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Created At (Local)</th>
                            <th>UTC String (Raw)</th>
                            <th>Items</th>
                            <th>Cost Check</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (const order of orders) {
            let costStatus = '<span class="warn">No Items</span>';

            // Check Cost for First Item
            if (order.line_items?.[0]) {
                const item = order.line_items[0];
                const vid = item.variant_id;
                try {
                    const varRes = await client.get({ path: `variants/${vid}` });
                    const variant = (varRes.body as any).variant;

                    if (variant?.inventory_item_id) {
                        try {
                            const invRes = await client.get({ path: `inventory_items/${variant.inventory_item_id}` });
                            const inventory = (invRes.body as any).inventory_item;
                            const cost = inventory.cost;

                            if (cost !== undefined && cost !== null) {
                                costStatus = `<span class="pass">Found: ${cost}</span>`;
                            } else {
                                costStatus = `<span class="fail">Cost is NULL/Empty</span>`;
                            }
                        } catch (e: any) {
                            costStatus = `<span class="fail">Inv Error: ${e.message}</span>`;
                        }
                    } else {
                        costStatus = `<span class="fail">No Inv Item ID</span>`;
                    }
                } catch (e: any) {
                    costStatus = `<span class="fail">Var Error: ${e.message}</span>`;
                }
            }

            html += `
                <tr>
                    <td>${order.order_number}</td>
                    <td>${new Date(order.created_at).toLocaleString('tr-TR')}</td>
                    <td>${order.created_at}</td>
                    <td>${order.line_items?.length || 0}</td>
                    <td>${costStatus}</td>
                </tr>
            `;
        }

        html += `</tbody></table></body></html>`;

        return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });

    } catch (error: any) {
        return new NextResponse(`<h1>Error</h1><p>${error.message}</p>`, { status: 500, headers: { 'Content-Type': 'text/html' } });
    }
}
