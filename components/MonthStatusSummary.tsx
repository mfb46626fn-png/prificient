'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, AlertTriangle, AlertOctagon, Loader2 } from 'lucide-react'

type InsightData = {
  title: string
  message: string
  sentiment: 'positive' | 'warning' | 'critical' | 'neutral'
}

export default function DashboardInsight() {
  const [data, setData] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sayfa açılınca API'den veriyi çek
    const fetchInsight = async () => {
      try {
        const res = await fetch('/api/insight')
        const json = await res.json()
        setData(json)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchInsight()
  }, [])

  // RENK VE İKON AYARLARI
  const styles = {
    positive: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-900',
      Icon: TrendingUp
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      Icon: AlertTriangle
    },
    critical: {
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      titleColor: 'text-rose-900',
      Icon: AlertOctagon
    },
    neutral: {
      bg: 'bg-gray-50',
      border: 'border-gray-100',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      titleColor: 'text-gray-900',
      Icon: Loader2
    }
  }

  const currentStyle = data ? styles[data.sentiment] : styles.neutral
  const IconComponent = currentStyle.Icon

  if (loading) {
    return (
      <div className="w-full p-6 rounded-3xl border border-gray-100 bg-white shadow-sm animate-pulse flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full p-6 rounded-3xl border ${currentStyle.bg} ${currentStyle.border} shadow-sm transition-all duration-500`}>
      <div className="flex items-start gap-5">
        
        {/* İKON KUTUSU */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${currentStyle.iconBg}`}>
          <IconComponent size={28} className={currentStyle.iconColor} />
        </div>

        {/* METİN ALANI */}
        <div>
          <h3 className={`font-bold text-lg mb-1 ${currentStyle.titleColor}`}>
            {data?.title}
          </h3>
          <p className="text-sm font-medium text-gray-600 leading-relaxed">
            {data?.message}
          </p>
          
          {/* Opsiyonel: Alt bilgi veya aksiyon butonu eklenebilir */}
          {data?.sentiment === 'critical' && (
            <div className="mt-3">
               <span className="text-xs font-bold text-rose-600 bg-white px-2 py-1 rounded-md border border-rose-100 cursor-pointer hover:bg-rose-50">
                 Detayları İncele →
               </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}