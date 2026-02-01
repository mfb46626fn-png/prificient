'use client'

/**
 * Toxic Products Card
 * 
 * Displays products with negative margins - "Zombies" that generate
 * revenue but destroy profit. Action-oriented with "Kapat" buttons.
 */

import { Skull, TrendingDown, AlertTriangle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface ToxicProduct {
    productId: string
    variantId: string
    title: string
    revenue: number
    netProfit: number
    margin: number
    returnRate: number
    adSpend: number
    isZombie: boolean
    isToxic: boolean
}

interface ToxicProductsCardProps {
    products: ToxicProduct[]
    currency?: string
    onDisableProduct?: (productId: string, variantId: string) => void
}

export default function ToxicProductsCard({
    products,
    currency = '₺',
    onDisableProduct
}: ToxicProductsCardProps) {
    // Only show toxic products (worst first)
    const toxicProducts = products
        .filter(p => p.isToxic || p.isZombie)
        .slice(0, 5) // Max 5 products

    const totalLoss = toxicProducts.reduce((sum, p) => sum + Math.abs(p.netProfit), 0)

    if (toxicProducts.length === 0) {
        return (
            <div className="relative bg-[#f8f9fa] rounded-none sm:rounded-sm shadow-sm border-x border-[#e5e7eb] max-w-sm mx-auto w-full font-mono text-xs md:text-sm p-6 text-gray-800">
                {/* Top Zigzag */}
                <div
                    className="absolute top-0 left-0 right-0 h-4"
                    style={{
                        clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)',
                        backgroundColor: '#f3f4f6',
                        top: '-10px',
                        height: '10px'
                    }}
                />

                <div className="text-center opacity-80">
                    <div className="text-green-600 mb-2">✓</div>
                    <h3 className="font-bold text-base tracking-widest">TEMİZ</h3>
                    <p className="text-xs text-gray-500 mt-2">Toksik ürün bulunamadı</p>
                </div>

                {/* Bottom Zigzag */}
                <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                        clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)',
                        backgroundColor: '#f3f4f6',
                        bottom: '-10px',
                        height: '10px'
                    }}
                />
            </div>
        )
    }

    return (
        <div className="relative bg-[#f8f9fa] rounded-none sm:rounded-sm shadow-sm border-x border-[#e5e7eb] max-w-sm mx-auto w-full font-mono text-xs md:text-sm p-6 text-gray-800">
            {/* Top Zigzag */}
            <div
                className="absolute top-0 left-0 right-0 h-4"
                style={{
                    clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)',
                    backgroundColor: '#f3f4f6',
                    top: '-10px',
                    height: '10px'
                }}
            />

            {/* Header */}
            <div className="text-center mb-4 opacity-80">
                <Skull className="mx-auto mb-2 text-red-500" size={24} />
                <div className="flex items-center justify-center gap-2">
                    <h3 className="font-bold text-base tracking-widest border-b border-dashed border-gray-300 pb-2 inline-block">
                        TOKSİK ÜRÜNLER
                    </h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-gray-900 text-white text-xs p-3">
                                <p>Bu ürünler ciro yaratıyor ama <strong>zarar ettiriyor</strong>. Reklam, iade veya düşük marj nedeniyle "zombi" oldular.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Product List */}
            <div className="space-y-3">
                {toxicProducts.map((product, index) => (
                    <div key={product.variantId || product.productId} className="border-b border-dashed border-gray-200 pb-3 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-gray-700 font-medium truncate max-w-[200px]" title={product.title}>
                                {index + 1}. {product.title.length > 25 ? product.title.substring(0, 25) + '...' : product.title}
                            </span>
                            {onDisableProduct && (
                                <button
                                    onClick={() => onDisableProduct(product.productId, product.variantId)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded px-2 py-0.5 text-[10px] font-bold transition-colors"
                                >
                                    KAPAT
                                </button>
                            )}
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-500">
                            <span>Ciro: {currency}{product.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}</span>
                            <span className="text-red-600 font-bold">
                                Zarar: {currency}{Math.abs(product.netProfit).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                            </span>
                        </div>

                        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                            <span>Marj: {product.margin.toFixed(1)}%</span>
                            {product.returnRate > 0 && (
                                <span className="text-amber-600">İade: %{product.returnRate.toFixed(0)}</span>
                            )}
                            {product.adSpend > 0 && (
                                <span>Reklam: {currency}{product.adSpend.toFixed(0)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Loss */}
            <div className="border-t-2 border-dashed border-gray-300 mt-4 pt-3">
                <div className="flex justify-between items-center text-base font-bold">
                    <span className="text-gray-700">TOPLAM KAYIP</span>
                    <span className="text-red-600 flex items-center gap-1">
                        <TrendingDown size={16} />
                        {currency}{totalLoss.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
                    </span>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 text-center block">
                    Bu ürünleri kapatarak veya fiyat/strateji değiştirerek kârınızı koruyun
                </span>
            </div>

            {/* Bottom Zigzag */}
            <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                    clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)',
                    backgroundColor: '#f3f4f6',
                    bottom: '-10px',
                    height: '10px'
                }}
            />
        </div>
    )
}
