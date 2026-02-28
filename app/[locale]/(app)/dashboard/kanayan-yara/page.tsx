
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Skull, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react'
import { generateComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis'
import { diagnoseFromAnalysis } from '@/lib/analysis/diagnosis-helper'

export default async function KanayanYaraPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Always fetch last 30 days for diagnosis consistency
    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - 30)

    let analysis = null
    try {
        analysis = await generateComprehensiveAnalysis(user.id, { start: startDate, end: now }, { limitLists: false })
    } catch (e) {
        console.error("Diagnosis Error", e)
    }

    if (!analysis) {
        return <div className="p-10 text-center">Analiz verisi yüklenemedi.</div>
    }

    const diagnosis = diagnoseFromAnalysis(analysis)
    const factorEntries = Object.entries(diagnosis.factors).sort(([, a], [, b]) => b - a)
    const [topFactor, topFactorScore] = factorEntries[0] || ['none', 0]

    // Determine Content based on topFactor
    let Content = null
    const isClean = diagnosis.score > 95 || topFactorScore === 0

    if (isClean) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 md:p-12">
                <div className="max-w-3xl mx-auto">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium">
                        <ArrowLeft size={20} /> Dashboard'a Dön
                    </Link>
                    <div className="bg-white rounded-3xl p-12 text-center border border-emerald-100 shadow-sm">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                            <DollarSign size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4">Her Şey Yolunda!</h1>
                        <p className="text-gray-500 text-lg">Mağazan şu an sağlıklı görünüyor. Büyük bir risk tespit edilmedi.</p>
                        <Link href="/dashboard" className="mt-8 inline-block px-8 py-4 bg-black text-white rounded-xl font-bold">
                            İşine Odaklan
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    switch (topFactor) {
        case 'toxic_product_impact':
            Content = <ToxicProductsView analysis={analysis} score={topFactorScore} />
            break
        case 'refund_bleed_impact':
            Content = <RefundBleedView analysis={analysis} score={topFactorScore} />
            break
        default:
            Content = <GenericBleedView factor={topFactor} score={topFactorScore} analysis={analysis} />
    }

    return (
        <div className="min-h-screen bg-white md:bg-gray-50">
            <div className="max-w-5xl mx-auto md:py-12">
                <div className="p-6 md:p-0">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-medium transition-colors">
                        <ArrowLeft size={20} /> Dashboard'a Dön
                    </Link>

                    {Content}
                </div>
            </div>
        </div>
    )
}

// --- SUB COMPONENTS ---

function ToxicProductsView({ analysis, score }: { analysis: any, score: number }) {
    const products = analysis.dangerProducts || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white md:rounded-3xl md:p-10 md:shadow-sm md:border border-gray-100">
                <div className="flex items-start gap-6">
                    <div className="hidden md:flex p-6 bg-red-50 rounded-2xl text-red-600 shrink-0">
                        <Skull size={48} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                            Kanayan Yara: Toksik Ürünler
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                            Satış Var, Ama <span className="text-red-600">Kâr Yok.</span>
                        </h1>
                        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                            Mağazanda ciro getiren ancak gerçekte sana para kaybettiren {products.length} ürün tespit ettik.
                            Bu ürünler reklam bütçeni ve operasyonel enerjini çalıyor.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Table */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Acil Müdahale Listesi</h3>
                        <p className="text-sm text-gray-500">Bu ürünleri satışa kapatmak anında kârını artırabilir.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium text-gray-400">Toplam Tahmini Zarar</div>
                        <div className="text-2xl font-black text-red-600">
                            {analysis.opportunityCost.lostProfit.toLocaleString('tr-TR', { style: 'currency', currency: analysis.currency })}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-400 uppercase font-bold">
                            <tr>
                                <th className="p-6">Ürün</th>
                                <th className="p-6 text-right">Maliyet</th>
                                <th className="p-6 text-right">Net Zarar</th>
                                <th className="p-6 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((p: any, i: number) => (
                                <tr key={i} className="hover:bg-red-50/10 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-gray-900 text-lg mb-1">{p.title}</div>
                                        <div className="text-xs text-gray-400 font-mono">{p.sku || 'SKU YOK'}</div>
                                    </td>
                                    <td className="p-6 text-right text-gray-600 font-medium">
                                        {(p.cogs || 0).toLocaleString('tr-TR', { style: 'currency', currency: analysis.currency })}
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="font-black text-red-600 text-lg">
                                            {p.profit.toLocaleString('tr-TR', { style: 'currency', currency: analysis.currency })}
                                        </div>
                                        <div className="text-xs text-red-400 font-medium mt-1">
                                            %{p.profit_margin.toFixed(1)} Marj
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="px-4 py-2 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 rounded-lg text-sm font-bold transition-colors">
                                            İncele
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900 mb-1">Prificient Önerisi</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        Bu ürünlerin fiyatını maliyetleri kurtaracak seviyeye çekmeyi deneyin. Eğer satış durursa, ürünü tamamen kaldırmak en kârlı hamle olacaktır.
                    </p>
                </div>
            </div>
        </div>
    )
}

function RefundBleedView({ analysis, score }: { analysis: any, score: number }) {
    const refunds = analysis.costBreakdown.refunds
    const rate = ((refunds / analysis.realProfit.grossRevenue) * 100).toFixed(1)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white md:rounded-3xl md:p-10 md:shadow-sm md:border border-gray-100">
                <div className="flex items-start gap-6">
                    <div className="p-6 bg-orange-50 rounded-2xl text-orange-600 shrink-0">
                        <TrendingDown size={48} />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                            Kanayan Yara: İade Kanaması
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                            İade Oranı: <span className="text-orange-600">%{rate}</span>
                        </h1>
                        <p className="text-lg text-gray-500">
                            Sektör ortalamasının üzerindesin. Kazandığın paranın büyük kısmı iadelere gidiyor.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Finansal Etki</h3>
                <div className="text-4xl font-black text-gray-900 mb-2">
                    -{refunds.toLocaleString('tr-TR', { style: 'currency', currency: analysis.currency })}
                </div>
                <p className="text-gray-500">Son 30 günde iadelere giden tutar.</p>
            </div>
        </div>
    )
}

function GenericBleedView({ factor, score, analysis }: { factor: string, score: number, analysis: any }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white md:rounded-3xl md:p-10 md:shadow-sm md:border border-gray-100">
                <h1 className="text-3xl font-black text-gray-900 mb-4 capitalize">
                    Sorun: {factor.replace(/_/g, ' ')}
                </h1>
                <p className="text-lg text-gray-500">
                    Bu metrik üzerinde iyileştirme yapman gerekiyor. Detaylı analiz yakında eklenecek.
                </p>
            </div>
        </div>
    )
}
