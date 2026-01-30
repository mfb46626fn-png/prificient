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
        // 1. Fetch recent events
        const { data: recentEvents, error } = await supabaseAdmin
            .from('financial_event_log')
            .select('*')
            .eq('user_id', user.id)
            .order('event_time', { ascending: true }) // Oldest first
            .limit(100);

        if (error) {
            console.error('[BatchProcess] Error fetching events:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!recentEvents || recentEvents.length === 0) {
            return NextResponse.json({ processed: 0, hasMore: false, durationMs: Date.now() - startTime });
        }

        // 2. Check which ones are already processed
        const eventIds = recentEvents.map(e => e.event_id);
        const { data: processedTransactions } = await supabaseAdmin
            .from('ledger_transactions')
            .select('event_id')
            .in('event_id', eventIds);

        const processedEventIds = new Set((processedTransactions || []).map((t: any) => t.event_id));

        // 3. Filter
        const toProcess = recentEvents.filter(e => !processedEventIds.has(e.event_id)).slice(0, 50);

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
