'use client'

import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import DateRangePicker from './DateRangePicker'

type AnalyticsProps = {
    currency: string
    data: {
        kpi: {
            revenue: number
            profit: number
            cogs: number
            ads: number
            returns: number
            margin: number
        }
        trend: any[]
        products: any[]
    }
}

export default function AnalyticsDashboard({ currency = 'TRY', data }: AnalyticsProps) {
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const marginColor = data.kpi.margin >= 20 ? 'text-emerald-600' : data.kpi.margin > 0 ? 'text-amber-600' : 'text-red-600'
    const profitColor = data.kpi.profit >= 0 ? 'text-emerald-900' : 'text-red-900'

    return (
        <div className="space-y-6">

            {/* HEADER & FILTER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Finansal Genel Bakış</h2>
                    <p className="text-sm text-gray-500">Mağazanızın performans metrikleri ve kârlılık analizi.</p>
                </div>
                <DateRangePicker />
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. NET PROFIT (HERO) */}
                <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                            <DollarSign size={20} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/50 ${marginColor}`}>
                            %{data.kpi.margin.toFixed(1)} Marj
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Toplam Net Kâr</p>
                    <h3 className={`text-2xl font-black mt-1 ${profitColor}`}>{formatMoney(data.kpi.profit)}</h3>
                </div>

                {/* 2. REVENUE */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Brüt Ciro</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(data.kpi.revenue)}</h3>
                </div>

                {/* 3. COGS & ADS */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Ürün Maliyeti</span>
                            <span className="font-medium text-gray-900">{formatMoney(data.kpi.cogs)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Reklam (Ads)</span>
                            <span className="font-medium text-gray-900">{formatMoney(data.kpi.ads)}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden flex">
                            <div className="bg-orange-400" style={{ width: `${(data.kpi.cogs / (data.kpi.revenue || 1)) * 100}%` }}></div>
                            <div className="bg-blue-400" style={{ width: `${(data.kpi.ads / (data.kpi.revenue || 1)) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* 4. RETURNS */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">İadeler</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatMoney(data.kpi.returns)}</h3>
                </div>
            </div>

            {/* CHART & PRODUCTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 2/3 CHART */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity size={16} className="text-gray-400" />
                        Finansal Trend
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.trend}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    hide={true} // Cleaner look
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => formatMoney(Number(value || 0))}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#94a3b8"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Ciro"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorProfit)"
                                    name="Net Kâr"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 1/3 TOP PRODUCTS */}
                <div className="bg-white p-0 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingBag size={16} className="text-gray-400" />
                            Performans Liderleri
                        </h3>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar max-h-[340px]">
                        {data.products.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-xs">Veri bulunamadı</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white sticky top-0 z-10 text-xs text-gray-400 font-medium">
                                    <tr>
                                        <th className="p-4 pl-5">Ürün</th>
                                        <th className="p-4 text-right pr-5">Kâr</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {data.products.slice(0, 10).map((p, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-3 pl-5">
                                                <div className="font-medium text-gray-900 line-clamp-1" title={p.name}>{p.name}</div>
                                                <div className="text-xs text-gray-400">Marj: {p.margin}%</div>
                                            </td>
                                            <td className="p-3 pr-5 text-right font-bold text-emerald-600">
                                                {formatMoney(p.profit)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
