'use client'

import { useMemo } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    ReferenceLine
} from 'recharts'

type ChartDataPoint = {
    transaction_date: string
    amount: number
    [key: string]: any
}

interface FinancialChartProps {
    data: ChartDataPoint[]
    type?: 'area' | 'bar'
    title?: string
    currency?: string
}

export default function FinancialChart({ data, type = 'area', title, currency = 'TRY' }: FinancialChartProps) {

    // Format data for chart
    const formattedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            date: new Date(item.transaction_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            value: Number(item.amount) // Ensure number
        }))
    }, [data])

    // Calculate stats for better visualization (e.g., color)
    const isPositiveTrend = useMemo(() => {
        if (formattedData.length < 2) return true;
        return formattedData[formattedData.length - 1].value >= formattedData[0].value;
    }, [formattedData]);

    const color = isPositiveTrend ? '#10b981' : '#f43f5e'; // Emerald or Rose

    if (!data || data.length === 0) return null

    return (
        <div className="w-full mt-4 mb-2 bg-white rounded-xl border border-gray-100 p-4 shadow-sm animate-in zoom-in-95 duration-300">
            {title && (
                <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h4>
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold">{currency}</span>
                </div>
            )}

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {type === 'bar' ? (
                        <BarChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                hide // Minimalist design
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${currency}`, 'Tutar']}
                                labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}
                            />
                            <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                        <AreaChart data={formattedData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={20}
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${currency}`, 'Değer']}
                                labelStyle={{ color: '#6b7280', fontSize: '10px', marginBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
