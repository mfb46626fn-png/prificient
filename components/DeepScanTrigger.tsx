'use client'

import { useState } from 'react'
import { RefreshCcw, Terminal, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeepScanTrigger() {
    const [isScanning, setIsScanning] = useState(false)
    const [scanLog, setScanLog] = useState<string[]>([])
    const router = useRouter()

    const startScan = async () => {
        setIsScanning(true)
        setScanLog([])

        // Simulation Steps
        const steps = [
            { msg: "Veri kaynaklarına bağlanılıyor... (Shopify, Meta Ads)", delay: 800 },
            { msg: "Son 24 saatlik finansal hareketler taranıyor...", delay: 1500 },
            { msg: "İade oranları ve marj sapmaları analiz ediliyor...", delay: 2200 },
            { msg: "Gider kaçakları ve hayalet kesintiler kontrol ediliyor...", delay: 3000 },
            { msg: "Risk algoritmaları yeniden çalıştırılıyor...", delay: 3800 },
            { msg: "TÜM SİSTEMLER GÜNCEL.", delay: 4200 },
        ]

        for (const step of steps) {
            await new Promise(r => setTimeout(r, step.delay - (steps[steps.indexOf(step) - 1]?.delay || 0))) // simple delay logic
            setScanLog(prev => [...prev, step.msg])
        }

        // Refresh Data
        router.refresh()

        // Success Delay
        await new Promise(r => setTimeout(r, 800))
        setIsScanning(false)
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
