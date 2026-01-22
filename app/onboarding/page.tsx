'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { completeOnboarding } from '@/app/actions/auth'
import { CheckCircle2, ChevronRight, Store, Rocket, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/ui/toast'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()

  const [step, setStep] = useState(1) // 1: Welcome, 2: Connect, 3: Success
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Shopify State
  const [shopUrl, setShopUrl] = useState('')
  const [connectLoading, setConnectLoading] = useState(false)

  useEffect(() => {
    const checkUserAndStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)

        // Entegrasyon yapıldı mı kontrol et
        const { data: integration } = await supabase
          .from('integrations')
          .select('id')
          .eq('user_id', user.id)
          .eq('platform', 'shopify')
          .maybeSingle()

        if (integration) {
          setStep(3) // Zaten bağlanmış, tamamlamaya git
        }
      } else {
        router.push('/login')
      }
    }
    checkUserAndStatus()
  }, [])

  // --- ACTIONS ---

  const handleConnectShopify = async () => {
    setConnectLoading(true)
    try {
      let cleanUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
      if (!cleanUrl.includes('.myshopify.com')) {
        cleanUrl += '.myshopify.com'
      }

      const response = await fetch(`/api/shopify/auth?shop=${cleanUrl}`)
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        showToast({ type: 'error', message: data.error || 'Bağlantı hatası' })
      }
    } catch (err: any) {
      showToast({ type: 'error', message: 'Beklenmedik bir hata oluştu.' })
    } finally {
      setConnectLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!userId) return
    setLoading(true)

    // Server Action ile güncelle
    const res = await completeOnboarding(userId)

    if (res?.error) {
      showToast({ type: 'error', message: res.error })
      setLoading(false)
    } else {
      showToast({ type: 'success', message: 'Kurulum tamamlandı! Yönlendiriliyorsunuz...' })
      router.push('/dashboard')
    }
  }

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Container */}
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col">

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 flex">
          <div className={`h-full bg-black transition-all duration-500 ease-out`} style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-8 md:p-12 items-center justify-center text-center animate-in fade-in duration-500">

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6 max-w-md">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Rocket size={40} />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hoş Geldiniz!</h1>
              <p className="text-gray-500 text-lg">
                Prificient ile finansal özgürlüğünüze giden yolculuk başlıyor. Sadece birkaç adımda mağazanızı analiz etmeye başlayacağız.
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-8"
              >
                Başlayalım <ChevronRight />
              </button>
            </div>
          )}

          {/* STEP 2: CONNECT */}
          {step === 2 && (
            <div className="space-y-6 w-full max-w-md">
              <div className="w-20 h-20 bg-[#95BF47]/10 text-[#95BF47] rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Store size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Mağazanızı Bağlayın</h2>
              <p className="text-gray-500">
                Shopify mağazanızdaki verileri çekerek size özel analizler sunabilmemiz için bağlantı kurmamız gerekiyor.
              </p>

              <div className="mt-8 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="magazam.myshopify.com"
                    value={shopUrl}
                    onChange={(e) => setShopUrl(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#95BF47] focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={handleConnectShopify}
                  disabled={connectLoading || !shopUrl}
                  className="w-full bg-[#95BF47] text-white py-4 rounded-xl font-bold hover:bg-[#85AB3E] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {connectLoading ? <Loader2 className="animate-spin" /> : 'Shopify ile Bağlan'}
                </button>
              </div>

              <button
                onClick={() => setStep(3)}
                className="text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors mt-4"
              >
                Şimdilik Geç (Demo Modu)
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="space-y-6 max-w-md">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in spin-in-12 duration-500">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Kurulum Tamamlandı!</h2>
              <p className="text-gray-500 text-lg">
                Her şey hazır. Şimdi dashboard'a giderek verilerinizi incelemeye başlayabilirsiniz.
              </p>

              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-8 shadow-xl shadow-black/10"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Dashboard\'a Git'}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-gray-400 text-xs font-bold">© 2026 We CaHan LTD.</p>

    </div>
  )
}