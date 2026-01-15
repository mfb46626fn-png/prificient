'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X, UploadCloud, FileSpreadsheet, Check, AlertTriangle, ArrowRight, Save, Trash2, RefreshCw, Activity, Wand2, Globe } from 'lucide-react'
// Platform Zekası İmportu
import { estimatePlatformFees } from '@/utils/platform-intelligence'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  type?: 'income' | 'expense'
}

type UnifiedRow = {
  id: string
  date: string
  description: string
  type: string
  
  unit_price: number 
  quantity: number
  unit_cost: number 
  total_amount: number // Toplam Satış Tutarı (Hesaplama için)
  
  shipping_cost_total: number
  platform_fee_total: number
  
  product_name: string
  platform: string
  isValid: boolean
  missingInfo: string[]
  isFeeEstimated?: boolean
}

// Platform Listesi (Dropdown için)
const PLATFORM_OPTIONS = [
    { value: 'shopify', label: 'Shopify' },
    { value: 'trendyol', label: 'Trendyol' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'etsy', label: 'Etsy' },
    { value: 'hepsiburada', label: 'Hepsiburada' },
    { value: 'manual', label: 'Manuel / Diğer' },
]

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'saving'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<UnifiedRow[]>([])
  const [logs, setLogs] = useState<string[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) resetState()
  }, [isOpen])

  const resetState = () => {
      setStep('upload')
      setFile(null)
      setData([])
      setLogs([])
      if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
      resetState()
      onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const removeFile = (e: React.MouseEvent) => {
      e.stopPropagation()
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startAnalysis = async () => {
    if (!file) return
    setStep('processing')
    setLogs(['Dosya yükleniyor...', 'AI verileri tarıyor...', 'Platform kuralları uygulanıyor...'])

    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('https://uare7j5h.rpcld.cc/webhook/upload-finance-file', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Sunucu Hatası: n8n yanıt vermedi.')
      const rawResponse = await res.json()
      
      let safeArray: any[] = []
      if (rawResponse.data && Array.isArray(rawResponse.data)) {
          safeArray = rawResponse.data
      } else if (Array.isArray(rawResponse)) {
          safeArray = rawResponse
      } else {
          safeArray = [rawResponse]
      }

      if (safeArray.length === 0) throw new Error("Veri boş")

      const processed: UnifiedRow[] = safeArray.map((item: any, idx: number) => {
        const productName = item.product_name || item.description || ''
        const date = item.date || new Date().toISOString().split('T')[0]
        
        const qty = parseFloat(item.quantity) || 1
        const unitPrice = parseFloat(item.unit_price) || 0
        const unitCost = parseFloat(item.unit_cost) || 0
        const totalAmount = parseFloat(item.total_amount) || (unitPrice * qty)
        
        const finalUnitPrice = unitPrice > 0 ? unitPrice : (totalAmount / qty)

        // --- PLATFORM ZEKA ---
        let platformFee = parseFloat(item.platform_fee_total) || 0
        let isEstimated = false
        // AI platformu bulamazsa boş string gelebilir, varsayılanı 'shopify' yapalım
        const rawPlatform = item.platform ? item.platform.toLowerCase() : 'shopify'
        
        // Gelen veri içinde platform adını temizle (eşleşme için)
        const matchedPlatform = PLATFORM_OPTIONS.find(p => rawPlatform.includes(p.value))?.value || 'shopify'

        // Eğer komisyon 0 geldiyse, biz hesaplayalım
        if (platformFee <= 0 && finalUnitPrice > 0) {
            const estimation = estimatePlatformFees(matchedPlatform, totalAmount)
            platformFee = estimation.estimatedFee
            isEstimated = true
        }

        const missing = []
        if (!date) missing.push('Tarih')
        if (finalUnitPrice <= 0) missing.push('Satış Fiyatı')
        if (!productName) missing.push('Ürün Adı') 

        return {
          id: `row-${idx}-${Math.random().toString(36).substr(2,5)}`,
          date: date,
          description: item.description || `${productName} Satışı`,
          type: 'order', 
          unit_price: finalUnitPrice,
          quantity: qty,
          unit_cost: unitCost,
          total_amount: totalAmount,
          shipping_cost_total: parseFloat(item.shipping_cost_total) || 0,
          platform_fee_total: platformFee, 
          product_name: productName,
          platform: matchedPlatform,
          isValid: missing.length === 0,
          missingInfo: missing,
          isFeeEstimated: isEstimated
        }
      })

      setData(processed)
      setStep('review')

    } catch (error: any) {
      alert(`Hata: ${error.message}`)
      setStep('upload')
      setFile(null)
    }
  }

  // --- SATIR GÜNCELLEME VE OTOMATİK HESAPLAMA ---
  const updateRow = (id: string, field: keyof UnifiedRow, value: any) => {
    setData(prev => prev.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value }
        
        // EĞER PLATFORM DEĞİŞTİRİLDİYSE -> KOMİSYONU YENİDEN HESAPLA
        if (field === 'platform') {
            const estimation = estimatePlatformFees(value, row.total_amount)
            updated.platform_fee_total = estimation.estimatedFee
            updated.isFeeEstimated = true // Yeniden hesaplandığını belirt
        }

        // Validasyon
        const missing = []
        if (!updated.date) missing.push('Tarih')
        if (updated.unit_price <= 0) missing.push('Satış Fiyatı')
        if (!updated.product_name) missing.push('Ürün Adı')
        updated.missingInfo = missing
        updated.isValid = missing.length === 0
        
        // Elle komisyon girilirse oto-hesap bayrağını kaldır
        if (field === 'platform_fee_total') updated.isFeeEstimated = false
        
        return updated
      }
      return row
    }))
  }

  const deleteRow = (id: string) => {
    setData(prev => prev.filter(r => r.id !== id))
  }

  const saveToDatabase = async () => {
    setStep('saving')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      for (const row of data) {
        const cleanProductName = row.product_name?.trim()
        let productId: string | null = null;

        if (cleanProductName) {
            const { data: existingProduct } = await supabase
                .from('products')
                .select('id')
                .eq('name', cleanProductName)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingProduct) {
                productId = existingProduct.id;
            } else {
                const { data: newProduct } = await supabase
                    .from('products')
                    .insert({
                        user_id: user.id,
                        name: cleanProductName,
                        product_key: cleanProductName.toLowerCase().replace(/\s/g, '_'),
                    })
                    .select('id')
                    .single();
                
                if (newProduct) productId = newProduct.id;
            }
        }

        if (!productId) continue; 

        // Karar (Decision) Kontrolü
        const { data: lastOrder } = await supabase
            .from('orders')
            .select('sale_price')
            .eq('product_id', productId)
            .order('order_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastOrder && Number(lastOrder.sale_price) !== row.unit_price) {
            await supabase.from('decisions').insert({
                user_id: user.id,
                product_id: productId,
                decision_type: 'price_change',
                old_value: lastOrder.sale_price,
                new_value: row.unit_price,
                decision_date: row.date
            });
        }

        const { data: newOrder } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                product_id: productId,
                platform: row.platform,
                order_date: row.date,
                quantity: row.quantity,
                sale_price: row.unit_price,
                unit_cost: row.unit_cost,
                shipping_cost: row.shipping_cost_total,
                platform_fee: row.platform_fee_total,
                raw_data: row 
            })
            .select('id')
            .single();

        if (newOrder) {
            await supabase.from('events').insert({
                user_id: user.id,
                event_type: 'order_created',
                related_order_id: newOrder.id,
                related_product_id: productId,
                event_date: row.date,
                description: `${row.quantity} adet ${cleanProductName} satıldı.`
            });
        }
      }

      onSuccess()
      handleClose()

    } catch (error: any) {
      console.error("Kayıt Hatası:", error)
      alert(`İşlem Durduruldu: ${error.message}`)
      setStep('review')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-[95vw] h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* HEADER */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Activity className="text-emerald-600"/> 
                Akıllı Veri Girişi
            </h3>
            <p className="text-xs text-gray-500 font-bold mt-1">
              {step === 'upload' ? 'Sipariş listesini yükleyin.' : 'Verileri kontrol edin ve platformu seçin.'}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"><X size={24}/></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50">
          
          {step === 'upload' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
               <div 
                 onClick={() => !file && fileInputRef.current?.click()} 
                 className={`w-full max-w-lg h-64 border-3 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all group relative ${file ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-300 hover:border-emerald-500 hover:bg-white cursor-pointer'}`}
               >
                  {file ? (
                      <>
                        <FileSpreadsheet size={48} className="text-emerald-600 mb-4"/>
                        <p className="font-bold text-lg text-emerald-900">{file.name}</p>
                        <p className="text-sm text-emerald-600 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                        <button onClick={removeFile} className="absolute top-4 right-4 p-2 bg-white rounded-full text-rose-500 hover:bg-rose-50 shadow-sm border border-rose-100 transition-all z-20"><Trash2 size={18} /></button>
                      </>
                  ) : (
                      <>
                        <UploadCloud size={48} className="text-gray-300 group-hover:text-emerald-500 transition-colors mb-4"/>
                        <p className="font-bold text-gray-400 group-hover:text-gray-600">Sipariş Dosyasını Sürükle</p>
                      </>
                  )}
                  <input ref={fileInputRef} type="file" accept=".csv, .xlsx" className="hidden" onChange={handleFileChange} />
               </div>
               {file && (
                   <button onClick={startAnalysis} className="mt-6 px-10 py-4 bg-black text-white font-bold rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-black/10">
                       Analizi Başlat <ArrowRight size={20}/>
                   </button>
               )}
            </div>
          )}

          {step === 'processing' && (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center space-y-2">
                    {logs.map((l, i) => <p key={i} className="text-sm font-bold text-gray-600 animate-in slide-in-from-bottom-2">{l}</p>)}
                </div>
             </div>
          )}

          {step === 'review' && (
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                        <tr>
                        <th className="px-4 py-3 font-black text-gray-400 uppercase">Durum</th>
                        <th className="px-4 py-3 font-black text-gray-400 uppercase">Tarih</th>
                        <th className="px-4 py-3 font-black text-gray-400 uppercase bg-blue-50/30 border-l border-gray-100">Ürün Adı</th>
                        <th className="px-4 py-3 font-black text-gray-400 uppercase bg-emerald-50/30">Adet</th>
                        <th className="px-4 py-3 font-black text-gray-400 uppercase bg-emerald-50/30">Satış Fiyatı</th>
                        
                        {/* YENİ: PLATFORM SEÇİMİ */}
                        <th className="px-4 py-3 font-black text-gray-400 uppercase bg-purple-50/30 border-l border-gray-100 text-purple-700">Platform</th>
                        
                        <th className="px-4 py-3 font-black text-gray-400 uppercase bg-rose-50/30 border-l border-gray-100 text-rose-700">Kargo</th>
                        <th className="px-4 py-3 font-black text-gray-400 uppercase bg-rose-50/30 text-rose-700">Komisyon</th>
                        
                        <th className="px-4 py-3 font-black text-gray-400 uppercase">Sil</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row) => (
                        <tr key={row.id} className={`hover:bg-gray-50/80 transition-colors ${!row.isValid ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3 text-center">
                                {row.isValid ? <Check size={16} className="text-emerald-500"/> : <AlertTriangle size={16} className="text-rose-500"/>}
                            </td>
                            <td className="px-4 py-3"><input type="date" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} className="bg-transparent font-bold outline-none w-24"/></td>
                            
                            <td className="px-4 py-3 border-l border-gray-100 bg-blue-50/10"><input type="text" value={row.product_name} onChange={e => updateRow(row.id, 'product_name', e.target.value)} className="bg-transparent w-40 outline-none"/></td>
                            <td className="px-4 py-3 bg-emerald-50/10"><input type="number" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', parseFloat(e.target.value))} className="bg-transparent font-medium w-12 text-center outline-none"/></td>
                            <td className="px-4 py-3 bg-emerald-50/10"><input type="number" value={row.unit_price} onChange={e => updateRow(row.id, 'unit_price', parseFloat(e.target.value))} className="bg-transparent font-black w-20 outline-none text-emerald-900"/></td>
                            
                            {/* YENİ: PLATFORM DROPDOWN (Değişince Fiyat Hesaplanır) */}
                            <td className="px-4 py-3 bg-purple-50/10 border-l border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Globe size={14} className="text-purple-400"/>
                                    <select 
                                        value={row.platform} 
                                        onChange={e => updateRow(row.id, 'platform', e.target.value)} 
                                        className="bg-transparent font-bold text-purple-700 outline-none cursor-pointer w-24"
                                    >
                                        {PLATFORM_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                            
                            <td className="px-4 py-3 border-l border-gray-100 bg-rose-50/10"><input type="number" value={row.shipping_cost_total} onChange={e => updateRow(row.id, 'shipping_cost_total', parseFloat(e.target.value))} className="bg-transparent font-medium w-16 text-rose-600 outline-none focus:font-bold"/></td>
                            
                            {/* KOMİSYON (OTO GÜNCELLENEN) */}
                            <td className="px-4 py-3 bg-rose-50/10 relative group">
                                <input type="number" value={row.platform_fee_total} onChange={e => updateRow(row.id, 'platform_fee_total', parseFloat(e.target.value))} className={`bg-transparent font-medium w-16 outline-none focus:font-bold ${row.isFeeEstimated ? 'text-purple-600 font-bold' : 'text-orange-600'}`}/>
                                {row.isFeeEstimated && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2" title="Otomatik Hesaplandı">
                                        <Wand2 size={12} className="text-purple-500 animate-pulse"/>
                                    </div>
                                )}
                            </td>
                            
                            <td className="px-4 py-3"><button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-rose-600"><Trash2 size={16}/></button></td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {step === 'review' && (
            <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center z-10">
                <div className="flex gap-4 text-xs font-bold text-gray-500 items-center">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg">Toplam {data.length} Sipariş</span>
                    {data.some(r => r.isFeeEstimated) && (
                        <span className="flex items-center gap-1.5 text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                            <Wand2 size={14}/> Platform komisyonları güncellendi
                        </span>
                    )}
                </div>
                <div className="flex gap-3">
                    <button onClick={resetState} className="px-6 py-3 bg-gray-100 font-bold rounded-xl flex items-center gap-2"><RefreshCw size={16}/> Sıfırla</button>
                    <button onClick={saveToDatabase} disabled={data.some(r => !r.isValid)} className="px-8 py-3 bg-black text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><Save size={18}/> Hepsini Kaydet</button>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}