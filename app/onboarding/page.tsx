'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, ShoppingBag, Store, Wallet, Loader2, Plus, Trash2 } from 'lucide-react'
import { useFinancialConfig } from '@/app/contexts/FinancialConfigContext' // Context'i bağladık

// --- PLATFORMA ÖZEL VARSAYILAN GİDERLER ---
const PLATFORM_DEFAULTS: Record<string, { label: string, amount: string }[]> = {
  'Shopify': [
    { label: 'Shopify Aboneliği', amount: '1000' },
    { label: 'Uygulama/Eklenti Giderleri', amount: '500' },
    { label: 'Dijital Pazarlama (Ads)', amount: '5000' },
  ],
  'Trendyol': [
    { label: 'Entegrasyon Yazılımı', amount: '300' },
    { label: 'Reklam Bakiyesi', amount: '2000' },
    { label: 'Muhasebe/Müşavirlik', amount: '1500' },
  ],
  'Amazon': [
    { label: 'Professional Seller Hesabı', amount: '1400' },
    { label: 'Helium10 / Yazılımlar', amount: '3000' },
    { label: 'PPC Reklamları', amount: '5000' },
  ],
  'Etsy': [
    { label: 'Listing Ücretleri (Tahmini)', amount: '500' },
    { label: 'Etsy Ads', amount: '1000' },
    { label: 'Araçlar (Marmalead vb.)', amount: '300' },
  ],
  'Genel': [
    { label: 'Muhasebe', amount: '1500' },
    { label: 'Yazılım Abonelikleri', amount: '500' },
    { label: 'Reklam Bütçesi', amount: '2000' },
  ]
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { refreshConfig } = useFinancialConfig() // İşlem bitince ayarları tazelemek için

  const [userId, setUserId] = useState<string | null>(null)

  // Form Verileri
  const [platform, setPlatform] = useState('')
  const [category, setCategory] = useState('')
  
  // Gider Listesi
  const [costList, setCostList] = useState<{ id: string, label: string, amount: string }[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      else router.push('/login')
    }
    getUser()
  }, [router, supabase])

  // Platform değiştiğinde varsayılan giderleri yükle
  useEffect(() => {
    if (step === 3 && platform && costList.length === 0) {
      const defaults = PLATFORM_DEFAULTS[platform] || PLATFORM_DEFAULTS['Genel']
      setCostList(defaults.map((item, index) => ({ 
          id: index.toString(), 
          label: item.label, 
          amount: item.amount 
      })))
    }
  }, [step, platform, costList.length])

  // --- GİDER LİSTESİ YÖNETİMİ ---
  const updateCost = (id: string, field: 'label' | 'amount', value: string) => {
    setCostList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const addCostRow = () => {
    setCostList(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), label: '', amount: '' }])
  }

  const removeCostRow = (id: string) => {
    setCostList(prev => prev.filter(item => item.id !== id))
  }

  // Toplam Sabit Gider Hesabı
  const totalFixedCost = costList.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0)

  // --- KAYDET VE BİTİR (YENİ SİSTEME GÖRE) ---
  const handleFinish = async () => {
    if (!userId) return
    setLoading(true)

    try {
        // 1. Giderleri yeni sistemin formatına (FixedExpense) çevir
        const formattedFixedExpenses = costList
            .filter(c => c.label && c.amount) // Boşları ele
            .map(c => ({
                id: c.id,
                title: c.label,
                amount: parseFloat(c.amount),
                paymentDay: 1 // Varsayılan olarak ayın 1'i (Kullanıcı sonra ayarlardan değiştirebilir)
            }))

        // 2. Yeni Financial Config Objesini Oluştur
        const newFinancialConfig = {
            // Varsayılan değerler (Önceki context yapımızdan)
            profitTargetPercent: 25,
            minMargin: 10,
            stockWarningDays: 14,
            riskAppetite: 'moderate',
            platformCommission: platform === 'Trendyol' ? 20 : (platform === 'Shopify' ? 2.9 : 15), // Basit varsayımlar
            paymentProcessorFee: 0,
            fixedPerOrderFee: 0,
            logisticsCost: 0,
            
            // Kullanıcıdan gelenler
            selectedPlatform: platform,
            monthlyFixedCost: totalFixedCost, // Dashboard'daki Burn Rate buna bakıyor
            fixedExpenses: formattedFixedExpenses // Ayarlar sayfasındaki liste buna bakıyor
        }

        // app/onboarding/page.tsx içinde handleFinish fonksiyonu
        const { error } = await supabase
            .from('profiles')
            .update({
                onboarding_completed: true, // Veritabanındaki sütun ismiyle birebir aynı olmalı
                financial_config: newFinancialConfig,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (error) throw error

        // 4. Context'i tazele (Dashboard güncel veriyi görsün)
        await refreshConfig()

        // 5. Yönlendir
        router.push('/dashboard')

    } catch (error: any) {
        alert('Kurulum sırasında bir hata oluştu: ' + error.message)
    } finally {
        setLoading(false)
    }
  }

  // UI Helper Class
  const inputClass = "w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-black rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400 text-lg"

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans selection:bg-black selection:text-white">
      
      {/* Progress Bar */}
      <div className="w-full max-w-lg mb-10">
        <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">
          <span className={step >= 1 ? 'text-black' : ''}>Platform</span>
          <span className={step >= 2 ? 'text-black' : ''}>Kategori</span>
          <span className={step >= 3 ? 'text-black' : ''}>Maliyetler</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          ></div>
        </div>
      </div>

      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ADIM 1: PLATFORM SEÇİMİ */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Store size={36} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Nerede Satıyorsun?</h1>
                <p className="text-gray-500 font-medium mt-2 text-lg">Sistemi senin için özelleştireceğiz.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {['Trendyol', 'Hepsiburada', 'Amazon', 'Shopify', 'Etsy', 'Kendi Sitem'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`p-5 rounded-2xl font-bold text-sm transition-all border-2 active:scale-95 ${platform === p ? 'border-black bg-black text-white shadow-xl shadow-black/20' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <button 
                onClick={() => setStep(2)} 
                disabled={!platform}
                className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
            >
                Devam Et <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* ADIM 2: KATEGORİ */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
                <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <ShoppingBag size={36} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Ne Satıyorsun?</h1>
                <p className="text-gray-500 font-medium mt-2 text-lg">İş modelini anlamamız için gerekli.</p>
            </div>

            <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Kategori / Ürün Tipi</label>
                <input 
                    type="text" 
                    placeholder="Örn: Kadın Giyim, Petshop, Elektronik..." 
                    className={inputClass}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-bold hover:bg-gray-200 transition-colors">Geri</button>
                <button 
                    onClick={() => setStep(3)} 
                    disabled={!category}
                    className="flex-1 py-5 bg-black text-white rounded-[1.5rem] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
                >
                    Devam Et <ArrowRight size={20} strokeWidth={3} />
                </button>
            </div>
          </div>
        )}

        {/* ADIM 3: MALİYETLER (EN ÖNEMLİ KISIM) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-2">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Wallet size={32} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sabit Giderlerin?</h1>
                <p className="text-gray-500 font-medium mt-2">
                   <span className="text-black font-bold">{platform}</span> için tahminlerimiz bunlar. Düzenleyebilirsin.
                </p>
            </div>

            {/* Gider Listesi */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {costList.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 group animate-in slide-in-from-bottom-2 duration-300">
                        <input 
                           type="text" 
                           placeholder="Gider Adı"
                           className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-black outline-none font-bold text-gray-900 text-sm transition-all"
                           value={item.label}
                           onChange={(e) => updateCost(item.id, 'label', e.target.value)}
                        />
                        
                        <div className="relative w-32 shrink-0">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₺</span>
                            <input 
                               type="number" 
                               placeholder="0"
                               className="w-full pl-7 pr-3 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-black outline-none font-black text-gray-900 text-sm transition-all"
                               value={item.amount}
                               onChange={(e) => updateCost(item.id, 'amount', e.target.value)}
                            />
                        </div>

                        <button 
                           onClick={() => removeCostRow(item.id)}
                           className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                <button 
                   onClick={addCostRow}
                   className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl font-bold text-sm hover:border-black hover:text-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Başka Gider Ekle
                </button>
            </div>

            {/* Özet ve Bitir */}
            <div className="bg-gray-900 text-white p-6 rounded-[2rem] shadow-2xl shadow-gray-900/30">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">AYLIK TOPLAM (BURN RATE)</p>
                        <p className="text-3xl font-black tracking-tight">₺{totalFixedCost.toLocaleString('tr-TR')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold">YILLIK TAHMİNİ</p>
                        <p className="text-sm font-bold text-gray-300">₺{(totalFixedCost * 12).toLocaleString('tr-TR')}</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleFinish} 
                    disabled={loading}
                    className="w-full py-4 bg-white text-black rounded-xl font-black text-lg hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} strokeWidth={3} /> Kurulumu Tamamla</>}
                </button>
            </div>

            <button onClick={() => setStep(2)} className="w-full text-xs text-gray-400 hover:text-black font-bold py-2 transition-colors">Geri Dön</button>

          </div>
        )}

      </div>
    </div>
  )
}