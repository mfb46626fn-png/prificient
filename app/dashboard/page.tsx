export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TransactionChart from '@/components/TransactionChart'
import ExpensePieChart from '@/components/ExpensePieChart'
import DateFilter from '@/components/DateFilter'
import DashboardHeader from '@/components/DashboardHeader'
import KPISection from '@/components/KPISection'
import SmartSummary from '@/components/SmartSummary'
import MonthStatusSummary from '@/components/MonthStatusSummary'
import AnomalyAlert from '@/components/AnomalyAlert'
// YENİ: Başa Baş Kartı
import BreakevenCard from '@/components/BreakevenCard'
import CashFlowCalendar from '@/components/CashFlowCalendar'

export default async function Dashboard(props: {
  searchParams: Promise<{ period?: string }>
}) {
  const searchParams = await props.searchParams
  const period = searchParams?.period || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const now = new Date()
  
  // 1. ANA FİLTRE İÇİN TARİH ARALIĞI (Grafikler ve KPI'lar için)
  let startDate: string | null = null
  let endDate: string | null = null

  if (period === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  } else if (period === 'last-month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
  }

  // 2. BAŞA BAŞ KARTI İÇİN TARİH ARALIĞI (Her zaman 'Bu Ay' olmalı)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  // --- SORGULAR ---

  // A. Ana Veriler (Seçilen periyoda göre)
  let revQuery = supabase.from('revenues').select('*').eq('user_id', user.id)
  let expQuery = supabase.from('expenses').select('*').eq('user_id', user.id)

  if (startDate && endDate) {
    revQuery = revQuery.gte('date', startDate).lte('date', endDate)
    expQuery = expQuery.gte('date', startDate).lte('date', endDate)
  }

  // B. Başa Baş Verileri (Sadece bu ay için)
  // Not: Eğer ana filtre zaten 'this-month' ise tekrar sorgu atmayabiliriz ama
  // kod karmaşasını önlemek ve 'all'/'last-month' durumlarında da kartın çalışması için ayrı çekiyoruz.
  const cmRevQuery = supabase.from('revenues').select('amount').eq('user_id', user.id).gte('date', currentMonthStart).lte('date', currentMonthEnd)
  const cmExpQuery = supabase.from('expenses').select('amount').eq('user_id', user.id).gte('date', currentMonthStart).lte('date', currentMonthEnd)

  // --- TÜM VERİLERİ PARALEL ÇEK ---
  const [revRes, expRes, cmRevRes, cmExpRes] = await Promise.all([
    revQuery.order('date', { ascending: false }),
    expQuery.order('date', { ascending: false }),
    cmRevQuery,
    cmExpQuery
  ])

  // --- İŞLEME: ANA DASHBOARD ---
  const formattedRevenues = (revRes.data || []).map(r => ({ ...r, type: 'revenue', category: 'Gelir' }))
  const formattedExpenses = (expRes.data || []).map(e => ({ ...e, type: 'expense' }))

  const allTransactions = [...formattedRevenues, ...formattedExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalRevenue = formattedRevenues.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalExpense = formattedExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const netProfit = totalRevenue - totalExpense
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0"

  // --- İŞLEME: BAŞA BAŞ KARTI ---
  const cmTotalRevenue = (cmRevRes.data || []).reduce((acc, curr) => acc + Number(curr.amount), 0)
  const cmTotalExpense = (cmExpRes.data || []).reduce((acc, curr) => acc + Number(curr.amount), 0)
  const currentMonthNetProfit = cmTotalRevenue - cmTotalExpense

  return (
    <div className="min-h-screen bg-white pb-10 font-sans">
      <DashboardHeader 
        totalRevenue={totalRevenue} 
        totalExpense={totalExpense} 
      />

      <main className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* ANOMALİ ALARMI */}
        <AnomalyAlert />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Genel Bakış</h2>
            <p className="text-gray-500 font-medium">Finansal rotanızın anlık özeti.</p>
          </div>
          <div className="flex items-center gap-3">
            <DateFilter />
          </div>
        </div>

        <div className="mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          <MonthStatusSummary 
            currentRevenue={totalRevenue} 
            currentExpense={totalExpense} 
            lastMonthRevenue={totalRevenue * 0.9} // Simülasyon
          />
        </div>

        <div className="space-y-6">
          <KPISection totalRevenue={totalRevenue} totalExpense={totalExpense} netProfit={netProfit} margin={margin} />
          
        {/* YENİ: BAŞA BAŞ VE TAKVİM GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 delay-300">
              {/* SOL: Başa Baş Göstergesi (%33 Genişlik) */}
              <div className="lg:col-span-1">
                  <BreakevenCard currentMonthNetProfit={currentMonthNetProfit} />
              </div>

              {/* SAĞ: Nakit Akışı Takvimi (%66 Genişlik) */}
              <div className="lg:col-span-2">
                  <CashFlowCalendar />
              </div>
          </div>

          <SmartSummary revenue={totalRevenue} expense={totalExpense} netProfit={netProfit} margin={margin} />
        </div>

        {allTransactions.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TransactionChart transactions={allTransactions} />
              </div>
              <div className="lg:col-span-1">
                <ExpensePieChart transactions={formattedExpenses} />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center bg-gray-50 rounded-4xl border-2 border-dashed border-gray-200 text-center px-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-balance">Henüz finansal veri bulunamadı</h3>
            <p className="text-gray-500">Analizleri görmek için menüden "İşlemler & Veri" sayfasına giderek veri ekleyin.</p>
          </div>
        )}
      </main>
      
    </div>
  )
}