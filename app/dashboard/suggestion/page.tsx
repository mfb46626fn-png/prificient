
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Skull, TrendingDown, RefreshCw, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { generateComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis'

export default async function SuggestionPage({ searchParams }: { searchParams: Promise<{ type?: string, range?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const type = params.type || 'unknown'
    const range = params.range || '30d'

    // Calculate Date Range
    const now = new Date()
    const startDate = new Date()
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
        console.error("Suggestion Analysis Error", e)
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: analysis?.currency || 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    // --- CONTENT MAP ---
    const getContent = () => {
        switch (type) {
            case 'toxic_product_impact':
                const dangerProducts = analysis?.dangerProducts || []
                const totalLoss = dangerProducts.reduce((sum: number, p: any) => sum + (p.profit < 0 ? Math.abs(p.profit) : 0), 0)

                return {
                    title: 'Toksik Ürün Temizliği',
                    icon: <Skull size={32} className="text-red-500" />,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    subtitle: 'Gizli Zarar Edenleri Tespit Et',
                    description: 'Mağazanızda ciro yapıyor gibi görünen ancak reklam ve iade maliyetleri düşüldüğünde size net zarar yazan ürünler var.',
                    impact: `Bu ürünleri kapatmak kârınızı anında ${formatMoney(totalLoss)} artıracaktır.`,
                    actionLabel: 'Shopify Paneline Git',
                    actionLink: 'https://admin.shopify.com/products',
                    component: (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-red-50/50 text-xs font-bold text-red-800 uppercase">
                                        <tr>
                                            <th className="p-4">Ürün</th>
                                            <th className="p-4 text-right">Zarar</th>
                                            <th className="p-4 text-right">Marj</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-50">
                                        {dangerProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-6 text-center text-gray-500 text-sm">
                                                    Şu an için belirgin bir toksik ürün bulunamadı. Harika!
                                                </td>
                                            </tr>
                                        ) : (
                                            dangerProducts.map((p: any, i: number) => (
                                                <tr key={i} className="hover:bg-red-50/30 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-900 line-clamp-1">{p.title}</div>
                                                        <div className="text-xs text-gray-500">{p.sku || 'SKU Yok'}</div>
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-red-600">
                                                        {formatMoney(p.profit)}
                                                    </td>
                                                    <td className="p-4 text-right text-xs text-red-400 font-medium">
                                                        %{p.profit_margin.toFixed(1)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex gap-4">
                                <div className="mt-1 text-blue-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm mb-1">Prificient Önerisi</h4>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        Bu ürünlerin reklamlarını kapatmak, bütçenizi kârlı ürünlere ("Yıldız Oyuncular") kaydırmanızı sağlar.
                                        Cironuz biraz düşebilir, ancak <b>Net Kârınız</b> artacaktır.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }

            case 'roas_trap_impact':
                return {
                    title: 'ROAS Tuzağı',
                    icon: <TrendingDown size={32} className="text-indigo-500" />,
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50',
                    subtitle: 'Reklam Verimliliği Düşük',
                    description: 'Reklam harcamalarınızın getirisi (ROAS) kritik seviyenin altında. Yani reklama verdiğiniz her 1 TL size beklenen kârı getirmiyor.',
                    impact: `Verimsiz kampanyaları durdurmak nakit akışınızı iyileştirecektir.`,
                    actionLabel: 'Reklam Yöneticisine Git',
                    actionLink: 'https://adsmanager.facebook.com',
                    component: (
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <p className="text-gray-600">Düşük ROAS genellikle yanlış hedef kitle veya düşük dönüşüm oranından kaynaklanır. Özellikle "tıklama alıp satış getirmeyen" reklam setlerini kapatın.</p>
                        </div>
                    )
                }

            case 'refund_bleed_impact':
                const refundRate = (analysis?.costBreakdown?.refunds / (analysis?.costBreakdown?.revenue || 1)) * 100
                return {
                    title: 'İade Kanaması',
                    icon: <RefreshCw size={32} className="text-orange-500" />,
                    color: 'text-orange-600',
                    bg: 'bg-orange-50',
                    subtitle: 'İade Oranlarını Optimize Et',
                    description: `İadeler cironuzun %${refundRate.toFixed(1)}'ini eritiyor. Sektör ortalaması %10-15 civarındadır.`,
                    impact: 'İade oranını %5 düşürmek kârınızı önemli ölçüde artıracaktır.',
                    actionLabel: 'İade Politikalarını İncele',
                    actionLink: 'https://admin.shopify.com',
                    component: (
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <p className="text-gray-600">İade nedenlerini analiz etmeniz gerekiyor. Beden tablosu eksikliği veya yanlış ürün açıklamaları en yaygın sebeplerdir.</p>
                        </div>
                    )
                }

            // ADD MORE AS NEEDED (Default Fallback)
            default:
                return {
                    title: 'Finansal Optimizasyon',
                    icon: <CheckCircle size={32} className="text-emerald-500" />,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    subtitle: 'Genel İyileştirme Fırsatları',
                    description: 'Verilerinizi analiz ettik ve bazı iyileştirme fırsatları yakaladık.',
                    impact: 'Bu önerileri uygulamak genel finansal sağlığınızı iyileştirecektir.',
                    actionLabel: 'Dashboard\'a Dön',
                    actionLink: '/dashboard',
                    component: <div className="p-8 text-center text-gray-500">Detaylı analiz için Dashboard üzerinden diğer metriklere göz atın.</div>
                }
        }
    }

    const content = getContent()

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Navbar / Back */}
                <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors gap-2">
                    <ArrowLeft size={16} /> Dashboard'a Dön
                </Link>

                {/* Header Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 p-12 opacity-5 ${content.bg} rounded-bl-[10rem]`}>
                        {content.icon}
                    </div>

                    <div className="relative z-10">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-xs font-black uppercase tracking-wider ${content.bg} ${content.color}`}>
                            {content.icon} Aksiyon Planı
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                            {content.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-lg leading-relaxed mb-8">
                            {content.description}
                        </p>

                        <div className="inline-flex flex-col md:flex-row gap-8 py-6 border-y border-gray-100 w-full mb-8">
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hedef</div>
                                <div className="text-lg font-bold text-gray-900">{content.subtitle}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tahmini Etki</div>
                                <div className={`text-lg font-black ${content.color}`}>{content.impact}</div>
                            </div>
                        </div>

                        {content.actionLink.startsWith('http') ? (
                            <a href={content.actionLink} target="_blank" rel="noopener noreferrer" className="inline-flex w-full md:w-auto h-12 bg-black text-white hover:bg-gray-800 transition-colors rounded-xl items-center justify-center px-8 font-bold text-sm gap-2">
                                {content.actionLabel} <ExternalLink size={16} />
                            </a>
                        ) : (
                            <Link href={content.actionLink} className="inline-flex w-full md:w-auto h-12 bg-black text-white hover:bg-gray-800 transition-colors rounded-xl items-center justify-center px-8 font-bold text-sm gap-2">
                                {content.actionLabel} <ArrowLeft size={16} className="rotate-180" />
                            </Link>
                        )}

                    </div>
                </div>

                {/* Dynamic Content */}
                {content.component}

            </div>
        </div>
    )
}
