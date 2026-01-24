'use client'

import { TrendingDown, Info, CreditCard, Receipt } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface GhostExpenseCardProps {
    amount: number
}

export default function GhostExpenseCard({ amount }: GhostExpenseCardProps) {
    // For MVP, since we only have the aggregate '740+770' as Fees from PainEngine, 
    // we will simulate a breakdown based on typical ratios or just show the total if no granular data.
    // Ideally, we would fetch 740 and 770 separately. 
    // Let's assume for now 80% is Payment Processing (Komisyon) and 20% is Service/Infra (Altyapı).
    // Or just label it as "İşlem & Servis Ücretleri".

    // Actually, let's just show the breakdown text clearly.
    const commissionEstimate = amount * 0.75
    const infraEstimate = amount * 0.25

    return (
        <div className="bg-gray-900 text-gray-400 rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 relative overflow-hidden flex flex-col justify-between gap-4 h-full border border-gray-800 hover:border-gray-700 transition-colors">

            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <TrendingDown size={80} />
            </div>

            <div className="flex items-start justify-between relative z-10 w-full">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500">Hayalet Giderler</h3>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info size={12} className="text-gray-600 hover:text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs text-xs">Genellikle gözden kaçan ödeme altyapı komisyonları, işlem ücretleri ve kargo farkları.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <p className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                        -{amount.toLocaleString('tr-TR')}₺
                    </p>
                </div>
            </div>

            <div className="space-y-2 relative z-10 w-full bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <CreditCard size={12} className="text-gray-500" />
                        <span>Sanal POS Kom.</span>
                    </div>
                    <span className="font-mono text-gray-300">~{commissionEstimate.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <Receipt size={12} className="text-gray-500" />
                        <span>Altyapı & Servis</span>
                    </div>
                    <span className="font-mono text-gray-300">~{infraEstimate.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺</span>
                </div>
            </div>

        </div>
    )
}
