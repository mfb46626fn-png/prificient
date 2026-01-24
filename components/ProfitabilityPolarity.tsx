'use client'

import { ArrowRight, Trophy, Skull, TrendingUp, TrendingDown } from 'lucide-react'
import Image from 'next/image'

interface Product {
    variant_id: string
    title: string
    net_sales: number
    status: 'healthy' | 'warning' | 'toxic'
}

interface ProfitabilityPolarityProps {
    heroes: Product[]
    villains: Product[]
}

export default function ProfitabilityPolarity({ heroes, villains }: ProfitabilityPolarityProps) {

    // Helper for Skeleton Rows
    const SkeletonRow = () => (
        <div className="flex items-center justify-between p-2 rounded-lg opacity-50">
            <div className="flex items-center gap-2 w-full">
                <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse shrink-0"></div>
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
        </div>
    )

    const hasData = heroes.length > 0 || villains.length > 0

    return (
        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden h-full">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-900 text-white rounded-xl">
                        <Trophy size={18} />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Varyant Performansı</h3>
                </div>
            </div>

            {/* Split List */}
            <div className="grid grid-cols-2 gap-4 md:gap-8 divide-x divide-gray-100">

                {/* HEROES (Cash Cows) */}
                <div className="space-y-4 pr-2">
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Nakit İnekleri
                    </h4>

                    {!hasData ? (
                        <div className="space-y-3">
                            <SkeletonRow /><SkeletonRow /><SkeletonRow />
                        </div>
                    ) : (
                        heroes.length === 0 ? <p className="text-xs text-gray-400">Veri yok</p> :
                            heroes.slice(0, 5).map((product, i) => (
                                <div key={product.variant_id} className="flex justify-between items-center text-sm group">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-mono text-emerald-300 text-xs">#{i + 1}</span>
                                        <span className="font-bold text-gray-700 truncate group-hover:text-emerald-700 transition-colors">{product.title}</span>
                                    </div>
                                    <span className="font-mono font-bold text-emerald-600">+{product.net_sales.toLocaleString()}₺</span>
                                </div>
                            ))
                    )}
                </div>

                {/* VILLAINS (Cash Burners) */}
                <div className="space-y-4 pl-4 md:pl-6">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Nakit Yakıcılar
                    </h4>

                    {!hasData ? (
                        <div className="space-y-3">
                            <SkeletonRow /><SkeletonRow /><SkeletonRow />
                        </div>
                    ) : (
                        villains.length === 0 ? <p className="text-xs text-gray-400">Veri yok</p> :
                            villains.slice(0, 5).map((product, i) => (
                                <div key={product.variant_id} className="flex justify-between items-center text-sm group">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-mono text-red-300 text-xs">#{i + 1}</span>
                                        <span className="font-bold text-gray-700 truncate group-hover:text-red-700 transition-colors">{product.title}</span>
                                    </div>
                                    <span className="font-mono font-bold text-red-500">{product.net_sales.toLocaleString()}₺</span>
                                </div>
                            ))
                    )}
                </div>

            </div>
        </div>
    )
}
