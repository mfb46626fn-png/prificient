
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertTriangle, TrendingUp, Zap, Target } from 'lucide-react'
import { generateComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis'
import { diagnoseFromAnalysis } from '@/lib/analysis/diagnosis-helper'

export default async function OneriPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const now = new Date()
    const startDate = new Date()
    startDate.setDate(now.getDate() - 30)

    let analysis = null
    try {
        // Fetch full list for detailed recommendations
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
                            <Zap size={40} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4">Büyüme Zamanı!</h1>
                        <p className="text-gray-500 text-lg">
                            Kritik bir sorun bulunmuyor. Şimdi reklam bütçeni artırarak ciroyu katlama zamanı.
                        </p>
                        <Link href="/dashboard" className="mt-8 inline-block px-8 py-4 bg-black text-white rounded-xl font-bold">
                            Dashboard'a Dön
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    switch (topFactor) {
        case 'toxic_product_impact':
            Content = <ToxicSolutionView analysis={analysis} score={topFactorScore} />
            break
        case 'refund_bleed_impact':
            Content = <RefundSolutionView analysis={analysis} score={topFactorScore} />
            break
        default:
            Content = <GenericSolutionView factor={topFactor} score={topFactorScore} analysis={analysis} />
    }

    return (
        <div className="min-h-screen bg-white md:bg-gray-50">
            <div className="max-w-4xl mx-auto md:py-12">
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

function ToxicSolutionView({ analysis, score }: { analysis: any, score: number }) {
    const products = analysis.dangerProducts || []
    const totalLoss = analysis.opportunityCost.lostProfit;
    const projectGain = totalLoss * 12; // Annual projection

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white md:rounded-3xl md:p-12 md:shadow-lg md:border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Target size={200} />
                </div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                        <Zap size={14} /> Prificient Önerisi
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        Zarar Eden Ürünleri<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Satışa Kapat.</span>
                    </h1>

                    <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mb-8">
                        Tespit edilen {products.length} ürün, satıldığı her an kasandan para eksiltiyor.
                        Duygusal bağ kurma, matematiğe güven.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex-1">
                            <div className="text-sm font-bold text-red-400 uppercase mb-1">Mevcut Durum</div>
                            <div className="text-3xl font-black text-red-600">
                                -{totalLoss.toLocaleString('tr-TR', { style: 'currency', currency: analysis.currency })} <span className="text-sm text-red-400 font-medium">/ Ay</span>
                            </div>
                            <div className="text-xs text-red-400 mt-2">Bu ürünlerden kaynaklı aylık net zarar.</div>
                        </div>

                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex-1 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <TrendingUp size={100} />
                            </div>
                            <div className="text-sm font-bold text-emerald-600 uppercase mb-1">Potansiyel Kazanç</div>
                            <div className="text-3xl font-black text-emerald-600">
                                +{projectGain.toLocaleString('tr-TR', { style: 'currency', currency: analysis.currency })} <span className="text-sm text-emerald-500 font-medium">/ Yıl</span>
                            </div>
                            <div className="text-xs text-emerald-600 mt-2">Sadece bu ürünleri kapatarak yıllık kurtarılan nakit.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why & How */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">1</span>
                        Neden Kapatmalıyım?
                    </h3>
                    <ul className="space-y-4 text-gray-600">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Bu ürünlerin maliyeti (COGS + Kargo + Reklam), satış fiyatından daha yüksek.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Reklam bütçeni "çöp" trafiğe harcıyorsun.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Operasyonel yük (paketleme, iade süreçleri) boşa gidiyor.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">2</span>
                        Nasıl Yaparım?
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-200">
                            <strong>Adım 1:</strong> Shopify paneline git.
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-200">
                            <strong>Adım 2:</strong> Aşağıdaki ürünleri bul.
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-200">
                            <strong>Adım 3:</strong> Durumunu "Taslak" (Draft) yap veya Arşivle.
                        </div>
                        <Link href="/dashboard/kanayan-yara" className="block text-center text-blue-600 font-bold hover:underline mt-4">
                            Zarar Eden Ürün Listesini Gör →
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-blue-200">
                <h3 className="text-2xl font-bold mb-2">Karar Senin.</h3>
                <p className="opacity-80 mb-6">Matematik yalan söylemez. Bu ürünleri kapat, kârlı ürünlere odaklan.</p>
                <Link href="/dashboard" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-block">
                    Anlaşıldı, Dashboard'a Dön
                </Link>
            </div>
        </div>
    )
}

function RefundSolutionView({ analysis, score }: { analysis: any, score: number }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white md:rounded-3xl md:p-12 md:shadow-lg md:border border-gray-100">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                    <AlertTriangle size={14} /> Prificient Önerisi
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                    İade Politikanı<br />
                    <span className="text-orange-600">Sıkılaştır.</span>
                </h1>
                <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mb-8">
                    İade oranların sektör ortalamasının üzerinde. Bu sadece müşteri memnuniyetsizliği değil, operasyonel bir kara delik.
                </p>

                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                    <h3 className="font-bold text-orange-800 mb-2">Aksiyon Planı</h3>
                    <ul className="list-disc list-inside text-orange-700 space-y-2">
                        <li>Ürün açıklamalarını ve beden tablolarını güncelle (İade sebebi: "Beden uymadı" ise).</li>
                        <li>Kargo paketlemesini iyileştir (İade sebebi: "Hasarlı ürün" ise).</li>
                        <li>İade süresini veya koşullarını gözden geçir.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

function GenericSolutionView({ factor, score, analysis }: { factor: string, score: number, analysis: any }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white md:rounded-3xl md:p-12 md:shadow-lg md:border border-gray-100">
                <h1 className="text-4xl font-black text-gray-900 mb-6 capitalize">
                    Çözüm: {factor.replace(/_/g, ' ')}
                </h1>
                <p className="text-lg text-gray-500">
                    Bu konuda detaylı bir aksiyon planı hazırlanıyor. Genel finansal disiplin kurallarına uyun.
                </p>
            </div>
        </div>
    )
}
