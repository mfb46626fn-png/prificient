'use client'

import { useState } from 'react'
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    LineChart, Line, ReferenceLine, Treemap
} from 'recharts'
import { Calendar, AlertTriangle, TrendingDown, Receipt, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface FinancialData {
    waterfall: { name: string, value: number, fill: string }[]
    trend: { date: string, revenue: number, profit: number }[]
    unitEconomics: {
        averageOrderValue: number
        cogs: number
        ads: number
        shipping: number
        fees: number
        net: number
    }
    expenses: { name: string, size: number, fill: string }[]
}

interface FinancialAutopsyProps {
    data: FinancialData
    isLoading?: boolean
}

// Custom Treemap Content
const TreemapContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: (payload && payload.fill) || props.fill || '#333333',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {width > 50 && height > 30 && (
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
                    {name}
                </text>
            )}
            {width > 50 && height > 30 && (
                <text x={x + width / 2} y={y + height / 2 - 7} textAnchor="middle" fill="#fff" fontSize={10} opacity={0.8}>
                    {props.size?.toLocaleString()}₺
                </text>
            )}
        </g>
    );
};

export default function FinancialAutopsy({ data, isLoading = false }: FinancialAutopsyProps) {
    const [dateRange, setDateRange] = useState('Bu Ay')

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-400">Yükleniyor...</div>
    }

    const { waterfall, trend, unitEconomics, expenses } = data

    // Check for Death Cross (Revenue UP, Profit DOWN in last 3 data points)
    const isDeathCross = trend.length > 3 &&
        trend[trend.length - 1].revenue > trend[trend.length - 3].revenue &&
        trend[trend.length - 1].profit < trend[trend.length - 3].profit

    return (
        <div className="space-y-4 md:space-y-8 animate-in fade-in duration-700 pb-20 font-sans">

            {/* HEADER & FILTER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                        <span className="p-1.5 md:p-2 bg-blue-900 text-white rounded-lg"><TrendingDown size={18} className="md:w-5 md:h-5" /></span>
                        Finansal Otopsi
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">İşletmenizin detaylı anatomik incelemesi.</p>
                </div>

                {/* Date Picker Mock - Full Width on Mobile */}
                <div className="w-full md:w-auto flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm">
                    <Calendar size={14} className="text-gray-400 ml-2" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-transparent text-xs md:text-sm font-bold text-gray-700 focus:outline-none p-1 w-full md:w-auto"
                    >
                        <option>Bugün</option>
                        <option>Dün</option>
                        <option>Bu Hafta</option>
                        <option>Bu Ay</option>
                        <option>Geçen Ay</option>
                    </select>
                </div>
            </div>

            {/* MODULE 1: PROFIT WATERFALL */}
            <div className="bg-white rounded-3xl md:rounded-[2rem] p-4 md:p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm md:text-lg font-black text-gray-900 mb-4 md:mb-6 uppercase tracking-wide">Kâr Şelalesi (Net Profit Walk)</h3>
                <div className="h-[250px] md:h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={waterfall} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="name"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval={0}  // Force show all labels
                                tick={{ fill: '#9ca3af', fontSize: 9 }}
                            />
                            <YAxis
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                width={30}
                            />
                            <RechartsTooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: any) => [`${Number(value).toLocaleString()}₺`, 'Tutar']}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {waterfall.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* MODULE 2: TREND ANALYSIS (DEATH CROSS) */}
            <div className="bg-white rounded-3xl md:rounded-[2rem] p-4 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="text-sm md:text-lg font-black text-gray-900 uppercase tracking-wide">Trend Analizi</h3>
                    {isDeathCross && (
                        <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] md:text-xs font-black animate-pulse">
                            <AlertTriangle size={12} className="md:w-[14px] md:h-[14px]" /> ⚠️ DEATH CROSS
                        </div>
                    )}
                </div>

                <div className="h-[250px] md:h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val.replace('Gün ', '')} // "1", "2" instead of "Gün 1"
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                            />
                            <YAxis
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                width={30}
                            />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                            <Line type="monotone" dataKey="revenue" name="Brüt Ciro" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="profit" name="Net Kâr" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* MODULE 3: BOTTOM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">

                {/* LEFT: UNIT ECONOMICS (RECEIPT) */}
                <div className="bg-white rounded-3xl md:rounded-[2rem] p-4 md:p-8 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="p-1.5 md:p-2 bg-gray-100 text-gray-600 rounded-lg md:rounded-xl"><Receipt size={16} className="md:w-5 md:h-5" /></div>
                        <h3 className="text-sm md:text-lg font-black text-gray-900 uppercase tracking-wide">Birim Ekonomi</h3>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-xl p-4 md:p-6 font-mono text-xs md:text-sm space-y-2 md:space-y-3 relative overflow-hidden">
                        {/* Zigzag Top */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_50%,#f9fafb_50%)] bg-[length:12px_12px] rotate-180 opacity-50"></div>

                        <p className="text-[10px] md:text-xs text-gray-400 text-center mb-2 md:mb-4 uppercase tracking-widest font-sans font-bold">Ortalama Sipariş Anatomisi</p>

                        <div className="flex justify-between items-center">
                            <span>Sepet Tutarı</span>
                            <span className="font-bold">{unitEconomics.averageOrderValue.toLocaleString()}₺</span>
                        </div>
                        <div className="flex justify-between items-center text-red-500">
                            <span>(-) Ürün Maliyeti</span>
                            <span>{unitEconomics.cogs.toLocaleString()}₺</span>
                        </div>
                        <div className="flex justify-between items-center text-red-500">
                            <span>(-) Reklam (CPA)</span>
                            <span>{unitEconomics.ads.toLocaleString()}₺</span>
                        </div>
                        <div className="flex justify-between items-center text-red-500">
                            <span>(-) Kargo & Lojistik</span>
                            <span>{unitEconomics.shipping.toLocaleString()}₺</span>
                        </div>
                        <div className="flex justify-between items-center text-red-500">
                            <span>(-) Komisyonlar</span>
                            <span>{unitEconomics.fees.toLocaleString()}₺</span>
                        </div>

                        <div className="border-t border-dashed border-gray-300 my-2"></div>

                        <div className="flex justify-between items-center text-sm md:text-lg font-black bg-white p-2 md:p-3 rounded-lg border border-gray-200 shadow-sm">
                            <span>TEKİL KÂR</span>
                            <span className={unitEconomics.net > 0 ? "text-emerald-600" : "text-red-600"}>
                                {unitEconomics.net.toLocaleString()}₺
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-2">
                            Her siparişte cebinize kalan net tutar.
                        </p>
                    </div>
                </div>

                {/* RIGHT: EXPENSE TREEMAP */}
                <div className="bg-white rounded-3xl md:rounded-[2rem] p-4 md:p-8 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="p-1.5 md:p-2 bg-rose-50 text-rose-600 rounded-lg md:rounded-xl"><TrendingDown size={16} className="md:w-5 md:h-5" /></div>
                        <h3 className="text-sm md:text-lg font-black text-gray-900 uppercase tracking-wide">Gider Haritası</h3>
                    </div>

                    <div className="flex-1 min-h-[220px] md:min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={expenses}
                                dataKey="size"
                                aspectRatio={4 / 3}
                                stroke="#fff"
                                fill="#8884d8"
                                content={<TreemapContent />}
                            />
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

        </div>
    )
}
