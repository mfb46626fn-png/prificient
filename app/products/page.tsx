'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import {
  Package, TrendingUp, AlertCircle, Search,
  ArrowRight, ShieldCheck, ShieldAlert, Shield
} from 'lucide-react'
import Link from 'next/link'

// TİP TANIMLARI
type ProductSummary = {
  id: string
  name: string
  total_revenue: number
  total_profit: number
  total_orders: number
  last_sale_date: string
  average_margin: number
  confidence_level: 'low' | 'medium' | 'high'
}

import { useCurrency } from '@/app/contexts/CurrencyContext'

export default function ProductsPage() {
  const supabase = createClient()
  const { convert, symbol } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ revenue: 0, profit: 0 })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. ÜRÜNLERİ VE SİPARİŞLERİNİ ÇEK
      const { data: rawData, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          orders (
            total_revenue,
            net_profit,
            order_date
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error("Veri çekme hatası:", error)
        setLoading(false)
        return
      }

      let totalGlobalRevenue = 0
      let totalGlobalProfit = 0

      // 2. CANLI KARNE HESAPLAMA (Aggregation)
      const summaries: ProductSummary[] = rawData.map((prod: any) => {
        let rev = 0
        let profit = 0
        let count = prod.orders?.length || 0
        let lastDate = ''

        // Siparişleri döngüye al ve topla
        if (prod.orders && prod.orders.length > 0) {
          prod.orders.forEach((o: any) => {
            rev += Number(o.total_revenue)
            profit += Number(o.net_profit)
            if (!lastDate || new Date(o.order_date) > new Date(lastDate)) {
              lastDate = o.order_date
            }
          })
        }

        totalGlobalRevenue += rev
        totalGlobalProfit += profit

        // Güven Seviyesi (Manifesto Madde 8)
        let conf: 'low' | 'medium' | 'high' = 'low'
        if (count > 20) conf = 'high'
        else if (count >= 5) conf = 'medium'

        return {
          id: prod.id,
          name: prod.name,
          total_revenue: rev,
          total_profit: profit,
          total_orders: count,
          last_sale_date: lastDate,
          average_margin: rev > 0 ? (profit / rev) * 100 : 0,
          confidence_level: conf
        }
      })

      // 3. SADECE SATIŞI OLANLARI GÖSTER VE KÂRA GÖRE SIRALA
      // Manifesto: "Satılmamış ürün = yok"
      const activeProducts = summaries
        .filter(p => p.total_orders > 0)
        .sort((a, b) => b.total_profit - a.total_profit)

      setProducts(activeProducts)
      setStats({ revenue: totalGlobalRevenue, profit: totalGlobalProfit })
      setLoading(false)
    }

    fetchData()
  }, [])

  const getConfidenceBadge = (level: string) => {
    if (level === 'high') return <span className="flex items-center gap-1 text-[10px] uppercase font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100"><ShieldCheck size={12} /> Yüksek Güven</span>
    if (level === 'medium') return <span className="flex items-center gap-1 text-[10px] uppercase font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100"><Shield size={12} /> Orta Güven</span>
    return <span className="flex items-center gap-1 text-[10px] uppercase font-black text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200"><ShieldAlert size={12} /> Düşük Veri</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <DashboardHeader totalRevenue={stats.revenue} totalExpense={stats.revenue - stats.profit} />

      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Ürün Karneleri</h1>
            <p className="text-gray-600 font-bold mt-1 text-sm">Sadece satışı gerçekleşmiş ürünlerin performans özeti.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Ürün ara..."
              className="pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-black text-sm outline-none focus:border-black transition-all w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* LİSTE */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold">Analiz yapılıyor...</div>
        ) : products.length === 0 ? (
          <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-black text-black">Henüz Aktif Ürün Yok</h3>
            <p className="text-gray-500 font-medium mt-2">
              Sistem sadece "gerçekleşmiş satışları" ürün olarak kabul eder.<br />
              Veri sayfasından bir satış dosyası yükleyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block">
                  <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-black/5 transition-all duration-300 relative overflow-hidden">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

                      {/* SOL: İSİM VE GÜVEN */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getConfidenceBadge(product.confidence_level)}
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Son Satış: {new Date(product.last_sale_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      {/* ORTA: METRİKLER */}
                      <div className="flex items-center gap-8 md:border-l md:border-gray-100 md:pl-8">

                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Toplam Sipariş</p>
                          <p className="text-xl font-black text-gray-900">{product.total_orders}</p>
                        </div>

                        <div className="text-center md:text-left">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ort. Marj</p>
                          <p className={`text-xl font-black ${product.average_margin > 30 ? 'text-emerald-500' : product.average_margin > 15 ? 'text-blue-500' : 'text-orange-500'}`}>
                            %{product.average_margin.toFixed(0)}
                          </p>
                        </div>

                        <div className="text-center md:text-right min-w-[120px]">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Net Kâr</p>
                          <p className="text-2xl font-black text-gray-900">{symbol}{convert(product.total_profit)}</p>
                        </div>

                      </div>

                      {/* SAĞ: OK */}
                      <div className="hidden md:flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                        <ArrowRight size={20} />
                      </div>

                    </div>

                    {/* Hover Efekti için Arkaplan */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </Link>
              ))}
          </div>
        )}

      </main>
    </div>
  )
}