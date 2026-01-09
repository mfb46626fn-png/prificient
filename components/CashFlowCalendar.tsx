'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useFinancialConfig } from '@/app/contexts/FinancialConfigContext'
import { useCurrency } from '@/app/contexts/CurrencyContext'

type FinancialEvent = {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  date: string
  status: 'pending' | 'completed'
}

export default function CashFlowCalendar() {
  const supabase = createClient()
  const { config } = useFinancialConfig()
  const { symbol, convert } = useCurrency()
  const [events, setEvents] = useState<FinancialEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCashFlow() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date()
      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(today.getDate() + 30)

      // 1. İşlemler Tablosundan Gelecek Verileri Çek (Varsa)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', thirtyDaysLater.toISOString().split('T')[0])
        .order('date', { ascending: true })

      const dbEvents: FinancialEvent[] = (transactions || []).map(t => ({
        id: t.id,
        title: t.description || (t.type === 'income' ? 'Gelir' : 'Gider'),
        amount: t.amount,
        type: t.type,
        date: t.date,
        status: 'pending'
      }))

      // 2. Financial Config'deki Sabit Giderleri Takvime Yerleştir
      const fixedEvents: FinancialEvent[] = []
      if (config?.fixedExpenses) {
        config.fixedExpenses.forEach((exp: any) => {
          const expDate = new Date(today.getFullYear(), today.getMonth(), exp.paymentDay || 1)
          
          // Eğer bu ayki ödeme günü geçtiyse, bir sonraki ayı kontrol et
          if (expDate < today) {
            expDate.setMonth(expDate.getMonth() + 1)
          }

          // Eğer hesaplanan tarih önümüzdeki 30 gün içindeyse ekle
          if (expDate <= thirtyDaysLater) {
            fixedEvents.push({
              id: `fixed-${exp.id}`,
              title: exp.title,
              amount: exp.amount,
              type: 'expense',
              date: expDate.toISOString().split('T')[0],
              status: 'pending'
            })
          }
        })
      }

      // 3. Verileri Birleştir ve Tarihe Göre Sırala
      const allEvents = [...dbEvents, ...fixedEvents].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      setEvents(allEvents)
      setLoading(false)
    }

    fetchCashFlow()
  }, [config, supabase])

  const getDay = (dateStr: string) => dateStr.split('-')[2]
  const getMonth = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleString('tr-TR', { month: 'short' })
  }

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Bugün'
    return `${days} gün kaldı`
  }

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden group">
      
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6 z-10">
        <h3 className="font-black text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:rotate-12 transition-transform">
            <Calendar size={18} />
          </div>
          Nakit Akışı
        </h3>
        <span className="text-[10px] font-black bg-gray-900 text-white px-3 py-1.5 rounded-lg tracking-widest">
            30 GÜNLÜK PROJEKSİYON
        </span>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar z-10 max-h-[350px]">
        {loading ? (
           <div className="flex items-center justify-center h-32 text-gray-400 animate-pulse font-bold text-sm">Veriler yükleniyor...</div>
        ) : events.length === 0 ? (
           <div className="text-center py-10">
              <p className="text-xs font-bold text-gray-400">Gelecek 30 günde planlanmış <br/> bir nakit hareketi yok.</p>
           </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all group/item border border-transparent hover:border-gray-100">
              
              <div className="flex items-center gap-4">
                {/* Tarih Kutusu */}
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[10px] font-black border shadow-sm transition-all group-hover/item:scale-105 ${
                  event.type === 'income' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  <span className="text-sm leading-none">{getDay(event.date)}</span>
                  <span className="text-[8px] opacity-70 uppercase mt-0.5">{getMonth(event.date)}</span>
                </div>
                
                {/* Detay */}
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                          event.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                          {event.type === 'income' ? 'Alacak' : 'Ödeme'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                          <Clock size={10} /> {getDaysLeft(event.date)}
                      </span>
                  </div>
                </div>
              </div>

              {/* Tutar */}
              <div className="text-right">
                  <div className={`font-black text-sm flex items-center justify-end gap-0.5 ${
                      event.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                  {event.type === 'income' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                  {symbol}{convert(event.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Özet Bilgi */}
      {!loading && events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-center z-10">
          <div className="flex items-center gap-2 justify-center text-[10px] text-gray-500 font-bold">
              <AlertCircle size={12} className="text-indigo-500" />
              <p>Sabit giderleriniz "Onboarding" verilerinden otomatik çekilir.</p>
          </div>
        </div>
      )}

    </div>
  )
}