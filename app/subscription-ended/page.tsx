import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function SubscriptionEndedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">Deneme Süreniz Doldu</h1>
        <p className="text-gray-500 mb-8 font-medium">
          Prificient ile finansal takibe devam etmek için lütfen aboneliğinizi başlatın. Verileriniz güvende, sadece erişime kapalı.
        </p>

        <button className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg shadow-black/20 mb-4">
          Planı Yükselt (Yakında)
        </button>
        
        <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-gray-600">
          Çıkış Yap
        </Link>
      </div>
    </div>
  )
}