'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Loader2, Calendar, Hash, Tag, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

// STANDART KATEGORİ LİSTESİ (Bunu global bir sabit de yapabiliriz)
const PREDEFINED_CATEGORIES = [
  'Ürün Maliyeti',
  'Kargo & Lojistik',
  'Dijital Pazarlama',
  'Komisyonlar',
  'Yazılım & Abonelik',
  'Personel & Ofis',
  'Vergi & Yasal',
  'Diğer'
]

export default function AddTransactionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income')
  const [loading, setLoading] = useState(false)
  const [customCategories, setCustomCategories] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Diğer', // Varsayılan seçim
    date: new Date().toISOString().split('T')[0]
  })

  const supabase = createClient()
  const router = useRouter()

  // Kullanıcının "Finansal Ayarlar"da oluşturduğu özel bütçe kategorilerini de çekelim
  useEffect(() => {
    const fetchCustomCategories = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('category_budgets').select('category_name').eq('user_id', user.id)
        if (data) {
          const budgetCats = data.map(b => b.category_name)
          setCustomCategories(budgetCats)
        }
      }
    }
    if (isOpen) fetchCustomCategories()
  }, [isOpen])

  // Birleştirilmiş Benzersiz Kategori Listesi
  const allCategories = Array.from(new Set([...PREDEFINED_CATEGORIES, ...customCategories]))

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const table = activeTab === 'income' ? 'revenues' : 'expenses'
    const payload = {
      user_id: user.id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: activeTab === 'expense' ? formData.category : 'Satış Geliri', // Gelirde kategori sabit olabilir
      date: formData.date
    }

    await supabase.from(table).insert(payload)
    
    setLoading(false)
    setFormData({ amount: '', description: '', category: 'Diğer', date: new Date().toISOString().split('T')[0] })
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Yeni İşlem</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
            <button onClick={() => setActiveTab('income')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'income' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Gelir</button>
            <button onClick={() => setActiveTab('expense')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'expense' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Gider</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Tutar</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input required type="number" step="0.01" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-lg focus:ring-2 focus:ring-black/5 transition-all" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
            </div>

            {activeTab === 'expense' && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Kategori</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  {/* INPUT YERİNE SELECT KULLANIYORUZ */}
                  <select 
                    className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-gray-700 appearance-none cursor-pointer focus:ring-2 focus:ring-black/5 transition-all"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Açıklama</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input required type="text" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-gray-700 focus:ring-2 focus:ring-black/5 transition-all" placeholder="Örn: Google Ads Faturası" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase ml-1 mb-2">Tarih</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="date" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-gray-700 focus:ring-2 focus:ring-black/5 transition-all" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>

            <button disabled={loading} type="submit" className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-xl transition-all active:scale-95 ${activeTab === 'income' ? 'bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600' : 'bg-rose-500 shadow-rose-200 hover:bg-rose-600'}`}>
              {loading ? <Loader2 className="animate-spin mx-auto" /> : (activeTab === 'income' ? 'Gelir Ekle' : 'Gider Ekle')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}