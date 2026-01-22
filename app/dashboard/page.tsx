import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/DashboardClient'
import { LedgerService } from '@/lib/ledger'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Auth Check (Server Side)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Initialize Data
    let revenue = 0
    let expenses = 0
    let connected = false

    try {
        // A. Ledger Logic
        // Pass the server-side client to LedgerService to respect impersonation!
        await LedgerService.initializeAccounts(user.id, supabase)

        const { data: entries, error } = await supabase
            .from('ledger_entries')
            .select(`
                amount,
                direction,
                account:ledger_accounts!inner(code, type)
            `)
            .eq('user_id', user.id)

        if (!error && entries) {
            entries.forEach((entry: any) => {
                const code = entry.account.code
                const amount = Number(entry.amount)

                // 600 serisi -> Gelir (Alacak çalışır)
                if (code.startsWith('6')) {
                    if (entry.direction === 'CREDIT') revenue += amount
                    else revenue -= amount
                }

                // 700 serisi -> Gider (Borç çalışır)
                if (code.startsWith('7')) {
                    if (entry.direction === 'DEBIT') expenses += amount
                    else expenses -= amount
                }
            })
        }

        // B. Integration Check
        const { data: integration } = await supabase
            .from('integrations')
            .select('status')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .maybeSingle()

        connected = !!integration

    } catch (err) {
        console.error("Dashboard Server Error:", err)
    }

    // 3. Prepare Metrics
    const metrics = {
        revenue,
        expenses,
        equity: revenue - expenses,
        loading: false, // Server component always ready with data
        connected
    }

    return <DashboardClient metrics={metrics} />
}
