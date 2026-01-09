'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Package, 
  Truck, 
  DollarSign, 
  PieChart,
  Info
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { useFinancialConfig } from '@/app/contexts/FinancialConfigContext'

export default function NewProductPage() {
  const supabase = createClient()
  const router = useRouter()
  const { symbol, convert } = useCurrency()
  
  // GLOBAL BEYİN: Finansal ayarları çekiyoruz
  const { config, loading: configLoading } = useFinancialConfig()

  // --- STATE ---
  const [name, setName] = useState('')
  const [cost, setCost] = useState('') // Alış Fiyatı
  const [price, setPrice] = useState('') // Satış Fiyatı
  const [stock, setStock] = useState('')

  // Override Alanları (Ayarlardan gelir ama değiştirilebilir)
  const [taxRate, setTaxRate] = useState(0)
  const [commissionRate, setCommissionRate] = useState(0)
  const [logistics, setLogistics] = useState(0)
  const [adCost, setAdCost] = useState(0)

  // Analiz Sonuçları
  const [analysis, setAnalysis] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // 1. Ayarlar Yüklendiğinde Varsayılanları Doldur
  useEffect(() => {
    if (!configLoading && config) {
      setTaxRate(config.taxRate)
      setCommissionRate(config.platformCommission)
      setLogistics(config.logisticsCost)
      
      // Reklam maliyeti modele göre değişir
      if (config.adSpendModel === 'per_order' || config.adSpendModel === 'per_product') {
        setAdCost(config.adSpendAmount)
      } else {
        setAdCost(0) // Sabit bütçeliyse ürün başına maliyet yansıtma (veya tahmini yansıt)
      }
    }
  }, [config, configLoading])

  // 2. CANLI HESAPLAMA MOTORU
  useEffect(() => {
    const sPrice = parseFloat(price) || 0
    const sCost = parseFloat(cost) || 0
    
    if (sPrice <= 0) {
      setAnalysis(null)
      return
    }

    // --- Finansal Hesaplamalar ---
    
    // A. Vergi Hesabı (KDV Dahil/Hariç Durumuna Göre)
    let taxAmount = 0
    let netSalesPrice = sPrice // Vergi hariç satış fiyatı

    if (config.vatIncluded) {
        // Formül: Fiyat / (1 + Oran/100) * (Oran/100) -> İç Yüzde Yöntemi
        // Örn: 120 TL (20% KDV) -> Vergi 20 TL, Net 100 TL
        taxAmount = sPrice * (taxRate / (100 + taxRate))
        netSalesPrice = sPrice - taxAmount
    } else {
        // Hariçse direkt üstüne eklenmiştir, cepten çıkacak vergi oranıdır.
        taxAmount = sPrice * (taxRate / 100)
    }

    // B. Komisyon (Satış Fiyatı Üzerinden)
    const commissionAmount = sPrice * (commissionRate / 100)

    // C. Toplam Kesintiler
    const totalDeductions = taxAmount + commissionAmount + logistics + adCost

    // D. Net Kâr
    const netProfit = sPrice - sCost - totalDeductions
    const profitMargin = (netProfit / sPrice) * 100

    // E. Uyarı Durumu Kontrolü (Ayarlardaki Hedeflere Göre)
    let status = 'success'
    let message = 'Harika! Hedeflenen kârlılığın üzerindesiniz.'

    if (netProfit < 0) {
        status = 'danger'
        message = 'ZARAR RİSKİ! Bu fiyattan satış yaparsanız para kaybedersiniz.'
    } else if (profitMargin < config.minMargin) {
        status = 'warning'
        message = `DİKKAT: Kâr marjınız (%${profitMargin.toFixed(1)}), minimum sınırınızın (%${config.minMargin}) altında.`
    } else if (profitMargin < config.profitTargetPercent) {
        status = 'neutral'
        message = `İyi, ancak hedefiniz olan %${config.profitTargetPercent} marjın biraz altındasınız.`
    }

    setAnalysis({
        taxAmount,
        commissionAmount,
        totalDeductions,
        netProfit,
        profitMargin,
        status,
        message
    })

  }, [price, cost, taxRate, commissionRate, logistics, adCost, config])

  // --- KAYDET ---
  const handleSave = async () => {
    if (!name || !price || !cost) return alert('Lütfen zorunlu alanları doldurun.')
    
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        // Gerçek veritabanı kayıt işlemi buraya gelecek.
        // Şimdilik simülasyon olduğu için sadece konsola yazıyoruz.
        console.log("Ürün Kaydedildi:", {
            user_id: user.id,
            name,
            cost: parseFloat(cost),
            price: parseFloat(price),
            stock: parseInt(stock),
            financial_snapshot: analysis // O anki kârlılık durumunu da kaydedebiliriz!
        })
        
        // Başarılı mesajı ve yönlendirme
        alert('Ürün başarıyla eklendi!')
        router.push('/products') 
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <DashboardHeader />

      <main className="max-w-5xl mx-auto p-6 sm:p-8 animate-in fade-in duration-500">
        
        {/* Üst Bar */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <ArrowLeft size={20} className="text-gray-500"/>
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Yeni Ürün Ekle</h1>
                    <p className="text-sm text-gray-500 font-medium">Finansal analiz motoru devrede.</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* SOL: ÜRÜN BİLGİLERİ */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Package className="text-gray-400" size={20} /> Temel Bilgiler
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Ürün Adı</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5"
                                placeholder="Örn: Akıllı Kedi Su Pınarı"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Alış Maliyeti (Birim)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                                    <input 
                                        type="number" 
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Satış Fiyatı</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                                    <input 
                                        type="number" 
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Stok Adedi</label>
                            <input 
                                type="number" 
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* GELİŞMİŞ MALİYET AYARLARI (Varsayılanlar Gelir) */}
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-gray-400" size={20} /> Maliyet Yapılandırması
                        <span className="ml-auto text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold">OTOMATİK</span>
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Vergi Oranı (%)</label>
                            <input 
                                type="number" 
                                value={taxRate}
                                onChange={(e) => setTaxRate(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Platform Komisyonu (%)</label>
                            <input 
                                type="number" 
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Kargo/Lojistik ({symbol})</label>
                            <input 
                                type="number" 
                                value={logistics}
                                onChange={(e) => setLogistics(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">Reklam/Pazarlama ({symbol})</label>
                            <input 
                                type="number" 
                                value={adCost}
                                onChange={(e) => setAdCost(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 flex items-center gap-2">
                        <Info size={14}/> Bu değerler "Finansal Ayarlar" sayfasından otomatik çekilmiştir. Bu ürün için özelleştirebilirsiniz.
                    </p>
                </div>
            </div>

            {/* SAĞ: CANLI ANALİZ KARTI */}
            <div className="lg:col-span-1">
                {analysis ? (
                    <div className={`sticky top-8 p-6 rounded-[2rem] shadow-2xl transition-all duration-500 border-2 ${
                        analysis.status === 'danger' ? 'bg-rose-50 border-rose-100 shadow-rose-100' :
                        analysis.status === 'warning' ? 'bg-amber-50 border-amber-100 shadow-amber-100' :
                        'bg-emerald-50 border-emerald-100 shadow-emerald-100'
                    }`}>
                        
                        {/* DURUM BAŞLIĞI */}
                        <div className="flex items-start gap-3 mb-6">
                            <div className={`p-2 rounded-xl ${
                                analysis.status === 'danger' ? 'bg-rose-500 text-white' :
                                analysis.status === 'warning' ? 'bg-amber-500 text-white' :
                                'bg-emerald-500 text-white'
                            }`}>
                                {analysis.status === 'danger' ? <AlertTriangle size={20}/> : 
                                 analysis.status === 'warning' ? <AlertTriangle size={20}/> : 
                                 <CheckCircle2 size={20}/>}
                            </div>
                            <div>
                                <h3 className={`font-black text-sm uppercase tracking-wide ${
                                    analysis.status === 'danger' ? 'text-rose-700' :
                                    analysis.status === 'warning' ? 'text-amber-700' :
                                    'text-emerald-700'
                                }`}>
                                    {analysis.status === 'danger' ? 'Kritik Uyarı' :
                                     analysis.status === 'warning' ? 'İyileştirme Gerekli' :
                                     'Mükemmel'}
                                </h3>
                                <p className="text-xs font-bold opacity-70 mt-1 leading-relaxed">
                                    {analysis.message}
                                </p>
                            </div>
                        </div>

                        {/* RAKAMSAL DÖKÜM */}
                        <div className="space-y-3 mb-6 bg-white/50 p-4 rounded-xl">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 font-bold">Satış Fiyatı</span>
                                <span className="font-black text-gray-900">{symbol}{parseFloat(price).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 font-bold">Alış Maliyeti</span>
                                <span className="font-black text-gray-900">-{symbol}{parseFloat(cost).toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-gray-200 my-1"></div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 font-bold">Vergi ({config.vatIncluded ? 'Dahil' : 'Hariç'})</span>
                                <span className="font-bold text-rose-500">-{symbol}{analysis.taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 font-bold">Platform Kom.</span>
                                <span className="font-bold text-rose-500">-{symbol}{analysis.commissionAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 font-bold">Kargo & Reklam</span>
                                <span className="font-bold text-rose-500">-{symbol}{(analysis.totalDeductions - analysis.taxAmount - analysis.commissionAmount).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* NET SONUÇ */}
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tahmini Net Kâr</p>
                            <div className={`text-4xl font-black tracking-tighter ${analysis.netProfit < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                                {symbol}{analysis.netProfit.toFixed(2)}
                            </div>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-black mt-2 ${
                                analysis.profitMargin < 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                %{analysis.profitMargin.toFixed(1)} Marj
                            </div>
                        </div>

                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full mt-6 py-4 bg-black text-white rounded-xl font-bold hover:scale-105 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-70 disabled:scale-100"
                        >
                            {saving ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
                        </button>

                    </div>
                ) : (
                    // BOŞ DURUM (Henüz fiyat girilmediyse)
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 text-center opacity-50">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <PieChart size={32} />
                        </div>
                        <h3 className="font-bold text-gray-900">Analiz Bekleniyor</h3>
                        <p className="text-xs text-gray-400 mt-2">Maliyet ve satış fiyatını girin, yapay zeka karlılığınızı hesaplasın.</p>
                    </div>
                )}
            </div>

        </div>
      </main>
    </div>
  )
}