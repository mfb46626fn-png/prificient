'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Globe, Bell, Coins, CheckCircle2, Loader2, AlertCircle, Shield, Zap, Mail } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { useCurrency } from '@/app/contexts/CurrencyContext'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const { updateCurrency } = useCurrency()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showMessage, setShowMessage] = useState(false)

  // State
  const [settings, setSettings] = useState({
    currency: 'TRY',
    language: 'tr',
    notifyWeeklyReport: true,
    notifyAnomalies: true,
    notifySecurity: true,
    notifyMarketing: false
  })

  // Toast
  const triggerMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setShowMessage(true), 10)
    setTimeout(() => {
        setShowMessage(false)
        setTimeout(() => setMessage(null), 500) 
    }, 4000)
  }

  // Verileri Çek
  useEffect(() => {
    const getSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('currency, language, email_notifications, notify_anomalies, notify_security, notify_marketing')
        .eq('id', user.id)
        .single()

      if (data) {
        setSettings({
            currency: data.currency || 'TRY',
            language: data.language || 'tr',
            notifyWeeklyReport: data.email_notifications ?? true,
            notifyAnomalies: data.notify_anomalies ?? true,
            notifySecurity: data.notify_security ?? true,
            notifyMarketing: data.notify_marketing ?? false,
        })
        if (data.currency) updateCurrency(data.currency)
      }
      setLoading(false)
    }
    getSettings()
  }, [])

  // Kaydet
  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        const { error } = await supabase
            .from('profiles')
            .update({
                currency: settings.currency,
                language: settings.language,
                email_notifications: settings.notifyWeeklyReport,
                notify_anomalies: settings.notifyAnomalies,
                notify_security: settings.notifySecurity,
                notify_marketing: settings.notifyMarketing,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) {
            triggerMessage('error', 'Hata: ' + error.message)
        } else {
            updateCurrency(settings.currency)
            triggerMessage('success', 'Ayarlar başarıyla kaydedildi.')
            router.refresh()
        }
    }
    setSaving(false)
  }

  // --- ARTIK KESİN ÇALIŞACAK OLAN SWITCH ---
  const ToggleSwitch = ({ checked, onChange, label, description, icon: Icon }: any) => (
    <div 
        onClick={() => onChange(!checked)}
        className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group select-none active:scale-[0.99]"
    >
        <div className="flex items-center gap-4 pr-4">
            {/* İKON KUTUSU */}
            {/* !bg-black ve !bg-gray-100 kullanarak zorluyoruz */}
            <div className={`p-3 rounded-2xl transition-colors duration-300 flex items-center justify-center ${checked ? '!bg-black !text-white' : '!bg-gray-100 !text-gray-400'}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className={`font-bold text-sm transition-colors duration-300 ${checked ? '!text-gray-900' : '!text-gray-400'}`}>
                    {label}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{description}</p>
            </div>
        </div>
        
        {/* SWITCH GÖVDESİ */}
        {/* BURAYA DİKKAT: '!bg-emerald-500' kullanıyoruz. Bu rengi ezemezler. */}
        <div className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out ${checked ? '!bg-emerald-500 shadow-inner' : '!bg-gray-200'}`}>
            {/* TOP */}
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </div>
  )

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <DashboardHeader />

      <main className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8 animate-in fade-in duration-500">
        
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Genel Ayarlar</h1>
            <p className="text-gray-500 font-medium">Uygulama deneyiminizi ve bildirimlerinizi özelleştirin.</p>
        </div>

        {/* TOAST */}
        <div className={`fixed top-6 left-0 right-0 mx-auto w-max z-[100] transition-all duration-500 transform ${showMessage ? 'translate-y-4 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-90'}`}>
           {message && (
             <div className={`flex items-center gap-4 px-6 py-4 rounded-full shadow-2xl backdrop-blur-md border ${message.type === 'success' ? 'bg-emerald-600 text-white border-emerald-400/30' : 'bg-rose-600 text-white border-rose-400/30'}`}>
                <div className="p-1.5 bg-white/20 rounded-full">
                   {message.type === 'success' ? <CheckCircle2 size={18} className="text-white" /> : <AlertCircle size={18} className="text-white" />}
                </div>
                <span className="font-bold text-sm tracking-wide">{message.text}</span>
             </div>
           )}
        </div>

        {/* KARTLAR */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
            
            {/* 1. BÖLÜM */}
            <div className="p-8 border-b border-gray-50">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Globe size={14} /> Bölgesel ve Dil
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Varsayılan Para Birimi</label>
                        <div className="relative group">
                            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors" size={18} />
                            <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-gray-100 transition-all appearance-none cursor-pointer">
                                <option value="TRY">Türk Lirası (₺)</option>
                                <option value="USD">Amerikan Doları ($)</option>
                                <option value="EUR">Euro (€)</option>
                                <option value="GBP">Sterlin (£)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Uygulama Dili</label>
                        <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors" size={18} />
                            <select value={settings.language} onChange={(e) => setSettings({...settings, language: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-2xl font-bold text-gray-900 outline-none focus:ring-4 focus:ring-gray-100 transition-all appearance-none cursor-pointer">
                                <option value="tr">Türkçe</option>
                                <option value="en">English (Beta)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. BÖLÜM */}
            <div className="p-8">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Bell size={14} /> Akıllı Bildirimler
                </h2>
                
                <div className="space-y-2">
                    <ToggleSwitch 
                        checked={settings.notifyWeeklyReport}
                        onChange={(val: boolean) => setSettings({...settings, notifyWeeklyReport: val})}
                        label="Haftalık Performans Raporu"
                        description="Her Pazartesi geçen haftanın özetini gönder (Şu an pasif)."
                        icon={Mail}
                    />
                    
                    <div className="h-px bg-gray-50 my-2"></div>

                    <ToggleSwitch 
                        checked={settings.notifyAnomalies}
                        onChange={(val: boolean) => setSettings({...settings, notifyAnomalies: val})}
                        label="Anomali ve Risk Uyarıları"
                        description="Maliyetlerde ani artış olursa sistem anında uyarsın."
                        icon={Zap}
                    />

                    <div className="h-px bg-gray-50 my-2"></div>

                    <ToggleSwitch 
                        checked={settings.notifySecurity}
                        onChange={(val: boolean) => setSettings({...settings, notifySecurity: val})}
                        label="Güvenlik Bildirimleri"
                        description="Şifre değiştiğinde veya kritik işlemlerde bildir."
                        icon={Shield}
                    />
                </div>
            </div>

            {/* BUTON */}
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xs font-bold text-gray-400 pl-2">Son güncelleme: Otomatik</p>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:scale-100"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Ayarları Kaydet</>}
                </button>
            </div>

        </div>
      </main>
    </div>
  )
}