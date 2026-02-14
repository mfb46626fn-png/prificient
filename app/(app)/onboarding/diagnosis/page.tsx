'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Target, ArrowRight, Loader2, Package, DollarSign, Percent, Clock } from 'lucide-react';
import type { DiagnosisReport } from '@/lib/onboarding/diagnosis';

// Helper function for currency formatting
const createFormatter = (currency: string) => (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(n);

// --- Slide 1: Overview ---
function SlideOverview({ data }: { data: DiagnosisReport }) {
    const formatCurrency = createFormatter(data.currency);
    const profitMargin = data.illusion.revenue > 0
        ? ((data.illusion.realProfit / data.illusion.revenue) * 100).toFixed(1)
        : '0';

    return (
        <div className="flex flex-col items-center justify-center h-full px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Yıllık Finansal Özet</h2>
                <p className="text-gray-500">Son 365 günde {data.illusion.salesCount} satış analiz edildi</p>
            </motion.div>

            <div className="w-full max-w-xl grid grid-cols-2 gap-4">
                {/* Revenue Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                >
                    <TrendingUp className="w-6 h-6 text-blue-600 mb-3" />
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">Toplam Ciro</p>
                    <p className="text-2xl md:text-3xl font-black text-gray-900">
                        {formatCurrency(data.illusion.revenue)}
                    </p>
                </motion.div>

                {/* Profit Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`rounded-2xl p-6 border ${data.illusion.realProfit >= 0
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100'
                        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'}`}
                >
                    {data.illusion.realProfit >= 0
                        ? <TrendingUp className="w-6 h-6 text-emerald-600 mb-3" />
                        : <TrendingDown className="w-6 h-6 text-red-600 mb-3" />}
                    <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${data.illusion.realProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        Net Kâr
                    </p>
                    <p className={`text-2xl md:text-3xl font-black ${data.illusion.realProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(data.illusion.realProfit)}
                    </p>
                </motion.div>

                {/* Profit Margin */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 col-span-2"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Kâr Marjı</p>
                            <p className={`text-3xl font-black ${Number(profitMargin) >= 10 ? 'text-emerald-600' : Number(profitMargin) >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                %{profitMargin}
                            </p>
                        </div>
                        <Percent className="w-10 h-10 text-gray-200" />
                    </div>
                </motion.div>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-center text-gray-600 max-w-md"
            >
                {data.illusion.gapMessage}
            </motion.p>
        </div>
    );
}

// --- Slide 2: Problem Product ---
function SlideProblemProduct({ data }: { data: DiagnosisReport }) {
    const formatCurrency = createFormatter(data.currency);
    if (!data.toxicChampion) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Dikkat Gerektiren Ürün</h2>
                <p className="text-gray-500">Yüksek satış, düşük karlılık</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-md bg-white rounded-3xl border-2 border-amber-200 shadow-xl shadow-amber-100/50 p-6"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{data.toxicChampion.productName}</h3>
                        <p className="text-sm text-gray-500">{data.toxicChampion.salesVolume} adet satıldı</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">Ciro</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(data.toxicChampion.grossRevenue)}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-xs text-red-600 font-medium mb-1">Net Zarar</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(data.toxicChampion.netLoss)}</p>
                    </div>
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center text-gray-500 text-sm max-w-sm"
            >
                Bu ürün çok satıyor ama her satışta zarar yaratıyor.
            </motion.p>
        </div>
    );
}

// --- Slide 3: Cost Breakdown ---
function SlideCostBreakdown({ data }: { data: DiagnosisReport }) {
    const formatCurrency = createFormatter(data.currency);
    if (!data.lossAnatomy) return null;

    const items = [
        { label: 'Satış Geliri', value: data.lossAnatomy.grossRevenue, positive: true, icon: DollarSign },
        { label: 'Ürün Maliyeti', value: -data.lossAnatomy.cogs, positive: false, icon: Package },
        { label: 'Reklam Gideri', value: -data.lossAnatomy.adSpend, positive: false, icon: TrendingUp },
        { label: 'İade Maliyeti', value: -data.lossAnatomy.refundCost, positive: false, icon: AlertTriangle },
        { label: 'Platform Komisyonu', value: -data.lossAnatomy.platformFees, positive: false, icon: Percent },
    ].filter(i => i.value !== 0);

    return (
        <div className="flex flex-col items-center justify-center h-full px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Maliyet Anatomisi</h2>
                <p className="text-gray-500">Paranız nereye gidiyor?</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
            >
                <div className="divide-y divide-gray-100">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-center justify-between p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.positive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <span className="text-gray-700 font-medium">{item.label}</span>
                            </div>
                            <span className={`font-bold ${item.positive ? 'text-emerald-600' : 'text-gray-900'}`}>
                                {item.positive ? '+' : ''}{formatCurrency(item.value)}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Total */}
                <div className={`p-4 ${data.lossAnatomy.netResult >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">Net Sonuç</span>
                        <span className={`text-xl font-black ${data.lossAnatomy.netResult >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(data.lossAnatomy.netResult)}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// --- Slide 4: Opportunity Cost ---
function SlideOpportunity({ data }: { data: DiagnosisReport }) {
    if (!data.opportunityCost) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Fırsat Maliyeti</h2>
                <p className="text-gray-500 mb-8">Kaçan potansiyel kâr</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white max-w-sm shadow-2xl shadow-blue-200"
            >
                <p className="text-blue-100 mb-2">Bu ürünü satmasaydınız</p>
                <p className="text-6xl font-black mb-2">%{data.opportunityCost.percentageGain}</p>
                <p className="text-blue-100">daha yüksek kâr elde edecektiniz</p>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-gray-500 text-sm max-w-sm"
            >
                Her satış otomatik kâr demek değil. Doğru ürün karmasını bulmak kritik.
            </motion.p>
        </div>
    );
}

// --- Slide 5: Cash Flow Projection ---
function SlideCashFlow({ data }: { data: DiagnosisReport }) {
    const formatCurrency = createFormatter(data.currency);
    const isHealthy = data.burnProjection.dailyBurnRate === 0 || data.burnProjection.daysUntilZero > 180;

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isHealthy ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    <Clock className={`w-8 h-8 ${isHealthy ? 'text-emerald-600' : 'text-amber-600'}`} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Nakit Akışı</h2>
                <p className="text-gray-500 mb-8">Finansal sürdürülebilirlik analizi</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm space-y-4"
            >
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">Günlük Nakit Değişimi</p>
                    <p className={`text-3xl font-black ${data.burnProjection.dailyBurnRate > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {data.burnProjection.dailyBurnRate > 0 ? '-' : '+'}{formatCurrency(data.burnProjection.dailyBurnRate)}
                    </p>
                </div>

                {data.burnProjection.dailyBurnRate > 0 && (
                    <div className={`rounded-2xl p-6 ${data.burnProjection.daysUntilZero < 90 ? 'bg-red-50 border-2 border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2">Tahmini Nakit Süresi</p>
                        <p className={`text-4xl font-black ${data.burnProjection.daysUntilZero < 90 ? 'text-red-600' : 'text-amber-600'}`}>
                            {data.burnProjection.daysUntilZero} Gün
                        </p>
                    </div>
                )}

                {isHealthy && (
                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                        <p className="text-emerald-700 font-medium">✓ Nakit akışınız sağlıklı görünüyor</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// --- Slide 6: CTA ---
function SlideCTA() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-200">
                    <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Analiziniz Hazır</h2>
                <p className="text-gray-500 max-w-sm mb-10">
                    Dashboard'unuzda detaylı raporlar, ürün bazlı analizler ve AI destekli öneriler sizi bekliyor.
                </p>
            </motion.div>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-5 px-12 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-3 text-lg"
            >
                Dashboard'a Git
                <ArrowRight className="w-5 h-5" />
            </motion.button>
        </div>
    );
}

// --- Main Page ---
export default function DiagnosisPage() {
    const router = useRouter();
    const [report, setReport] = useState<DiagnosisReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch('/api/onboarding/diagnosis');
                const data = await res.json();

                if (!data.hasEnoughData) {
                    router.replace('/dashboard');
                    return;
                }

                setReport(data);
            } catch (error) {
                console.error('Failed to fetch diagnosis:', error);
                router.replace('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [router]);

    const slides = report ? [
        <SlideOverview key="overview" data={report} />,
        report.toxicChampion && <SlideProblemProduct key="problem" data={report} />,
        report.lossAnatomy && <SlideCostBreakdown key="breakdown" data={report} />,
        report.opportunityCost && <SlideOpportunity key="opportunity" data={report} />,
        <SlideCashFlow key="cashflow" data={report} />,
        <SlideCTA key="cta" />
    ].filter(Boolean) : [];

    const goTo = useCallback((direction: 'next' | 'prev') => {
        if (direction === 'next' && currentSlide < slides.length - 1) {
            setCurrentSlide(c => c + 1);
        } else if (direction === 'prev' && currentSlide > 0) {
            setCurrentSlide(c => c - 1);
        }
    }, [currentSlide, slides.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') goTo('next');
            if (e.key === 'ArrowLeft') goTo('prev');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goTo]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Finansal Analiz Yapılıyor</h2>
                    <p className="text-gray-500">1 yıllık verileriniz işleniyor...</p>
                </div>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Prificient" width={32} height={32} className="rounded-lg" />
                        <span className="font-bold text-gray-900">Prificient</span>
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Slide Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-screen pt-20 pb-24"
                >
                    {slides[currentSlide]}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <button
                        onClick={() => goTo('prev')}
                        disabled={currentSlide === 0}
                        className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm text-gray-400 font-medium">
                        {currentSlide + 1} / {slides.length}
                    </span>

                    <button
                        onClick={() => goTo('next')}
                        disabled={currentSlide === slides.length - 1}
                        className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
