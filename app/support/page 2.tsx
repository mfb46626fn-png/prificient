import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import SupportListClient from '@/components/SupportListClient'

export const dynamic = 'force-dynamic'

export default async function SupportPage() {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Fetch Tickets
    const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    let errorMessage = null;

    if (error) {
        console.warn("Error fetching tickets (likely missing table):", error.message)
        errorMessage = error.code === 'PGRST205'
            ? 'Destek sistemi henüz yapılandırılmamış (Tablo eksik).'
            : 'Destek talepleri yüklenirken bir hata oluştu.';
    }

    return (
        <div className="min-h-screen bg-white">
            <DashboardHeader />
            <main className="py-8">
                <SupportListClient initialTickets={tickets || []} error={errorMessage} />
            </main>
        </div>
    )
}
