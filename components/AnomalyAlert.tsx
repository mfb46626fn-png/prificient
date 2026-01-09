'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AlertTriangle, X, ArrowRight } from 'lucide-react'

export default function AnomalyAlert() {
  const supabase = createClient()
  const [alert, setAlert] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const checkAlerts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Sadece okunmamış ve "Anomali" içeren en son bildirimi çek
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .ilike('title', '%Anomali%') // Başlığında 'Anomali' geçenleri yakala
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setAlert(data)
      }
    }
    checkAlerts()
  }, [])

  const dismissAlert = async () => {
    setIsVisible(false)
    if (alert) {
        // Okundu olarak işaretle
        await supabase.from('notifications').update({ is_read: true }).eq('id', alert.id)
    }
  }

  if (!alert || !isVisible) return null

  return (
    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-6 animate-in slide-in-from-top-2 duration-500 relative overflow-hidden group">
      {/* Arkaplan Efekti */}
      <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-2">
         <AlertTriangle size={120} className="text-rose-600"/>
      </div>

      <div className="flex items-start gap-4 relative z-10">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-rose-100 shrink-0">
            <AlertTriangle className="text-rose-600 animate-pulse" size={24} />
        </div>
        
        <div className="flex-1">
            <h3 className="font-black text-rose-900 text-lg mb-1">{alert.title}</h3>
            <p className="text-rose-800/80 text-sm font-medium leading-relaxed max-w-2xl">
                {alert.message}
            </p>
            <div className="mt-3 flex gap-3">
                <button 
                    onClick={dismissAlert}
                    className="text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-4 py-2 rounded-lg transition-colors"
                >
                    Okundu İşaretle
                </button>
            </div>
        </div>

        <button 
            onClick={() => setIsVisible(false)} 
            className="text-rose-400 hover:text-rose-700 transition-colors p-1"
        >
            <X size={20} />
        </button>
      </div>
    </div>
  )
}