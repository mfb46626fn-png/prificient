'use client'

import { usePreferences } from '@/app/contexts/PreferencesContext'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useCurrency } from '@/app/contexts/CurrencyContext' 

export default function KPISection({ totalRevenue, totalExpense, netProfit, margin }: any) {
  const { t } = usePreferences()
  // convert fonksiyonu eklendi
  const { symbol, convert } = useCurrency() 

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Gelir Kartı */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-start group hover:border-emerald-200 transition-all">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.total_income}</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">
             {/* convert eklendi */}
             {symbol}{convert(totalRevenue)}
          </h3>
        </div>
        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* Gider Kartı */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-start group hover:border-rose-200 transition-all">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.total_expense}</p>
          <h3 className="text-3xl font-black text-rose-600 mt-2 tracking-tight">
            {/* convert eklendi */}
            {symbol}{convert(totalExpense)}
          </h3>
        </div>
        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
          <TrendingDown size={24} />
        </div>
      </div>

      {/* Net Kâr Kartı */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-start group hover:border-blue-200 transition-all">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.net_profit}</p>
          <h3 className={`text-3xl font-black mt-2 tracking-tight ${netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {/* convert eklendi */}
            {symbol}{convert(netProfit)}
          </h3>
          <div className="flex items-center gap-2 mt-2">
             <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500 uppercase">
                {t.profit_margin}: %{margin}
             </span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
          <Wallet size={24} />
        </div>
      </div>
    </div>
  )
}