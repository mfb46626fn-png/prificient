'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle, TrendingDown, Skull, Target, ArrowRight, Loader2 } from 'lucide-react';
import type { DiagnosisReport } from '@/lib/onboarding/diagnosis';

// --- Slide Components ---

function SlideRealityCheck({ data }: { data: DiagnosisReport }) {
    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
            >
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Gerçeklik Kontrolü</h2>
                <p className="text-gray-400 text-sm">Son 30 günde {data.illusion.salesCount} satış yaptınız.</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center w-full max-w-2xl">
                {/* Revenue */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 0.5, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">Ciro</p>
                    <p className="text-4xl md:text-5xl font-bold text-gray-500">
                        {formatCurrency(data.illusion.revenue)}
                    </p>
                </motion.div>

                {/* Divider */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-4xl text-gray-600"
                >
                    →
                </motion.div>

                {/* Real Profit */}
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                    className="text-center"
                >
                    <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">Gerçek Kâr</p>
                    <p className={`text-5xl md:text-6xl font-black ${data.illusion.realProfit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatCurrency(data.illusion.realProfit)}
                    </p>
                </motion.div>
            </div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="mt-12 text-lg md:text-xl text-gray-300 max-w-md"
            >
                {data.illusion.gapMessage}
            </motion.p>
        </div>
    );
}

function SlideTraitor({ data }: { data: DiagnosisReport }) {
    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

    if (!data.toxicChampion) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 150 }}
            >
                <Skull className="w-20 h-20 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Haini Tanı</h2>
                <p className="text-gray-400 text-sm mb-8">En çok satan ürününüz = En büyük düşmanınız</p>
            </motion.div>

            {/* Toxic Product Card */}
            <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="bg-gradient-to-br from-red-950/50 to-gray-900 border border-red-800/50 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-red-900/20"
            >
                <div className="w-16 h-16 bg-red-900/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <TrendingDown className="w-8 h-8 text-red-500" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1 truncate">
                    {data.toxicChampion.productName}
                </h3>
                <p className="text-gray-500 text-sm mb-6">{data.toxicChampion.salesVolume} adet satıldı</p>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                    className="bg-red-950/70 rounded-xl p-4"
                >
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Net Zarar</p>
                    <p className="text-4xl font-black text-red-500">
                        {formatCurrency(data.toxicChampion.netLoss)}
                    </p>
                </motion.div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-8 text-sm text-gray-500 max-w-xs"
            >
                Shopify size bu ürünün "Best Seller" olduğunu söylüyor.<br />
                <span className="text-red-400">Prificient ise "Nakit Yakıcı" olduğunu söylüyor.</span>
            </motion.p>
        </div>
    );
}

function SlideBreakdown({ data }: { data: DiagnosisReport }) {
    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

    if (!data.lossAnatomy) return null;

    const items = [
        { label: 'Satış Geliri', value: data.lossAnatomy.grossRevenue, positive: true },
        { label: 'Ürün Maliyeti (COGS)', value: -data.lossAnatomy.cogs, positive: false },
        { label: 'Reklam Gideri (Meta)', value: -data.lossAnatomy.adSpend, positive: false },
        { label: 'İade Maliyeti', value: -data.lossAnatomy.refundCost, positive: false },
        { label: 'Platform Komisyonları', value: -data.lossAnatomy.platformFees, positive: false },
        { label: 'Kargo Farkı', value: -data.lossAnatomy.shippingGap, positive: false },
    ].filter(i => i.value !== 0);

    return (
        <div className="flex flex-col items-center justify-center h-full px-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-8"
            >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Zararın Otopsisi</h2>
                <p className="text-gray-400 text-sm">{data.toxicChampion?.productName}</p>
            </motion.div>

            {/* Receipt */}
            <div className="bg-[#f5f5f0] rounded-lg p-6 max-w-sm w-full font-mono text-sm text-gray-800 shadow-2xl">
                {/* Zigzag Top */}
                <div className="h-4 -mt-6 -mx-6 bg-[#111] mb-4" style={{
                    clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'
                }} />

                <div className="text-center mb-4 pb-2 border-b border-dashed border-gray-400">
                    <p className="font-bold text-xs tracking-widest">FİNANSAL OTOPSİ RAPORU</p>
                </div>

                <div className="space-y-2">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.2 }}
                            className="flex justify-between items-center"
                        >
                            <span className="text-gray-600">{item.label}</span>
                            <span className={item.positive ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
                                {item.positive ? '+' : ''}{formatCurrency(item.value)}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + items.length * 0.2 }}
                    className="border-t-2 border-double border-gray-800 mt-4 pt-4"
                >
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">TOPLAM</span>
                        <span className={`font-black text-xl ${data.lossAnatomy.netResult < 0 ? 'text-red-600' : 'text-green-700'}`}>
                            {formatCurrency(data.lossAnatomy.netResult)}
                        </span>
                    </div>
                </motion.div>

                {/* Zigzag Bottom */}
                <div className="h-4 -mb-6 -mx-6 mt-4 bg-[#111]" style={{
                    clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
                }} />
            </div>
        </div>
    );
}

function SlideOpportunityCost({ data }: { data: DiagnosisReport }) {
    if (!data.opportunityCost) return null;

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Target className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Fırsat Maliyeti</h2>
                <p className="text-gray-400 text-sm mb-8">Boşuna harcanan emek</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="max-w-md"
            >
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                    Eğer bu <span className="text-red-400 font-bold">&quot;Çok Satan&quot;</span> ürünü hiç satmasaydınız,
                </p>
                <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring', stiffness: 150 }}
                    className="text-5xl md:text-7xl font-black text-amber-400 my-6"
                >
                    %{data.opportunityCost.percentageGain}
                </motion.p>
                <p className="text-xl md:text-2xl text-gray-300">
                    daha yüksek kâr elde edecektiniz.
                </p>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="mt-12 text-gray-500 text-sm max-w-xs"
            >
                Zarar etmek kötüdür. Ama &quot;boşu boşuna çalışmış olmak&quot; daha acı verir.
            </motion.p>
        </div>
    );
}

function SlideCliff({ data }: { data: DiagnosisReport }) {
    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <span className="text-4xl">⚠️</span>
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Uçuruma Koşuyorsunuz</h2>
            </motion.div>

            {data.burnProjection.dailyBurnRate > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-red-950/30 border border-red-800/30 rounded-2xl p-8 max-w-sm w-full mt-8"
                >
                    <p className="text-gray-400 text-sm mb-2">Tahmini Nakit Açığı</p>
                    <p className="text-5xl font-black text-red-500">{data.burnProjection.daysUntilZero} gün</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Günlük kayıp: ₺{data.burnProjection.dailyBurnRate.toLocaleString('tr-TR')}
                    </p>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-10 max-w-md"
            >
                <p className="text-lg text-gray-300 mb-6">
                    Bu kaderiniz değil. Sadece <span className="text-green-400 font-bold">3 küçük karar</span> ile bu tabloyu pozitife çevirebilirsiniz.
                </p>

                {/* Blurred Solutions Teaser */}
                <div className="bg-gray-800/50 rounded-xl p-4 blur-sm select-none">
                    <p className="text-gray-400 text-sm">1. Fiyat optimizasyonu</p>
                    <p className="text-gray-400 text-sm">2. Reklam bütçesi revizyonu</p>
                    <p className="text-gray-400 text-sm">3. İade politikası güncellemesi</p>
                </div>
                <p className="text-gray-600 text-xs mt-2">Detaylar Dashboard&apos;da</p>
            </motion.div>
        </div>
    );
}

function SlideCTA() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
                    <span className="text-5xl">🚀</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Kontrolü Geri Alın</h2>
                <p className="text-gray-400 max-w-md mb-10">
                    Artık problemi biliyorsunuz. Şimdi çözümü inşa etme zamanı.
                </p>
            </motion.div>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-3"
            >
                Karar Masasına Git
                <ArrowRight className="w-5 h-5" />
            </motion.button>
        </div>
    );
}

// --- Loading Screen ---
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="mb-6"
            >
                <div className="w-20 h-20 border-4 border-gray-800 border-t-cyan-500 rounded-full" />
            </motion.div>
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-cyan-400 text-lg font-medium"
            >
                Finansal Röntgen Çekiliyor...
            </motion.p>
            <p className="text-gray-600 text-sm mt-2">Verileriniz analiz ediliyor</p>
        </div>
    );
}

// --- Main Page ---
export default function DiagnosisPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<DiagnosisReport | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Fetch diagnosis report
    useEffect(() => {
        async function fetchReport() {
            try {
                const res = await fetch('/api/onboarding/diagnosis');
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Diagnosis fetch failed');
                }

                if (!data.hasEnoughData) {
                    // Not enough data, skip to dashboard
                    router.push('/dashboard');
                    return;
                }

                setReport(data);
            } catch (err: any) {
                console.error('Diagnosis error:', err);
                setError(err.message);
                // On error, redirect to dashboard after delay
                setTimeout(() => router.push('/dashboard'), 2000);
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, [router]);

    // Build slides array
    const slides = report ? [
        <SlideRealityCheck key="reality" data={report} />,
        report.toxicChampion && <SlideTraitor key="traitor" data={report} />,
        report.lossAnatomy && <SlideBreakdown key="breakdown" data={report} />,
        report.opportunityCost && <SlideOpportunityCost key="opportunity" data={report} />,
        <SlideCliff key="cliff" data={report} />,
        <SlideCTA key="cta" />,
    ].filter(Boolean) : [];

    const totalSlides = slides.length;

    const goNext = useCallback(() => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    }, [currentSlide, totalSlides]);

    const goPrev = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    }, [currentSlide]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goNext, goPrev]);

    // Touch swipe
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (diff > 50) goNext();
        if (diff < -50) goPrev();
        setTouchStart(null);
    };

    if (loading) return <LoadingScreen />;

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                <p className="text-white text-lg mb-2">Bir sorun oluştu</p>
                <p className="text-gray-500 text-sm">{error}</p>
                <p className="text-gray-600 text-xs mt-4">Dashboard&apos;a yönlendiriliyorsunuz...</p>
            </div>
        );
    }

    if (!report) return null;

    return (
        <div
            className="min-h-screen bg-[#0a0a0a] relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent pointer-events-none" />

            {/* Slide Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-screen flex items-center justify-center"
                >
                    {slides[currentSlide]}
                </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentSlide
                                ? 'bg-white w-6'
                                : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                    />
                ))}
            </div>

            {/* Navigation Arrows */}
            {currentSlide > 0 && (
                <button
                    onClick={goPrev}
                    className="fixed left-4 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-white transition-colors z-50"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            {currentSlide < totalSlides - 1 && (
                <button
                    onClick={goNext}
                    className="fixed right-4 top-1/2 -translate-y-1/2 p-3 text-gray-500 hover:text-white transition-colors z-50"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}

            {/* Next Button (Mobile Friendly) */}
            {currentSlide < totalSlides - 1 && (
                <button
                    onClick={goNext}
                    className="fixed bottom-20 right-6 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-colors z-50 text-sm"
                >
                    Sonraki Gerçek
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
