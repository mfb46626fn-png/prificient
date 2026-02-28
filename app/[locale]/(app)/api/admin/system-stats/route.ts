
import { createAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    // 1. Admin Verification
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = (user.email || '').toLowerCase();
    const isExplicitAdmin = ['can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com'].includes(email);
    const isAdmin = user.app_metadata?.role === 'prificient_admin' || isExplicitAdmin;

    if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Gather Metrics
    const supabaseAdmin = createAdminClient();
    const start = Date.now();

    // Parallel Fetching
    // Parallel Fetching
    const [
        { data: { users: recentUsers } },
        { count: ticketCount },
        { count: logCount },
        // Simple query for latency check
        { error: dbError }
    ] = await Promise.all([
        supabaseAdmin.auth.admin.listUsers(),
        supabaseAdmin.from('support_tickets').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('financial_event_log').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('profiles').select('id').limit(1).maybeSingle() // Latency Check (Public table)
    ]);

    const userCount = recentUsers.length;

    const latency = Date.now() - start;

    // 3. System Stats
    const stats = {
        server: {
            uptime: Math.floor(process.uptime()),
            memory: Math.round(process.memoryUsage().rss / 1024 / 1024),
            status: 'ok'
        },
        database: {
            status: dbError ? 'error' : 'connected',
            latency,
            stats: {
                users: userCount || 0,
                tickets: ticketCount || 0,
                logs: logCount || 0
            }
        },
        time: new Date().toISOString()
    };

    return NextResponse.json(stats);
}
