'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowUpCircle, ArrowDownCircle, Trash2, Edit2, ArrowUpDown, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import EditTransactionModal from '@/components/EditTransactionModal'
import { useCurrency } from '@/app/contexts/CurrencyContext'

type Transaction = {
  id: string
  amount: number
  description: string
  date: string
  type: 'revenue' | 'expense'
  category?: string
}

type SortConfig = {
  key: 'date' | 'amount' | 'category' | null
  direction: 'asc' | 'desc'
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const supabase = createClient()
  const router = useRouter()
  // symbol yanına convert fonksiyonunu ekledik
  const { symbol, convert } = useCurrency() 
  
  const [data, setData] = useState<Transaction[]>(transactions)
  const [search, setSearch] = useState('')
  const [editingItem, setEditingItem] = useState<Transaction | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' })

  useEffect(() => {
    setData(transactions)
  }, [transactions])

  const handleDelete = async (item: Transaction) => {
    const tableName = item.type === 'revenue' ? 'revenues' : 'expenses'
    const { error } = await supabase.from(tableName).delete().eq('id', item.id);
    if (!error) {
        setData(prev => prev.filter(t => t.id !== item.id));
        router.refresh();
    }
  }

  const handleEditSuccess = (updatedItem: Transaction | null) => {
    if (updatedItem === null) {
        if (editingItem) setData(prev => prev.filter(item => item.id !== editingItem.id))
    } else {
        setData(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
    }
    router.refresh()
  }

  const handleSort = (key: 'date' | 'amount' | 'category') => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  const processedData = useMemo(() => {
    let filtered = data.filter(t => 
      t.description?.toLowerCase().includes(search.toLowerCase()) || 
      (t.category && t.category.toLowerCase().includes(search.toLowerCase()))
    )
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key!]
        let bValue: any = b[sortConfig.key!]
        if (sortConfig.key === 'date') { aValue = new Date(aValue).getTime(); bValue = new Date(bValue).getTime() }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return filtered
  }, [data, search, sortConfig])

  return (
    <>
      <div className="bg-white rounded-4xl border border-gray-100 shadow-xl mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4">
          <h3 className="text-xl font-black text-gray-900">Son İşlemler</h3>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Ara..." className="pl-11 pr-4 py-3 w-full rounded-2xl bg-gray-50 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="divide-y divide-gray-50 max-h-150 overflow-y-auto">
          {processedData.map((t) => (
            <div key={t.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 group">
              <div className="col-span-1 flex items-center justify-between md:justify-start gap-3">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${t.type === 'revenue' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                   {t.type === 'revenue' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                 </div>
                 <div className="md:hidden flex flex-col flex-1 ml-3">
                    <span className="font-bold text-gray-900 text-base">{t.description}</span>
                    <span className="text-xs text-gray-500 font-medium">{new Date(t.date).toLocaleDateString('tr-TR')}</span>
                 </div>
                 <div className={`md:hidden font-black text-lg ${t.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {/* MOBİL: convert fonksiyonu eklendi */}
                    {t.type === 'revenue' ? '+' : '-'}{symbol}{convert(t.amount)}
                 </div>
              </div>

              <div className="col-span-4 hidden md:block font-bold text-gray-900 truncate">{t.description}</div>
              <div className="col-span-2 hidden md:block text-sm font-medium text-gray-500">{new Date(t.date).toLocaleDateString('tr-TR')}</div>
              <div className="col-span-2 hidden md:block"><span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">{t.category || '-'}</span></div>
              
              <div className={`col-span-2 hidden md:block text-right font-black text-lg ${t.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {/* MASAÜSTÜ: convert fonksiyonu eklendi */}
                {t.type === 'revenue' ? '+' : '-'}{symbol}{convert(t.amount)}
              </div>

              <div className="col-span-1 flex justify-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setEditingItem(t)} className="p-2 text-gray-400 hover:text-blue-600 rounded-xl transition-colors"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(t)} className="p-2 text-gray-400 hover:text-rose-600 rounded-xl transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editingItem && <EditTransactionModal isOpen={!!editingItem} onClose={() => setEditingItem(null)} transaction={editingItem} onSuccess={handleEditSuccess} />}
    </>
  )
}