'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Bell, Trash2, LogOut, User, Settings, ChevronDown, X,
  LayoutDashboard, FolderInput, Menu, Sparkles, Clock, Crown, History, PlugZap, MessageCircle, Calculator, ShieldAlert, Activity
} from 'lucide-react'
import GlobalLoader from '@/components/GlobalLoader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import BetaInfoModal from '@/components/BetaInfoModal'
import FeedbackModal from '@/components/FeedbackModal'
import { useProfile } from '@/app/contexts/ProfileContext'
import Image from 'next/image'
import { useSubscription } from '@/app/hooks/useSubscription'

type UserProfile = {
  full_name: string | null
  username: string | null
  email?: string
}

type Notification = {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

interface DashboardHeaderProps {
  isDemo?: boolean
}

export default function DashboardHeader({ isDemo = false }: DashboardHeaderProps) {
  // SIDEBAR STATE
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // ABONELİK DURUMU
  const { status: subStatus, daysLeft, loading: subLoading } = useSubscription()

  const router = useRouter()
  const supabase = createClient()
  const { currency, updateCurrency } = useCurrency()

  const menuRef = useRef<HTMLDivElement>(null)
  const sideMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const { avatarUrl, loading: profileLoading } = useProfile()

  // 1. BİLDİRİMLERİ ÇEK
  const fetchNotifications = async () => {
    if (isDemo) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) setNotifications(data)
    }
  }

  // 2. OKUNDU İŞARETLE
  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    if (!isDemo) await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  // 3. SİLME & TEMİZLEME
  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDemo) {
      setNotifications(prev => prev.filter(n => n.id !== id))
      return
    }
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (!error) setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = async () => {
    if (isDemo) {
      setNotifications([])
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('notifications').delete().eq('user_id', user.id)
      if (!error) setNotifications([])
    }
  }

  const [painScore, setPainScore] = useState(0)

  // 4. MOTOR & VERİ YÜKLEME
  useEffect(() => {
    fetchNotifications()

    // Fetch Pulse Data (Lightweight)
    async function checkPulse() {
      if (isDemo) { setPainScore(85); return; } // Demo Pulse
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('merchant_health_scores').select('pain_score').eq('user_id', user.id).maybeSingle()
        if (data) setPainScore(data.pain_score)
      }
    }
    checkPulse()
  }, [])

  useEffect(() => {
    const initData = async () => {
      if (isDemo) {
        setLoading(false)
        return
      }
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000))
      const dataFetch = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).maybeSingle()

          if (profileData) {
            setProfile({ full_name: profileData.full_name, username: profileData.username, email: user.email })
          } else {
            // Self-Healing
            const { error: insertError } = await supabase.from('profiles').insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || '',
              username: user.email?.split('@')[0]
            })
            if (!insertError) {
              setProfile({ full_name: user.user_metadata?.full_name || null, username: user.email?.split('@')[0] || null, email: user.email })
            }
          }
        }
      }
      await Promise.all([minLoadingTime, dataFetch(), fetchNotifications()])
      setLoading(false)
    }
    initData()

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setIsNotificationsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isDemo])

  const displayName = isDemo ? 'Demo Kullanıcı' : (profile?.full_name || profile?.email?.split('@')[0] || 'Kullanıcı')

  // V2 Placeholder Stats
  const status = "V2 Hazır"
  const statusColor = "text-emerald-600"

  // ABONELİK ROZETİ (SAĞ)
  const renderSubscriptionBadge = () => {
    if (isDemo) return null
    if (subLoading) return <div className="w-16 h-6 bg-gray-50 rounded-lg animate-pulse hidden sm:block"></div>

    // BETA = VISION
    if (subStatus === 'beta') {
      return (
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-black/5 border border-black/10 rounded-full">
          <Crown size={12} className="text-black fill-black" />
          <span className="text-[10px] font-black uppercase text-black tracking-widest">VISION</span>
        </div>
      )
    }

    if (subStatus === 'pro_active') {
      return (
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-700">
          <Crown size={12} className="fill-amber-700" />
          <span className="text-[10px] font-black uppercase tracking-widest">PRO</span>
        </div>
      )
    }

    // Fallback for Trial
    if (subStatus === 'trial_active') {
      return (
        <div className={`hidden md:flex px-3 py-1 rounded-full border text-[10px] font-black uppercase items-center gap-1.5 ${daysLeft < 3 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
          <Clock size={12} /> {daysLeft} Gün
        </div>
      )
    }

    return null
  }

  // SIDEBAR SUMMARY BADGE
  const renderSidebarBadge = () => {
    if (subStatus === 'beta') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-black border border-gray-800 rounded-lg shadow-sm">
          <Crown size={12} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase text-white tracking-wider">VISION</span>
        </div>
      )
    }
    // ... existing logic for others or generic fallback
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
        <span className={`w-2 h-2 rounded-full ${subStatus === 'pro_active' ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
        <span className="text-[10px] font-black uppercase text-gray-700">
          {subStatus === 'pro_active' ? 'PRO' : 'Deneme'}
        </span>
      </div>
    )
  }

  if (loading) return <GlobalLoader />

  return (
    <>
      {isDemo && (
        <div className="bg-indigo-600 text-white text-[10px] sm:text-xs font-bold text-center py-1.5 absolute top-0 left-0 w-full z-50 tracking-wide uppercase">
          DEMO MODU
        </div>
      )}

      {/* HEADER */}
      <header className={`bg-white border-b border-gray-100 sticky top-0 z-30 transition-all duration-500 ${isDemo ? 'mt-7' : ''}`}>
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">

          <div className="flex items-center gap-6">
            {/* MENÜ BUTONU */}
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 active:scale-95 text-gray-500 hover:text-black"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-3">
              <Link href={isDemo ? "/demo" : "/dashboard"} className="hover:opacity-80 transition-opacity">
                <Image
                  src="/logo.png"
                  alt="Prificient"
                  width={120}
                  height={40}
                  className="object-contain h-8 w-auto"
                  priority
                />
              </Link>

              {/* BETA BADGE (Left - Clickable) */}
              {subStatus === 'beta' && (
                <button
                  onClick={() => setIsBetaModalOpen(true)}
                  className="hidden sm:flex px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase border border-gray-200 items-center gap-1.5 hover:bg-black hover:text-white transition-colors group"
                  title="Yenilikleri Gör"
                >
                  <Sparkles size={10} className="group-hover:text-amber-400 transition-colors" />
                  <span>BETA v1.0</span>
                </button>
              )}
            </div>
          </div>

          {/* --- ORTA KISIM: ARAMA & Breadcrumb --- */}
          <div className="flex-1 px-8">
            {isDemo && (
              <div className="hidden md:flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold w-fit">
                <span className="animate-pulse">●</span> Demo Modu
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* SUBSCRIPTION BADGE (Right - Profile Area) */}
            {renderSubscriptionBadge()}

            {/* Bildirimler */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2.5 rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
              >
                <Bell size={20} />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              {/* ... (Notifications Dropdown) ... */}
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-[2rem] shadow-xl border border-gray-100 py-4 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  {/* ... notifications content ... */}
                  <div className="px-6 pb-2 border-b border-gray-50 flex justify-between items-center">
                    <h4 className="font-bold text-sm text-gray-900">Bildirimler</h4>
                    <div className="flex gap-2">
                      {notifications.length > 0 && <button onClick={clearAllNotifications} className="text-[10px] text-gray-400 hover:text-rose-600 font-bold">Temizle</button>}
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold">{notifications.filter(n => !n.is_read).length} Yeni</span>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} onClick={() => markAsRead(n.id)} className={`px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer group relative ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                          <div className="flex justify-between items-start">
                            <p className={`text-xs font-bold ${!n.is_read ? 'text-blue-600' : 'text-gray-900'}`}>{n.title}</p>
                            <button onClick={(e) => deleteNotification(n.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 rounded text-gray-400 hover:text-rose-600 transition-all"><Trash2 size={12} /></button>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-400 text-xs">Bildirim yok.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --- KULLANICI MENÜSÜ --- */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                  {isDemo ? 'D' : (profile?.full_name?.[0] || 'U')}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">
                    {isDemo ? 'Demo Kullanıcı' : (profile?.full_name || 'Kullanıcı')}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {isDemo ? 'Gözlemci' : (profile?.username || 'Hesap')}
                  </p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {/* ... (User Menu Dropdown) ... */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-[2rem] shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-6 py-4 border-b border-gray-50 mb-2">
                    <p className="text-sm font-black text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{isDemo ? 'Demo Modu' : (profile?.username ? `@${profile.username}` : profile?.email)}</p>
                  </div>

                  {!isDemo && (
                    <>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 mx-2 rounded-xl"><User size={18} /> Profil & Ayarlar</Link>
                      <div className="hidden"><Settings size={18} /></div> {/* Keeps icon import usage for now or remove later */}
                      <Link href="/support" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 mx-2 rounded-xl"><MessageCircle size={18} /> Destek</Link>

                      <button
                        onClick={() => { setIsMenuOpen(false); setIsFeedbackModalOpen(true); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 mx-2 rounded-xl"
                      >
                        <MessageCircle size={18} /> Geri Bildirim
                      </button>

                      <div className="h-px bg-gray-50 my-2 mx-4"></div>
                    </>
                  )}

                  <button
                    onClick={async () => {
                      if (isDemo) {
                        router.push('/')
                      } else {
                        await supabase.auth.signOut();
                        router.push('/login');
                      }
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-black text-rose-600 hover:bg-rose-50 mx-2 rounded-xl"
                  >
                    <LogOut size={18} /> {isDemo ? 'Demodan Çık' : 'Çıkış Yap'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- SIDEBAR ANIMASYON ALANI --- */}
      <div
        className={`fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isSideMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsSideMenuOpen(false)}
      />

      <div
        ref={sideMenuRef}
        className={`fixed left-4 top-4 bottom-4 w-80 bg-white rounded-[2.5rem] shadow-2xl flex flex-col border border-gray-100 overflow-hidden z-[100] transform transition-transform duration-500 cubic-bezier(0.33, 1, 0.68, 1) ${isSideMenuOpen ? 'translate-x-0' : '-translate-x-[120%]'
          }`}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <Image
              src="/logo.png"
              alt="Prificient"
              width={120}
              height={40}
              className="object-contain h-8 w-auto"
              priority
            />
            <button onClick={() => setIsSideMenuOpen(false)} className="p-2.5 hover:bg-gray-50 rounded-full transition-all hover:rotate-90"><X size={24} className="text-gray-400 hover:text-black" /></button>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Hoş Geldin</p>
            <h3 className="text-xl font-black text-gray-900 truncate">{displayName}</h3>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          <Link href="/dashboard" onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group">
            <LayoutDashboard size={20} className="group-hover:text-black" />
            <span className="text-sm font-black uppercase tracking-wider">Karar Masası</span>
          </Link>



          <Link href="/simulation" onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group">
            <Calculator size={20} className="group-hover:text-indigo-600" />
            <span className="text-sm font-black uppercase tracking-wider">CFO Simülasyonu</span>
          </Link>

          <Link href="/dashboard/recovery" onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group relative">
            <ShieldAlert size={20} className={`group-hover:text-blue-600 ${painScore > 80 ? 'text-red-500 animate-pulse' : ''}`} />
            <span className={`text-sm font-black uppercase tracking-wider ${painScore > 80 ? 'text-red-500' : ''}`}>Kurtarma Planı</span>

            {painScore > 80 && (
              <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
            )}
          </Link>

          <Link href="/connect/shopify" onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group">
            <PlugZap size={20} />
            <span className="text-sm font-black uppercase tracking-wider">Entegrasyonlar</span>
          </Link>
        </nav>

        <div className="px-8 mt-auto mb-8 space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İşletme Özeti</p>

          <div className="bg-gray-50 p-5 rounded-[1.5rem] border border-gray-100 space-y-4">

            {/* Health Score */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-gray-500">Veri Puanı</span>
                <span className={`text-xl font-black ${painScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {100 - painScore}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${painScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${100 - painScore}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 font-medium leading-tight">
                {painScore > 50 ? 'Risk seviyesi yüksek. Aksiyon alın.' : 'Finansal durum stabil görünüyor.'}
              </p>
            </div>

            <div className="w-full h-px bg-gray-200"></div>

            {/* Plan Status */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">Abonelik</span>
              {renderSidebarBadge()}
            </div>

          </div>
        </div>
      </div>

      <BetaInfoModal isOpen={isBetaModalOpen} onClose={() => setIsBetaModalOpen(false)} actionLabel="Kullanmaya Başla" onAction={() => router.push('/dashboard')} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </>
  )
}