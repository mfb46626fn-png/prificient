import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { LedgerService } from '@/lib/ledger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Batch Process Unprocessed Events
 * Called after sync completes to process events into ledger
 * Processes 50 events per call, returns if more remain
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        // Auth check
        const supabaseUser = await createClient();
        const { data: { user } } = await supabaseUser.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const supabaseAdmin = createAdminClient();

        // Find unprocessed events (no ledger_transaction linked)
        // We check if event has been processed by looking for linked transactions
        // 1. Fetch unprocessed events using Left Join and Filter
        // We limit to 20 to ensure 60s timeout is firmly respected
        const { data: unprocessedEvents, error } = await supabaseAdmin
            .from('financial_event_log')
            .select('event_id, event_type, payload, ledger_transactions(id)')
            .eq('user_id', user.id)
            .is('ledger_transactions', null) // Filter where NO transaction exists
            .order('event_time', { ascending: true })
            .limit(20);

        if (error) {
            console.error('[BatchProcess] DB Error:', JSON.stringify(error));
            return NextResponse.json({ error: error.message, details: error }, { status: 500 });
        }

        const toProcess = unprocessedEvents || [];


        let processed = 0;
        let errors = 0;

        for (const event of toProcess) {
            try {
                await LedgerService.processEvent(
                    event.event_id,
                    user.id,
                    event.event_type,
                    event.payload,
                    supabaseAdmin
                );
                processed++;
            } catch (e: any) {
                console.error(`[BatchProcess] Event ${event.event_id}:`, e.message);
                errors++;
            }
        }

        const duration = Date.now() - startTime;
        const hasMore = toProcess.length === 50;

        return NextResponse.json({
            processed,
            errors,
            hasMore,
            durationMs: duration
        });

    } catch (error: any) {
        console.error('[BatchProcess] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
