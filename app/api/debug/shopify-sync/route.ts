import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import shopify from '@/lib/shopify';

export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to test Shopify sync step by step
 * Call: GET /api/debug/shopify-sync
 */
export async function GET(req: NextRequest) {
    const results: any = {
        timestamp: new Date().toISOString(),
        steps: []
    };

    try {
        // Step 1: Check user authentication
        const supabaseUser = await createClient();
        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        results.steps.push({
            step: 1,
            name: 'User Authentication',
            success: !!user,
            userId: user?.id || null,
            error: userError?.message || null
        });

        if (!user) {
            return NextResponse.json({ ...results, error: 'Not authenticated' }, { status: 401 });
        }

        // Step 2: Get Shopify integration from DB
        const supabaseAdmin = createAdminClient();
        const { data: integration, error: integrationError } = await supabaseAdmin
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .eq('status', 'active')
            .single();

        results.steps.push({
            step: 2,
            name: 'Get Shopify Integration',
            success: !!integration,
            shopDomain: integration?.shop_domain || null,
            hasAccessToken: !!integration?.access_token,
            error: integrationError?.message || null
        });

        if (!integration || !integration.access_token) {
            return NextResponse.json({ ...results, error: 'No active Shopify integration found' }, { status: 404 });
        }

        // Step 3: Test Shopify API connection
        const session = {
            shop: integration.shop_domain,
            accessToken: integration.access_token,
        };
        const client = new shopify.clients.Rest({ session: session as any });

        let ordersResponse: any;
        try {
            ordersResponse = await client.get({
                path: 'orders',
                query: {
                    status: 'any',
                    limit: 5 // Just get 5 orders for testing
                }
            });

            results.steps.push({
                step: 3,
                name: 'Shopify API Call',
                success: true,
                orderCount: ordersResponse.body?.orders?.length || 0,
                sampleOrder: ordersResponse.body?.orders?.[0] ? {
                    id: ordersResponse.body.orders[0].id,
                    order_number: ordersResponse.body.orders[0].order_number,
                    total_price: ordersResponse.body.orders[0].total_price,
                    created_at: ordersResponse.body.orders[0].created_at
                } : null
            });
        } catch (shopifyError: any) {
            results.steps.push({
                step: 3,
                name: 'Shopify API Call',
                success: false,
                error: shopifyError.message,
                fullError: JSON.stringify(shopifyError, null, 2)
            });
            return NextResponse.json({ ...results, error: 'Shopify API failed' }, { status: 500 });
        }

        // Step 4: Check existing events in financial_event_log
        const { count: eventCount, error: countError } = await supabaseAdmin
            .from('financial_event_log')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        results.steps.push({
            step: 4,
            name: 'Check Existing Events',
            success: !countError,
            eventCount: eventCount || 0,
            error: countError?.message || null
        });

        // Step 5: Check ledger_transactions
        const { count: transactionCount, error: txError } = await supabaseAdmin
            .from('ledger_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        results.steps.push({
            step: 5,
            name: 'Check Ledger Transactions',
            success: !txError,
            transactionCount: transactionCount || 0,
            error: txError?.message || null
        });

        // Step 6: Check ledger_entries
        const { count: entryCount, error: entryError } = await supabaseAdmin
            .from('ledger_entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        results.steps.push({
            step: 6,
            name: 'Check Ledger Entries',
            success: !entryError,
            entryCount: entryCount || 0,
            error: entryError?.message || null
        });

        // Step 7: Try to insert a test event
        const testOrder = ordersResponse.body?.orders?.[0];
        if (testOrder) {
            const { data: insertData, error: insertError } = await supabaseAdmin
                .from('financial_event_log')
                .insert({
                    user_id: user.id,
                    stream_type: 'debug_test',
                    event_type: 'TestEvent',
                    payload: { test: true, order_id: testOrder.id, timestamp: new Date().toISOString() }
                })
                .select()
                .single();

            results.steps.push({
                step: 7,
                name: 'Test Insert to financial_event_log',
                success: !!insertData,
                insertedId: insertData?.event_id || null,
                error: insertError?.message || null,
                errorDetails: insertError ? JSON.stringify(insertError) : null
            });

            // Cleanup test data
            if (insertData) {
                await supabaseAdmin
                    .from('financial_event_log')
                    .delete()
                    .eq('event_id', insertData.event_id);
            }
        }

        // Summary
        results.summary = {
            allStepsSuccessful: results.steps.every((s: any) => s.success),
            shopifyConnected: !!integration,
            shopifyHasOrders: (ordersResponse.body?.orders?.length || 0) > 0,
            databaseHasEvents: (eventCount || 0) > 0,
            databaseHasTransactions: (transactionCount || 0) > 0
        };

        return NextResponse.json(results);

    } catch (error: any) {
        results.fatalError = error.message;
        return NextResponse.json(results, { status: 500 });
    }
}
