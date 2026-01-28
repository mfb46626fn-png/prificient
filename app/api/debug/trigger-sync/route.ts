import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { ShopifyHistoryScanner } from '@/lib/sync/shopify-history';
import shopify from '@/lib/shopify';
import { Session } from '@shopify/shopify-api';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro max

/**
 * Manual Shopify Sync Trigger
 * Call: POST /api/debug/trigger-sync
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        console.log('[ManualSync] === STARTING MANUAL SYNC ===');

        // Step 1: Get authenticated user
        const supabaseUser = await createClient();
        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (!user) {
            console.error('[ManualSync] User not authenticated');
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        console.log('[ManualSync] User:', user.id);

        // Step 2: Get Shopify integration
        const supabaseAdmin = createAdminClient();
        const { data: integration, error: integrationError } = await supabaseAdmin
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .eq('status', 'active')
            .single();

        if (!integration) {
            console.error('[ManualSync] No Shopify integration found');
            return NextResponse.json({ error: 'No active Shopify integration' }, { status: 404 });
        }

        console.log('[ManualSync] Shop:', integration.shop_domain);

        // Step 3: Run sync
        console.log('[ManualSync] Starting history scan...');

        const syncedCount = await ShopifyHistoryScanner.scanPastShopifyData(
            user.id,
            integration.shop_domain,
            integration.access_token,
            7 // Reduced to 7 days for stability
        );

        // Fetch & Update Currency (Async)
        try {
            const session = new Session({
                id: `offline_${integration.shop_domain}`,
                shop: integration.shop_domain,
                state: 'state',
                isOnline: false,
                accessToken: integration.access_token
            });
            const client = new shopify.clients.Rest({ session });
            const shopInfo: any = await client.get({ path: 'shop' });
            const currency = shopInfo.body?.shop?.currency;

            if (currency) {
                await supabaseAdmin.from('store_settings').update({ currency }).eq('user_id', user.id);
                console.log(`[ManualSync] Currency updated: ${currency}`);
            }
        } catch (err) {
            console.error('[ManualSync] Currency update warning:', err);
        }

        const duration = Date.now() - startTime;

        console.log('[ManualSync] === SYNC COMPLETE ===');
        console.log('[ManualSync] Orders synced:', syncedCount);
        console.log('[ManualSync] Duration:', duration, 'ms');

        return NextResponse.json({
            success: true,
            syncedOrders: syncedCount || 0, // Ensure number
            shopDomain: integration.shop_domain,
            durationMs: duration
        });

    } catch (error: any) {
        console.error('[ManualSync] FATAL ERROR:', error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
