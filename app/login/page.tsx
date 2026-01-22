'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

// Modern Google Icon
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  // --- STATE ---
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // --- HOOKS ---
  const { showToast } = useToast()

  // --- FORM İŞLEMLERİ ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log("Form submitted. Mode:", mode)

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          console.error("Login Error:", error)
          showToast({ type: 'error', title: 'Giriş Başarısız', message: error.message })
        } else {
          console.log("Login Success")
          showToast({ type: 'success', title: 'Hoş Geldiniz', message: 'Yönlendiriliyorsunuz...' })

          // Check for Admin
          const user = data.user;
          const userEmail = (user?.email || '').toLowerCase().trim();
          const isAdmin = ['can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com'].includes(userEmail) ||
            user?.app_metadata?.role === 'prificient_admin' ||
            user?.user_metadata?.role === 'prificient_admin';

          if (isAdmin) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
          router.refresh()
        }
      } else {
        // --- SIGNUP MODE ---
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              is_onboarding_completed: false
            }
          }
        })

        if (error) {
          console.error("Signup Error:", error)
          if (error.message.includes('already registered') || error.message.includes('already exists') || error.status === 422) {
            showToast({ type: 'warning', title: 'Hesap Zaten Var', message: 'Bu e-posta adresiyle zaten bir hesap var. Lütfen giriş yapın.' })
            // Optional: switch to login mode automatically?
            // setMode('login') 
          } else {
            showToast({ type: 'error', title: 'Kayıt Başarısız', message: error.message })
          }
        } else {
          console.log("Signup Success:", data)
          // Check if user is created but waiting for confirmation
          if (data.user && data.user.identities && data.user.identities.length === 0) {
            showToast({ type: 'warning', title: 'Hesap Zaten Var', message: 'Bu e-posta adresiyle zaten bir hesap var. Lütfen giriş yapın.' })
          } else {
            showToast({ type: 'success', title: 'Kayıt Başarılı', message: 'Hesabınız oluşturuldu. Yönlendiriliyorsunuz...' })
            router.push('/onboarding')
            router.refresh()
          }
        }
      }
    } catch (err: any) {
      console.error("Unexpected Error in Auth:", err)
      showToast({ type: 'error', title: 'Sistem Hatası', message: err.message || 'Beklenmedik bir hata oluştu.' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) {
        showToast({ type: 'error', message: error.message })
      }
    } catch (err: any) {
      showToast({ type: 'error', message: err.message })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* LEFT SIDE: FORM */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="max-w-[400px] w-full space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">

          {/* Header */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-block mb-12 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10">
                <Image src="/logo.png" alt="Prificient" fill className="object-contain" />
              </div>
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              {mode === 'login' ? 'Tekrar Hoş Geldin' : 'Hemen Başla'}
            </h1>
            <p className="text-gray-500 font-medium">
              {mode === 'login'
                ? 'Finansal özgürlüğünü yönetmeye devam et.'
                : 'E-ticaret finansınızı yapay zeka ile yönetin.'}
            </p>
          </div>

          {/* Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex font-bold text-sm">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${mode === 'login' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  placeholder="Adınız Soyadınız"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">E-posta</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="ornek@sirket.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Şifre</label>
                {mode === 'login' && <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline">Unuttun mu?</Link>}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 hover:scale-[1.01] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400 font-bold uppercase">veya</span></div>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            {googleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
            <span>Google ile Devam Et</span>
          </button>

          <p className="text-center text-xs text-gray-400 font-medium">
            Devam ederek <Link href="/terms" className="underline text-gray-500 hover:text-black">Kullanım Koşulları</Link>'nı kabul etmiş sayılırsınız.
          </p>

        </div>
      </div>

      {/* RIGHT SIDE: VISUAL / TESTIMONIAL */}
      <div className="hidden lg:flex relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 max-w-md text-white p-12">
          <h2 className="text-4xl font-black tracking-tight mb-6">
            "Kârınızı Yönetmenin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">En Akıllı Yolu."</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Prificient, e-ticaret operasyonlarınızdaki gizli maliyetleri bulur ve net kârınızı artırmanız için size rehberlik eder.
          </p>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl">P</div>
            <div>
              <p className="font-bold">Prificient AI</p>
              <p className="text-xs text-blue-200">Finansal Asistanınız</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}