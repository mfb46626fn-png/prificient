'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import DashboardClient from '@/components/DashboardClient'

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({
        revenue: 0,
        expenses: 0,
        equity: 0,
        loading: true,
        connected: false, // Initial state
    })
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Ledger Entries'den Veri Çek
            // Net Gelir: 600'lü hesapların ALACAK bakiyesi (Revenue is Credit normal)
            // Giderler: 700'lü hesapların BORÇ bakiyesi (Expense is Debit normal)
            const { data: entries, error } = await supabase
                .from('ledger_entries')
                .select(`
                    amount,
                    direction,
                    account:ledger_accounts!inner(code, type)
                `)
                .eq('user_id', user.id)

            if (error) {
                console.error("Dashboard Error:", error)
                return
            }

            let revenue = 0
            let expenses = 0

            entries?.forEach((entry: any) => {
                const code = entry.account.code
                const amount = Number(entry.amount)

                // Basit Mantık:
                // 600 serisi -> Gelir (Alacak çalışır)
                if (code.startsWith('6')) {
                    if (entry.direction === 'CREDIT') revenue += amount
                    else revenue -= amount // İade vs.
                }

                // 700 serisi -> Gider (Borç çalışır)
                if (code.startsWith('7')) {
                    if (entry.direction === 'DEBIT') expenses += amount
                    else expenses -= amount
                }
            })

            // 2. Integration Check
            const { data: integration } = await supabase
                .from('integrations')
                .select('status')
                .eq('user_id', user.id)
                .eq('platform', 'shopify')
                .maybeSingle()

            setMetrics({
                revenue,
                expenses,
                equity: revenue - expenses,
                loading: false,
                connected: !!integration // Yeni state
            })
        }

        fetchData()
    }, [])

    return <DashboardClient metrics={metrics} />
}
