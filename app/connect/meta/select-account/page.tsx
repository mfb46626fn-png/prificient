'use client'

import { ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MetaMaintenancePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl max-w-md text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                    <ShoppingBag size={40} />
                </div>

                <h1 className="text-2xl font-black text-gray-900 mb-2">Meta Entegrasyonu</h1>
                <p className="text-gray-500 mb-8 font-medium">
                    Bu özellik şu anda bakım aşamasındadır. Şirket doğrulama süreçleri tamamlandığında tekrar aktif edilecektir.
                </p>

                <div className="bg-blue-50/50 p-4 rounded-xl mb-8 border border-blue-100">
                    <p className="text-xs text-blue-800 font-bold uppercase tracking-wider">Durum: Pasif</p>
                </div>

                <Link
                    href="/dashboard"
                    className="block w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                    Panele Dön
                </Link>
            </div>
        </div>
    )
}
