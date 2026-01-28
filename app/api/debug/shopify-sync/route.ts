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

        // Step 8: Full Sync Simulation for One Order
        const testOrder = ordersResponse.body?.orders?.[0];
        if (testOrder) {
            results.steps.push({ step: 8, name: 'Starting Sync Simulation', orderId: testOrder.id });

            // 8.1 Initialize Accounts
            const { error: initError } = await supabaseAdmin.from('ledger_accounts').select('count').eq('user_id', user.id).single();
            // Try to init
            await import('@/lib/ledger').then(m => m.LedgerService.initializeAccounts(user.id, supabaseAdmin));

            // Re-check accounts
            const { data: accounts, error: accError } = await supabaseAdmin.from('ledger_accounts').select('*').eq('user_id', user.id);
            results.steps.push({
                step: 8.1,
                name: 'Account Initialization',
                accountCount: accounts?.length || 0,
                accounts: accounts?.map((a: any) => `${a.code} (${a.type})`),
                error: accError?.message || null
            });

            if (!accounts || accounts.length === 0) {
                return NextResponse.json({ ...results, error: 'Ledger Accounts failed to initialize' }, { status: 500 });
            }

            // 8.2 Record Event (Simulate)
            const { data: eventLog, error: eventError } = await supabaseAdmin.from('financial_event_log').insert({
                user_id: user.id,
                stream_type: 'debug_simulation',
                event_type: 'OrderCreated',
                payload: testOrder
            }).select().single();

            results.steps.push({
                step: 8.2,
                name: 'Record Event Log',
                eventId: eventLog?.event_id,
                error: eventError?.message || null
            });

            if (eventLog) {
                // 8.3 Process Event (Manual Call to catch errors)
                try {
                    const LedgerService = (await import('@/lib/ledger')).LedgerService;
                    await LedgerService.processEvent(eventLog.event_id, user.id, 'OrderCreated', testOrder, supabaseAdmin);

                    results.steps.push({ step: 8.3, name: 'Process Event', success: true });
                } catch (processError: any) {
                    results.steps.push({
                        step: 8.3,
                        name: 'Process Event',
                        success: false,
                        error: processError.message,
                        stack: processError.stack
                    });
                }

                // 8.4 Check Resulting Transactions
                const { data: txs } = await supabaseAdmin.from('ledger_transactions').select('*').eq('event_id', eventLog.event_id);
                const { data: entries } = await supabaseAdmin.from('ledger_entries').select('*').in('transaction_id', txs?.map((t: any) => t.id) || []);

                results.steps.push({
                    step: 8.4,
                    name: 'Verify Ledger Entries',
                    transactionCount: txs?.length || 0,
                    entryCount: entries?.length || 0,
                    entries: entries
                });

                // Cleanup simulation
                // await supabaseAdmin.from('financial_event_log').delete().eq('event_id', eventLog.event_id);
            }
        }

        // Summary
        results.summary = {
            allStepsSuccessful: results.steps.every((s: any) => s.success !== false),
            shopifyConnected: !!integration,
            shopifyHasOrders: (ordersResponse.body?.orders?.length || 0) > 0,
            accountInitSuccess: (results.steps.find((s: any) => s.step === 8.1)?.accountCount || 0) > 0,
            syncSimulationSuccess: (results.steps.find((s: any) => s.step === 8.4)?.entryCount || 0) > 0
        };

        return NextResponse.json(results);

    } catch (error: any) {
        results.fatalError = error.message;
        results.stack = error.stack;
        return NextResponse.json(results, { status: 500 });
    }
}
