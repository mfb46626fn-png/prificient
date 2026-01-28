import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { ShopifyHistoryScanner } from '@/lib/sync/shopify-history';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro max

/**
 * Manual Shopify Sync Trigger
 * Call: GET or POST /api/debug/trigger-sync
 */
export async function GET(req: NextRequest) {
    return triggerSync();
}

export async function POST(req: NextRequest) {
    return triggerSync();
}

async function triggerSync() {
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
            90 // Last 90 days
        );

        const duration = Date.now() - startTime;

        console.log('[ManualSync] === SYNC COMPLETE ===');
        console.log('[ManualSync] Orders synced:', syncedCount);
        console.log('[ManualSync] Duration:', duration, 'ms');

        return NextResponse.json({
            success: true,
            syncedOrders: syncedCount,
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
