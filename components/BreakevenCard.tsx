'use client'

import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useFinancialConfig } from '@/app/contexts/FinancialConfigContext'
import { useCurrency } from '@/app/contexts/CurrencyContext'

interface BreakevenCardProps {
  currentMonthNetProfit: number 
}

export default function BreakevenCard({ currentMonthNetProfit }: BreakevenCardProps) {
  const { config } = useFinancialConfig()
  const { symbol, convert } = useCurrency()

  const fixedCost = config?.monthlyFixedCost || 0
  
  // Progress Bar
  const progress = fixedCost > 0 ? (currentMonthNetProfit / fixedCost) * 100 : 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const remaining = Math.max(fixedCost - currentMonthNetProfit, 0)
  const isBreakeven = currentMonthNetProfit >= fixedCost

  // --- ACİLİYET SIRALAMASI ---
  const today = new Date().getDate()
  
  // Giderleri "Kalan Gün"e göre sırala
  const sortedExpenses = [...(config?.fixedExpenses || [])].map(exp => {
      let daysLeft = exp.paymentDay - today
      if (daysLeft < 0) daysLeft += 30 // Eğer günü geçtiyse, bir sonraki aya at (Basit mantık)
      return { ...exp, daysLeft }
  }).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3) // İlk 3 tanesini al

  if (fixedCost === 0) return null

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden h-full flex flex-col justify-between group">
      
      {/* ÜST KISIM: Başa Baş Durumu */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    {isBreakeven ? <CheckCircle2 size={18} className="text-emerald-500"/> : <TrendingUp size={18} className="text-blue-500"/>}
                    Başa Baş Noktası
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1">
                    {isBreakeven ? 'Hedef aşıldı, kâr bölgesindesin.' : 'Sabit giderleri karşılama hedefi.'}
                </p>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">HEDEF</p>
                <p className="text-sm font-black text-gray-900">{symbol}{convert(fixedCost)}</p>
            </div>
        </div>

        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${isBreakeven ? 'bg-emerald-500' : 'bg-blue-600'}`}
                style={{ width: `${clampedProgress}%` }}
            ></div>
        </div>
        
        {!isBreakeven && (
            <div className="text-right text-[10px] font-bold text-blue-600 mb-6">
                Kalan: {symbol}{convert(remaining)}
            </div>
        )}
      </div>

      {/* ALT KISIM: Yaklaşan Ödemeler (Aciliyet Listesi) */}
      {sortedExpenses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-50 relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Clock size={10}/> Yaklaşan Sabit Giderler
              </p>
              <div className="space-y-2">
                  {sortedExpenses.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center text-xs group/item hover:bg-gray-50 rounded-lg p-1 transition-colors">
                          <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${exp.daysLeft <= 3 ? 'bg-rose-500 animate-pulse' : 'bg-gray-300'}`}></div>
                              <span className="font-bold text-gray-700 group-hover/item:text-black transition-colors">{exp.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-[10px]">{exp.daysLeft === 0 ? 'Bugün' : `${exp.daysLeft} gün`}</span>
                              <span className="font-black text-gray-900">{symbol}{convert(exp.amount)}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  )
}