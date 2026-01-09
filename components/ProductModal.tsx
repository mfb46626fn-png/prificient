'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Save, X, AlertTriangle, CheckCircle2, Package, TrendingUp, RefreshCcw, Loader2, Settings2, Sparkles, ArrowRight } from 'lucide-react'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { useFinancialConfig } from '@/app/contexts/FinancialConfigContext'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  productToEdit?: any
}

export default function ProductModal({ isOpen, onClose, onSuccess, productToEdit }: ProductModalProps) {
  const supabase = createClient()
  const { symbol } = useCurrency()
  const { config } = useFinancialConfig()

  const [saving, setSaving] = useState(false)
  const [useCustomSettings, setUseCustomSettings] = useState(false)

  // --- FORM DATASI ---
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    marketplace: 'Shopify',
    cost_price: '',
    selling_price: '',
    stock_quantity: ''
  })

  // --- ÖZEL AYARLAR ---
  const [customCommission, setCustomCommission] = useState(0)
  const [customProcessorFee, setCustomProcessorFee] = useState(0)
  const [customFixedFee, setCustomFixedFee] = useState(0)
  const [customLogistics, setCustomLogistics] = useState(0)
  const [customAdCost, setCustomAdCost] = useState(0)

  // Analiz ve Öneriler
  const [analysis, setAnalysis] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<any>(null)

  const smartRound = (num: number) => Math.ceil(num)

  // 1. MODAL AÇILINCA VERİLERİ DOLDUR
  useEffect(() => {
    if (isOpen) {
      // Varsayılanlar: Sadece Platform verilerini çek, Kargo ve Reklam 0 başlasın.
      if (config) {
        setCustomCommission(config.platformCommission)
        setCustomProcessorFee(config.paymentProcessorFee || 0)
        setCustomFixedFee(config.fixedPerOrderFee || 0)
        
        // DÜZELTME: Kargo ve Reklam artık globalden çekilmiyor, 0 başlıyor.
        setCustomLogistics(0) 
        setCustomAdCost(0)
      }

      if (productToEdit) {
        // DÜZENLEME MODU
        setFormData({
          name: productToEdit.name,
          sku: productToEdit.sku || '',
          marketplace: productToEdit.marketplace || (config?.selectedPlatform || 'Shopify'),
          cost_price: productToEdit.cost_price?.toString() || '',
          selling_price: productToEdit.selling_price?.toString() || '',
          stock_quantity: productToEdit.stock_quantity?.toString() || ''
        })
        
        // Kayıtlı kargo/reklam varsa getir
        setCustomLogistics(productToEdit.shipping_cost || 0)
        // Reklam verisi ürün bazlı tutulmuyorsa 0 kalır veya ayrı bir sütun varsa oradan çekilir.
        // Şimdilik reklam da 0 başlatıyoruz edit modunda (veritabanında reklam sütunu yoksa).
        
        // Özelleştirme menüsünü aç
        setUseCustomSettings(true)

      } else {
        // YENİ ÜRÜN MODU
        setFormData({
          name: '',
          sku: '',
          marketplace: config?.selectedPlatform || 'Shopify',
          cost_price: '',
          selling_price: '',
          stock_quantity: ''
        })
        setCustomLogistics(0)
        setCustomAdCost(0)
        setUseCustomSettings(false)
      }
    }
  }, [isOpen, productToEdit, config])

  // 2. HESAPLAMA MOTORU
  useEffect(() => {
    if (!config) return

    const sPrice = parseFloat(formData.selling_price) || 0
    const sCost = parseFloat(formData.cost_price) || 0

    // Aktif Değerleri Belirle
    // Eğer özelleştirme kapalıysa (Yeni ürün, varsayılan), Kargo ve Reklam 0 kabul edilir.
    const activeComm = useCustomSettings ? customCommission : config.platformCommission
    const activeProcessor = useCustomSettings ? customProcessorFee : (config.paymentProcessorFee || 0)
    const activeFixedFee = useCustomSettings ? customFixedFee : (config.fixedPerOrderFee || 0)
    const activeLogistics = useCustomSettings ? customLogistics : 0 
    const activeAdCost = useCustomSettings ? customAdCost : 0

    // --- FİYAT ÖNERİSİ MOTORU ---
    if (sCost > 0) {
        const calculatePrice = (targetMargin: number) => {
            const marginRate = targetMargin / 100
            const commRate = activeComm / 100
            const processorRate = activeProcessor / 100
            
            const totalRate = commRate + processorRate + marginRate
            const fixedCosts = sCost + activeLogistics + activeAdCost + activeFixedFee

            if (totalRate >= 1) return 0 
            
            return smartRound(fixedCosts / (1 - totalRate))
        }

        setSuggestions({
            min: calculatePrice(config.minMargin),
            target: calculatePrice(config.profitTargetPercent)
        })
    } else {
        setSuggestions(null)
    }

    // --- KÂR ANALİZİ ---
    if (sPrice > 0) {
        const commAmount = sPrice * (activeComm / 100)
        const processorAmount = sPrice * (activeProcessor / 100)
        
        const totalDeductions = commAmount + processorAmount + activeFixedFee + activeLogistics + activeAdCost
        const netProfit = sPrice - sCost - totalDeductions
        const profitMargin = (netProfit / sPrice) * 100

        let status = 'success'
        let message = 'Mükemmel! Hedef tuttu.'
        
        if (netProfit < 0) {
            status = 'danger'
            message = 'ZARAR RİSKİ!'
        } else if (profitMargin < config.minMargin) {
            status = 'warning'
            message = `Marj Düşük (%${profitMargin.toFixed(1)})`
        } else if (profitMargin < config.profitTargetPercent) {
            status = 'neutral'
            message = 'Hedefe Yakın'
        }

        setAnalysis({
            netProfit,
            profitMargin,
            commAmount,
            processorAmount,
            fixedFeeAmount: activeFixedFee,
            logisticsAdAmount: activeLogistics + activeAdCost,
            status,
            message,
            activeComm,
            activeProcessor
        })
    } else {
        setAnalysis(null)
    }

  }, [formData.selling_price, formData.cost_price, useCustomSettings, customCommission, customProcessorFee, customFixedFee, customLogistics, customAdCost, config])

  const applyPrice = (val: number) => {
      setFormData(prev => ({ ...prev, selling_price: val.toString() }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.selling_price) return alert("Ürün adı ve fiyat zorunludur.")
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        const finalSku = formData.sku.trim() === '' ? `PRD-${Math.floor(Date.now() / 1000)}` : formData.sku
        const payload = {
            user_id: user.id,
            name: formData.name,
            sku: finalSku,
            marketplace: formData.marketplace,
            cost_price: parseFloat(formData.cost_price) || 0,
            selling_price: parseFloat(formData.selling_price) || 0,
            stock_quantity: parseInt(formData.stock_quantity) || 0,
            shipping_cost: useCustomSettings ? customLogistics : 0 
        }

        const query = productToEdit 
            ? supabase.from('products').update(payload).eq('id', productToEdit.id)
            : supabase.from('products').insert(payload)
            
        const { error } = await query
        if (error) alert(error.message)
        else onSuccess()
    }
    setSaving(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white rounded-[2.5rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* HEADER */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{productToEdit ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
                    <p className="text-sm text-gray-500 font-bold mt-1">Yapay zeka destekli fiyatlandırma asistanı.</p>
                </div>
                <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors group">
                    <X size={24} className="text-gray-400 group-hover:text-black"/>
                </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* SOL: FORM (7/12) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* KİMLİK */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Package className="text-gray-400" size={18}/> Ürün Detayları
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Ürün Adı</label>
                                    <input type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-black/5" 
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Örn: Akıllı Kedi Su Pınarı" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">SKU</label>
                                    <input type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-black/5" 
                                        value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="Otomatik" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Pazaryeri</label>
                                    <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-black/5 cursor-pointer appearance-none" 
                                        value={formData.marketplace} onChange={e => setFormData({...formData, marketplace: e.target.value})}>
                                        <option value="Shopify">Shopify</option>
                                        <option value="Amazon">Amazon</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* FİNANSAL GİRİŞ */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" size={18}/> Maliyet ve Fiyat
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Alış Maliyeti</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{symbol}</span>
                                        <input type="number" className="w-full pl-10 pr-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100" 
                                            value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Satış Fiyatı</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{symbol}</span>
                                        <input type="number" className="w-full pl-10 pr-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-100" 
                                            value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Stok Adedi</label>
                                    <input type="number" className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5" 
                                        value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} placeholder="0" />
                                </div>
                            </div>

                            {/* GELİŞMİŞ AYARLAR TOGGLE */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg transition-colors ${useCustomSettings ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <Settings2 size={18} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold transition-colors ${useCustomSettings ? 'text-indigo-900' : 'text-gray-500'}`}>Bu Ürün İçin Özelleştir</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Komisyon ve işlem ücretlerini değiştir.</p>
                                        </div>
                                    </div>
                                    <div onClick={() => setUseCustomSettings(!useCustomSettings)} className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${useCustomSettings ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform duration-300 ${useCustomSettings ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>

                                {useCustomSettings ? (
                                    <div className="grid grid-cols-2 gap-4 mt-6 animate-in slide-in-from-top-2 fade-in bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1 mb-1 block">Komisyon (%)</label>
                                            <input type="number" value={customCommission} onChange={e => setCustomCommission(Number(e.target.value))} className="w-full px-4 py-3 bg-white rounded-xl font-bold text-sm border border-indigo-100 focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1 mb-1 block">Ödeme Altyapı (%)</label>
                                            <input type="number" value={customProcessorFee} onChange={e => setCustomProcessorFee(Number(e.target.value))} className="w-full px-4 py-3 bg-white rounded-xl font-bold text-sm border border-indigo-100 focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1 mb-1 block">Sabit Ücret ({symbol})</label>
                                            <input type="number" value={customFixedFee} onChange={e => setCustomFixedFee(Number(e.target.value))} className="w-full px-4 py-3 bg-white rounded-xl font-bold text-sm border border-indigo-100 focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1 mb-1 block">Kargo ({symbol})</label>
                                            <input type="number" value={customLogistics} onChange={e => setCustomLogistics(Number(e.target.value))} className="w-full px-4 py-3 bg-white rounded-xl font-bold text-sm border border-indigo-100 focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider ml-1 mb-1 block">Reklam ({symbol})</label>
                                            <input type="number" value={customAdCost} onChange={e => setCustomAdCost(Number(e.target.value))} className="w-full px-4 py-3 bg-white rounded-xl font-bold text-sm border border-indigo-100 focus:border-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 bg-gray-50 px-4 py-3 rounded-xl border border-dashed border-gray-200">
                                        <RefreshCcw size={12} className="text-gray-400"/>
                                        <span>Sistem: Kom %{config?.platformCommission}, Altyapı %{config?.paymentProcessorFee}, Sabit {symbol}{config?.fixedPerOrderFee}, Kargo {symbol}0</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SAĞ: ANALİZ (5/12) */}
                    <div className="lg:col-span-5 space-y-6 sticky top-8 h-fit">
                        
                        {/* 1. HESAPLAMA KARTI */}
                        {analysis ? (
                            <div className={`p-8 rounded-[2.5rem] shadow-2xl transition-all duration-500 border-[3px] bg-white relative overflow-hidden ${
                                analysis.status === 'danger' ? 'shadow-rose-500/20 border-rose-100' :
                                analysis.status === 'warning' ? 'shadow-amber-500/20 border-amber-100' :
                                'shadow-emerald-500/20 border-emerald-100'
                            }`}>
                                {/* Arkaplan Glow */}
                                <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-20 pointer-events-none ${
                                    analysis.status === 'danger' ? 'bg-rose-500' :
                                    analysis.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className={`p-2.5 rounded-2xl text-white shadow-lg ${
                                            analysis.status === 'danger' ? 'bg-rose-500' :
                                            analysis.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}>
                                            {analysis.status === 'danger' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
                                        </div>
                                        <div>
                                            <h4 className={`font-black text-sm uppercase tracking-wider ${
                                                analysis.status === 'danger' ? 'text-rose-600' :
                                                analysis.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                                            }`}>{analysis.status === 'danger' ? 'Kritik Seviye' : analysis.status === 'warning' ? 'İyileştirilmeli' : 'Harika Sonuç'}</h4>
                                            <p className="text-[10px] font-bold text-gray-400">{analysis.message}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-bold">Satış Fiyatı</span>
                                            <span className="font-black text-gray-900">{symbol}{parseFloat(formData.selling_price).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-bold">Alış Maliyeti</span>
                                            <span className="font-bold text-gray-900">-{symbol}{parseFloat(formData.cost_price).toFixed(2)}</span>
                                        </div>
                                        <div className="h-px bg-gray-100 my-2"></div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Komisyon (%{analysis.activeComm})</span>
                                            <span className="font-bold text-rose-500">-{symbol}{analysis.commAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Ödeme Altyapı (%{analysis.activeProcessor})</span>
                                            <span className="font-bold text-rose-500">-{symbol}{analysis.processorAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Sabit Ücret</span>
                                            <span className="font-bold text-rose-500">-{symbol}{analysis.fixedFeeAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-bold">Kargo & Reklam</span>
                                            <span className="font-bold text-rose-500">-{symbol}{analysis.logisticsAdAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="text-center bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TAHMİNİ NET KÂR</p>
                                        <div className={`text-5xl font-black tracking-tighter ${analysis.netProfit < 0 ? 'text-rose-500' : 'text-gray-900'}`}>
                                            {symbol}{analysis.netProfit.toFixed(2)}
                                        </div>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black mt-3 ${
                                            analysis.profitMargin < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            %{analysis.profitMargin.toFixed(1)} KÂR MARJI
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center h-full flex flex-col items-center justify-center opacity-60">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                                    <Package size={40} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2">Analiz Bekleniyor</h3>
                                <p className="text-sm text-gray-400 font-medium max-w-[200px] leading-relaxed">
                                    Sol taraftan maliyet ve satış fiyatını girin, yapay zeka anlık kârlılığınızı hesaplasın.
                                </p>
                            </div>
                        )}

                        {/* 2. AI FİYAT ÖNERİLERİ */}
                        {suggestions && (
                            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 relative overflow-hidden animate-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-2 mb-4 text-indigo-900">
                                    <div className="p-1.5 bg-indigo-200 rounded-lg text-indigo-800">
                                        <Sparkles size={16} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Yapay Zeka Önerisi</span>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm hover:border-indigo-300 transition-all">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MİNİMUM (%{config?.minMargin})</p>
                                            <p className="text-xl font-black text-indigo-950">{symbol}{suggestions.min}</p>
                                        </div>
                                        <button onClick={() => applyPrice(suggestions.min)} className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1">
                                            Uygula <ArrowRight size={12}/>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-indigo-500 shadow-md hover:scale-[1.02] transition-all">
                                        <div>
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">HEDEF (%{config?.profitTargetPercent})</p>
                                            <p className="text-xl font-black text-indigo-700">{symbol}{suggestions.target}</p>
                                        </div>
                                        <button onClick={() => applyPrice(suggestions.target)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-lg shadow-indigo-200">
                                            Uygula <ArrowRight size={12}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="p-6 md:p-8 border-t border-gray-100 bg-white sticky bottom-0 z-20 flex justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <button onClick={onClose} className="px-8 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-colors text-sm">
                    İptal Et
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="px-10 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center gap-3 disabled:opacity-70 disabled:scale-100 text-sm"
                >
                    {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                    {productToEdit ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
                </button>
            </div>

        </div>
    </div>
  )
}