'use client'

import { useState, useEffect, useRef } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import { Building2, Save, UserCircle, Bell, CreditCard, Lock, Loader2, Camera, Trash2, Mail, Calendar, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/ui/toast'
import BillingSettings from '@/components/BillingSettings'
import Image from 'next/image'
import { useProfile } from '@/app/contexts/ProfileContext'
import { useRouter } from 'next/navigation'
import { updatePassword, deleteAccount } from '@/lib/actions/auth'

interface SettingsClientProps {
  initialProfile: { full_name: string, username: string, email?: string }
  isDemo?: boolean
}

export default function SettingsClient({ initialProfile, isDemo = false }: SettingsClientProps) {
  const { updateAvatarUrl } = useProfile()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<{ full_name: string, username: string, email?: string, birth_date?: string, avatar_url?: string }>({
    ...initialProfile,
    birth_date: '',
    avatar_url: undefined
  })
  const [frequency, setFrequency] = useState<string>('weekly')
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'billing'>('general')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passData, setPassData] = useState({ newPassword: '', confirmPassword: '' })

  const supabase = createClient()
  const { showToast } = useToast()

  useEffect(() => {
    const init = async () => {
      if (!isDemo) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Fetch Notification Settings
          const { data: notifData } = await supabase.from('notification_settings').select('report_frequency').eq('user_id', user.id).maybeSingle()
          if (notifData) setFrequency(notifData.report_frequency)

          // Fetch Extended Profile Data (Avatar, Birth Date)
          const { data: profData } = await supabase.from('profiles').select('avatar_url, birth_date').eq('id', user.id).maybeSingle()
          if (profData) {
            setProfile(prev => ({
              ...prev,
              birth_date: profData.birth_date || '',
              avatar_url: profData.avatar_url ? `${profData.avatar_url}?t=${new Date().getTime()}` : undefined
            }))
          }
        }
      }
    }
    init()
  }, [isDemo])

  // --- AVATAR UPLOAD ---
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) { setUploading(false); return; }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const fileName = `avatar_${user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id)
      if (updateError) throw updateError

      const newAvatarUrl = `${publicUrl}?t=${new Date().getTime()}`
      setProfile(prev => ({ ...prev, avatar_url: newAvatarUrl }))
      updateAvatarUrl(newAvatarUrl)

      showToast({ type: 'success', title: 'Başarılı', message: 'Profil fotoğrafı güncellendi.' })
      router.refresh()

    } catch (error: any) {
      showToast({ type: 'error', title: 'Hata', message: error.message })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // --- SAVE GENERAL ---
  const handleSaveGeneral = async () => {
    setSaving(true)
    if (isDemo) {
      setTimeout(() => { alert('Demo modu.'); setSaving(false) }, 500); return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: profile.full_name,
          username: profile.username,
          birth_date: profile.birth_date || null,
          updated_at: new Date().toISOString()
        })
        showToast({ type: 'success', title: 'Başarılı', message: 'Profil bilgileri kaydedildi.' })
        router.refresh()
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Hata', message: 'Kaydedilirken hata oluştu.' })
    } finally {
      setSaving(false)
    }
  }



  // --- SAVE PASSWORD ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaving(true)

    const formData = new FormData()
    formData.append('password', passData.newPassword)
    formData.append('confirmPassword', passData.confirmPassword)

    const result = await updatePassword(formData)

    if (result.error) {
      showToast({ type: 'error', title: 'Hata', message: result.error })
    } else {
      showToast({ type: 'success', title: 'Başarılı', message: result.success as string })
      setPassData({ newPassword: '', confirmPassword: '' })
    }
    setPasswordSaving(false)
  }

  // --- DELETE ACCOUNT ---
  const handleDeleteAccount = async () => {
    if (window.confirm("HESABINIZI TAMAMEN SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ? BU İŞLEM GERİ ALINAMAZ.")) {
      const result = await deleteAccount()

      if (result.error) {
        showToast({ type: 'error', title: 'Hata', message: result.error })
      } else {
        await supabase.auth.signOut()
        router.push('/login')
        showToast({ type: 'success', title: 'Hesap Silindi', message: 'Hesabınız başarıyla silindi. Sizi özleyeceğiz.' })
      }
    }
  }

  // --- SAVE NOTIFICATIONS ---
  const handleSaveNotifications = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('notification_settings').upsert({ user_id: user.id, report_frequency: frequency, updated_at: new Date().toISOString() })
      showToast({ type: 'success', title: 'Başarılı', message: 'Bildirim ayarları kaydedildi.' })
    }
    setSaving(false)
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
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full text-left px-5 py-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'billing' ? 'bg-white text-black shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-white/50'}`}
            >
              <CreditCard size={20} /> Abonelik & Paketler
            </button>
          </aside>

          {/* CONTENT */}
          <main className="flex-1 space-y-6">

            {/* Save Button (Contextual) */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 sticky top-20 z-10 md:static">
              <div>
                <h1 className="text-lg font-black text-gray-900">
                  {activeTab === 'general' ? 'Profil Yönetimi' : activeTab === 'notifications' ? 'Bildirimler' : 'Ödeme'}
                </h1>
                <p className="text-xs text-gray-500">
                  {activeTab === 'general' ? 'Kişisel bilgilerinizi güncelleyin.' : 'Tercihlerinizi yapılandırın.'}
                </p>
              </div>

              {activeTab !== 'billing' && (
                <button
                  onClick={activeTab === 'general' ? handleSaveGeneral : handleSaveNotifications}
                  disabled={saving}
                  className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-70"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'} <Save size={18} />
                </button>
              )}
            </div>

            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in">
                {/* AVATAR + BASIC INFO */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-28 h-28 rounded-[2rem] bg-white p-1.5 shadow-2xl shadow-gray-200 border border-gray-100 relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 ${uploading ? 'pointer-events-none opacity-80' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-full h-full bg-gray-900 rounded-[1.7rem] overflow-hidden flex items-center justify-center text-white text-4xl font-black relative">
                        {uploading ? (
                          <Loader2 className="animate-spin text-white" size={24} />
                        ) : profile.avatar_url ? (
                          <Image src={profile.avatar_url} alt="Avatar" width={112} height={112} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <span>{profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                          <Camera size={24} className="text-white mb-1" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Değiştir</span>
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{profile.full_name || 'İsimsiz Kullanıcı'}</h3>
                      <p className="text-sm text-gray-400 font-bold">@{profile.username || 'kullanici'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Ad Soyad</label>
                      <div className="relative group">
                        <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" className="w-full px-5 py-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-900" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Kullanıcı Adı</label>
                      <div className="relative group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                        <input type="text" className="w-full px-5 py-4 pl-10 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-900" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Doğum Tarihi</label>
                      <div className="relative group">
                        <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="date" className="w-full px-5 py-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-900" value={profile.birth_date} onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">E-Posta</label>
                      <div className="relative group">
                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" disabled className="w-full px-5 py-4 pl-12 bg-gray-100 border border-gray-100 rounded-2xl outline-none font-bold text-gray-400 cursor-not-allowed" value={profile.email} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECURITY */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Lock size={18} /></div>
                      Güvenlik
                    </h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <input type="password" placeholder="Yeni Şifre" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" value={passData.newPassword} onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })} />
                      <input type="password" placeholder="Şifre Tekrar" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold" value={passData.confirmPassword} onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })} />
                      <button type="submit" disabled={passwordSaving} className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                        {passwordSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Şifreyi Güncelle'}
                      </button>
                    </form>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-rose-100 shadow-sm">
                    <h2 className="text-lg font-black text-rose-900 mb-2 flex items-center gap-2">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={18} /></div>
                      Hesap
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mb-6 leading-relaxed">
                      Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir.
                    </p>
                    <button onClick={handleDeleteAccount} className="w-full py-4 bg-white text-rose-600 border border-rose-200 rounded-2xl font-bold hover:bg-rose-50 transition-all">
                      Hesabı Sil
                    </button>
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

            {activeTab === 'billing' && <BillingSettings />}
          </main>
        </div>
      </div>
    </div>
  )
}