'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  Bell, Package, Trash2, LogOut, User, Settings, ChevronDown, X, 
  LayoutDashboard, FolderInput, Menu, Sparkles, Clock, Crown 
} from 'lucide-react'
import GlobalLoader from '@/components/GlobalLoader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { runNotificationEngine } from '@/utils/notificationEngine'
import BetaInfoModal from '@/components/BetaInfoModal'
import { useProfile } from '@/app/contexts/ProfileContext'
import Image from 'next/image'
// Abonelik Hook'u (Dosya yolunu projene göre kontrol et, genelde @/hooks/...)
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
  totalRevenue?: number
  totalExpense?: number
  isDemo?: boolean
}

export default function DashboardHeader({ totalRevenue = 0, totalExpense = 0, isDemo = false }: DashboardHeaderProps) {
  // SIDEBAR STATE
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  
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

  // 4. MOTOR & VERİ YÜKLEME
  useEffect(() => {
    const triggerEngine = async () => {
      if (isDemo || loading) return
      try {
        await runNotificationEngine(totalRevenue, totalExpense, (totalRevenue - totalExpense))
        await fetchNotifications()
      } catch (error) { console.error(error) }
    }
    triggerEngine()
  }, [totalRevenue, totalExpense, loading, isDemo])

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
          const { data: profileData } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).single()
          if (profileData) setProfile({ full_name: profileData.full_name, username: profileData.username, email: user.email })
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
  const initial = displayName[0]?.toUpperCase() || 'D'
  const netProfit = totalRevenue - totalExpense
  const profitPercentage = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0"
  const status = netProfit > 0 ? "Kârda" : netProfit < 0 ? "Zararda" : "Stabil"
  const statusColor = netProfit > 0 ? "text-emerald-600" : netProfit < 0 ? "text-rose-600" : "text-blue-600"

  // AKILLI ROZET RENDERER
  const renderStatusBadge = () => {
    if (isDemo) return null
    if (subLoading) return <div className="w-24 h-6 bg-gray-100 rounded-full animate-pulse hidden sm:block"></div>

    if (subStatus === 'beta') {
      return (
        <button 
          onClick={() => setIsBetaModalOpen(true)}
          className="hidden sm:flex px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase hover:bg-indigo-100 transition-all items-center justify-center gap-1.5"
        >
          <Sparkles size={12} className="text-indigo-500"/>
          Beta (Sınırsız)
        </button>
      )
    }

    if (subStatus === 'trial_active') {
      return (
        <div className={`hidden sm:flex px-3 py-1 rounded-full border text-[10px] font-black uppercase items-center gap-1.5 ${daysLeft < 3 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
          <Clock size={12} /> {daysLeft} Gün Kaldı
        </div>
      )
    }

    if (subStatus === 'trial_expired') {
      return (
        <div className="hidden sm:flex px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase border border-gray-700 items-center gap-1.5">
          <LogOut size={12} /> Süre Doldu
        </div>
      )
    }

    if (subStatus === 'pro_active') {
      return (
        <div className="hidden sm:flex px-3 py-1 bg-black text-amber-400 rounded-full text-[10px] font-black uppercase border border-gray-800 items-center gap-1.5 shadow-sm">
          <Crown size={12} /> PRO
        </div>
      )
    }
    return null
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
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
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
                
                {/* DİNAMİK ROZET BURAYA GELDİ */}
                {renderStatusBadge()}
            </div>
          </div>

          <div className="flex items-center gap-3">
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

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-[2rem] shadow-xl border border-gray-100 py-4 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
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

            {/* Profil */}
            {!isDemo ? (
                <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
                        {profileLoading ? <div className="animate-pulse bg-gray-600 w-full h-full"></div> : avatarUrl ? <Image src={avatarUrl} alt="Profil" width={32} height={32} className="object-cover w-full h-full" unoptimized /> : initial}
                    </div>
                    <span className="hidden md:block text-sm font-bold text-gray-700 truncate">{displayName}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-[2rem] shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <div className="px-6 py-4 border-b border-gray-50 mb-2">
                          <p className="text-sm font-black text-gray-900 truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{profile?.username ? `@${profile.username}` : profile?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 mx-2 rounded-xl"><User size={18} /> Profil</Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 mx-2 rounded-xl"><Settings size={18} /> Ayarlar</Link>
                      <div className="h-px bg-gray-50 my-2 mx-4"></div>
                      <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-black text-rose-600 hover:bg-rose-50 mx-2 rounded-xl"><LogOut size={18} /> Çıkış Yap</button>
                    </div>
                )}
                </div>
            ) : (
                <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors">
                    <LogOut size={14} /> Çıkış
                </Link>
            )}
          </div>
        </div>
      </header>

      {/* --- SIDEBAR ANIMASYON ALANI --- */}
      <div 
        className={`fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
          isSideMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSideMenuOpen(false)}
      />

      <div 
        ref={sideMenuRef}
        className={`fixed left-4 top-4 bottom-4 w-80 bg-white rounded-[2.5rem] shadow-2xl flex flex-col border border-gray-100 overflow-hidden z-[100] transform transition-transform duration-500 cubic-bezier(0.33, 1, 0.68, 1) ${
          isSideMenuOpen ? 'translate-x-0' : '-translate-x-[120%]'
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

          <nav className="px-4 space-y-1">
            <Link href={isDemo ? "/demo" : "/dashboard"} onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all">
              <LayoutDashboard size={20} /> <span className="text-sm font-black uppercase tracking-wider">Dashboard</span>
            </Link>
            <Link href={isDemo ? "/demo/transactions" : "/transactions"} onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all">
              <FolderInput size={20} /> <span className="text-sm font-black uppercase tracking-wider">İşlemler & Veri</span>
            </Link>
            <Link href={isDemo ? "#" : "/settings"} onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all">
              <Settings size={20} /> <span className="text-sm font-black uppercase tracking-wider">Genel Ayarlar</span>
            </Link>
          </nav>

          <div className="px-8 mt-auto mb-8 space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İşletme Özeti</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Kârlılık</p>
                <p className={`text-sm font-black ${netProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>{netProfit >= 0 ? '+' : ''}%{profitPercentage}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Durum</p>
                <p className={`text-sm font-black ${statusColor}`}>{status}</p>
              </div>
            </div>
            
            <div className="bg-gray-100/80 rounded-2xl p-1 flex">
              {['TRY', 'USD', 'EUR'].map((curr) => (
                <button key={curr} onClick={() => updateCurrency(curr)} className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all ${currency === curr ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-black'}`}>{curr}</button>
              ))}
            </div>
          </div>
      </div>

      <BetaInfoModal isOpen={isBetaModalOpen} onClose={() => setIsBetaModalOpen(false)} />
    </>
  )
}