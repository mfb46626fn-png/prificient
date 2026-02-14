'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
    AlertTriangle, Target, ArrowRight, Loader2, Package,
    DollarSign, Percent, Clock, ShoppingBag, PieChart,
    BarChart3, Sparkles, CheckCircle2, XCircle, Zap
} from 'lucide-react';
import type { ComprehensiveAnalysis, ProductMetric, Recommendation } from '@/lib/onboarding/comprehensive-analysis';

// --- Currency Formatter ---
const createFormatter = (currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// ============================================
// SLIDE COMPONENTS
// ============================================

// --- Slide 1: Welcome ---
function SlideWelcome({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);
    const startDate = new Date(data.dateRange.start);
    const endDate = new Date(data.dateRange.end);

    return (
        <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"
            >
                <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-gray-900 mb-2"
            >
                Hoş Geldin, {data.storeName}!
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 mb-8"
            >
                {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')} arası
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-3 gap-4"
            >
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-900">{data.overview.totalOrders}</div>
                    <div className="text-sm text-gray-500">Sipariş</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-900">{data.overview.totalProducts}</div>
                    <div className="text-sm text-gray-500">Ürün</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-900">{data.overview.periodDays}</div>
                    <div className="text-sm text-gray-500">Gün</div>
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-500 mt-8 text-sm"
            >
                Tüm verilerin analiz edildi. Gerçekleri öğrenmeye hazır mısın?
            </motion.p>
        </div>
    );
}

// --- Slide 2: Big Picture ---
function SlideBigPicture({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Büyük Resim</h2>
            </div>

            <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                    {fmt.format(data.overview.totalRevenue)}
                </div>
                <div className="text-gray-500">Toplam Ciro</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">Siparişler</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{data.overview.totalOrders}</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-600 font-medium">Ortalama Sepet</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {fmt.format(data.overview.avgOrderValue)}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Ürün Sayısı</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{data.overview.totalProducts}</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-600 font-medium">Günlük Ciro</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {fmt.format(data.cashFlow.averageDailyRevenue)}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Slide 3: Real Profit ---
function SlideRealProfit({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);
    const isLoss = data.realProfit.netProfit < 0;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLoss ? 'bg-red-100' : 'bg-green-100'}`}>
                    {isLoss ? <TrendingDown className="w-5 h-5 text-red-600" /> : <TrendingUp className="w-5 h-5 text-green-600" />}
                </div>
                <h2 className="text-xl font-bold text-gray-900">Gerçek Kârınız</h2>
            </div>

            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Brüt Ciro</div>
                        <div className="text-2xl font-bold text-gray-900">{fmt.format(data.realProfit.grossRevenue)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Toplam Maliyet</div>
                        <div className="text-2xl font-bold text-red-500">-{fmt.format(data.realProfit.totalCosts)}</div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                        <div className="text-lg font-medium text-gray-700">Net Kâr</div>
                        <div className={`text-3xl font-bold ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                            {fmt.format(data.realProfit.netProfit)}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`rounded-xl p-4 ${isLoss ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${isLoss ? 'text-red-500' : 'text-green-500'}`} />
                    <div>
                        <div className={`font-medium ${isLoss ? 'text-red-800' : 'text-green-800'}`}>
                            Kâr Marjı: %{data.realProfit.profitMargin.toFixed(1)}
                        </div>
                        <div className={`text-sm ${isLoss ? 'text-red-600' : 'text-green-600'}`}>
                            {data.realProfit.gapMessage}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Slide 4: Hidden Costs ---
function SlideHiddenCosts({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);
    const costs = data.costBreakdown;
    const total = costs.total_costs || 1;

    const items = [
        { name: 'Ürün Maliyeti (COGS)', value: costs.cogs, color: 'bg-red-500', pct: (costs.cogs / total * 100) },
        { name: 'Vergiler (KDV)', value: costs.tax, color: 'bg-orange-500', pct: (costs.tax / total * 100) },
        { name: 'Platform Komisyonu', value: costs.platform_fees, color: 'bg-purple-500', pct: (costs.platform_fees / total * 100) },
        { name: 'Kargo Gideri', value: costs.shipping, color: 'bg-blue-500', pct: (costs.shipping / total * 100) },
        { name: 'İadeler', value: (costs as any).refunds || 0, color: 'bg-pink-500', pct: (((costs as any).refunds || 0) / total * 100) },
    ].filter(i => i.value > 0);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Gizli Maliyetler</h2>
            </div>

            <div className="text-center mb-6">
                <div className="text-4xl font-bold text-red-500 mb-1">
                    -{fmt.format(costs.total_costs)}
                </div>
                <div className="text-gray-500 text-sm">Toplam Maliyet</div>
            </div>

            <div className="space-y-3">
                {items.map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            <span className="font-bold text-gray-900">{fmt.format(item.value)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.pct}%` }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className={`h-full ${item.color} rounded-full`}
                            />
                        </div>
                        <div className="text-xs text-gray-400 mt-1 text-right">%{item.pct.toFixed(1)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Slide 5: Top Products ---
function SlideTopProducts({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">En Çok Satanlar</h2>
            </div>

            {data.topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Ürün verisi bulunamadı</div>
            ) : (
                <div className="space-y-3">
                    {data.topProducts.slice(0, 5).map((product, i) => (
                        <motion.div
                            key={product.variant_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-gray-50 rounded-xl p-4"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 line-clamp-1">{product.title}</div>
                                        <div className="text-xs text-gray-500">{product.quantity_sold} adet satıldı</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-sm text-gray-500">Ciro: </span>
                                    <span className="font-bold text-gray-900">{fmt.format(product.revenue)}</span>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${product.profit_margin >= 20 ? 'bg-green-100 text-green-700' : product.profit_margin >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    %{product.profit_margin.toFixed(0)} marj
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Slide 6: Danger Products ---
function SlideDangerProducts({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);

    if (data.dangerProducts.length === 0) {
        return (
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Tehlikeli Ürün Yok!</h2>
                </div>
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <p className="text-gray-600">Tüm ürünleriniz sağlıklı marjlarda görünüyor.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Dikkat: Tehlikeli Ürünler</h2>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-700">
                    Bu ürünler %10'un altında marjla satılıyor veya zarar ettiriyor.
                </p>
            </div>



            <div className="space-y-3">
                {data.dangerProducts.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                        {data.costBreakdown.cogs === 0 ? (
                            <>
                                <div className="text-amber-500 font-bold mb-2">Maliyet Bilgisi Eksik</div>
                                <p className="text-sm text-gray-600">
                                    Ürün maliyetlerinizi henüz girmediğiniz için kârlılık analizi tam yapılamıyor.
                                    Maliyetler girildiğinde burada zarar eden ürünleri görebileceksiniz.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-green-500 font-bold mb-2">Harika Haber!</div>
                                <p className="text-sm text-gray-600">
                                    Şu an için zarar eden veya çok düşük marjlı (%10 altı) ürününüz bulunmuyor.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    data.dangerProducts.slice(0, 5).map((product, i) => (
                        <motion.div
                            key={product.variant_id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white border border-red-100 rounded-xl p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 line-clamp-1">{product.title}</div>
                                        <div className="text-xs text-gray-500">{product.quantity_sold} adet</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${product.profit < 0 ? 'text-red-600' : 'text-orange-500'}`}>
                                        {product.profit < 0 ? '-' : ''}{fmt.format(Math.abs(product.profit))}
                                    </div>
                                    <div className="text-xs text-gray-400">%{product.profit_margin.toFixed(1)} marj</div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div >
    );
}

// --- Slide 7: Trends ---
function SlideTrends({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);
    const trends = data.monthlyTrends.slice(-6); // Last 6 months
    const maxRevenue = Math.max(...trends.map(t => t.revenue), 1);

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Trend Analizi</h2>
            </div>

            {trends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Yeterli trend verisi yok</div>
            ) : (
                <div className="space-y-4">
                    {trends.length >= 2 && (
                        <div className="bg-indigo-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-indigo-600 font-medium mb-1">Son Ay Performansı</div>
                                <div className="text-sm text-indigo-800">
                                    Geçen aya göre cironuz
                                    <span className="font-bold">
                                        {((trends[trends.length - 1].revenue - trends[trends.length - 2].revenue) / (trends[trends.length - 2].revenue || 1) * 100).toFixed(1)}%
                                    </span>
                                    {trends[trends.length - 1].revenue > trends[trends.length - 2].revenue ? ' arttı 📈' : ' azaldı 📉'}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-indigo-600">
                                {fmt.format(trends[trends.length - 1].revenue)}
                            </div>
                        </div>
                    )}
                    {trends.map((month, i) => {
                        const monthName = new Date(month.month + '-01').toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
                        const barWidth = (month.revenue / maxRevenue) * 100;

                        return (
                            <div key={month.month} className="flex items-center gap-3">
                                <div className="w-16 text-sm text-gray-500">{monthName}</div>
                                <div className="flex-1">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${barWidth}%` }}
                                        transition={{ delay: 0.1 * i }}
                                        className="h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-end pr-2"
                                    >
                                        <span className="text-xs text-white font-medium">{fmt.format(month.revenue)}</span>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// --- Slide 8: Cash Flow ---
function SlideCashFlow({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);
    const isNegative = data.cashFlow.dailyBurnRate > 0;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Nakit Akışı</h2>
            </div>

            {isNegative ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-50 rounded-xl p-4">
                        <div className="text-sm text-gray-500 mb-1">Günlük Nakit Yakma</div>
                        <div className="text-xl font-bold text-red-600">{fmt.format(data.cashFlow.dailyBurnRate)}</div>
                        <div className="text-xs text-red-400 mt-1">Zarar ediyoruz</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                        <div className="text-sm text-gray-500 mb-1">Tahmini Ömür</div>
                        <div className="text-xl font-bold text-blue-600">{data.cashFlow.daysUntilZero > 900 ? '900+ Gün' : `${data.cashFlow.daysUntilZero} Gün`}</div>
                        <div className="text-xs text-blue-400 mt-1">Mevcut nakit ile</div>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 rounded-xl p-6 mb-6 text-center">
                    <div className="block mb-2 text-4xl">🚀</div>
                    <div className="text-xl font-bold text-green-700">Nakit Akışınız Pozitif</div>
                    <p className="text-sm text-green-600 mt-1">Her gün kâr ediyorsunuz, bu harika!</p>
                </div>
            )}


        </div>
    );
}

// --- Slide 9: Opportunity ---
function SlideOpportunity({ data }: { data: ComprehensiveAnalysis }) {
    const fmt = createFormatter(data.currency);

    if (!data.opportunityCost.worstProduct) {
        return (
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Fırsat Potansiyeli</h2>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-600">Önemli bir fırsat maliyeti tespit edilmedi.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Fırsat Maliyeti</h2>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 text-center mb-6">
                <div className="text-sm text-amber-700 mb-2">Kaybedilen Potansiyel Kâr</div>
                <div className="text-4xl font-bold text-amber-600 mb-2">
                    {fmt.format(data.opportunityCost.lostProfit)}
                </div>
                <div className="text-sm text-amber-600">
                    Zarar eden ürünleri optimize ederek kazanabilirdiniz
                </div>
            </div>

            {data.opportunityCost.worstProduct && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-sm text-red-600 font-medium mb-1">En Büyük Sorun</div>
                    <div className="font-bold text-gray-900">{data.opportunityCost.worstProduct.title}</div>
                    <div className="text-sm text-red-600">
                        Bu ürün {fmt.format(Math.abs(data.opportunityCost.worstProduct.profit))} zarar ettirdi
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Slide 10: Action Plan ---
function SlideActionPlan({ data }: { data: ComprehensiveAnalysis }) {
    const typeIcons: Record<string, any> = {
        warning: AlertTriangle,
        opportunity: Zap,
        action: Target
    };

    const typeColors: Record<string, string> = {
        warning: 'bg-red-100 text-red-600',
        opportunity: 'bg-amber-100 text-amber-600',
        action: 'bg-blue-100 text-blue-600'
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Aksiyon Planı</h2>
            </div>

            <div className="space-y-4">
                {data.recommendations.map((rec, i) => {
                    const Icon = typeIcons[rec.type] || Target;
                    const colorClass = typeColors[rec.type] || 'bg-gray-100 text-gray-600';

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 * i }}
                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{rec.title}</div>
                                    <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                                    <div className="text-xs text-blue-600 mt-2 font-medium">{rec.impact}</div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Slide 11: CTA ---
function SlideCTA({ onComplete }: { onComplete: () => void }) {
    return (
        <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
            >
                <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Analiz Tamamlandı!
            </h2>

            <p className="text-gray-600 mb-8">
                Artık tüm gerçekleri biliyorsunuz. Dashboard'da detaylı raporlara erişebilir,<br />
                kararlarınızı veriye dayalı alabilirsiniz.
            </p>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
                Dashboard'a Git
                <ArrowRight className="w-5 h-5" />
            </motion.button>
        </div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function UnifiedAnalysisPage() {
    const router = useRouter();
    const isRunning = useRef(false);

    const [phase, setPhase] = useState<'syncing' | 'analyzing' | 'presenting'>('syncing');
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncStats, setSyncStats] = useState({ processed: 0, total: 0 });
    const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Start sync on mount
    useEffect(() => {
        if (isRunning.current) return;
        isRunning.current = true;
        runSyncAndAnalysis();
    }, []);

    const runSyncAndAnalysis = async () => {
        try {
            // Phase 1: Initialize sync
            const initRes = await fetch('/api/sync/init', { method: 'POST' });
            if (!initRes.ok) {
                const err = await initRes.json();
                throw new Error(err.error || 'Sync başlatılamadı');
            }

            const initData = await initRes.json();
            const total = initData.totalOrders || 0;
            setSyncStats({ processed: 0, total });

            // Phase 2: Batch sync
            let cursor = null;
            let processed = 0;

            while (true) {
                const batchRes: Response = await fetch('/api/sync/batch', {
                    method: 'POST',
                    body: JSON.stringify({ cursor }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!batchRes.ok) {
                    const err = await batchRes.json();
                    throw new Error(err.error || 'Batch sync hatası');
                }

                const batchData: { processed?: number; next_cursor?: string } = await batchRes.json();
                processed += batchData.processed || 0;
                cursor = batchData.next_cursor;

                setSyncStats({ processed, total });
                setSyncProgress(total > 0 ? Math.round((processed / total) * 100) : 0);

                if (!cursor) break;
            }

            // Phase 3: Analysis
            setPhase('analyzing');

            const analysisRes = await fetch('/api/onboarding/analysis');
            if (!analysisRes.ok) {
                const err = await analysisRes.json();
                throw new Error(err.error || 'Analiz hatası');
            }

            const analysisData = await analysisRes.json();
            setAnalysis(analysisData);
            setPhase('presenting');

        } catch (err: any) {
            console.error('Sync/Analysis error:', err);
            setError(err.message);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        if (phase !== 'presenting') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, currentSlide]);

    const totalSlides = 11;
    const nextSlide = () => setCurrentSlide(s => Math.min(s + 1, totalSlides - 1));
    const prevSlide = () => setCurrentSlide(s => Math.max(s - 1, 0));

    const handleComplete = () => {
        router.refresh();
        router.push('/dashboard');
    };

    // Render slides
    const renderSlide = () => {
        if (!analysis) return null;

        switch (currentSlide) {
            case 0: return <SlideWelcome data={analysis} />;
            case 1: return <SlideBigPicture data={analysis} />;
            case 2: return <SlideRealProfit data={analysis} />;
            case 3: return <SlideHiddenCosts data={analysis} />;
            case 4: return <SlideTopProducts data={analysis} />;
            case 5: return <SlideDangerProducts data={analysis} />;
            case 6: return <SlideTrends data={analysis} />;
            case 7: return <SlideCashFlow data={analysis} />;
            case 8: return <SlideOpportunity data={analysis} />;
            case 9: return <SlideActionPlan data={analysis} />;
            case 10: return <SlideCTA onComplete={handleComplete} />;
            default: return null;
        }
    };

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    // Syncing/Analyzing phase
    if (phase !== 'presenting') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="text-center">
                    {/* Animated Logo */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 mx-auto mb-8 flex items-center justify-center"
                    >
                        <Image src="/logo.png" alt="Prificient" width={128} height={128} className="object-contain" priority />
                    </motion.div>

                    {/* Progress Ring */}
                    <div className="relative w-40 h-40 mx-auto mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                            <motion.circle
                                cx="80" cy="80" r="70"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: syncProgress / 100 }}
                                transition={{ duration: 0.5 }}
                                style={{ strokeDasharray: 440, strokeDashoffset: 0 }}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900">{syncProgress}%</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {phase === 'syncing' ? 'Veriler Aktarılıyor...' : 'Analiz Yapılıyor...'}
                    </h2>
                    <p className="text-gray-500">
                        {phase === 'syncing'
                            ? `${syncStats.processed} / ${syncStats.total} sipariş işlendi`
                            : 'Kapsamlı rapor hazırlanıyor...'}
                    </p>
                </div>
            </div>
        );
    }

    // Presenting phase
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <Image src="/logo.svg" alt="Prificient" width={120} height={32} />
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalSlides }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-blue-500 w-4' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 pb-24 px-4 min-h-screen flex items-center justify-center">
                <div className="w-full max-w-lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl shadow-xl p-6"
                        >
                            {renderSlide()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Navigation */}
            {currentSlide < totalSlides - 1 && (
                <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 py-4">
                    <div className="max-w-lg mx-auto px-4 flex justify-between items-center">
                        <button
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${currentSlide === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Geri
                        </button>

                        <span className="text-sm text-gray-400">{currentSlide + 1} / {totalSlides}</span>

                        <button
                            onClick={nextSlide}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                        >
                            İleri
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}
