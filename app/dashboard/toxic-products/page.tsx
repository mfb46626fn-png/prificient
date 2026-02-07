
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { generateComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis'
import { ArrowLeft, AlertTriangle, TrendingDown, ExternalLink, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import DateRangePicker from '@/components/DateRangePicker'

export default async function ToxicProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const range = (params.range as string) || '30d'
    const now = new Date()
    const startDate = new Date()
    // Date Logic (Reused for consistency)
    if (range === '7d') startDate.setDate(now.getDate() - 7)
    else if (range === '30d') startDate.setDate(now.getDate() - 30)
    else if (range === 'this_month') startDate.setDate(1)
    else if (range === 'last_month') {
        startDate.setMonth(startDate.getMonth() - 1)
        startDate.setDate(1)
        now.setDate(0)
    } else if (range === 'all') {
        startDate.setFullYear(2020)
    }

    let analysis: any = null
    try {
        const filter = range === 'all' ? undefined : { start: startDate, end: now };
        analysis = await generateComprehensiveAnalysis(user.id, filter)
    } catch (e) {
        console.error("Analysis Error", e)
    }

    const dangerProducts = analysis?.dangerProducts || []
    const totalLoss = dangerProducts.reduce((sum: number, p: any) => sum + (p.profit < 0 ? Math.abs(p.profit) : 0), 0)
    const currency = analysis?.currency || 'TRY'

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Link href="/dashboard" className="text-gray-400 hover:text-gray-900 flex items-center gap-2 text-sm font-medium mb-2 transition-colors">
                            <ArrowLeft size={16} /> Dashboard'a Dön
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <ShieldAlert className="text-red-600" size={32} />
                            Toksik Ürün Yönetimi
                        </h1>
                        <p className="text-gray-500 mt-1">Bu ürünler nakit akışınızı negatif etkiliyor. Acil müdahale önerilir.</p>
                    </div>
                    <DateRangePicker />
                </div>

                {/* Summary Card */}
                {dangerProducts.length > 0 ? (
                    <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingDown size={120} className="text-red-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="text-red-600 font-bold uppercase tracking-wider text-xs mb-2 flex items-center gap-2">
                                <AlertTriangle size={14} /> Toplam Zarar Etkisi
                            </div>
                            <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                                -{formatMoney(totalLoss)}
                            </div>
                            <p className="text-red-800/70 font-medium">
                                Bu ürünleri kapatarak aylık kârınızı bu kadar artırabilirsiniz.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-emerald-900">Harika Haber!</h3>
                            <p className="text-emerald-700">Şu an mağazanızda zarar eden "Toksik" bir ürün bulunmuyor.</p>
                        </div>
                    </div>
                )}

                {/* Product List */}
                {dangerProducts.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Tespit Edilen Toksik Ürünler ({dangerProducts.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {dangerProducts.map((p: any, i: number) => (
                                <div key={i} className="p-6 hover:bg-red-50/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-gray-900 text-lg">{p.title}</h4>
                                            <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                                Zararlı
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 flex flex-wrap gap-4 mt-2">
                                            <span>SKU: {p.sku || '-'}</span>
                                            <span>Satış: {p.quantity_sold} Adet</span>
                                            <span>Maliyet: {formatMoney(p.cogs)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 w-full md:w-auto">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400 font-medium uppercase">Net Zarar</div>
                                            <div className="text-xl font-black text-red-600">
                                                {formatMoney(p.profit)}
                                            </div>
                                        </div>

                                        <div className="text-right min-w-[80px]">
                                            <div className="text-xs text-gray-400 font-medium uppercase">Marj</div>
                                            <div className="text-sm font-bold text-red-500">
                                                %{p.profit_margin.toFixed(1)}
                                            </div>
                                        </div>

                                        <a
                                            href={`https://admin.shopify.com/store/${analysis.storeName?.replace(/ /g, '-').toLowerCase()}/products/${p.product_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                                            title="Shopify'da Düzenle"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
