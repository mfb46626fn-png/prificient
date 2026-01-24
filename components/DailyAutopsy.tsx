'use client'

import { Receipt, AlertCircle, CheckCircle2 } from 'lucide-react'

interface DailyAutopsyProps {
    data: {
        grossRevenue: number
        returns: number
        ads: number
        cogsAndFees: number
        netPocket: number
        date: string
    } | null
}

export default function DailyAutopsy({ data }: DailyAutopsyProps) {

    // Receipt Metaphor
    // If no data, we show a "Ghost Receipt" (Mock) to keep the UI populated.
    const displayData = data || {
        grossRevenue: 0,
        returns: 0,
        ads: 0,
        cogsAndFees: 0,
        netPocket: 0,
        date: new Date().toISOString(),
        isMock: true
    }

    const { grossRevenue, returns, ads, netPocket, isMock } = displayData as any

    return (
        <div className="relative bg-[#f8f9fa] rounded-none sm:rounded-sm shadow-sm border-x border-[#e5e7eb] max-w-sm mx-auto w-full font-mono text-xs md:text-sm p-6 text-gray-800">
            {/* Top Zigzag */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gray-900" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)', backgroundColor: '#f3f4f6', top: '-10px', height: '10px' }}></div>

            <div className="text-center mb-6 opacity-80">
                <Receipt className="mx-auto mb-2 opacity-50" size={24} />
                <h3 className="font-bold text-base tracking-widest border-b border-dashed border-gray-300 pb-2 inline-block">DÜNÜN OTOPSİSİ</h3>
                <p className="mt-1 text-[10px] text-gray-400">{new Date(displayData.date).toLocaleDateString()}</p>
            </div>

            <div className={`space-y-2 ${isMock ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex justify-between">
                    <span>CİRO</span>
                    <span className="font-bold">{isMock ? '-- ₺' : grossRevenue.toLocaleString() + '₺'}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>İADE</span>
                    <span>{isMock ? '-- ₺' : `-${returns.toLocaleString()}₺`}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>REKLAM</span>
                    <span>{isMock ? '-- ₺' : `-${ads.toLocaleString()}₺`}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>MALİYET</span>
                    <span>{isMock ? '-- ₺' : `-${(displayData.cogsAndFees || 0).toLocaleString()}₺`}</span>
                </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

            <div className={`flex justify-between items-center text-lg md:text-xl font-bold ${isMock ? 'opacity-50' : netPocket > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                <span>NET CEPTE:</span>
                <span>{isMock ? 'Hesaplanıyor...' : netPocket.toLocaleString() + '₺'}</span>
            </div>

            {/* Bottom Zigzag */}
            <div className="absolute bottom-0 left-0 right-0 h-4" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)', backgroundColor: '#f3f4f6', bottom: '-10px', height: '10px' }}></div>
        </div>
    )
}
