import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { shopifyClient } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check (Standard Client)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Integration (Admin Client to bypass RLS)
        const supabaseAdmin = createAdminClient();
        const { data: integration, error: dbError } = await supabaseAdmin
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .maybeSingle();

        if (dbError) {
            console.error('DB Error:', dbError);
            throw new Error(dbError.message);
        }

        if (!integration) {
            return NextResponse.json({ error: 'Integration record not found in DB - Please reconnect Shopify' }, { status: 400 });
        }

        const { access_token, shop_domain } = integration;

        if (!access_token || !shop_domain) {
            return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 400 });
        }

        // 3. Fetch Order Count from Shopify (ALL TIME - no date filter)
        const client = shopifyClient(shop_domain, access_token);
        const countRes: any = await client.get({
            path: 'orders/count',
            query: { status: 'any' }
        });
        const totalOrders = countRes.body?.count || 0;

        // 3.1. NEW: Fetch Shop Info to get Currency
        let shopCurrency = 'TRY'; // Default fallback
        try {
            const shopRes: any = await client.get({ path: 'shop' });
            shopCurrency = shopRes.body?.shop?.currency || 'TRY';
            console.log(`[Sync Init] Detected Shopify currency: ${shopCurrency}`);
        } catch (shopInfoError) {
            console.warn('[Sync Init] Failed to fetch shop info, using default currency TRY');
        }

        // 3.2. Save shop currency to store_settings
        await supabaseAdmin
            .from('store_settings')
            .upsert({
                user_id: user.id,
                currency: shopCurrency,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        // 3.5. HARD RESET DATA (Critical for re-syncing corrections)
        // Since we are starting a full sync, we must clear old faulty data for this user.
        // Order: Check dependencies (Entries -> Transactions -> Event Log)

        // Note: Supabase RLS policies usually handle user_id isolation, but for Admin Client we must be explicit.
        await supabaseAdmin.from('ledger_entries').delete().eq('user_id', user.id);
        await supabaseAdmin.from('ledger_transactions').delete().eq('user_id', user.id);
        await supabaseAdmin.from('financial_event_log').delete().eq('user_id', user.id);


        // 4. Update Integration State (Admin Client)
        await supabaseAdmin
            .from('integrations')
            .update({
                sync_status: 'syncing',
                total_orders_to_sync: totalOrders,
                sync_progress: 0,
                last_synced_cursor: null
            })
            .eq('id', integration.id);

        return NextResponse.json({
            success: true,
            totalOrders,
            status: 'syncing'
        });

    } catch (error: any) {
        console.error('Sync Init Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
