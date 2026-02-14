'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Loader2, AlertTriangle, ArrowRight, ShoppingBag, TrendingUp, Package } from 'lucide-react';

interface InitResponse {
    success: boolean;
    totalOrders: number;
    status: string;
}

export default function SyncPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'initializing' | 'syncing' | 'finishing' | 'completed' | 'failed_auth'>('initializing');
    const [logs, setLogs] = useState<string[]>(['Sistem başlatılıyor...']);
    const [stats, setStats] = useState({ processed: 0, total: 0, revenue: 0, currency: 'USD' });
    const [topProducts, setTopProducts] = useState<Record<string, number>>({});
    const isRunning = useRef(false);

    const addLog = (msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 50));
    };

    useEffect(() => {
        if (isRunning.current) return;
        isRunning.current = true;
        startSyncEngine();
    }, []);

    const startSyncEngine = async () => {
        try {
            addLog('Shopify bağlantısı kontrol ediliyor...');

            const initRes = await fetch('/api/sync/init', { method: 'POST' });
            if (!initRes.ok) {
                const errData = await initRes.json();
                throw new Error(errData.error || 'Başlatma hatası');
            }

            const initData: InitResponse = await initRes.json();
            const total = initData.totalOrders || 0;
            setStats(prev => ({ ...prev, total }));
            setStatus('syncing');
            addLog(`Son 1 yıldaki ${total} sipariş tespit edildi.`);

            let cursor = null;
            let processedCount = 0;
            let totalRevenue = 0;
            let currentCurrency = 'USD';
            let productMap: Record<string, number> = {};
            let hasMore = true;

            while (hasMore) {
                const batchRes: Response = await fetch('/api/sync/batch', {
                    method: 'POST',
                    body: JSON.stringify({ cursor }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!batchRes.ok) {
                    let errorMessage = 'Veri paketi hatası';
                    try {
                        const errorData = await batchRes.json();
                        if (errorData.error) errorMessage = errorData.error;
                    } catch (e) {
                        const text = await batchRes.text();
                        if (text) errorMessage = text;
                    }
                    throw new Error(errorMessage);
                }

                const batchData: any = await batchRes.json();

                processedCount += batchData.processed || 0;
                cursor = batchData.next_cursor;

                if (batchData.stats) {
                    totalRevenue += batchData.stats.revenue || 0;
                    currentCurrency = batchData.stats.currency || currentCurrency;

                    Object.entries(batchData.stats.products || {}).forEach(([name, count]) => {
                        productMap[name] = (productMap[name] || 0) + (count as number);
                    });
                }

                const calcProgress = total > 0 ? Math.floor((processedCount / total) * 100) : 0;
                setProgress(Math.min(calcProgress, 99));

                setStats({
                    processed: processedCount,
                    total,
                    revenue: totalRevenue,
                    currency: currentCurrency
                });

                const sortedProducts = Object.entries(productMap)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
                setTopProducts(sortedProducts);

                addLog(`${batchData.processed} sipariş işlendi...`);

                if (!cursor || (total > 0 && processedCount >= total)) {
                    hasMore = false;
                }
            }

            setStatus('finishing');
            setProgress(100);
            addLog('Senkronizasyon tamamlandı!');

        } catch (error: any) {
            console.error(error);
            const msg = error.message || 'Bir sorun oluştu';
            addLog(`HATA: ${msg}`);
            if (msg.includes('Integration') || msg.includes('not connected')) {
                setStatus('failed_auth');
            }
        }
    };

    const handleComplete = async () => {
        try {
            await fetch('/api/sync/complete', { method: 'POST' });
            setStatus('completed');
            setTimeout(() => router.replace('/onboarding/diagnosis'), 1000);
        } catch (e) {
            addLog('Tamamlama hatası, tekrar deneyin.');
        }
    };

    const formatMoney = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <div className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
                    <Image src="/logo.png" alt="Prificient" width={32} height={32} className="rounded-lg" />
                    <span className="font-bold text-gray-900 text-lg">Prificient</span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Title */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">
                        {status === 'finishing' || status === 'completed'
                            ? 'Verileriniz Hazır!'
                            : 'Verileriniz Yükleniyor'}
                    </h1>
                    <p className="text-gray-500">
                        {status === 'finishing' || status === 'completed'
                            ? 'Son 1 yıllık mağaza verileriniz analiz edildi.'
                            : 'Shopify mağazanızdan son 1 yıllık veriler çekiliyor.'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-blue-900/5 overflow-hidden">

                    {/* Progress Section */}
                    {(status === 'initializing' || status === 'syncing') && (
                        <div className="p-8 space-y-8">
                            {/* Circular Progress */}
                            <div className="relative flex items-center justify-center py-6">
                                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 absolute" />
                                <svg className="w-40 h-40 -rotate-90 transform relative" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                                    <circle
                                        cx="50" cy="50" r="42"
                                        fill="none"
                                        stroke="url(#blueGradient)"
                                        strokeWidth="6"
                                        strokeDasharray={`${progress * 2.64} 264`}
                                        strokeLinecap="round"
                                        className="transition-all duration-500 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute text-center">
                                    <div className="text-4xl font-black text-gray-900">{progress}%</div>
                                    <div className="text-xs text-gray-400 font-medium">Tamamlandı</div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100">
                                    <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
                                    <div className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Toplam Ciro</div>
                                    <div className="text-2xl font-black text-gray-900">{formatMoney(stats.revenue, stats.currency)}</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                                    <Package className="w-5 h-5 text-blue-600 mb-2" />
                                    <div className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">Siparişler</div>
                                    <div className="text-2xl font-black text-gray-900">{stats.processed} / {stats.total}</div>
                                </div>
                            </div>

                            {/* Activity Log */}
                            <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto">
                                <div className="space-y-1 font-mono text-xs">
                                    {logs.slice(0, 10).map((log, i) => (
                                        <div key={i} className={`flex items-start gap-2 ${i === 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                                            {i === 0 && <Loader2 className="w-3 h-3 mt-0.5 animate-spin" />}
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Finishing State */}
                    {(status === 'finishing' || status === 'completed') && (
                        <div className="p-8 space-y-6">
                            {/* Success Icon */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Toplam Ciro</div>
                                    <div className="text-lg font-black text-gray-900">{formatMoney(stats.revenue, stats.currency)}</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Siparişler</div>
                                    <div className="text-lg font-black text-gray-900">{stats.processed}</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-xs text-gray-500 font-medium mb-1">Dönem</div>
                                    <div className="text-lg font-black text-blue-600">1 Yıl</div>
                                </div>
                            </div>

                            {/* Top Products */}
                            {Object.keys(topProducts).length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">En Çok Satanlar</h3>
                                    <div className="space-y-2">
                                        {Object.entries(topProducts).map(([name, count], i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                <span className="text-sm text-gray-700 truncate pr-4 flex items-center gap-2">
                                                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                                    {name}
                                                </span>
                                                <span className="text-sm font-bold text-gray-500">{count} adet</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <button
                                onClick={handleComplete}
                                disabled={status === 'completed'}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {status === 'completed' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Yönlendiriliyor...
                                    </>
                                ) : (
                                    <>
                                        Finansal Analize Devam Et
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'failed_auth' && (
                        <div className="p-8 text-center space-y-6">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Bağlantı Hatası</h2>
                                <p className="text-gray-500 text-sm">Shopify bağlantısı doğrulanamadı. Lütfen tekrar deneyin.</p>
                            </div>
                            <button
                                onClick={() => router.push('/connect/shopify')}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                Tekrar Bağla
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-8">
                    Verileriniz güvenli bir şekilde işleniyor ve yalnızca analiz için kullanılıyor.
                </p>
            </div>
        </div>
    );
}
