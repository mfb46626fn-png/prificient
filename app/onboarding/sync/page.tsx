'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal } from 'lucide-react';

interface InitResponse {
    success: boolean;
    totalOrders: number;
    status: string;
}

interface BatchResponse {
    processed: number;
    next_cursor: string | null;
}

export default function SyncPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'optimizing' | 'syncing' | 'finishing' | 'completed' | 'failed_auth'>('optimizing');
    const [logs, setLogs] = useState<string[]>(['Sistem başlatılıyor...']);
    const [stats, setStats] = useState({ processed: 0, total: 0, revenue: 0, currency: 'TRY' });
    const [topProducts, setTopProducts] = useState<Record<string, number>>({});
    const isRunning = useRef(false);

    const addLog = (msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 100));
    };

    useEffect(() => {
        if (isRunning.current) return;
        isRunning.current = true;
        startSyncEngine();
    }, []);

    const startSyncEngine = async () => {
        try {
            // Step 1: Init & Reset
            addLog('Veritabanı temizleniyor ve bağlantı kontrol ediliyor...');

            // Call Init
            const initRes = await fetch('/api/sync/init', { method: 'POST' });
            if (!initRes.ok) {
                const errData = await initRes.json();
                throw new Error(errData.error || 'Başlatma hatası');
            }

            const initData: InitResponse = await initRes.json();
            const total = initData.totalOrders || 0;
            setStats(prev => ({ ...prev, total }));
            setStatus('syncing');
            addLog(`Geçmiş ${total} sipariş tespit edildi (2023'ten bugüne).`);

            // Step 2: Batch Loop
            let cursor = null;
            let processedCount = 0;
            let totalRevenue = 0;
            let currentCurrency = 'TRY';
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

                        // SHOW LOGS EVEN ON ERROR
                        if (errorData.debug_logs && Array.isArray(errorData.debug_logs)) {
                            errorData.debug_logs.forEach((l: string) => addLog(`[ERR-SRV] ${l}`));
                        }
                    } catch (e) {
                        // Fallback to text if JSON fails
                        const text = await batchRes.text();
                        if (text) errorMessage = text;
                    }
                    throw new Error(errorMessage);
                }

                const batchData = await batchRes.json();

                // Update Logic
                processedCount += batchData.processed || 0;
                cursor = batchData.next_cursor;

                // Stats
                if (batchData.stats) {
                    totalRevenue += batchData.stats.revenue || 0;
                    currentCurrency = batchData.stats.currency || currentCurrency;

                    // Merge products
                    Object.entries(batchData.stats.products || {}).forEach(([name, count]) => {
                        productMap[name] = (productMap[name] || 0) + (count as number);
                    });
                }

                // Update UI State
                const safeTotal = total > 0 ? total : 1;
                const percent = Math.min(Math.round((processedCount / safeTotal) * 100), 99);

                setProgress(percent);
                setStats({
                    processed: processedCount,
                    total,
                    revenue: totalRevenue,
                    currency: currentCurrency
                });

                // Keep top 5 products for display
                const sortedProducts = Object.entries(productMap)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
                setTopProducts(sortedProducts);

                addLog(`Paket: ${batchData.processed} sipariş (${(batchData.stats?.revenue || 0).toLocaleString()} ${currentCurrency}).`);

                // CRITICAL DEBUG: Show server logs in UI
                if (batchData.debug_logs && Array.isArray(batchData.debug_logs)) {
                    batchData.debug_logs.forEach((l: string) => addLog(`[SRV] ${l}`));
                }

                if (!cursor || (total > 0 && processedCount >= total)) {
                    hasMore = false;
                }
            }

            // Step 3: Verification (Pause)
            setStatus('finishing');
            addLog('Veri doğrulama bekleniyor...');

        } catch (error: any) {
            console.error(error);
            const msg = error.message || 'Bir sorun oluştu';
            addLog(`HATA: ${msg}`);
            if (msg.includes('Integration record') || msg.includes('not connected')) {
                setStatus('failed_auth');
            }
        }
    };

    const handleComplete = async () => {
        try {
            await fetch('/api/sync/complete', { method: 'POST' });
            setProgress(100);
            setStatus('completed');
            // Redirect to diagnosis page to show financial insights before dashboard
            setTimeout(() => router.replace('/onboarding/diagnosis'), 1500);
        } catch (e) {
            addLog('Tamamlama hatası, tekrar deneyin.');
        }
    };

    const formatMoney = (amount: number, currency: string) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-8">

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Prificient Finansal Senkronizasyon
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        {status === 'finishing' ? 'Lütfen verilerinizi doğrulayın.' : 'Verileriniz işleniyor, lütfen bekleyin.'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">

                    {/* Status: Syncing */}
                    {status !== 'finishing' && status !== 'completed' && status !== 'failed_auth' && (
                        <div className="space-y-8">
                            <div className="relative flex items-center justify-center py-4">
                                <div className="w-32 h-32 rounded-full border-4 border-zinc-800 absolute"></div>
                                <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8"
                                        className="text-purple-600 transition-all duration-500 ease-out"
                                        strokeDasharray={`${progress * 2.89} 289`} strokeLinecap="round" />
                                </svg>
                                <div className="absolute font-mono text-2xl font-bold">{progress}%</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-4 bg-zinc-950 rounded-xl">
                                    <div className="text-zinc-500 text-xs uppercase">Toplam Ciro</div>
                                    <div className="text-xl font-bold text-green-400">{formatMoney(stats.revenue, stats.currency)}</div>
                                </div>
                                <div className="p-4 bg-zinc-950 rounded-xl">
                                    <div className="text-zinc-500 text-xs uppercase">İşlenen Sipariş</div>
                                    <div className="text-xl font-bold text-white">{stats.processed} / {stats.total}</div>
                                </div>
                            </div>

                            <div className="bg-black/80 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto border border-zinc-800">
                                <div className="space-y-1">
                                    {logs.map((log, i) => (
                                        <div key={i} className={`break-all ${log.includes('[ERR') ? 'text-red-400 font-bold' : log.includes('[SRV]') ? 'text-blue-300' : 'text-zinc-500'}`}>
                                            <span className="opacity-50 mr-2">{'>'}</span> {log}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status: Finishing (Verification) */}
                    {status === 'finishing' && (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Terminal size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Senkronizasyon Tamamlandı</h2>
                                <p className="text-zinc-400 text-sm mt-2">Aşağıdaki veriler sisteminize aktarıldı.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                                    <div className="text-zinc-500 text-xs">Toplam Ciro</div>
                                    <div className="text-lg font-bold text-green-400">{formatMoney(stats.revenue, stats.currency)}</div>
                                </div>
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                                    <div className="text-zinc-500 text-xs">Sipariş Sayısı</div>
                                    <div className="text-lg font-bold text-white">{stats.processed}</div>
                                </div>
                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                                    <div className="text-zinc-500 text-xs">Tarih Aralığı</div>
                                    <div className="text-lg font-bold text-blue-400">2023 - Bugün</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">En Çok Satanlar</h3>
                                <div className="space-y-1">
                                    {Object.entries(topProducts).map(([name, count], i) => (
                                        <div key={i} className="flex justify-between text-sm py-2 border-b border-zinc-800 last:border-0">
                                            <span className="text-zinc-300 truncate pr-4">{name}</span>
                                            <span className="font-mono text-zinc-500">{count} adet</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleComplete}
                                className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
                            >
                                Onayla ve Dashboard'a Git
                            </button>
                        </div>
                    )}

                    {/* Status: Failed */}
                    {status === 'failed_auth' && (
                        <div className="text-center space-y-4">
                            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl">
                                <p className="font-bold">Bağlantı Hatası</p>
                                <p className="text-sm">Shopify bağlantısı doğrulanamadı.</p>
                            </div>
                            <button onClick={() => router.push('/connect/shopify')} className="w-full bg-zinc-800 py-3 rounded-xl">
                                Tekrar Bağla
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
