import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { shopifyClient } from '@/lib/shopify';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabaseAdmin = createAdminClient();

        // 1. Get Shopify Access Token
        const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('access_token, shop_name')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .single();

        if (!integration || !integration.access_token) {
            return NextResponse.json({ error: 'Shopify not connected' }, { status: 400 });
        }

        // 2. Init Shopify Client & Fetch Count
        const client = shopifyClient(integration.shop_name, integration.access_token);
        const count = await client.get({ path: 'orders/count', query: { status: 'any' } });

        const totalOrders = count.body.count;

        // 3. Update DB state
        const { error } = await supabaseAdmin
            .from('integrations')
            .update({
                sync_status: 'syncing',
                sync_progress: 0,
                total_orders_to_sync: totalOrders,
                last_synced_cursor: null, // Reset cursor for fresh sync
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('platform', 'shopify');

        if (error) throw error;

        return NextResponse.json({
            success: true,
            totalOrders,
            status: 'syncing'
        });

    } catch (error: any) {
        console.error('[Sync Init] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
