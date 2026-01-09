'use client'

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Minus } from 'lucide-react'
import { useCurrency } from '@/app/contexts/CurrencyContext'

interface MonthStatusProps {
  currentRevenue: number
  currentExpense: number
  lastMonthRevenue: number // Geçen ayın verisi (Kıyaslama için)
}

export default function MonthStatusSummary({ currentRevenue, currentExpense, lastMonthRevenue }: MonthStatusProps) {
  const { symbol, convert } = useCurrency()

  const netProfit = currentRevenue - currentExpense
  const margin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0
  const expenseRatio = currentRevenue > 0 ? (currentExpense / currentRevenue) * 100 : 0

  // --- DETERMINISTIC LOGIC (KARAR MEKANİZMASI) ---
  
  let statusTitle = ""
  let statusMessage = ""
  let statusColor = ""
  let Icon = Minus

  // Senaryo 1: ZARAR DURUMU
  if (netProfit < 0) {
    statusTitle = "Dikkat: Zarar Ediyorsunuz"
    statusColor = "bg-rose-50 border-rose-100 text-rose-900"
    Icon = TrendingDown
    
    // Alt detay: Neden?
    if (expenseRatio > 100) {
        statusMessage = `Giderleriniz gelirlerinizin tamamını aştı. Her satışta ortalama %${Math.abs(margin).toFixed(0)} kaybediyorsunuz. Acil müdahale (fiyat artışı veya gider kısıntısı) gerekiyor.`
    } else {
        statusMessage = "Operasyonel maliyetler kârlılığınızı negatif bölgeye çekiyor."
    }
  } 
  // Senaryo 2: DÜŞÜK KÂRLILIK (Riskli Bölge: %0 - %15 arası)
  else if (margin > 0 && margin < 15) {
    statusTitle = "Kârlısınız Ancak Risk Var"
    statusColor = "bg-yellow-50 border-yellow-100 text-yellow-900"
    Icon = AlertCircle

    statusMessage = `Net kâr marjınız %${margin.toFixed(1)}. Bu oran e-ticaret için sınırda kabul edilir. Beklenmedik bir iade veya reklam maliyeti ayı zararla kapatmanıza neden olabilir.`
  }
  // Senaryo 3: SAĞLIKLI BÜYÜME (İdeal Bölge: %15+)
  else {
    statusTitle = "İşler Yolunda Gidiyor"
    statusColor = "bg-emerald-50 border-emerald-100 text-emerald-900"
    Icon = TrendingUp

    // Büyüme detayı
    if (currentRevenue > lastMonthRevenue) {
        const growth = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        statusMessage = `Geçen aya göre cironuzu %${growth.toFixed(0)} artırdınız ve %${margin.toFixed(1)} gibi sağlıklı bir marj ile çalışıyorsunuz. Bu tempoyu koruyun.`
    } else {
        statusMessage = `Cironuz geçen aydan düşük olsa da, %${margin.toFixed(1)} kâr marjı ile verimli bir ay geçiriyorsunuz. Nakit akışınız pozitif.`
    }
  }

  // Henüz veri yoksa
  if (currentRevenue === 0 && currentExpense === 0) {
    return (
        <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 text-center">
            <p className="text-gray-400 font-bold text-sm">Henüz analiz için yeterli veri yok.</p>
        </div>
    )
  }

  return (
    <div className={`p-6 rounded-[2rem] border ${statusColor} transition-all`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl bg-white shadow-sm shrink-0`}>
           <Icon size={24} className={statusColor.includes('rose') ? 'text-rose-600' : statusColor.includes('yellow') ? 'text-yellow-600' : 'text-emerald-600'} />
        </div>
        <div>
           <h3 className="font-black text-lg mb-1">{statusTitle}</h3>
           <p className="text-sm font-medium opacity-90 leading-relaxed">
             {statusMessage}
           </p>
           
           {/* Özet Veri Hapları */}
           <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 bg-white/60 rounded-lg text-xs font-bold border border-black/5">
                Marj: %{margin.toFixed(1)}
              </span>
              <span className="px-3 py-1 bg-white/60 rounded-lg text-xs font-bold border border-black/5">
                Net: {symbol}{convert(Math.abs(netProfit))}
              </span>
           </div>
        </div>
      </div>
    </div>
  )
}