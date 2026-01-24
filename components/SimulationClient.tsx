'use client'

import { useState, useMemo } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import { Calculator, ArrowRight, TrendingUp, DollarSign, PackageX, AlertTriangle, Layers, Save, RotateCcw, Skull, Search } from 'lucide-react'
import { SimulationEngine, SimulationScenario, HybridSimulationInput, ProductSimData } from '@/lib/simulation/engine'

interface SimulationClientProps {
    input: HybridSimulationInput
    isDemo?: boolean
}

export default function SimulationClient({ input, isDemo = false }: SimulationClientProps) {
    // STATE
    const [scope, setScope] = useState<'portfolio' | 'product'>('portfolio')
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    // Sliders State (We keep one set of sliders that applies contextually)
    const [modifiers, setModifiers] = useState({
        price: 0,
        ads: 0,
        returns: 0,
        cogs: 0,
        killed: false
    })

    // DERIVED SCENARIO
    const scenario: SimulationScenario = useMemo(() => ({
        scope,
        target_variant_id: selectedProduct,
        price_change_percent: modifiers.price,
        ad_budget_change_percent: modifiers.ads,
        return_improvement_percent: modifiers.returns,
        cogs_increase_percent: modifiers.cogs,
        is_killed: modifiers.killed
    }), [scope, selectedProduct, modifiers])

    // SIMULATION RUN
    const result = useMemo(() => {
        return SimulationEngine.simulateHybrid(input, scenario)
    }, [input, scenario])

    const isProfitPositive = result.delta_profit >= 0

    // HANDLERS
    const handleReset = () => {
        setModifiers({ price: 0, ads: 0, returns: 0, cogs: 0, killed: false })
    }

    const handleProductSelect = (vid: string) => {
        setScope('product')
        setSelectedProduct(vid)
        handleReset() // Reset modifiers when switching context to avoid confusion
    }

    const switchToPortfolio = () => {
        setScope('portfolio')
        setSelectedProduct(null)
        handleReset()
    }

    const applyPreset = (type: 'inflation' | 'growth' | 'cleanup') => {
        handleReset()
        setScope('portfolio')
        if (type === 'inflation') setModifiers({ ...modifiers, price: 15, cogs: 10 })
        if (type === 'growth') setModifiers({ ...modifiers, ads: 100 })
        if (type === 'cleanup') {
            // Cleanup is special: Ideally it kills toxic products?
            // For now let's just do return improvement globally
            setModifiers({ ...modifiers, returns: -20 })
        }
    }

    // PRODUCT LIST FILTER
    const filteredProducts = input.products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeProduct = selectedProduct ? input.products.find(p => p.variant_id === selectedProduct) : null

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <DashboardHeader isDemo={isDemo} />

            <div className="max-w-[1700px] mx-auto px-4 md:px-8 py-8">

                {/* TOP BAR: SCOPE SELECTOR */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm sticky top-20 z-20">
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                        <button
                            onClick={switchToPortfolio}
                            className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${scope === 'portfolio' ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            🏢 Tüm Mağaza
                        </button>

                        {/* Toxic Shortcuts */}
                        {input.products.slice(0, 3).map(p => (
                            <button
                                key={p.variant_id}
                                onClick={() => handleProductSelect(p.variant_id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${selectedProduct === p.variant_id ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-gray-100 text-gray-600 hover:border-rose-100'}`}
                            >
                                <AlertTriangle size={14} className={p.net_sales < 0 ? 'text-rose-500' : 'text-gray-400'} />
                                {p.title.substring(0, 20)}...
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Ürün ara..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500/20"
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // Delay to allow click
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {(isSearchFocused || searchQuery) && (
                            <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(p => (
                                        <button
                                            key={p.variant_id}
                                            onClick={() => { handleProductSelect(p.variant_id); setSearchQuery(''); setIsSearchFocused(false); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-xs font-bold text-gray-700 border-b border-gray-50 last:border-0"
                                        >
                                            <div className="flex justify-between">
                                                <span className="truncate pr-2">{p.title}</span>
                                                <span className={p.net_sales < 0 ? 'text-rose-500' : 'text-emerald-500'}>
                                                    {Math.round(p.net_sales).toLocaleString()}₺
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-xs text-center text-gray-400 font-bold">Sonuç bulunamadı.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: CONTROLS */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* CONTEXT HEADER */}
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${scope === 'portfolio' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                                {scope === 'portfolio' ? <Layers size={24} /> : <PackageX size={24} />}
                            </div>
                            <div>
                                <h2 className="font-black text-gray-900 leading-tight">
                                    {scope === 'portfolio' ? 'Mağaza Geneli' : activeProduct?.title || 'Ürün Seçildi'}
                                </h2>
                                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wide">
                                    {scope === 'portfolio' ? 'Makro Simülasyon' : 'Cerrahi Müdahale'}
                                </p>
                            </div>
                        </div>

                        {/* KILL SWITCH (MICRO ONLY) */}
                        {scope === 'product' && (
                            <div className={`p-1 rounded-[2rem] border-2 transition-colors ${modifiers.killed ? 'bg-rose-50 border-rose-500' : 'bg-white border-transparent shadow-sm'}`}>
                                <button
                                    onClick={() => setModifiers({ ...modifiers, killed: !modifiers.killed })}
                                    className={`w-full py-4 rounded-[1.8rem] font-black flex items-center justify-center gap-2 transition-all ${modifiers.killed ? 'bg-rose-500 text-white shadow-lg scale-[0.98]' : 'bg-gray-100 text-gray-500 hover:bg-rose-100 hover:text-rose-600'}`}
                                >
                                    <Skull size={20} />
                                    {modifiers.killed ? 'ÜRÜN İPTAL EDİLDİ' : 'BU ÜRÜNÜ ÖLDÜR'}
                                </button>
                                {modifiers.killed && (
                                    <p className="text-center text-xs font-bold text-rose-600 mt-2 mb-2">
                                        Bu ürünün tüm gelir ve giderleri sıfırlandı.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* SLIDERS (DISABLED IF KILLED) */}
                        <div className={`space-y-6 transition-opacity ${modifiers.killed ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                            {/* PRICE SLIDER */}
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <label className="text-xs font-black text-gray-900 uppercase tracking-wide">Fiyat</label>
                                    <span className={`text-lg font-black ${modifiers.price > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{modifiers.price > 0 ? '+' : ''}{modifiers.price}%</span>
                                </div>
                                <input type="range" min="-20" max="50" step="1" value={modifiers.price} onChange={(e) => setModifiers({ ...modifiers, price: parseInt(e.target.value) })} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                            </div>

                            {/* AD BUDGET */}
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-indigo-100 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <label className="text-xs font-black text-gray-900 uppercase tracking-wide">Reklam Bütçesi</label>
                                    <span className={`text-lg font-black ${modifiers.ads > 0 ? 'text-orange-500' : 'text-gray-400'}`}>{modifiers.ads > 0 ? '+' : ''}{modifiers.ads}%</span>
                                </div>
                                <input type="range" min="-50" max="200" step="10" value={modifiers.ads} onChange={(e) => setModifiers({ ...modifiers, ads: parseInt(e.target.value) })} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                            </div>

                            {/* COGS and RETURNS (Condensed) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Maliyet (Enflasyon)</label>
                                    <input type="range" min="0" max="30" step="1" value={modifiers.cogs} onChange={(e) => setModifiers({ ...modifiers, cogs: parseInt(e.target.value) })} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-500 block mb-2" />
                                    <span className="text-sm font-black text-red-500">+{modifiers.cogs}%</span>
                                </div>
                                <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">İade (İyileşme)</label>
                                    <input type="range" min="-50" max="0" step="5" value={modifiers.returns} onChange={(e) => setModifiers({ ...modifiers, returns: parseInt(e.target.value) })} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 block mb-2" />
                                    <span className="text-sm font-black text-emerald-600">{modifiers.returns}%</span>
                                </div>
                            </div>
                        </div>

                        {/* PRESETS (ONLY PORTFOLIO) */}
                        {scope === 'portfolio' && (
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => applyPreset('inflation')} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:border-gray-300">🛡 Enflasyon</button>
                                <button onClick={() => applyPreset('growth')} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:border-gray-300">🚀 Büyüme</button>
                                <button onClick={handleReset} className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200"><RotateCcw size={16} /></button>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: RESULTS */}
                    <div className="lg:col-span-8 flex flex-col gap-8">

                        {/* BUTTERFLY EFFECT CARD */}
                        {/* BUTTERFLY EFFECT CARD */}
                        <div className={`rounded-[2.5rem] p-6 md:p-14 text-white relative overflow-hidden transition-all duration-700 shadow-2xl ${isProfitPositive ? 'bg-black' : 'bg-red-900'} min-h-[300px] md:min-h-[400px] flex flex-col justify-center`}>
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                                    <TrendingUp size={14} />
                                    {scope === 'portfolio' ? 'Tahmini Yıllık Etki' : 'Kelebek Etkisi (Mağaza Geneli)'}
                                </div>

                                <h2 className="text-5xl md:text-9xl font-black tracking-tighter mb-4">
                                    {result.delta_profit > 0 ? '+' : ''}{Math.round(result.delta_profit).toLocaleString('tr-TR')}₺
                                    <span className="text-xl md:text-4xl text-white/50 font-bold ml-2 md:ml-4 tracking-normal block md:inline">
                                        / ay
                                    </span>
                                </h2>

                                <div className="h-px bg-white/10 w-full my-8"></div>

                                <p className="text-gray-400 font-medium text-sm md:text-xl leading-relaxed max-w-2xl">
                                    {scope === 'product' ? (
                                        <>
                                            Sadece <span className="text-white font-bold">{activeProduct?.title}</span> üzerinde yaptığınız bu değişiklik,
                                            toplam mağaza kârını aylık <span className="text-white font-bold">{Math.round(result.delta_profit).toLocaleString()}₺</span> {result.delta_profit >= 0 ? 'artırıyor' : 'azaltıyor'}.
                                        </>
                                    ) : (
                                        <>
                                            Yapılan genel değişikliklerin toplam finansal tabloya etkisi.
                                            Yıllık projeksiyon: <span className="text-white font-bold">{Math.round(result.delta_profit * 12).toLocaleString()}₺</span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* METRICS GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Ciro', val: result.new_revenue, old: input.global_cogs + input.global_ad_spend + input.global_shipping_cost + result.old_net_profit }, // Approx revenue from input? Actually result has breakdown. We need old revenue. 
                                // Result doesn't return old revenue explicitly breakdown in logic, but has old profit.
                                // Let's simplify and show NEW values.
                                { label: 'Yeni Ciro', val: result.new_revenue, prefix: '₺' },
                                { label: 'Yeni Adet', val: result.new_orders, prefix: '' },
                                { label: 'Yeni Kâr', val: result.new_net_profit, prefix: '₺', color: result.new_net_profit > 0 ? 'text-emerald-600' : 'text-red-500' },
                            ].map((m, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-2">{m.label}</p>
                                    <p className={`text-xl font-black ${m.color || 'text-gray-900'}`}>
                                        {Math.round(m.val).toLocaleString()}{m.prefix}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}
