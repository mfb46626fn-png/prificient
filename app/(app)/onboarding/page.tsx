'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Store, Loader2, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()

  const [shopUrl, setShopUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      // Check if already connected, if so, skip to dashboard or diagnosis
      const { data: integration } = await supabase.from('integrations').select('id').eq('user_id', user.id).maybeSingle()
      if (integration) {
        router.replace('/dashboard')
      }
    }
    checkUser()
  }, [router])

  const handleConnect = async () => {
    if (!shopUrl) return
    setLoading(true)

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
        setLoading(false)
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Bir hata oluştu.' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">

        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <Store size={40} />
        </div>

        <div>
          <h1 className="text-3xl font-black mb-2">Mağazanızı Bağlayın</h1>
          <p className="text-gray-400">Prificient'ın finansal röntgeni (MRI) çekebilmesi için Shopify mağazanıza erişim izni vermelisiniz.</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="magazam.myshopify.com"
            value={shopUrl}
            onChange={(e) => setShopUrl(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white font-bold rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-center placeholder:text-gray-700"
          />

          <button
            onClick={handleConnect}
            disabled={loading || !shopUrl}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Analizi Başlat <ArrowRight /></>}
          </button>

          <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mt-4">
            Sadece Okuma İzni (Read-Only) Alınır
          </p>
        </div>

      </div>
    </div>
  )
}