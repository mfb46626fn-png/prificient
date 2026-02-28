'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { triggerToast } from '@/components/tools/Toast'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Form inputs
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Loading states
    const [updatingProfile, setUpdatingProfile] = useState(false)
    const [updatingPassword, setUpdatingPassword] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)
                const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || ''
                setFullName(name)
                setEmail(session.user.email || '')
            } else {
                window.location.href = '/tools-home' // Redirect if not logged in
            }
            setLoading(false)
        }
        fetchUser()
    }, [supabase])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setUpdatingProfile(true)

        try {
            // Update auth user metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            })

            if (authError) throw authError

            // Optionally, update public users table if exists
            await supabase.from('users').update({ full_name: fullName }).eq('id', user.id)

            triggerToast({
                message: 'Değişiklikler kaydedildi',
                subtext: 'Kişisel profil bilgileriniz güncellendi.'
            })
        } catch (error: any) {
            triggerToast({
                message: 'Güncelleme başarısız',
                subtext: error.message || 'Bir hata oluştu.'
            })
        } finally {
            setUpdatingProfile(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            triggerToast({
                message: 'Şifreler uyuşmuyor',
                subtext: 'Lütfen şifreleri tekrar kontrol edin.'
            })
            return
        }
        if (newPassword.length < 6) {
            triggerToast({
                message: 'Şifre çok kısa',
                subtext: 'En az 6 karakterli bir şifre belirleyin.'
            })
            return
        }

        setUpdatingPassword(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setNewPassword('')
            setConfirmPassword('')

            triggerToast({
                message: 'Şifre yenilendi',
                subtext: 'Güvenlik ayarlarınız başarıyla güncellendi.'
            })
        } catch (error: any) {
            triggerToast({
                message: 'Şifre değiştirilemedi',
                subtext: error.message || 'Lütfen tekrar deneyin.'
            })
        } finally {
            setUpdatingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen py-24 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
                        Profil ve Güvenlik
                    </h1>
                    <p className="text-sm text-neutral-400">
                        Prificient ekosistemindeki hesap bilgilerinizi yönetin.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Menu (Optional / Simple) */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors">
                                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Genel Profil
                            </a>
                        </nav>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 space-y-8">

                        {/* Card 1: Personal Info */}
                        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white">Kişisel Bilgiler</h3>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="p-6">
                                <div className="space-y-5">
                                    <div>
                                        <label htmlFor="fullName" className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                                            Ad Soyad
                                        </label>
                                        <input
                                            id="fullName"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full max-w-sm py-2.5 px-4 rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                                            E-Posta (Değiştirilemez)
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full max-w-sm py-2.5 px-4 rounded-xl border border-white/5 bg-black/40 text-neutral-500 text-sm cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center">
                                    <button
                                        type="submit"
                                        disabled={updatingProfile}
                                        className="h-10 px-6 rounded-xl bg-white text-black text-sm font-semibold transition-all hover:bg-neutral-200 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                                    >
                                        {updatingProfile ? (
                                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            'Değişiklikleri Kaydet'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Card 2: Password Management */}
                        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
                            <div className="px-6 py-5 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white">Şifre Yönetimi</h3>
                            </div>
                            <form onSubmit={handleUpdatePassword} className="p-6">
                                <div className="space-y-5">
                                    <div>
                                        <label htmlFor="newPassword" className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                                            Yeni Şifre
                                        </label>
                                        <input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full max-w-sm py-2.5 px-4 rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wide">
                                            Yeni Şifre (Tekrar)
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full max-w-sm py-2.5 px-4 rounded-xl border border-white/10 bg-black/20 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center">
                                    <button
                                        type="submit"
                                        disabled={updatingPassword || !newPassword || !confirmPassword}
                                        className="h-10 px-6 rounded-xl border border-white/10 bg-transparent text-white text-sm font-semibold transition-all hover:bg-white/5 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                                    >
                                        {updatingPassword ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Şifreyi Güncelle'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
