'use client'

/**
 * Product Analysis Page
 * 
 * Split view showing "Kârlı" (profitable) vs "Zombi" (revenue positive, profit negative) products.
 * True net profit per product with ad spend attribution.
 */

import { useEffect, useState } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, Skull, DollarSign, RefreshCw, Filter, Search } from 'lucide-react'
import Link from 'next/link'

interface ProductData {
    productId: string
    variantId: string
    title: string
    revenue: number
    cogs: number
    adSpend: number
    transactionFees: number
    netProfit: number
    margin: number
    soldQuantity: number
    returnQuantity: number
    returnRate: number
    isZombie: boolean
    isToxic: boolean
}

export default function ProductAnalysisClient() {
    const [products, setProducts] = useState<ProductData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | 'profitable' | 'zombie'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [days, setDays] = useState(30)
    const [currency, setCurrency] = useState('₺')

    useEffect(() => {
        fetchProducts()
    }, [days])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/products/profitability?days=${days}`)
            const data = await res.json()

            if (data.success) {
                setProducts(data.products)
                if (data.currency) setCurrency(data.currency)
            } else {
                setError(data.error || 'Veri yüklenemedi')
            }
        } catch (e) {
            setError('Bağlantı hatası')
        } finally {
            setLoading(false)
        }
    }

    // Filter and search
    const filteredProducts = products.filter(p => {
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'profitable' ? !p.isZombie :
                    p.isZombie

        const matchesSearch = searchQuery
            ? p.title.toLowerCase().includes(searchQuery.toLowerCase())
            : true

        return matchesFilter && matchesSearch
    })

    // Split into profitable and zombies
    const profitableProducts = filteredProducts.filter(p => !p.isZombie)
    const zombieProducts = filteredProducts.filter(p => p.isZombie)

    // Totals
    const totalProfit = filteredProducts.reduce((sum, p) => sum + p.netProfit, 0)
    const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.revenue, 0)
    const zombieLoss = zombieProducts.reduce((sum, p) => sum + Math.abs(p.netProfit), 0)

    const formatCurrency = (value: number) => {
        return `${currency}${Math.abs(value).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Ürün Analizi</h1>
                                <p className="text-sm text-gray-500">Gerçek kârlılık - Ciro değil, kazanç</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            Yenile
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                            <DollarSign size={16} />
                            Toplam Ciro
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                            <TrendingUp size={16} />
                            Net Kâr
                        </div>
                        <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalProfit >= 0 ? '' : '-'}{formatCurrency(totalProfit)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                            <TrendingUp size={16} />
                            Kârlı Ürün
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{profitableProducts.length}</div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
                            <Skull size={16} />
                            Zombi Ürün
                        </div>
                        <div className="text-2xl font-bold text-red-600">{zombieProducts.length}</div>
                        <div className="text-xs text-gray-500">Kayıp: {formatCurrency(zombieLoss)}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-2">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Ürün ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-none outline-none text-sm w-48"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="bg-white border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="all">Tüm Ürünler</option>
                            <option value="profitable">Sadece Kârlı</option>
                            <option value="zombie">Sadece Zombi</option>
                        </select>
                    </div>

                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="bg-white border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value={7}>Son 7 Gün</option>
                        <option value={30}>Son 30 Gün</option>
                        <option value={90}>Son 90 Gün</option>
                    </select>
                </div>

                {/* Loading / Error States */}
                {loading && (
                    <div className="text-center py-12">
                        <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
                        <p className="text-gray-500">Ürünler analiz ediliyor...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                {/* Product Table */}
                {!loading && !error && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ciro</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Maliyet</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reklam</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Net Kâr</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Marj</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">İade %</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-8 text-gray-500">
                                                Ürün bulunamadı
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.variantId || product.productId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900 truncate max-w-[200px]" title={product.title}>
                                                        {product.title}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {product.soldQuantity} satış
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                    {formatCurrency(product.revenue)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-600">
                                                    {formatCurrency(product.cogs)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-600">
                                                    {product.adSpend > 0 ? formatCurrency(product.adSpend) : '-'}
                                                </td>
                                                <td className={`px-4 py-3 text-right text-sm font-bold ${product.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {product.netProfit >= 0 ? '' : '-'}{formatCurrency(product.netProfit)}
                                                </td>
                                                <td className={`px-4 py-3 text-right text-sm ${product.margin >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                                    {product.margin.toFixed(1)}%
                                                </td>
                                                <td className={`px-4 py-3 text-right text-sm ${product.returnRate > 10 ? 'text-amber-600' : 'text-gray-500'}`}>
                                                    {product.returnRate.toFixed(0)}%
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {product.isToxic ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            <Skull size={12} />
                                                            Toksik
                                                        </span>
                                                    ) : product.isZombie ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                            <TrendingDown size={12} />
                                                            Zombi
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            <TrendingUp size={12} />
                                                            Kârlı
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
