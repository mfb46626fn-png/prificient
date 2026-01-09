'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Save, Target, AlertTriangle, RotateCcw, Percent, Activity, Loader2, Sparkles, Globe, RefreshCw,
  Plus, Trash2, Calendar
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { useFinancialConfig, FixedExpense } from '@/app/contexts/FinancialConfigContext'

// Platform Verileri
const PLATFORM_DATA: Record<string, { commission: number, processor: number, fixedUSD: number }> = {
    'Shopify': { commission: 2.0, processor: 2.9, fixedUSD: 0.30 }, 
    'Amazon': { commission: 15.0, processor: 0, fixedUSD: 0.99 }, 
    'Diğer': { commission: 0, processor: 0, fixedUSD: 0 } 
}

export default function FinancialSettingsPage() {
  const supabase = createClient()
  const { symbol } = useCurrency()
  const { config: globalConfig, refreshConfig, loading: contextLoading } = useFinancialConfig()
  
  const currentUSDRate = 35.5 // Simülasyon Kuru

  const [saving, setSaving] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [config, setConfig] = useState(globalConfig)

  // Local state: Gider Listesi Formu
  const [expenses, setExpenses] = useState<FixedExpense[]>([])

  // Global config yüklendiğinde formu doldur
  useEffect(() => {
    if (globalConfig) {
      setConfig(globalConfig)
      setExpenses(globalConfig.fixedExpenses || [])
    }
  }, [globalConfig])

  // Gider listesi değiştikçe toplam tutarı (monthlyFixedCost) otomatik güncelle
  useEffect(() => {
      const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
      setConfig(prev => ({ ...prev, fixedExpenses: expenses, monthlyFixedCost: total }))
  }, [expenses])

  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null)
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }

  // --- GİDER YÖNETİMİ ---
  const addExpense = () => {
      const newId = Math.random().toString(36).substr(2, 9)
      // Varsayılan olarak ayın 1'i
      setExpenses([...expenses, { id: newId, title: '', amount: 0, paymentDay: 1 }])
  }

  const removeExpense = (id: string) => {
      setExpenses(expenses.filter(e => e.id !== id))
  }

  const updateExpense = (id: string, field: keyof FixedExpense, value: any) => {
      setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  // --- PLATFORM DEĞİŞİMİ ---
  const handlePlatformChange = (platformName: string) => {
      const data = PLATFORM_DATA[platformName] || PLATFORM_DATA['Diğer']
      const convertedFixedFee = data.fixedUSD * currentUSDRate
      setConfig(prev => ({
          ...prev, selectedPlatform: platformName, platformCommission: data.commission,
          paymentProcessorFee: data.processor, fixedPerOrderFee: parseFloat(convertedFixedFee.toFixed(2))
      }))
      showToast(`${platformName} verileri yüklendi.`, 'success')
  }

  // --- GERİ AL ---
  const handleUndo = () => { if(confirm('Kaydedilmemiş değişiklikler geri alınsın mı?')) setConfig(globalConfig) }

  // --- AI STRATEJİSİ ---
  const handleAISuggestion = async () => {
    setThinking(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    const appetite = config.riskAppetite || 'moderate'
    let suggestion = { ...config }
    if (appetite === 'aggressive') {
        suggestion.profitTargetPercent = 15; suggestion.minMargin = 5; suggestion.stockWarningDays = 7 
    } else if (appetite === 'conservative') {
        suggestion.profitTargetPercent = 35; suggestion.minMargin = 20; suggestion.stockWarningDays = 21 
    } else {
        suggestion.profitTargetPercent = 25; suggestion.minMargin = 10; suggestion.stockWarningDays = 14
    }
    setConfig(suggestion)
    setThinking(false)
    showToast(`${appetite === 'aggressive' ? 'Agresif' : appetite === 'conservative' ? 'Muhafazakar' : 'Dengeli'} profili uygulandı.`, 'success')
  }

  // --- KAYDET ---
  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('profiles').update({
          financial_config: config, updated_at: new Date().toISOString()
        }).eq('id', user.id)

      if (!error) { await refreshConfig(); showToast('Yapılandırma kaydedildi.', 'success') } 
      else { showToast('Hata: ' + error.message, 'error') }
    }
    setSaving(false)
  }

  const handleChange = (key: keyof typeof config, value: any) => setConfig(prev => ({ ...prev, [key]: value }))

  if (contextLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 font-sans selection:bg-emerald-100">
      <DashboardHeader />

      <main className="max-w-5xl mx-auto p-6 sm:p-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Finansal Yapılandırma
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-full uppercase tracking-widest font-bold border border-blue-100">Core System</span>
                </h1>
                <p className="text-gray-500 font-medium mt-2 max-w-2xl">
                    İşletmenizin finansal beynini buradan yönetin.
                </p>
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={handleUndo} className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors" title="Geri Al"><RotateCcw size={20}/></button>
                <button onClick={handleAISuggestion} disabled={thinking} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-70">
                    {thinking ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {thinking ? 'Hesaplanıyor...' : 'AI Önerisi Al'}
                </button>
            </div>
        </div>

        {toast && <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-3 animate-in slide-in-from-top-5 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>{toast.type === 'success' ? <Activity size={18}/> : <AlertTriangle size={18}/>}{toast.msg}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* 1. HEDEFLER & SABİT GİDERLER (YENİLENMİŞ) */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50">
                    <div className="p-2.5 bg-gray-900 text-white rounded-xl"><Target size={20} /></div>
                    <div>
                        <h2 className="font-black text-gray-900 text-lg">Hedefler & Giderler</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Burn Rate Detayları</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Hedef Marj</label>
                            <div className="relative">
                                <input type="number" value={config.profitTargetPercent} onChange={(e) => handleChange('profitTargetPercent', Number(e.target.value))} className="w-full pl-4 pr-8 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5"/>
                                <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Min. Marj</label>
                            <div className="relative">
                                <input type="number" value={config.minMargin} onChange={(e) => handleChange('minMargin', Number(e.target.value))} className="w-full pl-4 pr-8 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5"/>
                                <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* GİDER YÖNETİCİSİ */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold text-gray-500">Aylık Sabit Giderler (Detaylı)</label>
                            <button onClick={addExpense} className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors">
                                <Plus size={12}/> Ekle
                            </button>
                        </div>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            {expenses.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">Henüz sabit gider eklenmedi.</p>}
                            
                            {expenses.map((exp) => (
                                <div key={exp.id} className="flex gap-2 items-center group animate-in slide-in-from-left-2 duration-300">
                                    <input 
                                        type="text" 
                                        placeholder="Gider Adı (Örn: Kira)" 
                                        value={exp.title}
                                        onChange={(e) => updateExpense(exp.id, 'title', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-xs font-bold focus:ring-1 focus:ring-black outline-none transition-all"
                                    />
                                    <div className="relative w-24">
                                        <input 
                                            type="number" 
                                            placeholder="Tutar" 
                                            value={exp.amount}
                                            onChange={(e) => updateExpense(exp.id, 'amount', Number(e.target.value))}
                                            className="w-full pl-3 pr-1 py-2 bg-gray-50 rounded-lg text-xs font-bold focus:ring-1 focus:ring-black outline-none transition-all"
                                        />
                                    </div>
                                    <div className="relative w-20" title="Her ayın kaçında ödeniyor?">
                                        <Calendar size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                                        <input 
                                            type="number" 
                                            min="1" max="31"
                                            placeholder="Gün"
                                            value={exp.paymentDay}
                                            onChange={(e) => updateExpense(exp.id, 'paymentDay', Number(e.target.value))}
                                            className="w-full pl-6 pr-1 py-2 bg-gray-50 rounded-lg text-xs font-bold focus:ring-1 focus:ring-black outline-none transition-all"
                                        />
                                    </div>
                                    <button onClick={() => removeExpense(exp.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* OTOMATİK HESAPLANAN TOPLAM */}
                        <div className="mt-4 p-4 bg-gray-900 text-white rounded-2xl flex justify-between items-center shadow-lg shadow-gray-200">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TOPLAM AYLIK GİDER</p>
                                <p className="text-[10px] text-gray-500">Bu tutar başa baş noktasını belirler.</p>
                            </div>
                            <span className="text-xl font-black">{symbol}{config.monthlyFixedCost.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. PLATFORM */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Globe size={20} /></div>
                    <div>
                        <h2 className="font-black text-gray-900 text-lg">Platform & Altyapı</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Shopify / Amazon / Global</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Satış Platformu</label>
                        <div className="relative">
                            <select value={config.selectedPlatform || 'Shopify'} onChange={(e) => handlePlatformChange(e.target.value)} className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer appearance-none">
                                {Object.keys(PLATFORM_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-white px-2 py-1 rounded-md shadow-sm">OTOMATİK</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Platform Komisyonu</label>
                            <div className="relative">
                                <input type="number" value={config.platformCommission} onChange={(e) => handleChange('platformCommission', Number(e.target.value))} className="w-full pl-4 pr-8 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/10"/>
                                <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Ödeme Altyapı Kesintisi</label>
                            <div className="relative">
                                <input type="number" value={config.paymentProcessorFee || 0} onChange={(e) => handleChange('paymentProcessorFee', Number(e.target.value))} className="w-full pl-4 pr-8 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/10"/>
                                <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Sabit İşlem Ücreti</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                                <input type="number" value={config.fixedPerOrderFee || 0} onChange={(e) => handleChange('fixedPerOrderFee', Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/10"/>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 group">
                                    <RefreshCw size={14} className="text-gray-400" />
                                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black text-white text-[10px] rounded-lg hidden group-hover:block z-10">Dolar bazlı ücret anlık kurla çarpılmıştır.</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Ort. Kargo/Lojistik</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                                <input type="number" value={config.logisticsCost} onChange={(e) => handleChange('logisticsCost', Number(e.target.value))} className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500/10"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. ÖNGÖRÜ */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle size={20} /></div>
                    <div>
                        <h2 className="font-black text-gray-900 text-lg">Risk & Strateji</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">AI ve Stok Ayarları</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Risk İştahı (AI Motoru)</label>
                        <select value={config.riskAppetite} onChange={(e) => handleChange('riskAppetite', e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-amber-500/10 cursor-pointer">
                            <option value="conservative">Muhafazakar (Yüksek Marj, Düşük Risk)</option>
                            <option value="moderate">Dengeli (Standart Büyüme)</option>
                            <option value="aggressive">Agresif (Düşük Marj, Hızlı Büyüme)</option>
                        </select>
                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">AI, fiyat önerilerini bu tercihe göre yapar.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Stok Uyarı Zamanı</label>
                        <div className="relative">
                            <input type="number" value={config.stockWarningDays} onChange={(e) => handleChange('stockWarningDays', Number(e.target.value))} className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-amber-500/10"/>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">GÜN</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">Stok bu sürenin altına düştüğünde uyarı alırsınız.</p>
                    </div>
                </div>
            </div>

        </div>

        {/* KAYDET BUTONU */}
        <div className="fixed bottom-8 right-8 z-40">
            <button onClick={handleSave} disabled={saving} className="px-8 py-4 bg-black text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-black/30 hover:scale-105 hover:bg-gray-900 transition-all flex items-center gap-3 disabled:opacity-70 disabled:scale-100">
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> YAPILANDIRMAYI KAYDET</>}
            </button>
        </div>

      </main>
    </div>
  )
}