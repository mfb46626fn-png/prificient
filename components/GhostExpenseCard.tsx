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
    const commissionEstimate = amount * 0.75
    const infraEstimate = amount * 0.25

    return (
        <div className="relative bg-[#f8f9fa] rounded-none sm:rounded-sm shadow-sm border-x border-[#e5e7eb] max-w-sm mx-auto w-full font-mono text-xs md:text-sm p-6 text-gray-800">
            {/* Top Zigzag */}
            <div className="absolute top-0 left-0 right-0 h-4" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)', backgroundColor: '#f3f4f6', top: '-10px', height: '10px' }}></div>

            <div className="text-center mb-6 opacity-80">
                <TrendingDown className="mx-auto mb-2 opacity-50 text-red-500" size={24} />
                <div className="flex items-center justify-center gap-2">
                    <h3 className="font-bold text-base tracking-widest border-b border-dashed border-gray-300 pb-2 inline-block">HAYALET GİDERLER</h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info size={12} className="text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs text-xs">Genellikle gözden kaçan ödeme altyapı komisyonları, işlem ücretleri ve kargo farkları.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard size={12} className="text-gray-400" />
                        <span>Sanal POS Kom.</span>
                    </div>
                    <span className="font-bold">~{commissionEstimate.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <div className="flex items-center gap-2">
                        <Receipt size={12} className="text-gray-400" />
                        <span>Altyapı & Servis</span>
                    </div>
                    <span>~{infraEstimate.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}₺</span>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

            <div className={`flex justify-between items-center text-lg md:text-xl font-bold ${amount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                <span>TOPLAM:</span>
                <span>-{amount.toLocaleString('tr-TR')}₺</span>
            </div>

            {/* Bottom Zigzag */}
            <div className="absolute bottom-0 left-0 right-0 h-4" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)', backgroundColor: '#f3f4f6', bottom: '-10px', height: '10px' }}></div>
        </div>
    )
}
