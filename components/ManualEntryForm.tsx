'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ArrowUpCircle, ArrowDownCircle, CheckCircle2, Loader2 } from 'lucide-react'

export default function ManualEntryForm() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const [formData, setFormData] = useState({
    type: 'expense', // Varsayılan: Gider
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0] // Bugünün tarihi
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')

    const tableName = formData.type === 'revenue' ? 'revenues' : 'expenses'
    const user = (await supabase.auth.getUser()).data.user

    if (!user) {
        alert("Giriş yapmanız gerekiyor.")
        setLoading(false)
        return
    }

    const { error } = await supabase.from(tableName).insert({
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      user_id: user.id
    })

    setLoading(false)

    if (error) {
      console.error(error)
      setStatus('error')
      alert('Hata: ' + error.message)
    } else {
      setStatus('success')
      // Formu temizle
      setFormData({ ...formData, amount: '', description: '', category: '' })
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      
      {/* Tip Seçimi */}
      <div className="flex gap-4">
        <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${formData.type === 'revenue' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
          <input 
            type="radio" 
            name="type" 
            value="revenue" 
            className="hidden" 
            onChange={() => setFormData({...formData, type: 'revenue'})}
            checked={formData.type === 'revenue'}
          />
          <ArrowUpCircle className={formData.type === 'revenue' ? 'text-emerald-600' : 'text-gray-400'} />
          <span className={`font-bold ${formData.type === 'revenue' ? 'text-emerald-700' : 'text-gray-500'}`}>Gelir</span>
        </label>

        <label className={`flex-1 cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${formData.type === 'expense' ? 'border-rose-500 bg-rose-50' : 'border-gray-100 hover:border-gray-200'}`}>
          <input 
            type="radio" 
            name="type" 
            value="expense" 
            className="hidden" 
            onChange={() => setFormData({...formData, type: 'expense'})}
            checked={formData.type === 'expense'}
          />
          <ArrowDownCircle className={formData.type === 'expense' ? 'text-rose-600' : 'text-gray-400'} />
          <span className={`font-bold ${formData.type === 'expense' ? 'text-rose-700' : 'text-gray-500'}`}>Gider</span>
        </label>
      </div>

      {/* Form Alanları */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Tutar</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₺</span>
            <input 
              type="number" 
              required
              className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-lg"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Açıklama</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            placeholder="Örn: Market alışverişi"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="Örn: Gıda"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tarih</label>
            <input 
              type="date" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : 'Kaydet'}
      </button>

      {status === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={20} />
          <span className="font-bold">Kayıt başarıyla eklendi!</span>
        </div>
      )}

    </form>
  )
}