import { useState, useEffect } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import { Building2, Save, UserCircle, Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/ui/toast'

interface SettingsClientProps {
  initialProfile: { full_name: string, username: string, email?: string }
  isDemo?: boolean
}

export default function SettingsClient({ initialProfile, isDemo = false }: SettingsClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [frequency, setFrequency] = useState<string>('weekly')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'notifications'>('general')
  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    if (!isDemo) {
      const fetchSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('notification_settings').select('report_frequency').eq('user_id', user.id).maybeSingle()
          if (data) setFrequency(data.report_frequency)
        }
      }
      fetchSettings()
    }
  }, [isDemo])

  const handleSave = async () => {
    setSaving(true)

    if (isDemo) {
      setTimeout(() => {
        alert('Demo modunda değişiklikler sadece yerel olarak simüle edilir.')
        setSaving(false)
      }, 1000)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 1. Save Profile
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: profile.full_name,
          username: profile.username,
          updated_at: new Date().toISOString()
        })

        // 2. Save Notification Settings
        await supabase.from('notification_settings').upsert({
          user_id: user.id,
          report_frequency: frequency,
          updated_at: new Date().toISOString()
        })

        showToast({ type: 'success', title: 'Başarılı', message: 'Ayarlarınız kaydedildi.' })
      }
    } catch (error) {
      console.error(error)
      showToast({ type: 'error', title: 'Hata', message: 'Kaydedilirken bir sorun oluştu.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <DashboardHeader isDemo={isDemo} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* SIDEBAR */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-5 py-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-white text-black shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-white/50'}`}
            >
              <UserCircle size={20} /> Genel Profil
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-5 py-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-white text-black shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-white/50'}`}
            >
              <Bell size={20} /> Bildirim Ayarları
            </button>
          </aside>

          {/* CONTENT */}
          <main className="flex-1 space-y-6">

            {/* Save Button */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 sticky top-20 z-10 md:static">
              <div>
                <h1 className="text-lg font-black text-gray-900">Ayarlar</h1>
                <p className="text-xs text-gray-500">Değişiklikleri kaydetmeyi unutmayın.</p>
              </div>
              <button
                onClick={handleSave} // Calls local mock save
                disabled={saving}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'} <Save size={18} />
              </button>
            </div>

            {activeTab === 'general' && (
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-in fade-in space-y-6">
                <div className="flex items-start gap-4 mb-2">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-500"><Building2 size={24} /></div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Genel Bilgiler</h2>
                    <p className="text-sm text-gray-500 font-medium">Profil ve görünürlük ayarlarınız.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ad Soyad</label>
                    <input
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={profile.username || ''}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      placeholder="@kullanici_adi"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">E-Posta (Değiştirilemez)</label>
                    <input
                      type="text"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-in fade-in space-y-6">
                <div className="flex items-start gap-4 mb-2">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-500"><Bell size={24} /></div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Bildirim Tercihleri</h2>
                    <p className="text-sm text-gray-500 font-medium">E-posta rapor ve bildirim sıklığını yönetin.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-lg font-bold text-gray-900 mb-2 block">Finansal Rapor Sıklığı</label>
                    <p className="text-sm text-gray-500 mb-4">Size ne sıklıkla özet e-posta gönderelim?</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { val: 'daily', label: 'Günlük Rapor', desc: 'Her sabah önceki günün özeti.' },
                        { val: 'weekly', label: 'Haftalık Rapor', desc: 'Her Pazartesi haftalık özet.' },
                        { val: 'monthly', label: 'Aylık Rapor', desc: 'Her ayın 1\'inde aylık özet.' },
                        { val: 'never', label: 'Gönderme', desc: 'Hiçbir rapor almak istemiyorum.' }
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => setFrequency(opt.val)}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${frequency === opt.val
                            ? 'border-indigo-600 bg-indigo-50/50'
                            : 'border-gray-100 hover:border-gray-200'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold ${frequency === opt.val ? 'text-indigo-700' : 'text-gray-900'}`}>{opt.label}</span>
                            {frequency === opt.val && <div className="w-3 h-3 rounded-full bg-indigo-600"></div>}
                          </div>
                          <p className="text-xs text-gray-500 font-medium">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}