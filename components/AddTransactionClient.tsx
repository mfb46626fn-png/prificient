'use client'

import React, { useState } from 'react'
import { Plus, Minus, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddTransaction() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'revenue' | 'expense'>('revenue')
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const table = type === 'revenue' ? 'revenues' : 'expenses'
    const payload = {
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      user_id: user.id,
      ...(type === 'expense' && { category: formData.category || 'Genel' })
    }

    const { error } = await supabase.from(table).insert([payload])

    if (!error) {
      setIsOpen(false)
      setFormData({ amount: '', category: '', date: new Date().toISOString().split('T')[0], description: '' })
      router.refresh() // Veriyi ekrana düşüren kritik komut
    }
    setLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-sm"
      >
        <Plus size={18} /> Yeni Ekle
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`p-6 ${type === 'revenue' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">İşlem Ekle</h2>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/10 rounded-full"><X size={20}/></button>
              </div>
              <div className="flex p-1 bg-gray-200/50 rounded-xl">
                <button onClick={() => setType('revenue')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'revenue' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>Gelir</button>
                <button onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}>Gider</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Miktar</label>
                <input required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full text-3xl font-bold py-2 border-b-2 border-gray-100 focus:border-blue-500 outline-none transition-colors" placeholder="0.00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Tarih</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full mt-1 p-2 bg-gray-50 rounded-lg border text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Kategori</label>
                  <input disabled={type === 'revenue'} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder={type === 'revenue' ? 'Gelir' : 'örn: Reklam'} className="w-full mt-1 p-2 bg-gray-50 rounded-lg border text-sm outline-none disabled:opacity-50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Açıklama</label>
                <input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full mt-1 p-2 bg-gray-50 rounded-lg border text-sm outline-none" placeholder="İsteğe bağlı..." />
              </div>
              <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white transition-all ${type === 'revenue' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                {loading ? 'Kaydediliyor...' : 'İşlemi Kaydet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}