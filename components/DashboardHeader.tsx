'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Bell, Package, Check, Trash2, LogOut, User, Settings, ChevronDown, X, Wallet, LayoutDashboard, FolderInput } from 'lucide-react'
import GlobalLoader from '@/components/GlobalLoader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { runNotificationEngine } from '@/utils/notificationEngine'
import BetaInfoModal from '@/components/BetaInfoModal' // Modal importu
import { useProfile } from '@/app/contexts/ProfileContext'
import Image from 'next/image'

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
  userEmail?: string
}

export default function DashboardHeader({ totalRevenue = 0, totalExpense = 0, isDemo = false }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  // Beta Modal State'i
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  
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
      if (data) setNotifications(data)
    }
  }

  // 2. OKUNDU İŞARETLE
  const markAsRead = async (id: string) => {
    if (isDemo) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }
  }

  // 3. BİLDİRİMİ SİL
  const deleteNotification = async (id: string) => {
    if (isDemo) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        return
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }
  }

  // 4. TÜMÜNÜ TEMİZLE
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

  // BİLDİRİM MOTORU
  useEffect(() => {
    const triggerEngine = async () => {
      if (isDemo || loading) return
      try {
        await runNotificationEngine(totalRevenue, totalExpense, (totalRevenue - totalExpense))
        await fetchNotifications()
      } catch (error) {
        console.error("Notification Engine Hatası:", error)
      }
    }
    triggerEngine()
  }, [totalRevenue, totalExpense, loading, isDemo])

  // VERİLERİN YÜKLENMESİ
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
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single()
          if (profileData) {
            setProfile({ full_name: profileData.full_name, username: profileData.username, email: user.email })
          }
        }
      }
      await Promise.all([minLoadingTime, dataFetch(), fetchNotifications()])
      setLoading(false)
    }
    initData()

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false)
      if (sideMenuRef.current && !sideMenuRef.current.contains(event.target as Node)) setIsSideMenuOpen(false)
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setIsNotificationsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [supabase, isDemo])

  const unreadCount = notifications.filter(n => !n.is_read).length
  const netProfit = totalRevenue - totalExpense
  const profitPercentage = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0"
  const status = netProfit > 0 ? "Kârda" : netProfit < 0 ? "Zararda" : "Stabil"
  const statusColor = netProfit > 0 ? "text-emerald-600" : netProfit < 0 ? "text-rose-600" : "text-blue-600"

  if (loading) return <GlobalLoader />

  const displayName = isDemo ? 'Demo Kullanıcı' : (profile?.full_name || profile?.email?.split('@')[0] || 'Kullanıcı')
  const initial = displayName[0]?.toUpperCase() || 'D'

  return (
    <>
      {/* DEMO UYARI BANDI */}
      {isDemo && (
         <div className="bg-indigo-600 text-white text-[10px] sm:text-xs font-bold text-center py-1.5 absolute top-0 left-0 w-full z-50 tracking-wide uppercase">
           DEMO MODU — Şu an örnek verileri inceliyorsunuz. Değişiklikler kaydedilmez.
         </div>
      )}

      {/* HEADER */}
      <header className={`bg-white border-b border-gray-100 sticky top-0 z-30 animate-in fade-in duration-500 ${isDemo ? 'mt-7' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSideMenuOpen(true)} className="p-1 hover:bg-gray-100 rounded-xl transition-all group relative">
              <div className="bg-black text-white w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform shadow-lg shadow-black/10">P</div>
            </button>
            
            <div className="flex items-center gap-3">
                <Link href={isDemo ? "/demo" : "/dashboard"} className="font-black text-xl tracking-tight text-gray-900 hidden sm:block">Prificient</Link>
                
                {/* BETA BUTONU */}
                <button 
                  onClick={() => setIsBetaModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wide hover:bg-blue-100 hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                  </span>
                  v1.0 Beta
                </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* BİLDİRİM BUTONU */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2.5 rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-3 w-85 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 py-5 animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="px-6 pb-4 border-b border-gray-50 flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-wider text-gray-900">Bildirimler</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{unreadCount} Okunmamış</p>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length > 0 ? notifications.map((n) => (
                      <div key={n.id} className={`px-6 py-5 hover:bg-gray-50/80 transition-all group relative ${!n.is_read ? 'bg-indigo-50/30' : ''}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className={`text-xs font-bold ${!n.is_read ? 'text-indigo-900' : 'text-gray-900'}`}>{n.title}</p>
                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                            <span className="text-[9px] font-medium text-gray-400 mt-2 block italic">{new Date(n.created_at).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!n.is_read && <button onClick={() => markAsRead(n.id)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"><Check size={14} /></button>}
                            <button onClick={() => deleteNotification(n.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    )) : <div className="py-12 text-center"><p className="text-xs font-bold text-gray-400">Bildirim bulunmuyor.</p></div>}
                  </div>
                  <div className="px-6 pt-4 border-t border-gray-50">
                    <button onClick={clearAllNotifications} className="w-full py-3 bg-gray-50 rounded-2xl text-[11px] font-black text-gray-500 hover:text-black hover:bg-gray-100 uppercase tracking-[0.2em] transition-all">Tümünü Temizle</button>
                  </div>
                </div>
              )}
            </div>

            {/* PROFİL / ÇIKIŞ */}
            {!isDemo ? (
                <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 p-1.5 pr-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                    
                    {/* --- AVATAR GÖRÜNTÜLEME --- */}
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm overflow-hidden relative">
                        {profileLoading ? (
                            <div className="animate-pulse bg-gray-400 w-full h-full"></div>
                        ) : avatarUrl ? (
                            <Image src={avatarUrl} alt="Profil" width={32} height={32} className="object-cover w-full h-full" unoptimized />
                        ) : (
                            initial
                        )}
                    </div>
                    {/* --------------------------- */}

                    <span className="hidden md:block text-sm font-bold text-gray-700 truncate">{displayName}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 py-3 animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="px-6 py-4 border-b border-gray-50 mb-2">
                        <p className="text-sm font-black text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{profile?.username ? `@${profile.username}` : profile?.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 mx-2 rounded-2xl transition-all"><User size={18} /> Profil</Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 mx-2 rounded-2xl transition-all"><Settings size={18} /> Ayarlar</Link>
                    <div className="h-px bg-gray-50 my-2 mx-4"></div>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-black text-rose-600 hover:bg-rose-50 mx-2 rounded-2xl transition-all"><LogOut size={18} /> Çıkış Yap</button>
                    </div>
                )}
                </div>
            ) : (
                <Link href="/" className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-2xl text-xs font-bold text-gray-700 transition-colors border border-gray-200">
                    <LogOut size={14} /> Demodan Çık
                </Link>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-[100] flex overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-500" onClick={() => setIsSideMenuOpen(false)}></div>
          <div ref={sideMenuRef} className="relative w-85 bg-white h-[96%] my-auto ml-4 rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-left-full duration-700">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="bg-black text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-black/20">P</div>
                <button onClick={() => setIsSideMenuOpen(false)} className="p-2.5 hover:bg-gray-50 rounded-full transition-all duration-300 hover:rotate-90"><X size={24} className="text-gray-400 hover:text-black" /></button>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Hoş Geldin</p>
                <h3 className="text-xl font-black text-gray-900 truncate">{displayName}</h3>
              </div>
            </div>

            <nav className="px-4 space-y-1">
              <Link href={isDemo ? "/demo" : "/dashboard"} onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group">
                <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" /> 
                <span className="text-sm font-black uppercase tracking-wider">Dashboard</span>
              </Link>
              <Link href={isDemo ? "/demo/transactions" : "/transactions"} onClick={() => setIsSideMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group">
                <div className="relative"><FolderInput size={20} className="group-hover:scale-110 transition-transform" /></div>
                <span className="text-sm font-black uppercase tracking-wider">İşlemler & Veri</span>
              </Link>
              <Link href={isDemo ? "#" : "/financial-settings"} onClick={() => { setIsSideMenuOpen(false); if(isDemo) alert('Bu özellik demo modunda kısıtlıdır.'); }} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group">
                <Wallet size={20} className="group-hover:scale-110 transition-transform" /> 
                <span className="text-sm font-black uppercase tracking-wider">Finansal Ayarlar</span>
              </Link>
              <Link href={isDemo ? "#" : "/settings"} onClick={() => { setIsSideMenuOpen(false); if(isDemo) alert('Bu özellik demo modunda kısıtlıdır.'); }} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group">
                <Settings size={20} className="group-hover:scale-110 transition-transform" /> 
                <span className="text-sm font-black uppercase tracking-wider">Genel Ayarlar</span>
              </Link>
              <Link href={isDemo ? "#" : "/products"} onClick={() => { setIsSideMenuOpen(false); if(isDemo) alert('Bu özellik demo modunda kısıtlıdır.'); }} className="flex items-center gap-4 px-6 py-4 text-gray-500 font-bold hover:text-black hover:bg-gray-50 rounded-[2rem] transition-all group">
                <div className="relative">
                  <Package size={20} className="group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-sm font-black uppercase tracking-wider">Ürün Kataloğu</span>
              </Link>
            </nav>

            <div className="px-8 mt-8 space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İşletme Özeti</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100 transition-all hover:shadow-md">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Kârlılık</p>
                  <p className={`text-sm font-black tracking-tight ${netProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>{netProfit >= 0 ? '+' : ''}%{profitPercentage}</p>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 transition-all hover:shadow-md">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Durum</p>
                  <p className={`text-sm font-black tracking-tight ${statusColor}`}>{status}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto p-8 space-y-6">
              <div className="p-1.5 bg-gray-100/80 rounded-3xl border border-gray-100 flex items-center justify-between">
                {['TRY', 'USD', 'EUR'].map((curr) => (
                  <button key={curr} onClick={() => updateCurrency(curr)} className={`flex-1 text-[10px] font-black py-2.5 rounded-2xl transition-all ${currency === curr ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}>{curr}</button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-2xl py-3 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Prificient v1.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EN ALTA EKLENDİ VE ÇALIŞIR DURUMDA */}
      <BetaInfoModal 
        isOpen={isBetaModalOpen} 
        onClose={() => setIsBetaModalOpen(false)} 
      />
    </>
  )
}