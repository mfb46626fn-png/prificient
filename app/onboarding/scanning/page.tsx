'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Terminal, ShieldCheck, Database, FileSearch, AlertTriangle } from 'lucide-react'

// Sequence of scanning steps
const SCAN_SEQUENCE = [
    { text: "Mağaza verileri alınıyor...", delay: 0, icon: <Terminal size={18} /> },
    { text: "Sipariş defteri oluşturuluyor (Ledger)...", delay: 1500, icon: <Database size={18} /> },
    { text: "Gizli işlem ücretleri ayrıştırılıyor...", delay: 3500, icon: <FileSearch size={18} /> },
    { text: "Kârlılık analizi yapılıyor (Net Profit calculation)...", delay: 5500, icon: <ShieldCheck size={18} /> },
    { text: "⚠️ Kritik finansal sızıntılar tespit edildi.", delay: 7500, icon: <AlertTriangle size={18} className="text-red-500" /> }
]

export default function ScanningPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const router = useRouter()

    useEffect(() => {
        // Run the sequence
        const timers = SCAN_SEQUENCE.map((step, index) => {
            return setTimeout(() => {
                setCurrentStep(index)
            }, step.delay)
        })

        // Redirect after the last step + buffer
        const redirectTimer = setTimeout(() => {
            router.push('/onboarding/diagnosis')
        }, 9000)

        // Cleanup
        return () => {
            timers.forEach(clearTimeout)
            clearTimeout(redirectTimer)
        }
    }, [router])

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Grid & Scanline */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent animate-scan"></div>

            <div className="max-w-xl w-full relative z-10 space-y-8">

                {/* Central Pulse */}
                <div className="flex justify-center mb-12">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
                        <div className="w-24 h-24 border-2 border-green-500 rounded-full flex items-center justify-center relative overflow-hidden">
                            <div className="w-full h-full bg-green-500/10 animate-ping absolute rounded-full"></div>
                            <Terminal size={40} className="text-green-400 relative z-10" />
                        </div>
                    </div>
                </div>

                {/* Console Output */}
                <div className="bg-black/80 border border-green-900/50 p-6 rounded-xl shadow-2xl backdrop-blur-sm min-h-[200px] flex flex-col justify-end">
                    {SCAN_SEQUENCE.map((step, index) => {
                        if (index > currentStep) return null

                        const isLast = index === currentStep
                        const isCritical = step.text.includes('⚠️')

                        return (
                            <div key={index} className={`flex items-center gap-3 mb-3 animate-in fade-in slide-in-from-left-2 duration-300 ${isCritical ? 'text-red-500 font-bold' : 'text-green-400/80'}`}>
                                <span className="opacity-50 text-xs">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                <div className={`${isLast ? 'animate-pulse' : ''}`}>{step.icon}</div>
                                <span className={isLast ? 'border-r-2 border-green-500 pr-1 animate-blink' : ''}>
                                    {step.text}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs uppercase tracking-widest text-green-700 font-bold">
                        <span>System Sync</span>
                        <span>{Math.min((currentStep + 1) * 20, 100)}%</span>
                    </div>
                    <div className="h-1 w-full bg-green-900/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            style={{ width: `${Math.min((currentStep + 1) * 20, 100)}%` }}
                        ></div>
                    </div>
                </div>

            </div>
        </div>
    )
}
