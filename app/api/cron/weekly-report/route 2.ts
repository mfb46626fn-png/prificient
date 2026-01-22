import { createClient } from '@supabase/supabase-js';
import { EmailService } from '@/lib/email';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // For Vercel Cron, typically the header is 'Authorization: Bearer <CRON_SECRET>'
        // But Vercel Cron might send it differently or we can set CRON_SECRET as header
        // Let's assume standard Vercel Cron protection setup or just check a custom secret query/header.
        // Ideally check: request.headers.get('x-cron-secret') or similar if configured manually.
        // For this MVP, let's assume strict header check if CRON_SECRET is set.
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    // 2. Initialize Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Date Range (Last 7 Days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // 4. Fetch All Users
    // In a real app, you might want to batch this or filter by 'active' status.
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError || !users) {
        console.error('Failed to list users:', usersError);
        return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
    }

    const results = [];

    // 5. Generate and Send Reports
    for (const user of users) {
        try {
            if (!user.email) continue;

            // Fetch Profile for Name
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();

            const userName = profile?.full_name || 'Kullanıcı';

            // Fetch Financial Metrics for User
            // Logic borrowed from Semantic Layer definitions
            // 600% -> Revenue (Credit)
            // 760% -> Marketing (Debit)
            // 7% -> Total Operating Expenses (Debit)

            // Fetch Ledger Entries for the period
            const { data: entries } = await supabase
                .from('ledger_entries')
                .select(`
          amount,
          direction,
          ledger_transactions!inner(created_at),
          ledger_accounts!inner(code)
        `)
                .eq('user_id', user.id)
                .gte('ledger_transactions.created_at', startDate.toISOString())
                .lte('ledger_transactions.created_at', endDate.toISOString());

            let revenue = 0;
            let adSpend = 0;
            let totalExpenses = 0; // Operating Expenses (7xx)

            if (entries) {
                entries.forEach((e: any) => {
                    const code = e.ledger_accounts.code;
                    const amt = e.amount;

                    if (code.startsWith('600') && e.direction === 'CREDIT') {
                        revenue += amt;
                    }
                    if (code.startsWith('760') && e.direction === 'DEBIT') {
                        adSpend += amt;
                    }
                    if (code.startsWith('7') && e.direction === 'DEBIT') {
                        totalExpenses += amt;
                    }
                });
            }

            // Simplified Net Profit (Revenue - Total Operating Expenses)
            // Ignoring Cost of Goods Sold (621) for simplicity if not tracked, or assuming it's part of logic.
            // If we want accurate Net Profit: Revenue - COGS - Opex.
            // Let's assume Gross Profit ~ Revenue (Service business) or check 621.

            // Let's verify if COGS is tracked. Semantic layer says 621.
            let cogs = 0;
            if (entries) {
                entries.forEach((e: any) => {
                    const code = e.ledger_accounts.code;
                    if (code.startsWith('621') && e.direction === 'DEBIT') {
                        cogs += e.amount;
                    }
                });
            }

            const netProfit = revenue - cogs - totalExpenses;
            const roi = adSpend > 0 ? (revenue / adSpend).toFixed(2) : 0;

            // Send Email
            const emailResult = await EmailService.sendWeeklyReport(user.email, userName, {
                startDate: startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
                endDate: endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
                netProfit,
                revenue,
                adSpend,
                roi
            });

            results.push({ userId: user.id, email: user.email, success: emailResult?.success });

        } catch (err) {
            console.error(`Error processing user ${user.id}:`, err);
            results.push({ userId: user.id, error: err });
        }
    }

    return NextResponse.json({
        success: true,
        processed: results.length,
        details: results
    });
}
