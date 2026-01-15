'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, Megaphone, Calendar, Search, ArrowRight, CheckCircle2, AlertCircle, Calculator } from 'lucide-react'

interface AdDistributorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AdDistributorModal({ isOpen, onClose, onSuccess }: AdDistributorModalProps) {
  const supabase = createClient()
  const [step, setStep] = useState<'input' | 'preview' | 'saving'>('input')
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [platform, setPlatform] = useState('Meta Ads')
  const [selectedProductId, setSelectedProductId] = useState<string>('all') // 'all' veya product_id
  
  // Data State
  const [products, setProducts] = useState<{id: string, name: string}[]>([])
  const [impactAnalysis, setImpactAnalysis] = useState<{
    orderCount: number, 
    costPerOrder: number, 
    productName: string
  } | null>(null)

  // Ürünleri Çek
  useEffect(() => {
    if (!isOpen) return
    const loadProducts = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from('products').select('id, name').eq('user_id', user.id)
        if (data) setProducts(data)
        
        // Reset
        setStep('input')
        setAmount('')
        setImpactAnalysis(null)
    }
    loadProducts()
  }, [isOpen])

  // --- ANALİZ ET (DAĞITIM HESABI) ---
  const analyzeDistribution = async () => {
    if (!amount || Number(amount) <= 0) return alert("Lütfen geçerli bir tutar girin.")
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. İlgili Siparişleri Bul
    let query = supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('order_date', date) // Sadece o günün siparişleri

    if (selectedProductId !== 'all') {
        query = query.eq('product_id', selectedProductId)
    }

    const { data: orders, error } = await query

    if (error || !orders) {
        alert("Sipariş verisi çekilemedi.")
        return
    }

    if (orders.length === 0) {
        alert("Seçilen tarihte ve üründe hiç sipariş bulunamadı! Dağıtım yapılamaz.")
        return
    }

    // 2. Matematiği Yap
    const totalCost = parseFloat(amount)
    const count = orders.length
    const costPerOrder = totalCost / count

    setImpactAnalysis({
        orderCount: count,
        costPerOrder: costPerOrder,
        productName: selectedProductId === 'all' ? 'Tüm Ürünler' : products.find(p => p.id === selectedProductId)?.name || 'Ürün'
    })
    
    setStep('preview')
  }

  // --- KAYDET VE DAĞIT ---
  const handleSave = async () => {
    setStep('saving')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
        // ADIM 1: Gider Kaydı Oluştur (Muhasebe için)
        await supabase.from('ad_spends').insert({
            user_id: user.id,
            date: date,
            amount: parseFloat(amount),
            platform: platform,
            campaign_name: `${impactAnalysis?.productName} Dağıtımı`,
            related_product_sku: selectedProductId === 'all' ? null : selectedProductId
        })

        // ADIM 2: Siparişleri Güncelle (Maliyet Giydirme)
        // Not: RLS politikaları ve Supabase update mantığı gereği loop ile veya toplu update ile yapabiliriz.
        // Basitlik için tekrar query atıp ID'leri alıyoruz.
        
        let query = supabase.from('orders').select('id, ad_cost_allocated').eq('user_id', user.id).eq('order_date', date)
        if (selectedProductId !== 'all') query = query.eq('product_id', selectedProductId)
        
        const { data: ordersToUpdate } = await query

        if (ordersToUpdate) {
            // Her siparişe ekle (Mevcut varsa üstüne ekle)
            const updates = ordersToUpdate.map(async (order) => {
                const newAdCost = (Number(order.ad_cost_allocated) || 0) + (impactAnalysis?.costPerOrder || 0)
                
                await supabase
                    .from('orders')
                    .update({ ad_cost_allocated: newAdCost }) // DB net_profit'i otomatik güncelleyecek
                    .eq('id', order.id)
            })
            
            await Promise.all(updates)
        }

        onSuccess()
        onClose()

    } catch (error: any) {
        alert("Hata: " + error.message)
        setStep('input')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Megaphone className="text-purple-600" size={24}/> 
                Reklam Dağıtıcı
            </h3>
            <p className="text-xs text-gray-500 font-bold mt-1">Harcamayı siparişlere giydir.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-black transition-colors"><X size={20}/></button>
        </div>

        {/* CONTENT */}
        <div className="p-8">
            
            {step === 'input' && (
                <div className="space-y-5">
                    {/* Tarih */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Harcama Tarihi</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-100 border border-transparent focus:border-purple-200"
                        />
                    </div>

                    {/* Platform */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Platform</label>
                        <select 
                            value={platform} 
                            onChange={(e) => setPlatform(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-100 border-r-[16px] border-r-transparent"
                        >
                            <option value="Meta Ads">Meta Ads (Instagram/FB)</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="TikTok Ads">TikTok Ads</option>
                            <option value="Influencer">Influencer</option>
                        </select>
                    </div>

                    {/* Tutar */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Toplam Harcama</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₺</span>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl font-black text-gray-900 text-lg outline-none focus:ring-2 focus:ring-purple-100 border border-transparent focus:border-purple-200"
                            />
                        </div>
                    </div>

                    {/* Ürün Seçimi */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Hangi Ürüne?</label>
                        <select 
                            value={selectedProductId} 
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-purple-100 border-r-[16px] border-r-transparent text-sm"
                        >
                            <option value="all">🌍 Genel Dağıtım (Tüm Siparişlere)</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-2 ml-1 leading-snug">
                            * Genel dağıtım seçerseniz, tutar o günkü <b>tüm</b> siparişlere eşit bölünür.
                        </p>
                    </div>

                    <button onClick={analyzeDistribution} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mt-4">
                        Analiz Et <ArrowRight size={18}/>
                    </button>
                </div>
            )}

            {step === 'preview' && impactAnalysis && (
                <div className="animate-in slide-in-from-right-8">
                    <div className="bg-purple-50 p-6 rounded-[2rem] text-center mb-6 border border-purple-100">
                        <div className="text-purple-900 font-bold text-sm mb-1">{impactAnalysis.productName}</div>
                        <div className="text-4xl font-black text-purple-600 tracking-tighter">
                            {impactAnalysis.orderCount} Sipariş
                        </div>
                        <div className="text-purple-400 text-xs font-bold uppercase mt-1">Bulundu</div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-sm font-bold text-gray-500">Toplam Harcama</span>
                            <span className="text-sm font-black text-gray-900">{parseFloat(amount).toFixed(2)} TL</span>
                        </div>
                        <div className="flex justify-between items-center px-2 py-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-bold text-gray-900">Sipariş Başına Maliyet</span>
                            <span className="text-lg font-black text-rose-500">-{impactAnalysis.costPerOrder.toFixed(2)} TL</span>
                        </div>
                        <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-xl text-yellow-800 text-xs font-medium">
                            <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                            Bu işlem, ilgili {impactAnalysis.orderCount} siparişin "Net Kâr"ını otomatik olarak düşürecektir.
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setStep('input')} className="py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Geri Dön</button>
                        <button onClick={handleSave} className="py-3 bg-black text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2">
                            <CheckCircle2 size={18}/> Onayla
                        </button>
                    </div>
                </div>
            )}

            {step === 'saving' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Siparişlere Dağıtılıyor...</p>
                </div>
            )}

        </div>
      </div>
    </div>
  )
}