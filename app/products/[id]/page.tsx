'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import { 
  ArrowLeft, ArrowRight, TrendingUp, Activity, 
  Calendar, CheckCircle2, XCircle, AlertCircle, PieChart, ShieldAlert, ShieldCheck, List, Eye, X, Receipt
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { analyzeProfitRisk } from '@/utils/platform-intelligence' 

// --- TİP TANIMLARI ---
type Decision = {
  decision_id: string
  old_value: number
  new_value: number
  decision_date: string
  analysis?: any
}

type OrderDetail = {
  id: string
  order_date: string
  net_profit: number
  quantity: number
  total_revenue: number
  sale_price: number
  unit_cost: number
  shipping_cost: number
  platform_fee: number
  ad_cost_allocated: number
  platform?: string
}

type ProductDetail = {
  id: string
  name: string
  total_revenue: number
  total_profit: number
  total_orders: number
  average_margin: number
  avg_price: number
  avg_cost: number
  avg_shipping: number
  avg_platform_fee: number
  avg_ad_cost: number
  orders_list: OrderDetail[]
}

export default function ProductDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [riskAnalysis, setRiskAnalysis] = useState<{level: string, msg: string} | null>(null)
  
  // MODAL STATE
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !params.id) return

      // 1. ÜRÜN VE SİPARİŞLERİ ÇEK
      const { data: prodData } = await supabase
        .from('products')
        .select(`
            id, name, 
            orders(
                id, order_date, net_profit, quantity, total_revenue, 
                sale_price, unit_cost, shipping_cost, platform_fee, ad_cost_allocated, platform
            )
        `)
        .eq('id', params.id)
        .single()

      // 2. KARARLARI ÇEK
      const { data: decisionData } = await supabase
        .from('decisions')
        .select('*')
        .eq('product_id', params.id)
        .order('decision_date', { ascending: false })

      if (prodData) {
        const orders = prodData.orders as any[] || []
        
        // Siparişleri Tarihe Göre Sırala
        orders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())

        let rev = 0, prof = 0, qty = 0
        let sumPrice = 0, sumCost = 0, sumShip = 0, sumFee = 0, sumAds = 0

        orders.forEach(o => {
            rev += Number(o.total_revenue)
            prof += Number(o.net_profit)
            qty += Number(o.quantity)
            
            const q = Number(o.quantity) || 1
            sumPrice += Number(o.sale_price) * q
            sumCost += Number(o.unit_cost) * q
            sumShip += Number(o.shipping_cost)
            sumFee += Number(o.platform_fee)
            sumAds += Number(o.ad_cost_allocated)
        })

        const avgPrice = qty > 0 ? sumPrice / qty : 0
        const avgCost = qty > 0 ? sumCost / qty : 0
        const avgShip = qty > 0 ? sumShip / qty : 0
        const avgFee = qty > 0 ? sumFee / qty : 0
        const avgAds = qty > 0 ? sumAds / qty : 0

        const totalUnitCost = avgCost + avgShip + avgFee + avgAds
        const risk = analyzeProfitRisk(totalUnitCost, avgPrice, 0) 
        setRiskAnalysis(risk)

        setProduct({
            id: prodData.id,
            name: prodData.name,
            total_revenue: rev,
            total_profit: prof,
            total_orders: orders.length,
            average_margin: rev > 0 ? (prof / rev) * 100 : 0,
            avg_price: avgPrice,
            avg_cost: avgCost,
            avg_shipping: avgShip,
            avg_platform_fee: avgFee,
            avg_ad_cost: avgAds,
            orders_list: orders
        })

        // --- KARAR ANALİZİ ---
        const analyzedDecisions = decisionData?.map((dec: any) => {
            const decisionDate = new Date(dec.decision_date).getTime()
            const ONE_DAY = 24 * 60 * 60 * 1000
            const WINDOW_DAYS = 14 

            const beforeOrders = orders.filter(o => {
                const od = new Date(o.order_date).getTime()
                return od < decisionDate && od >= (decisionDate - (WINDOW_DAYS * ONE_DAY))
            })
            
            const afterOrders = orders.filter(o => {
                const od = new Date(o.order_date).getTime()
                return od > decisionDate && od <= (decisionDate + (WINDOW_DAYS * ONE_DAY))
            })

            const calcDailyProfit = (list: any[]) => {
                if (list.length === 0) return 0
                const total = list.reduce((sum, o) => sum + Number(o.net_profit), 0)
                return total / WINDOW_DAYS 
            }

            const beforeProfit = calcDailyProfit(beforeOrders)
            const afterProfit = calcDailyProfit(afterOrders)
            
            let changePercent = 0
            if (beforeProfit > 0) {
                changePercent = ((afterProfit - beforeProfit) / beforeProfit) * 100
            } else if (afterProfit > 0) {
                changePercent = 100
            }

            const sampleSize = beforeOrders.length + afterOrders.length
            let confidence: 'low' | 'medium' | 'high' = 'low'
            if (sampleSize > 20) confidence = 'high'
            else if (sampleSize > 10) confidence = 'medium'

            return {
                ...dec,
                analysis: {
                    before_daily_profit: beforeProfit,
                    after_daily_profit: afterProfit,
                    profit_change_percent: changePercent,
                    is_success: afterProfit > beforeProfit,
                    confidence
                }
            }
        }) || []

        setDecisions(analyzedDecisions)
      }
      setLoading(false)
    }

    fetchData()
  }, [params.id])

  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">Analizler Yükleniyor...</div>
  if (!product) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">Ürün bulunamadı.</div>

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col gap-6">
            <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold text-sm">
                <ArrowLeft size={16}/> Geri Dön
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-black tracking-tight">{product.name}</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                            {product.total_orders} Sipariş
                        </span>
                        {riskAnalysis && (
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                riskAnalysis.level === 'safe' ? 'bg-emerald-100 text-emerald-800' :
                                riskAnalysis.level === 'medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-rose-100 text-rose-800'
                            }`}>
                                {riskAnalysis.level === 'safe' ? <ShieldCheck size={14}/> : <ShieldAlert size={14}/>}
                                {riskAnalysis.msg}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Toplam Net Kâr</div>
                    <div className="text-5xl font-black text-emerald-600 tracking-tighter">
                        {formatCurrency(product.total_profit)}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SOL KOLON: BİRİM EKONOMİ */}
            <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center gap-2">
                    <PieChart size={20} className="text-black"/>
                    <h3 className="text-xl font-black text-black">Birim Ekonomi (Ort.)</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-10 -mt-10 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-bold text-gray-500">Ort. Satış Fiyatı</span>
                            <span className="text-2xl font-black text-black">{formatCurrency(product.avg_price)}</span>
                        </div>
                        <div className="space-y-3 relative">
                            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                            <div className="flex justify-between items-center text-sm pl-4 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-400 rounded-full -ml-[5px]"></div>
                                <span className="text-gray-500 font-medium">Ürün Maliyeti</span>
                                <span className="font-bold text-rose-600">-{formatCurrency(product.avg_cost)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pl-4 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full -ml-[5px]"></div>
                                <span className="text-gray-500 font-medium">Platform/Komisyon</span>
                                <span className="font-bold text-orange-600">-{formatCurrency(product.avg_platform_fee)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pl-4 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-400 rounded-full -ml-[5px]"></div>
                                <span className="text-gray-500 font-medium">Kargo</span>
                                <span className="font-bold text-indigo-600">-{formatCurrency(product.avg_shipping)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pl-4 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full -ml-[5px]"></div>
                                <span className="text-gray-500 font-medium">Reklam (Ads)</span>
                                <span className="font-bold text-purple-600">-{formatCurrency(product.avg_ad_cost)}</span>
                            </div>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-5"></div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Net Cepte Kalan</span>
                            <div className="text-right">
                                <div className="text-3xl font-black text-emerald-600 leading-none">
                                    {formatCurrency(product.avg_price - product.avg_cost - product.avg_shipping - product.avg_platform_fee - product.avg_ad_cost)}
                                </div>
                                <div className="text-xs font-bold text-emerald-400 mt-1">
                                    %{product.average_margin.toFixed(1)} Marj
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {product.average_margin < 15 && (
                    <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex gap-3">
                        <AlertCircle className="text-rose-600 shrink-0" size={24} />
                        <div>
                            <h4 className="font-black text-rose-900 text-sm">Kritik Uyarı</h4>
                            <p className="text-xs text-rose-700 mt-1 leading-relaxed font-medium">
                                Bu ürünün kâr marjı çok düşük. Küçük bir reklam artışı veya iade durumunda zarar edebilirsiniz.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* SAĞ KOLON */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* KARAR ANALİZİ */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Activity size={20} className="text-black"/>
                        <h3 className="text-xl font-black text-black">Karar Analizi</h3>
                    </div>
                    <div className="space-y-6">
                        {decisions.length === 0 ? (
                            <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
                                <p className="text-gray-500 font-bold text-sm">Fiyat değişikliği (Karar) tespit edilmedi.</p>
                            </div>
                        ) : (
                            decisions.map((decision) => (
                                <div key={decision.decision_id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                                <TrendingUp size={20}/>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FİYAT DEĞİŞİMİ</div>
                                                <div className="text-base font-black text-black flex items-center gap-2">
                                                    {formatCurrency(decision.old_value)} 
                                                    <ArrowRight size={14} className="text-gray-400"/> 
                                                    {formatCurrency(decision.new_value)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200">
                                            <Calendar size={12}/>
                                            {new Date(decision.decision_date).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>
                                    {decision.analysis && (
                                        <div className="p-6 grid grid-cols-3 gap-4 items-center">
                                            <div className="text-center opacity-60">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Önce</div>
                                                <div className="text-lg font-black text-gray-600">{formatCurrency(decision.analysis.before_daily_profit)}</div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center border-x border-gray-100">
                                                {decision.analysis.is_success ? 
                                                    <CheckCircle2 size={20} className="text-emerald-500 mb-1"/> : 
                                                    <XCircle size={20} className="text-rose-500 mb-1"/>
                                                }
                                                <div className={`text-xl font-black ${decision.analysis.is_success ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {decision.analysis.profit_change_percent.toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">Sonra</div>
                                                <div className="text-lg font-black text-black">{formatCurrency(decision.analysis.after_daily_profit)}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SİPARİŞ GEÇMİŞİ LİSTESİ */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <List size={20} className="text-black"/>
                        <h3 className="text-xl font-black text-black">Sipariş Geçmişi</h3>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider">Tarih</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider">Adet</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider">Satış Fiyatı</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider">Top. Maliyet</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-right">Net Kâr</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-right">Marj</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-center">Detay</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {product.orders_list.map((order) => {
                                        const margin = (order.net_profit / order.total_revenue) * 100
                                        const totalCost = Number(order.total_revenue) - Number(order.net_profit)
                                        
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                                <td className="px-6 py-4 font-bold text-gray-600">
                                                    {new Date(order.order_date).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {order.quantity}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">
                                                    {formatCurrency(order.sale_price)}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-rose-600">
                                                    -{formatCurrency(totalCost)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-black ${order.net_profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {formatCurrency(order.net_profit)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black ${
                                                        margin > 20 ? 'bg-emerald-50 text-emerald-700' : 
                                                        margin > 0 ? 'bg-orange-50 text-orange-700' : 
                                                        'bg-rose-50 text-rose-700'
                                                    }`}>
                                                        %{margin.toFixed(0)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-black hover:bg-gray-200 transition-all">
                                                        <Eye size={14}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* --- DETAY MODALI (Sipariş Fişi) --- */}
        {selectedOrder && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                    
                    {/* DÜZELTME: Kapatma Butonu (z-index ve absolute pozisyonu iyileştirildi) */}
                    <div className="relative bg-gray-900 text-white p-6">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(null); }} 
                            className="absolute top-5 right-5 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all z-50 cursor-pointer"
                        >
                            <X size={20} className="text-white"/>
                        </button>

                        <div className="flex items-center gap-3 mb-1 pr-10">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                                <Receipt size={20}/>
                            </div>
                            <div>
                                <h3 className="text-lg font-black tracking-tight">Sipariş Fişi</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                                    {new Date(selectedOrder.order_date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        
                        {/* 1. GELİR */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase">Toplam Satış</div>
                                <div className="text-2xl font-black text-gray-900">{formatCurrency(selectedOrder.total_revenue)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-gray-400 uppercase">Adet</div>
                                <div className="text-lg font-bold text-gray-900">{selectedOrder.quantity} x {formatCurrency(selectedOrder.sale_price)}</div>
                            </div>
                        </div>

                        {/* 2. GİDERLER */}
                        <div className="space-y-3">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Gider Detayı</div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Ürün Maliyeti (COGS)</span>
                                <span className="font-bold text-rose-600">-{formatCurrency(selectedOrder.unit_cost * selectedOrder.quantity)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Platform Komisyonu</span>
                                <span className="font-bold text-orange-600">-{formatCurrency(selectedOrder.platform_fee)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Kargo</span>
                                <span className="font-bold text-indigo-600">-{formatCurrency(selectedOrder.shipping_cost)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Reklam Payı (Allocated)</span>
                                <span className="font-bold text-purple-600">-{formatCurrency(selectedOrder.ad_cost_allocated)}</span>
                            </div>
                        </div>

                        {/* 3. NET SONUÇ */}
                        <div className="pt-6 border-t-2 border-dashed border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-gray-900 uppercase">NET KÂR</span>
                                <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                                    {formatCurrency(selectedOrder.net_profit)}
                                </div>
                            </div>
                            <div className="text-right mt-1">
                                <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded">
                                    %{(selectedOrder.net_profit / selectedOrder.total_revenue * 100).toFixed(1)} Marj
                                </span>
                            </div>
                        </div>

                        {/* Footer Info */}
                        {selectedOrder.platform && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 py-2 rounded-xl">
                                <span>Platform:</span>
                                <span className="text-gray-700 uppercase tracking-wide">{selectedOrder.platform}</span>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  )
}