'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

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
    const [status, setStatus] = useState<'optimizing' | 'syncing' | 'finishing' | 'completed'>('optimizing');
    const [logs, setLogs] = useState<string[]>(['Sistem başlatılıyor...']);
    const [stats, setStats] = useState({ processed: 0, total: 0 });
    const isRunning = useRef(false);

    const addLog = (msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 8)); // Keep last 8 logs
    };

    useEffect(() => {
        if (isRunning.current) return;
        isRunning.current = true;
        startSyncEngine();
    }, []);

    const startSyncEngine = async () => {
        try {
            // Step 1: Init
            addLog('Shopify bağlantısı kontrol ediliyor...');
            const initRes = await fetch('/api/sync/init', { method: 'POST' });
            if (!initRes.ok) throw new Error('Başlatma hatası');

            const initData: InitResponse = await initRes.json();
            const total = initData.totalOrders || 0;
            setStats(prev => ({ ...prev, total }));
            setStatus('syncing');
            addLog(`${total} adet geçmiş sipariş tespit edildi.`);

            // Step 2: Batch Loop
            let cursor = null;
            let processedCount = 0;
            let hasMore = true;

            while (hasMore) {
                const batchRes = await fetch('/api/sync/batch', {
                    method: 'POST',
                    body: JSON.stringify({ cursor }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!batchRes.ok) throw new Error('Veri paketi hatası');

                const batchData: BatchResponse = await batchRes.json();

                // Update State
                processedCount += batchData.processed || 0;
                cursor = batchData.next_cursor;

                // Calculate Progress
                const safeTotal = total > 0 ? total : 1;
                const percent = Math.min(Math.round((processedCount / safeTotal) * 100), 99);

                setProgress(percent);
                setStats(prev => ({ ...prev, processed: processedCount }));
                addLog(`Paket işlendi (${processedCount}/${total}). Finansal kayıtlar oluşturuluyor...`);

                if (!cursor || (total > 0 && processedCount >= total)) {
                    hasMore = false;
                }
            }

            // Step 3: Complete
            setStatus('finishing');
            addLog('Veriler doğrulandı. Son rötuşlar yapılıyor...');

            const completeRes = await fetch('/api/sync/complete', { method: 'POST' });
            if (!completeRes.ok) throw new Error('Tamamlama hatası');

            setProgress(100);
            setStatus('completed');
            addLog('HAZIR! Yönlendiriliyorsunuz...');

            setTimeout(() => {
                router.replace('/dashboard');
            }, 2000);

        } catch (error: any) {
            console.error(error);
            addLog(`HATA: ${error.message || 'Bir sorun oluştu'}`);
            // Retry logic could be added here
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Prificient Başlatılıyor
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Verileriniz finansal zeka motoruna aktarılıyor.<br />
                        Lütfen bu sayfayı kapatmayın.
                    </p>
                </div>

                {/* Progress Ring */}
                <div className="relative flex items-center justify-center py-8">
                    {/* Background Circle */}
                    <div className="w-48 h-48 rounded-full border-4 border-zinc-800 absolute"></div>

                    {/* Spinner/Active Circle */}
                    <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="46"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-purple-600 transition-all duration-500 ease-out"
                            strokeDasharray={`${progress * 2.89} 289`} // 2 * PI * 46 ~= 289
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Percentage Text */}
                    <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-mono font-bold">{progress}%</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">{status}</span>
                    </div>
                </div>

                {/* Log Terminal */}
                <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4 font-mono text-xs h-40 overflow-hidden relative">
                    <div className="absolute top-2 right-2 flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                    </div>
                    <div className="space-y-1.5 mt-2">
                        {logs.map((log, i) => (
                            <div key={i} className={`flex items-start gap-2 ${i === 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                                <Terminal className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{log}</span>
                            </div>
                        ))}
                    </div>
                    {/* Fade out bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-900/90 to-transparent"></div>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-xs text-zinc-500 px-2">
                    <span>İşlenen: {stats.processed}</span>
                    <span>Toplam: {stats.total}</span>
                </div>
            </div>
        </div>
    );
}
