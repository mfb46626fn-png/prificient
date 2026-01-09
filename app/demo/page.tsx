'use client'

import TransactionChart from '@/components/TransactionChart'
import ExpensePieChart from '@/components/ExpensePieChart'
import DashboardHeader from '@/components/DashboardHeader'
import KPISection from '@/components/KPISection'
import SmartSummary from '@/components/SmartSummary'
import TransactionList from '@/components/TransactionList'
import { DEMO_DATA } from '@/utils/demoData'

export default function DemoPage() {
  
  const { totalRevenue, totalExpense, netProfit, margin, transactions } = DEMO_DATA

  // Chart için veriyi tarihe göre sırala
  const chartData = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="min-h-screen bg-white pb-10 font-sans">
      <DashboardHeader 
        totalRevenue={totalRevenue} 
        totalExpense={totalExpense} 
        isDemo={true}
      />

      <main className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-2">
               🚀 Örnek Veri Modu
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Genel Bakış</h2>
            <p className="text-gray-500 font-medium">Bu bir demo hesabıdır. Veriler temsilidir.</p>
          </div>
        </div>

        <div className="space-y-6">
          <KPISection totalRevenue={totalRevenue} totalExpense={totalExpense} netProfit={netProfit} margin={margin} />
          <SmartSummary revenue={totalRevenue} expense={totalExpense} netProfit={netProfit} margin={margin} />
        </div>

        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TransactionChart transactions={chartData} />
              </div>
              <div className="lg:col-span-1">
                {/* DÜZELTME: expensesByCategory yerine transactions gönderdik */}
                <ExpensePieChart transactions={transactions} />
              </div>
            </div>
        </div>
      </main>
    </div>
  )
}