'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, Save, Lock, Loader2, CheckCircle2, AlertCircle, Camera, Trash2, X } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import Image from 'next/image'
import { useProfile } from '@/app/contexts/ProfileContext'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false) // Fotoğraf yükleme durumu
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { updateAvatarUrl } = useProfile()
  
  // Mesaj Sistemi
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showMessage, setShowMessage] = useState(false)

  // Form Verileri
  const [userEmail, setUserEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    birthDate: '',
    website: ''
  })

  const [passData, setPassData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  // MESAJ GÖSTERME (Toast)
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
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')

      const { data } = await supabase
        .from('profiles')
        .select('full_name, username, birth_date, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setFormData({
          fullName: data.full_name || '',
          username: data.username || '',
          birthDate: data.birth_date || '', 
          website: ''
        })
        // Cache sorununu önlemek için timestamp ekle
        if (data.avatar_url) {
            setAvatarUrl(`${data.avatar_url}?t=${new Date().getTime()}`)
        }
      }
      setLoading(false)
    }
    getProfile()
  }, [supabase, router])

  // --- FOTOĞRAF YÜKLEME (GÜNCELLENDİ) ---
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true) // Loading başlat
      
      if (!event.target.files || event.target.files.length === 0) {
        setUploading(false)
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      
      // 1. Kullanıcıyı al
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      // 2. Dosya ismini sabitle (avatar_USERID.ext) -> Böylece eskisi silinir, yer kaplamaz
      const fileName = `avatar_${user.id}.${fileExt}`
      const filePath = `${fileName}`

      // 3. Storage'a Yükle (UPSERT: TRUE ile üzerine yaz)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 4. Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 5. Profili Güncelle
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateError) throw updateError
      
      // 6. State güncelle
      // Hem bu sayfadaki lokal state'i, hem de GLOBAL context'i güncelliyoruz.
      const newAvatarUrl = `${publicUrl}?t=${new Date().getTime()}`
      setAvatarUrl(newAvatarUrl) // Lokal state
      updateAvatarUrl(publicUrl) // GLOBAL CONTEXT GÜNCELLEMESİ (Header bunu dinliyor)
      
      triggerMessage('success', 'Profil fotoğrafı güncellendi!')
      router.refresh() // Server componentlerini de yenile

    } catch (error: any) {
      console.error(error)
      triggerMessage('error', 'Yükleme hatası: ' + error.message)
    } finally {
      setUploading(false) // Loading bitir
      // Input'u temizle ki aynı dosyayı tekrar seçebilsin
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // --- PROFİL GÜNCELLEME ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (!formData.fullName.trim() || !formData.username.trim()) {
       triggerMessage('error', 'Ad Soyad ve Kullanıcı Adı boş bırakılamaz.')
       setSaving(false)
       return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: formData.fullName,
        username: formData.username,
        birth_date: formData.birthDate || null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      triggerMessage('error', 'Hata: ' + error.message)
    } else {
      triggerMessage('success', 'Profil bilgileri başarıyla güncellendi!')
      router.refresh() 
    }
    setSaving(false)
  }

  // --- ŞİFRE GÜNCELLEME ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaving(true)

    if (passData.newPassword !== passData.confirmPassword) {
      triggerMessage('error', 'Şifreler birbiriyle uyuşmuyor.')
      setPasswordSaving(false)
      return
    }

    if (passData.newPassword.length < 6) {
      triggerMessage('error', 'Şifre en az 6 karakter olmalıdır.')
      setPasswordSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: passData.newPassword
    })

    if (error) {
      triggerMessage('error', 'Güncelleme başarısız: ' + error.message)
    } else {
      triggerMessage('success', 'Şifreniz başarıyla değiştirildi.')
      setPassData({ newPassword: '', confirmPassword: '' }) 
    }
    setPasswordSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (window.confirm("HESABINIZI SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?")) {
        setDeleteLoading(true)
        await supabase.auth.signOut()
        router.push('/login')
    }
  }

  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-2 ml-1"
  const inputClass = "w-full px-5 py-4 bg-gray-50 border border-gray-100 focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={32} /></div>

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <DashboardHeader />

      <main className="max-w-5xl mx-auto p-6 sm:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Üst Başlık */}
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profil Yönetimi</h1>
            <p className="text-gray-500 font-medium">Hesap bilgilerinizi güncelleyin ve güvenliğinizi sağlayın.</p>
        </div>

        {/* --- TOAST BİLDİRİMİ --- */}
        <div className={`fixed top-6 left-0 right-0 mx-auto w-max z-[100] transition-all duration-500 cubic-bezier(0.68, -0.55, 0.265, 1.55) transform ${showMessage ? 'translate-y-4 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-90'}`}>
           {message && (
             <div className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-full shadow-2xl backdrop-blur-md border ${message.type === 'success' ? 'bg-emerald-600 text-white border-emerald-400/30' : 'bg-rose-600 text-white border-rose-400/30'}`}>
                <div className="p-1.5 bg-white/20 rounded-full">
                   {message.type === 'success' ? <CheckCircle2 size={18} className="text-white" /> : <AlertCircle size={18} className="text-white" />}
                </div>
                <span className="font-bold text-sm tracking-wide pr-2">{message.text}</span>
                <button onClick={() => setShowMessage(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors"><X size={14}/></button>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL KOLON */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 relative overflow-hidden">
              
              {/* Arkaplan */}
              <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-gray-50/80 to-transparent"></div>

              <form onSubmit={handleUpdateProfile} className="relative z-10">
                
                {/* AVATAR BÖLÜMÜ */}
                <div className="flex items-center gap-6 mb-10">
                    <div 
                        className={`w-28 h-28 rounded-[2rem] bg-white p-1.5 shadow-2xl shadow-gray-200 border border-gray-100 relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 ${uploading ? 'pointer-events-none opacity-80' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-full h-full bg-gray-900 rounded-[1.7rem] overflow-hidden flex items-center justify-center text-white text-4xl font-black relative">
                            {uploading ? (
                                <div className="flex flex-col items-center gap-1">
                                    <Loader2 className="animate-spin text-white" size={24} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">Yükleniyor</span>
                                </div>
                            ) : avatarUrl ? (
                                // unoptimized prop'u Next.js'in cache mekanizmasını atlamasına yardımcı olur
                                <Image src={avatarUrl} alt="Avatar" width={112} height={112} className="object-cover w-full h-full" unoptimized />
                            ) : (
                                <span>{formData.fullName ? formData.fullName[0].toUpperCase() : 'U'}</span>
                            )}
                            
                            {/* Hover Overlay */}
                            {!uploading && (
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                    <Camera size={24} className="text-white mb-1"/>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Değiştir</span>
                                </div>
                            )}
                        </div>
                        {/* Gizli File Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{formData.fullName || 'İsimsiz Kullanıcı'}</h3>
                        <p className="text-sm text-gray-400 font-bold">@{formData.username || 'kullanici'}</p>
                        <button 
                            type="button" 
                            disabled={uploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all w-fit mt-1 disabled:opacity-50"
                        >
                            {uploading ? 'Yükleniyor...' : 'Fotoğrafı Güncelle'}
                        </button>
                    </div>
                </div>

                {/* Form Alanları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={labelClass}>Ad Soyad</label>
                    <div className="relative group">
                        <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input type="text" required className={`${inputClass} pl-12`} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Kullanıcı Adı</label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-black transition-colors">@</span>
                      <input type="text" required className={`${inputClass} pl-10`} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div>
                    <label className={labelClass}>Doğum Tarihi</label>
                    <div className="relative group">
                        <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors pointer-events-none" />
                        <input type="date" className={`${inputClass} pl-12 cursor-pointer appearance-none`} value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>E-Posta</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input type="email" disabled className={`${inputClass} pl-12 bg-gray-50 text-gray-400 cursor-not-allowed`} value={userEmail} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button type="submit" disabled={saving} className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:scale-100">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Değişiklikleri Kaydet</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* SAĞ KOLON: GÜVENLİK */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Lock size={18} /></div>
                  Güvenlik
                </h2>
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div>
                    <label className={labelClass}>Yeni Şifre</label>
                    <input type="password" placeholder="••••••••" className={inputClass} value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClass}>Tekrar</label>
                    <input type="password" placeholder="••••••••" className={inputClass} value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} />
                  </div>
                  <button type="submit" disabled={passwordSaving || (!passData.newPassword && !passData.confirmPassword)} className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {passwordSaving ? <Loader2 className="animate-spin" size={20} /> : 'Şifreyi Güncelle'}
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
                <button onClick={handleDeleteAccount} disabled={deleteLoading} className="w-full py-4 bg-white text-rose-600 border border-rose-200 rounded-2xl font-bold hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                    {deleteLoading ? <Loader2 className="animate-spin" size={20}/> : 'Hesabı Sil'}
                </button>
             </div>
          </div>

        </div>
      </main>
    </div>
  )
}