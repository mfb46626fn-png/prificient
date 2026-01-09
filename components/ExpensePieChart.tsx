'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { usePreferences } from '@/app/contexts/PreferencesContext'
import { useCurrency } from '@/app/contexts/CurrencyContext' // 1. Para birimi desteği

// Modern ve uyumlu renk paleti
const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1'  // Indigo
]

export default function ExpensePieChart({ transactions }: { transactions: any[] }) {
  const { t, chartColors } = usePreferences()
  const { symbol, convert } = useCurrency() // 2. Sembol ve çeviri fonksiyonu

  // Veri işleme mantığını useMemo ile optimize ettik
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense')
    
    const grouped = expenses.reduce((acc: any, curr) => {
      const cat = curr.category || 'Diğer' // Kategori yoksa 'Diğer' yazsın
      if (!acc[cat]) acc[cat] = 0
      acc[cat] += Number(curr.amount)
      return acc
    }, {})

    return Object.keys(grouped)
      .map(key => ({ name: key, value: grouped[key] }))
      .sort((a, b) => b.value - a.value) // Büyükten küçüğe sırala
  }, [transactions])

  // Özel Tooltip Bileşeni
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            {payload[0].name}
          </p>
          <p className="text-lg font-black text-gray-900">
            {symbol}{convert(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-colors outline-none" tabIndex={-1}>
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
        Gider Dağılımı
      </h3>
      <p className="text-xs font-medium text-gray-400 mb-6">Kategorilere göre harcamalarınız.</p>

      <div className="h-64 w-full relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60} // Donut kalınlığı
                outerRadius={85}
                paddingAngle={5} // Dilimler arası boşluk
                dataKey="value"
                stroke="none"
                cornerRadius={6} // Dilim kenarlarını yuvarla (Modern görünüm)
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="outline-none focus:outline-none" // Tıklama outline'ını kaldır
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs font-bold text-gray-500 ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-gray-200 animate-spin mb-3"></div>
            <p className="text-sm font-bold">Veri yok</p>
          </div>
        )}
      </div>
    </div>
  )
}