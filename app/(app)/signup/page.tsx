'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

// Google İkonu (SVG) - Tekrar Kullanılabilir
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('') // İsim alanı eklendi
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // 1. E-POSTA İLE KAYIT
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Supabase Auth ile kayıt ol
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          is_onboarding_completed: false // Kritik: Onboarding'e gitmesi için
        }
      }
    })

    if (error) {
      console.error("Signup Error:", error)
      if (error.message.includes('already registered') || error.message.includes('already exists') || error.status === 422) {
        alert("Bu e-posta adresiyle zaten bir hesap mevcut. Lütfen giriş yapınız.")
        router.push('/login')
      } else {
        alert(error.message)
      }
    } else {
      // Başarılıysa Onboarding'e yönlendir
      router.push('/onboarding')
      router.refresh()
    }
    setLoading(false)
  }

  // 2. GOOGLE İLE KAYIT (Login ile aynıdır, Supabase hesabı yoksa oluşturur)
  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      alert(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 sm:p-12">

        <div className="text-center mb-10">
          <div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black mx-auto shadow-lg shadow-black/20 mb-4">P</div>
          <h2 className="text-2xl font-black text-gray-900">Hesap Oluştur</h2>
          <p className="text-gray-500 font-medium mt-2">Prificient ile finansal özgürlüğüne adım at.</p>
        </div>

        {/* --- GOOGLE SIGNUP --- */}
        <button
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mb-6"
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <GoogleIcon />
              <span>Google ile Kayıt Ol</span>
            </>
          )}
        </button>

        {/* --- AYIRICI --- */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">veya e-posta ile</span></div>
        </div>

        {/* --- KAYIT FORMU --- */}
        <form onSubmit={handleEmailSignup} className="space-y-4">

          {/* İsim Alanı */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">Ad Soyad</label>
            <input
              type="text"
              required
              className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="Adınız Soyadınız"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">E-posta Adresi</label>
            <input
              type="email"
              required
              className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 ml-1">Şifre Oluştur</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5 transition-all"
              placeholder="En az 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ücretsiz Kayıt Ol'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          Zaten hesabın var mı? <Link href="/login" className="text-black font-bold hover:underline">Giriş Yap</Link>
        </p>

      </div>
    </div>
  )
}