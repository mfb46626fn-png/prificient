'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import {
    Activity, TrendingUp, Package,
    AlertCircle, Banknote, Clock
} from 'lucide-react'
import DashboardAIBox from '@/components/DashboardAIBox'
import { useCurrency } from '@/app/contexts/CurrencyContext'

// TİP TANIMLARI
type DashboardStats = {
    totalRevenue: number
    totalProfit: number
    totalOrders: number
    margin: number
}

type EventItem = {
    event_id: string
    event_type: string
    event_date: string
    description: string
    products: { name: string } | null
    orders: { net_profit: number, quantity: number, sale_price: number } | null
}

export default function DashboardPage() {
    const supabase = createClient()
    const { convert, symbol } = useCurrency()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, totalProfit: 0, totalOrders: 0, margin: 0 })
    const [feed, setFeed] = useState<EventItem[]>([])

    // VERİ ÇEKME MOTORU
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. İSTATİSTİKLER (Orders Tablosundan)
            const { data: orders } = await supabase
                .from('orders')
                .select('total_revenue, net_profit')
                .eq('user_id', user.id)

            let rev = 0, prof = 0, count = 0
            if (orders) {
                orders.forEach(o => {
                    rev += Number(o.total_revenue)
                    prof += Number(o.net_profit)
                })
                count = orders.length
            }

            setStats({
                totalRevenue: rev,
                totalProfit: prof,
                totalOrders: count,
                margin: rev > 0 ? (prof / rev) * 100 : 0
            })

            // 2. OLAY AKIŞI (Events Tablosundan)
            const { data: events } = await supabase
                .from('events')
                .select(`
          event_id,
          event_type,
          event_date,
          description,
          products ( name ),
          orders ( net_profit, quantity, sale_price )
        `)
                .eq('user_id', user.id)
                .order('event_date', { ascending: false })
                .limit(20)

            if (events) setFeed(events as any)

            setLoading(false)
        }

        fetchDashboardData()
    }, [])

    // FORMAT YARDIMCISI
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
    }

    const formatDate = (dateString: string) => {
        const d = new Date(dateString)
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <DashboardHeader />

            <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">

                {/* BAŞLIK */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                    <div>
                        <h1 className="text-3xl font-black text-black tracking-tight">Komuta Merkezi</h1>
                        <p className="text-gray-600 font-bold mt-1 text-sm">Gerçekleşmiş olayların canlı akışı.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black animate-pulse border border-emerald-200 shadow-sm">
                        <Activity size={14} /> CANLI
                    </div>
                </div>

                {/* 1. KPI KARTLARI (BÜYÜK RESİM) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* NET KÂR (EN ÖNEMLİSİ) */}
                    <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl shadow-gray-400 relative overflow-hidden group">
                        {/* Arkaplan Efekti */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-gray-300 text-xs font-black uppercase tracking-widest mb-2">
                                <TrendingUp size={16} className="text-emerald-400" /> Toplam Net Kâr
                            </div>
                            <div className="text-5xl font-black tracking-tighter mt-1 text-white">
                                {symbol}{convert(stats.totalProfit)}
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-gray-300">
                                <span className="text-black bg-white px-3 py-1 rounded-lg text-xs font-bold">%{stats.margin.toFixed(1)} Marj</span>
                                <span className="opacity-80">ile çalışıyorsun</span>
                            </div>
                        </div>
                    </div>

                    {/* CİRO */}
                    <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-black uppercase tracking-widest mb-2">
                            <Banknote size={16} /> Toplam Ciro
                        </div>
                        <div className="text-4xl font-black text-black tracking-tighter mt-1 group-hover:text-emerald-700 transition-colors">
                            {symbol}{convert(stats.totalRevenue)}
                        </div>
                        <div className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-wide">
                            Kasaya Giren Brüt Para
                        </div>
                    </div>

                    {/* SİPARİŞ ADEDİ */}
                    <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-black uppercase tracking-widest mb-2">
                            <Package size={16} /> Toplam Sipariş
                        </div>
                        <div className="text-4xl font-black text-black tracking-tighter mt-1 group-hover:text-blue-700 transition-colors">
                            {stats.totalOrders}
                        </div>
                        <div className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-wide">
                            Adet Gerçekleşmiş Satış
                        </div>
                    </div>
                </div>

                {/* 2. ZAMAN TÜNELİ (EVENT STREAM) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL: AKIŞ */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={20} className="text-black" />
                            <h3 className="text-xl font-black text-black">Olay Akışı</h3>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-center text-gray-500 font-bold py-10">Akış yükleniyor...</p>
                            ) : feed.length === 0 ? (
                                <div className="bg-white p-10 rounded-[2rem] text-center border-2 border-dashed border-gray-200">
                                    <p className="text-gray-500 font-bold text-lg">Henüz bir olay gerçekleşmedi.</p>
                                    <p className="text-gray-400 text-sm mt-2">Excel yükleyerek ilk veriyi gir.</p>
                                </div>
                            ) : (
                                feed.map((event) => (
                                    <div key={event.event_id} className="bg-white p-6 rounded-[1.5rem] border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all flex items-start gap-5 group">

                                        {/* İKON ALANI */}
                                        <div className={`mt-1 min-w-[3.5rem] h-14 rounded-2xl flex items-center justify-center border ${event.event_type === 'order_created' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                event.event_type === 'price_change' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                            {event.event_type === 'order_created' ? <Package size={24} /> :
                                                event.event_type === 'price_change' ? <TrendingUp size={24} /> :
                                                    <Activity size={24} />}
                                        </div>

                                        {/* İÇERİK ALANI */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-black text-base">
                                                    {event.event_type === 'order_created' ? 'Yeni Sipariş' :
                                                        event.event_type === 'price_change' ? 'Fiyat Değişimi' : 'Sistem Olayı'}
                                                </h4>
                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                                    {formatDate(event.event_date)}
                                                </span>
                                            </div>

                                            <p className="text-gray-800 mt-2 font-semibold leading-relaxed text-sm">
                                                {event.description || (event.products ? `${event.products.name} ile ilgili işlem.` : 'Detay yok.')}
                                            </p>

                                            {/* SİPARİŞ DETAYI (VARSA) */}
                                            {event.event_type === 'order_created' && event.orders && (
                                                <div className="mt-4 flex gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">NET KÂR</span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-black border border-emerald-200">
                                                            {symbol}{convert(event.orders.net_profit)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">ADET</span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-black border border-gray-200">
                                                            {event.orders.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* SAĞ: ANALİZ PANELİ */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle size={20} className="text-black" />
                            <h3 className="text-xl font-black text-black">Analiz Paneli</h3>
                        </div>

                        {/* YENİ: DİNAMİK AI KUTUSU (ESKİ STATİK KUTU GİTTİ) */}
                        <DashboardAIBox />

                        {/* BASİT İPUÇLARI */}
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-sm">
                            <h5 className="font-black text-black text-sm mb-4">Sistem Durumu</h5>
                            <ul className="space-y-4">
                                <li className="text-xs font-bold text-gray-600 flex gap-3 items-start">
                                    <span className="w-2 h-2 bg-rose-500 rounded-full mt-1.5 shrink-0"></span>
                                    <span>Sadece gerçekleşmiş satışlar sisteme dahil edilir. Tahmin yok.</span>
                                </li>
                                <li className="text-xs font-bold text-gray-600 flex gap-3 items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></span>
                                    <span>Fiyat değişiklikleri otomatik tespit edilir ve "Karar" olarak kaydedilir.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    )
}