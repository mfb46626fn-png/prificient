'use client'

import { Lightbulb, TrendingUp, AlertCircle, ShieldCheck, Zap } from 'lucide-react'
import { useCurrency } from '@/app/contexts/CurrencyContext'

interface SummaryProps {
  revenue: number
  expense: number
  netProfit: number
  margin: string | number
}

export default function SmartSummary({ revenue, expense, netProfit, margin }: SummaryProps) {
  const { symbol, convert } = useCurrency()
  
  const isSafe = revenue >= expense
  const coverageRatio = expense > 0 ? (revenue / expense) * 100 : 0

  // 1. Nakit Yastığı Mantığı: Mevcut kâr, sabit giderleri ne kadar süre fonlayabilir?
  // (Basitleştirilmiş Runway hesabı: Eğer gelir kesilirse mevcut kâr kaç gün yeter?)
  const dailyExpense = expense / 30
  const runwayDays = netProfit > 0 ? Math.floor(netProfit / dailyExpense) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* NAKİT AKIŞI DURUMU */}
      <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${isSafe ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'} text-white shadow-lg`}>
            {isSafe ? <TrendingUp size={20} /> : <AlertCircle size={20} />}
          </div>
          <h3 className={`font-black uppercase tracking-wider text-[10px] ${isSafe ? 'text-emerald-900' : 'text-rose-900'}`}>
            Finansal Sağlık Skoru
          </h3>
        </div>
        
        <div className="space-y-2">
          <p className={`text-sm font-bold ${isSafe ? 'text-emerald-800' : 'text-rose-800'}`}>
            {isSafe 
              ? `Geliriniz giderlerin %${coverageRatio.toFixed(0)} kadarını karşılıyor. Operasyonel olarak güvendesiniz.`
              : `Giderleri kapatmak için ${symbol}${convert(expense - revenue)} daha satış hacmi gerekiyor.`
            }
          </p>
          <div className="w-full bg-gray-200/50 h-2 rounded-full overflow-hidden mt-4">
            <div 
              className={`h-full transition-all duration-1000 ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(coverageRatio, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* GÜVENLİ BÖLGE (YASTIK) ANALİZİ */}
      <div className="p-8 rounded-[2.5rem] border-2 bg-indigo-50/40 border-indigo-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-lg">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-black uppercase tracking-wider text-[10px] text-indigo-900">Nakit Yastığı (Runway)</h3>
        </div>
        
        <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-indigo-900 tracking-tighter">
                {runwayDays > 99 ? '99+' : runwayDays}
            </span>
            <span className="text-sm font-bold text-indigo-600 mb-1.5 uppercase">Günlük Koruma</span>
        </div>

        <p className="mt-4 text-[11px] font-bold text-indigo-800 leading-relaxed">
            {runwayDays > 0 
                ? `Satışlar bugün durursa, mevcut kârınız operasyonu ${runwayDays} gün daha finanse edebilir.`
                : "Mevcut kârınız henüz bir güvenlik yastığı oluşturmak için yeterli değil."}
        </p>

        <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400 font-black uppercase tracking-widest">
            <Zap size={12} fill="currentColor" />
            Ölçeklenebilirlik: {runwayDays > 15 ? 'Yüksek' : 'Riskli'}
        </div>
      </div>
    </div>
  )
}