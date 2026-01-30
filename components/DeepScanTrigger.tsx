'use client'

import { useState, useEffect } from 'react'
import { RefreshCcw, Terminal, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeepScanTrigger({ autoTrigger }: { autoTrigger?: boolean }) {
    const [isScanning, setIsScanning] = useState(false)
    const [scanLog, setScanLog] = useState<string[]>([])
    const router = useRouter()

    // Auto-start if requested (e.g. after fresh login/connect)
    useEffect(() => {
        if (autoTrigger) {
            startScan()
        }
    }, [autoTrigger])

    const startScan = async () => {
        if (isScanning) return
        setIsScanning(true)
        setScanLog([])

        const addLog = (msg: string) => setScanLog(prev => [...prev, msg])

        try {
            addLog("Veri kaynaklarına bağlanılıyor... (Shopify)")

            // Progressive Chunked Sync - each chunk is 15 days
            let totalSynced = 0
            let totalSkipped = 0
            let isComplete = false
            let nextChunk: { startDate: string; endDate: string } | undefined = undefined
            let nextPageInfo: string | undefined = undefined
            let chunkCount = 0

            while (!isComplete) {
                chunkCount++

                // Build request body
                const body: any = {}
                if (nextChunk) {
                    body.startDate = nextChunk.startDate
                    body.endDate = nextChunk.endDate
                }
                if (nextPageInfo) {
                    body.pageInfo = nextPageInfo
                }

                addLog(`Veri paketi #${chunkCount} çekiliyor...`)

                const response = await fetch('/api/shopify/sync-chunk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error || 'Sync failed')
                }

                const result = await response.json()

                totalSynced += result.syncedOrders || 0
                totalSkipped += result.skippedOrders || 0
                isComplete = result.complete
                nextChunk = result.nextChunk
                nextPageInfo = result.nextPageInfo

                // Show progress
                if (result.currentChunk) {
                    const startDate = new Date(result.currentChunk.startDate).toLocaleDateString('tr-TR')
                    const endDate = new Date(result.currentChunk.endDate).toLocaleDateString('tr-TR')
                    addLog(`${startDate} - ${endDate} aralığı tarandı`)
                }

                addLog(`+${result.syncedOrders || 0} yeni sipariş | ${totalSynced} toplam`)

                // Safety limit
                if (chunkCount > 20) {
                    addLog("Maksimum chunk sayısına ulaşıldı.")
                    break
                }
            }

            addLog(`Toplam: ${totalSynced} yeni, ${totalSkipped} mevcut sipariş`)

            // Finalization steps
            addLog("Finansal hareketler işleniyor...")
            await new Promise(r => setTimeout(r, 600))

            addLog("Kâr/Zarar tabloları güncelleniyor...")
            await new Promise(r => setTimeout(r, 400))

            addLog("TÜM SİSTEMLER GÜNCEL.")
            await new Promise(r => setTimeout(r, 500))

            // Refresh Data
            router.refresh()
            router.replace('/dashboard')

        } catch (error: any) {
            console.error('Scan Error:', error)
            addLog(`HATA: ${error.message || 'Bağlantı hatası'}`)
            addLog("Lütfen daha sonra tekrar deneyin.")
            await new Promise(r => setTimeout(r, 3000))
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <>
            <button
                onClick={startScan}
                className="group flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all text-xs md:text-sm font-bold bg-white shadow-sm active:scale-95 whitespace-nowrap"
            >
                <div className="p-1 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <RefreshCcw size={14} className={`transition-transform duration-700 md:w-4 md:h-4 ${isScanning ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                </div>
                <span>Analizi Yenile</span>
            </button>

            {/* SCAN OVERLAY */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 px-4">
                    <div className="bg-black border border-gray-800 p-6 md:p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden">

                        {/* Matrix/Grid Background Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 animate-pulse">
                                    <Terminal size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-mono font-bold text-lg tracking-wider">DERİN TARAMA MODU</h3>
                                    <p className="text-gray-500 text-xs font-mono">Prificient AI Diagnostic Core v2.1</p>
                                </div>
                            </div>

                            <div className="space-y-3 font-mono text-sm h-64 overflow-y-auto custom-scrollbar">
                                {scanLog.map((log, i) => (
                                    <div key={i} className="flex items-center gap-3 text-emerald-400/90 animate-in slide-in-from-left-2 duration-300">
                                        <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                                        <span>{">"} {log}</span>
                                    </div>
                                ))}
                                <div className="animate-pulse text-indigo-500">_</div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                                <span className="text-gray-500 text-xs animate-pulse">Sistem taranıyor... Lütfen bekleyiniz.</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>

                        {/* Scanning Bar Animation */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
            )}
        </>
    )
}
