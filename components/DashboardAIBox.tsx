'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Sparkles, TrendingUp, Lock, ArrowRight, BrainCircuit } from 'lucide-react'
import Link from 'next/link'

type Insight = {
  type: 'success_story' | 'learning'
  productName?: string
  productId?: string
  changePercentage?: number
  oldPrice?: number
  newPrice?: number
  confidenceScore: number // 0-100 arası
  message: string
}

export default function DashboardAIBox() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [insight, setInsight] = useState<Insight>({
    type: 'learning',
    confidenceScore: 15,
    message: 'Veri toplama aşamasındayım. Yeterli "Olay" biriktiğinde analizler burada belirecek.'
  })

  useEffect(() => {
    const findBestInsight = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Son 10 Kararı Çek
      const { data: decisions } = await supabase
        .from('decisions')
        .select('*, products(name)')
        .eq('user_id', user.id)
        .order('decision_date', { ascending: false })
        .limit(10)

      if (!decisions || decisions.length === 0) {
        setLoading(false)
        return
      }

      // 2. Basit Analiz (Hızlı Tarama)
      // En başarılı kararı bulmaya çalışıyoruz
      let bestWin: Insight | null = null

      for (const dec of decisions) {
        // Karar tarihini al
        const date = new Date(dec.decision_date).getTime()
        const DAY = 24 * 60 * 60 * 1000
        
        // Önceki ve Sonraki 7 günü kıyasla (Hızlı analiz için 7 gün yeterli)
        const { data: orders } = await supabase
            .from('orders')
            .select('net_profit, order_date')
            .eq('product_id', dec.product_id)
            .gte('order_date', new Date(date - 7 * DAY).toISOString())
            .lte('order_date', new Date(date + 7 * DAY).toISOString())

        if (!orders || orders.length < 10) continue // Yetersiz veri (Madde 8)

        // Hesapla
        const beforeOrders = orders.filter(o => new Date(o.order_date).getTime() < date)
        const afterOrders = orders.filter(o => new Date(o.order_date).getTime() > date)

        if (beforeOrders.length < 3 || afterOrders.length < 3) continue

        const avgProfitBefore = beforeOrders.reduce((sum, o) => sum + o.net_profit, 0) / 7
        const avgProfitAfter = afterOrders.reduce((sum, o) => sum + o.net_profit, 0) / 7

        // Eğer kâr arttıysa bu bir başarı hikayesidir!
        if (avgProfitAfter > avgProfitBefore) {
            const increase = ((avgProfitAfter - avgProfitBefore) / avgProfitBefore) * 100
            
            // Eğer %5'ten fazla artış varsa dikkate al
            if (increase > 5) {
                bestWin = {
                    type: 'success_story',
                    productName: dec.products?.name,
                    productId: dec.product_id,
                    changePercentage: Math.round(increase),
                    oldPrice: dec.old_value,
                    newPrice: dec.new_value,
                    confidenceScore: 85,
                    message: `Fiyat artışı stratejisi ${dec.products?.name} üzerinde işe yaradı.`
                }
                break; // İlk ve en güncel başarıyı yakala ve çık
            }
        }
      }

      if (bestWin) {
          setInsight(bestWin)
      } else {
          // Başarı yoksa ama veri varsa güven skorunu artır
          setInsight(prev => ({ ...prev, confidenceScore: Math.min(decisions.length * 5 + 15, 60) }))
      }
      
      setLoading(false)
    }

    findBestInsight()
  }, [])

  return (
    <div className="bg-indigo-950 text-white p-6 rounded-[2rem] relative overflow-hidden shadow-xl shadow-indigo-200 min-h-[200px] flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
        
        {/* Arkaplan Efekti */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all"></div>
        
        {/* HEADER */}
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <h4 className="font-black text-lg mb-1 flex items-center gap-2">
                   <BrainCircuit size={20} className="text-purple-400"/> 
                   Prificient AI
                </h4>
                {insight.type === 'success_story' && (
                    <span className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                        KANITLANMIŞ STRATEJİ
                    </span>
                )}
            </div>
            
            {/* Confidence Meter */}
            <div className="text-right">
                <div className="text-[10px] font-bold text-indigo-300 uppercase mb-1">Güven Skoru</div>
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-indigo-900 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${insight.confidenceScore > 80 ? 'bg-emerald-400' : 'bg-purple-400'}`} 
                            style={{ width: `${insight.confidenceScore}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-bold text-white">%{insight.confidenceScore}</span>
                </div>
            </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 mt-4">
            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-indigo-800 rounded w-3/4"></div>
                    <div className="h-4 bg-indigo-800 rounded w-1/2"></div>
                </div>
            ) : insight.type === 'success_story' ? (
                // SUCCESS STATE
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-4">
                        <span className="text-white font-bold">{insight.productName}</span> için yaptığın fiyat değişikliği ({insight.oldPrice}₺ <ArrowRight size={10} className="inline"/> {insight.newPrice}₺), 
                        günlük kârını <span className="text-emerald-400 font-black">%{insight.changePercentage} artırdı.</span>
                    </p>
                    
                    {insight.productId && (
                        <Link href={`/products/${insight.productId}`} className="inline-flex items-center gap-2 bg-white text-indigo-950 px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-50 transition-colors">
                            <Sparkles size={14}/> Analizi İncele
                        </Link>
                    )}
                </div>
            ) : (
                // LEARNING STATE
                <div className="animate-in fade-in">
                    <p className="text-indigo-300 text-sm leading-relaxed mb-4 font-medium">
                        {insight.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 bg-indigo-900/50 px-3 py-2 rounded-lg border border-indigo-800/50">
                        <Lock size={12}/> 
                        Daha fazla "Fiyat Değişikliği" verisi gerekiyor.
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}