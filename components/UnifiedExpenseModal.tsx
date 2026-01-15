'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Building2, Megaphone, Package, Loader2, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UnifiedExpenseModalProps {
  isOpen: boolean
  onClose: () => void
}

type ExpenseType = 'fixed' | 'ads' | 'cogs'

export default function UnifiedExpenseModal({ isOpen, onClose }: UnifiedExpenseModalProps) {
  const [activeTab, setActiveTab] = useState<ExpenseType>('fixed')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // ORTAK STATE
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  
  // SABİT GİDER İÇİN
  const [category, setCategory] = useState('Abonelik')
  const [description, setDescription] = useState('')

  // REKLAM İÇİN
  const [platform, setPlatform] = useState('Meta Ads')
  const [campaign, setCampaign] = useState('')
  const [relatedSku, setRelatedSku] = useState('') // Zombi ürün tespiti için kritik

  // OPERASYONEL İÇİN
  const [cogsDescription, setCogsDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı yok')

      let error = null

      if (activeTab === 'fixed') {
        // 1. SABİT GİDER KAYDI
        const { error: err } = await supabase.from('fixed_expenses').insert({
          user_id: user.id,
          category,
          amount: parseFloat(amount),
          date,
          description
        })
        error = err
      } 
      else if (activeTab === 'ads') {
        // 2. REKLAM HARCAMASI (HAYALET ÜRÜN İÇİN SKU GİRİLEBİLİR)
        const { error: err } = await supabase.from('ad_spends').insert({
          user_id: user.id,
          platform,
          amount: parseFloat(amount),
          date,
          campaign_name: campaign,
          related_product_sku: relatedSku || null // Boşsa genel marka gideri olur
        })
        error = err
      }
      else {
        // 3. ESKİ OPERASYONEL GİDER (Legacy)
        const { error: err } = await supabase.from('expenses').insert({
          user_id: user.id,
          amount: parseFloat(amount),
          date,
          description: cogsDescription || 'Operasyonel Gider',
          category: 'Genel'
        })
        error = err
      }

      if (error) throw error
      
      // Başarılı
      router.refresh()
      onClose()
      // Formu sıfırla
      setAmount('')
      setDescription('')
      setCampaign('')
      setRelatedSku('')
      
    } catch (err) {
      console.error(err)
      alert('Gider eklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-black text-gray-900">Yeni Gider Girişi</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {/* TABLAR */}
        <div className="flex p-2 gap-2 bg-white border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('fixed')}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'fixed' ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            <Building2 size={16} /> Sabit Gider
          </button>
          <button 
            onClick={() => setActiveTab('ads')}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'ads' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            <Megaphone size={16} /> Reklam
          </button>
          <button 
            onClick={() => setActiveTab('cogs')}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'cogs' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            <Package size={16} /> Ürün/Diğer
          </button>
        </div>

        {/* FORM ALANI */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. TUTAR VE TARİH (ORTAK) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tutar (TL)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-lg outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tarih</label>
                <div className="relative">
                    <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-black/5 text-sm"
                    />
                    <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 my-2"></div>

            {/* 2. ÖZEL ALANLAR (TAB'A GÖRE DEĞİŞİR) */}
            
            {/* --- SABİT GİDER FORMU --- */}
            {activeTab === 'fixed' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kategori</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-black/5 text-sm"
                  >
                    <option>Abonelik (Shopify, App)</option>
                    <option>Maaş / Hizmet</option>
                    <option>Vergi / Muhasebe</option>
                    <option>Ofis / Kira</option>
                    <option>Diğer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Açıklama</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Örn: Shopify Aylık Ödeme"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-black/5 text-sm"
                  />
                </div>
              </div>
            )}

            {/* --- REKLAM GİDERİ FORMU --- */}
            {activeTab === 'ads' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 font-medium">
                  💡 İpucu: Eğer bu reklamı belli bir ürün için harcadıysan <strong>SKU</strong> gir. Böylece o ürün hiç satmasa bile maliyetini hesaplarız.
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Platform</label>
                  <select 
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  >
                    <option>Meta Ads (FB/IG)</option>
                    <option>Google Ads</option>
                    <option>TikTok Ads</option>
                    <option>Influencer</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kampanya Adı</label>
                        <input 
                            type="text" 
                            value={campaign}
                            onChange={e => setCampaign(e.target.value)}
                            placeholder="Örn: Kış İndirimi"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">İlgili Ürün (SKU)</label>
                        <input 
                            type="text" 
                            value={relatedSku}
                            onChange={e => setRelatedSku(e.target.value)}
                            placeholder="Opsiyonel"
                            className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                    </div>
                </div>
              </div>
            )}

            {/* --- OPERASYONEL GİDER FORMU --- */}
            {activeTab === 'cogs' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Açıklama</label>
                  <input 
                    type="text" 
                    value={cogsDescription}
                    onChange={e => setCogsDescription(e.target.value)}
                    placeholder="Örn: Kargo ödemesi, Paketleme malzemesi..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                  />
                </div>
              </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white font-bold py-4 rounded-xl mt-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Gideri Kaydet'}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}