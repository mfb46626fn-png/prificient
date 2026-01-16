'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Building2, Globe, CreditCard, Truck, CheckCircle2,
  ArrowRight, ArrowLeft, Store, Wallet
} from 'lucide-react'

import { StoreSettings } from '@/types/store_settings'

// BAŞLANGIÇ VERİSİ
const INITIAL_DATA: StoreSettings = {
  company_type: 'sahis',
  active_channels: {
    shopify: false,
    trendyol: false,
    hepsiburada: false,
    amazon: false,
    etsy: false,
    woocommerce: false
  },
  payment_gateways: {
    iyzico: { rate: 2.99, fixed: 3.00, active: false },
    paytr: { rate: 1.89, fixed: 0.00, active: false },
    stripe: { rate: 2.90, fixed: 0.30, active: false }, // USD cents
    shopify_payments: { rate: 2.50, fixed: 0.00, active: false },
    havale: { rate: 0, fixed: 0, active: false }
  },
  avg_shipping_cost: 50,
  avg_packaging_cost: 5
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<StoreSettings>(INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // --- ADIM 1: ŞİRKET TÜRÜ ---
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Şirket Yapınız</h2>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Vergi hesaplamaları ve net kâr analizi için şirket türünüzü bilmemiz gerekiyor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'sahis', title: 'Şahıs Şirketi', desc: 'Gelir Vergisi Mükellefi' },
          { id: 'ltd', title: 'Limited Şirket', desc: 'Kurumlar Vergisi (%25)' },
          { id: 'as', title: 'Anonim Şirket', desc: 'Kurumlar Vergisi (%25)' },
          { id: 'micro', title: 'Mikro İhracatçı', desc: 'KDV İadesi / Muafiyeti' }
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setData({ ...data, company_type: type.id })}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${data.company_type === type.id
              ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
              : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-bold ${data.company_type === type.id ? 'text-blue-700' : 'text-gray-900'}`}>
                  {type.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">{type.desc}</p>
              </div>
              {data.company_type === type.id && <CheckCircle2 className="text-blue-600" size={20} />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // --- ADIM 2: SATIŞ KANALLARI ---
  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Satış Kanalları</h2>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Hangi platformlarda aktif satış yapıyorsunuz?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.keys(data.active_channels).map((channel) => (
          <button
            key={channel}
            onClick={() => setData({
              ...data,
              active_channels: { ...data.active_channels, [channel]: !data.active_channels[channel] }
            })}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${data.active_channels[channel]
              ? 'border-purple-600 bg-purple-50 text-purple-700'
              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
              }`}
          >
            <Globe size={24} className={data.active_channels[channel] ? 'text-purple-600' : 'text-gray-400'} />
            <span className="font-bold capitalize">{channel}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // --- ADIM 3: ÖDEME ALTYAPISI (KRİTİK) ---
  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wallet size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Komisyon Ayarları</h2>
        <p className="text-gray-500 text-sm font-medium mt-2">
          "Paranın %3'ü Iyzico'ya gidiyor" diyebilmemiz için bu oranlar şart.
        </p>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {Object.keys(data.payment_gateways).map((gateway) => {
          const info = data.payment_gateways[gateway]
          return (
            <div key={gateway} className={`p-5 rounded-2xl border transition-all ${info.active ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-white opacity-60 hover:opacity-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={info.active}
                    onChange={(e) => {
                      const newData = { ...data }
                      newData.payment_gateways[gateway].active = e.target.checked
                      setData(newData)
                    }}
                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-black text-gray-900 capitalize">{gateway.replace('_', ' ')}</span>
                </div>
              </div>

              {info.active && (
                <div className="grid grid-cols-2 gap-4 pl-8 animate-in slide-in-from-top-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Komisyon (%)</label>
                    <input
                      type="number"
                      value={info.rate}
                      onChange={(e) => {
                        const newData = { ...data }
                        newData.payment_gateways[gateway].rate = parseFloat(e.target.value)
                        setData(newData)
                      }}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Sabit Ücret (TL)</label>
                    <input
                      type="number"
                      value={info.fixed}
                      onChange={(e) => {
                        const newData = { ...data }
                        newData.payment_gateways[gateway].fixed = parseFloat(e.target.value)
                        setData(newData)
                      }}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // --- ADIM 4: OPERASYONEL GİDERLER ---
  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Truck size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Operasyonel Giderler</h2>
        <p className="text-gray-500 text-sm font-medium mt-2">
          Her bir sipariş için ortalama ne kadar harcıyorsunuz?
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div>
          <label className="flex items-center justify-between text-sm font-bold text-gray-700 mb-2">
            <span>Ortalama Kargo Maliyeti</span>
            <span className="text-orange-600">{data.avg_shipping_cost} TL</span>
          </label>
          <input
            type="range"
            min="0" max="200" step="1"
            value={data.avg_shipping_cost}
            onChange={(e) => setData({ ...data, avg_shipping_cost: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-xs text-gray-400 font-bold mt-2">
            <span>0 TL</span>
            <span>200 TL+</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="flex items-center justify-between text-sm font-bold text-gray-700 mb-2">
            <span>Paketleme / Kutu Maliyeti</span>
            <span className="text-orange-600">{data.avg_packaging_cost} TL</span>
          </label>
          <input
            type="range"
            min="0" max="50" step="0.5"
            value={data.avg_packaging_cost}
            onChange={(e) => setData({ ...data, avg_packaging_cost: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <p className="text-xs text-gray-400 mt-2 font-medium">
            * Koli bandı, kutu, patpat, teşekkür kartı vb. toplamı.
          </p>
        </div>
      </div>
    </div>
  )

  // --- KAYDETME FONKSİYONU ---
  const handleComplete = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('store_settings').upsert({
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString()
      })

      if (error) {
        alert('Hata oluştu: ' + error.message)
        setLoading(false)
      } else {
        // Dashboard'a yönlendir
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">

      {/* PROGRESS BAR */}
      <div className="w-full max-w-lg mb-8 flex items-center justify-between px-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= s ? 'bg-black scale-125' : 'bg-gray-300'}`}></div>
          </div>
        ))}
      </div>

      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-xl p-8 relative overflow-hidden">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 text-gray-500 font-bold hover:text-black transition-colors"
            >
              <ArrowLeft size={18} /> Geri
            </button>
          ) : (
            <div></div> // Boşluk tutucu
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95"
            >
              Devam Et <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Kuruluyor...' : 'Sistemi Başlat'} <CheckCircle2 size={18} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
        Prificient Onboarding • Adım {step} / 4
      </p>
    </div>
  )
}