'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { ShieldCheck, User as UserIcon, Lock, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'

export default function ProfileClient() {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Form States
    const [fullName, setFullName] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Status States
    const [profileSaving, setProfileSaving] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                setFullName(user.user_metadata?.full_name || '')
            }
            setLoading(false)
        }
        loadUser()
    }, [supabase])

    const showToast = (message: string) => {
        setToastMessage(message)
        setTimeout(() => setToastMessage(null), 3000)
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setProfileSaving(true)

        try {
            // Update Auth Metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            })
            if (authError) throw authError

            // Update Public Users Table
            const { error: dbError } = await supabase
                .from('users')
                .update({ full_name: fullName })
                .eq('id', user.id)

            if (dbError) throw dbError

            showToast('Profil başarıyla güncellendi')
        } catch (error) {
            console.error('Profile update failed:', error)
            showToast('Profil güncellenirken bir hata oluştu')
        } finally {
            setProfileSaving(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            showToast('Şifreler eşleşmiyor')
            return
        }
        if (newPassword.length < 6) {
            showToast('Şifre en az 6 karakter olmalıdır')
            return
        }

        setPasswordSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })
            if (error) throw error

            setNewPassword('')
            setConfirmPassword('')
            showToast('Şifre başarıyla güncellendi')
        } catch (error) {
            console.error('Password update failed:', error)
            showToast('Şifre güncellenirken bir hata oluştu')
        } finally {
            setPasswordSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
                <ShieldCheck className="w-16 h-16 text-white/20 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Profilinize Erişilemiyor</h1>
                <p className="text-neutral-400 mb-6 max-w-sm">
                    Profilinizi görüntülemek için lütfen giriş yapın.
                </p>
                <a href="/login?redirect=/profile" className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors">
                    Giriş Yap
                </a>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] pb-24">
            {/* Header */}
            <header className="bg-[#050505]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <a href="/tools-home" className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-white" />
                        <h1 className="text-lg font-bold text-white">Profil ve Güvenlik</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Sidebar Menu */}
                    <div className="w-full md:w-64 shrink-0">
                        <nav className="flex flex-col gap-1">
                            <button className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl text-sm font-semibold text-white border border-white/10">
                                <UserIcon className="w-4 h-4" />
                                Genel Profil
                            </button>
                            <a href="/my-vault" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">
                                <ShieldCheck className="w-4 h-4" />
                                Kasam (Finansal Veriler)
                            </a>
                        </nav>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 space-y-8">
                        {/* Profile Info Card */}
                        <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Kişisel Bilgiler</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Ad Soyad</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-shadow"
                                        placeholder="Adınız Soyadınız"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">E-Posta Adresi</label>
                                    <input
                                        type="email"
                                        value={user.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-xl text-neutral-500 cursor-not-allowed select-none"
                                    />
                                    <p className="mt-2 text-xs text-neutral-500">Güvenlik nedeniyle e-posta adresi menüden değiştirilemez.</p>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={profileSaving}
                                        className="inline-flex items-center justify-center min-w-[160px] px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-colors disabled:bg-white/50 disabled:cursor-not-allowed"
                                    >
                                        {profileSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Password Management Card */}
                        <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Lock className="w-5 h-5 text-white" />
                                <h2 className="text-xl font-bold text-white">Şifre Yönetimi</h2>
                            </div>
                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-shadow"
                                        placeholder="En az 6 karakter"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-shadow"
                                        placeholder="Şifrenizi tekrar girin"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={passwordSaving || !newPassword || newPassword !== confirmPassword}
                                        className="inline-flex items-center justify-center min-w-[160px] px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                                    >
                                        {passwordSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Şifreyi Güncelle'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Simple Toast */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl shadow-xl shadow-black/50">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span className="text-sm font-medium text-white">{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
