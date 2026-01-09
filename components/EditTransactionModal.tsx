'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Save, Loader2, AlertCircle } from 'lucide-react'
import { useCurrency } from '@/app/contexts/CurrencyContext' // Context Eklendi

type Transaction = {
  id: string
  amount: number
  description: string
  date: string
  type: 'revenue' | 'expense' 
  category?: string
}

interface EditTransactionModalProps {
  transaction: Transaction
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedItem: Transaction) => void
}

export default function EditTransactionModal({ transaction, isOpen, onClose, onSuccess }: EditTransactionModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const supabase = createClient()
  const { symbol } = useCurrency() // Sembolü aldık
  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    description: transaction.description || '',
    date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
    category: transaction.category || ''
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
        category: transaction.category || ''
      })
      setErrorMsg(null)
    }
  }, [isOpen, transaction])

  if (!isOpen) return null

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const amountVal = parseFloat(formData.amount)
    
    if (isNaN(amountVal) || amountVal < 0) {
        setErrorMsg("Lütfen geçerli bir tutar girin.")
        setLoading(false)
        return
    }
    if (formData.date > today) {
        setErrorMsg("Geleceğe yönelik tarih seçemezsiniz.")
        setLoading(false)
        return
    }

    const tableName = transaction.type === 'revenue' ? 'revenues' : 'expenses'

    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update({
        amount: amountVal,
        description: formData.description,
        date: formData.date,
        category: formData.category
      })
      .eq('id', transaction.id)
      .select()
      .single()

    setLoading(false)

    if (error) {
      setErrorMsg('Hata: ' + error.message)
    } else {
      if (updatedData) {
          const typedData: Transaction = { ...updatedData, type: transaction.type }
          onSuccess(typedData)
      }
      onClose()
    }
  }

  const inputClass = "w-full px-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-black rounded-[1.5rem] outline-none transition-all font-medium text-gray-900"
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-2 ml-2"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-70 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-black text-2xl text-gray-900 tracking-tight">İşlemi Düzenle</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          {errorMsg && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-3"><AlertCircle size={20} /> {errorMsg}</div>}

          <div className={`text-center py-3 rounded-2xl font-bold text-xs uppercase tracking-widest ${transaction.type === 'revenue' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {transaction.type === 'revenue' ? 'Gelir Kaydı' : 'Gider Kaydı'}
          </div>

          <div><label className={labelClass}>Açıklama</label><input type="text" required className={inputClass} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>

          <div className="grid grid-cols-2 gap-4">
            {/* ETİKETTEKİ TL İBARESİ YERİNE DİNAMİK SEMBOL */}
            <div><label className={labelClass}>Tutar ({symbol})</label><input type="number" required className={`${inputClass} font-bold text-lg`} value={formData.amount || ''} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></div>
            <div><label className={labelClass}>Tarih</label><input type="date" required max={today} className={`${inputClass} cursor-pointer appearance-none`} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} /></div>
          </div>

          <div><label className={labelClass}>Kategori</label><input type="text" className={inputClass} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></div>

          <div className="flex gap-4 pt-4 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-gray-600 bg-gray-100 rounded-3xl hover:bg-gray-200 transition-colors">İptal</button>
            <button type="submit" disabled={loading} className="flex-2 py-4 font-bold text-white bg-black rounded-3xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-black/10">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Kaydet</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}