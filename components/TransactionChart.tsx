'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePreferences } from '@/app/contexts/PreferencesContext'
import { useCurrency } from '@/app/contexts/CurrencyContext' // Context Eklendi

export default function TransactionChart({ transactions }: { transactions: any[] }) {
  const { t, chartColors } = usePreferences()
  const { symbol } = useCurrency() // Sembolü aldık
  
  const data = processData(transactions, t)

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 h-full transition-colors outline-none">
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider">{t.income_expense_analysis}</h3>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
            
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: chartColors.text, fontSize: 11, fontWeight: 'bold' }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: chartColors.text, fontSize: 11, fontWeight: 'bold' }} 
              // Y ekseni rakamlarının yanına sembol ekledik
              tickFormatter={(value) => `${symbol}${value}`}
            />
            <Tooltip 
              cursor={{ fill: chartColors.grid, opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: chartColors.tooltipBg, 
                borderRadius: '1.5rem', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '1rem'
              }}
              // Tooltip içindeki rakamları formatladık
              formatter={(value: any) => [`${symbol}${value.toLocaleString('tr-TR')}`, '']}
              itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
            />
            <Bar dataKey="income" name={t.income} fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="expense" name={t.expense} fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function processData(transactions: any[], t: any) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  return last7Days.map(date => {
    const dayTrans = transactions.filter(t => t.date === date)
    // t.type kontrolü düzeltildi (bazı yerlerde 'revenue', bazı yerlerde 'income' olabilir)
    const income = dayTrans.filter(t => t.type === 'revenue' || t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
    const expense = dayTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
    
    return {
      date: new Date(date).toLocaleDateString(t.language === 'en' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'short' }),
      income,
      expense
    }
  })
}