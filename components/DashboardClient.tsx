'use client'

import DashboardHeader from '@/components/DashboardHeader'
import { Activity, TrendingUp, TrendingDown, Scale, ArrowRight, Loader2, ShoppingCart, Info } from 'lucide-react'
import Link from 'next/link'
import { DEMO_DATA } from '@/lib/demo-data'
import BenchmarkCard from '@/components/BenchmarkCard'

interface DashboardClientProps {
    metrics: {
        revenue: number
        expenses: number
        equity: number
        loading: boolean
        connected: boolean
    }
    benchmarks?: {
        margin: any
    }
    toxicProducts?: any[]
    isDemo?: boolean
}

export default function DashboardClient({ metrics, benchmarks, toxicProducts = [], isDemo = false }: DashboardClientProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)
    }

    return (
        <div className="bg-gray-50 pb-20">
            {/* DashboardHeader removed locally as it's provided by layout */}

            <main className="max-w-7xl mx-auto px-4 pt-4">
                {/* HERO SECTION */}
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {isDemo ? 'Demo Görünümü' : 'Karar Destek Merkezi'}
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        {isDemo ? 'Sistem özelliklerini keşfedin. Bu veriler gerçeği yansıtmaz.' : 'Finansal durumunuzun anlık özeti.'}
                    </p>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                    {/* Card 1: Revenue */}
                    <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-100 transition-all hover:scale-[1.01]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={24} /></div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Net Ciro</span>
                        </div>
                        {metrics.loading ? <div className="h-10 w-32 bg-gray-100 rounded-xl animate-pulse"></div> : (
                            <p className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(metrics.revenue)}</p>
                        )}
                        <p className="text-xs text-gray-400 font-bold mt-2">
                            {isDemo ? '+12% geçen aya göre' : '+0% geçen aya göre'}
                        </p>
                    </div>

                    {/* Card 2: Cost */}
                    <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2rem] shadow-sm border border-gray-100 transition-all hover:scale-[1.01]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown size={24} /></div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Giderler</span>
                        </div>
                        {metrics.loading ? <div className="h-10 w-32 bg-gray-100 rounded-xl animate-pulse"></div> : (
                            <p className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(metrics.expenses)}</p>
                        )}
                        <p className="text-xs text-gray-400 font-bold mt-2">Dönem içi toplam gider</p>
                    </div>

                    {/* Card 3: Net Profit */}
                    <div className="bg-black text-white p-5 md:p-8 rounded-3xl md:rounded-[2rem] shadow-xl shadow-black/20 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01]">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={80} /></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/10 text-white rounded-2xl"><Scale size={24} /></div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Net Kâr</span>
                        </div>
                        {metrics.loading ? <div className="h-10 w-32 bg-white/20 rounded-xl animate-pulse"></div> : (
                            <p className="text-4xl font-black tracking-tight">{formatCurrency(metrics.equity)}</p>
                        )}
                        <Link
                            href={isDemo ? "/demo/decisions" : "/decisions"}
                            className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-white transition-colors"
                        >
                            Detaylı Analiz <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* ACTIVITIES / LOG (DEMO ONLY FOR NOW OR CONNECTED REAL USER) */}
                {isDemo && (
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Son Aktiviteler</h3>
                                <p className="text-xs text-gray-500 font-bold">Gerçek zamanlı finansal hareketler (Demo)</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {DEMO_DATA.activities?.map((activity: any) => (
                                <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${activity.type === 'order' ? 'bg-emerald-100 text-emerald-600' :
                                            activity.type === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {activity.type === 'order' ? <ShoppingCart size={20} /> :
                                                activity.type === 'expense' ? <TrendingDown size={20} /> : <Info size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{activity.message}</p>
                                            <p className="text-xs text-gray-400 font-bold">{activity.time}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-black ${activity.status === 'positive' ? 'text-emerald-600' :
                                        activity.status === 'negative' ? 'text-rose-600' : 'text-gray-400'
                                        }`}>
                                        {activity.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BENCHMARK / COMPETITIVE STANDING */}
                {metrics && metrics.connected && !isDemo && benchmarks && benchmarks.margin && (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg animate-pulse"><TrendingUp size={20} /></div>
                            <h3 className="text-xl font-black text-gray-900">Rekabet Analizi</h3>
                            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-bold border border-amber-100">Yeni</span>
                            <span className="text-xs text-gray-400 font-bold ml-auto hidden sm:block">Kohort: {benchmarks.margin.cohort}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BenchmarkCard
                                metricLabel="Kâr Marjı"
                                userValue={benchmarks.margin.user_value ? Number((benchmarks.margin.user_value * 100).toFixed(1)) : 0}
                                median={benchmarks.margin.benchmark_median ? Number((benchmarks.margin.benchmark_median * 100).toFixed(1)) : 10}
                                top10={benchmarks.margin.benchmark_top10 ? Number((benchmarks.margin.benchmark_top10 * 100).toFixed(1)) : 25}
                                status={benchmarks.margin.percentile_rank >= 75 ? 'success' : benchmarks.margin.percentile_rank < 25 ? 'warning' : 'neutral'}
                                aiComment={benchmarks.margin.percentile_rank >= 75
                                    ? "Mükemmel! Sektörün en kârlı %25'lik dilimindesiniz."
                                    : benchmarks.margin.percentile_rank < 25
                                        ? "Dikkat: Benzer mağazalara göre kârlılığınız düşük."
                                        : "Ortalama seviyedesiniz. Reklam maliyetlerini optimize ederek Top %10'a girebilirsiniz."
                                }
                            />

                            {/* Placeholder for Refund comparison or another card */}
                            <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 border-dashed flex items-center justify-center text-gray-400 font-medium text-sm">
                                Daha fazla kıyaslama verisi toplanıyor...
                            </div>
                        </div>
                    </div>
                )}


                {/* EMPTY STATE (REAL USER NOT CONNECTED) */}
                {!metrics.loading && !isDemo && metrics.revenue === 0 && (
                    <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Activity size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Veri Akışı Bekleniyor</h3>
                        <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
                            {metrics.connected
                                ? "Shopify bağlantınız aktif. İlk sipariş veya finansal olay gerçekleştiğinde veriler buraya akmaya başlayacak."
                                : "Sistem şu an hazır ancak henüz işlenmiş bir finansal olay yok. Shopify mağazanızı bağlayın veya ilk siparişinizi bekleyin."
                            }
                        </p>
                        {metrics.connected ? (
                            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-xl inline-block">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                Veri Bekleniyor...
                            </div>
                        ) : (
                            <a href="/connect/shopify" className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors inline-block">
                                Shopify'ı Bağla
                            </a>
                        )}
                    </div>
                )}

            </main>
        </div>
    )
}
