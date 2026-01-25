'use client'

import { useState } from 'react'
import { forgotPassword } from '@/lib/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await forgotPassword(formData)

        if (result.error) {
            setError(result.error)
        } else if (result.success) {
            setMessage(result.success)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-300">

                {/* LOGO */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="/logo.png"
                        alt="Prificient"
                        width={150}
                        height={50}
                        className="object-contain h-10 w-auto"
                        priority
                    />
                </div>

                <h1 className="text-2xl font-black text-center text-gray-900 mb-2">Şifrenizi mi Unuttunuz?</h1>
                <p className="text-gray-500 text-center text-sm font-medium mb-8">
                    Endişelenmeyin, e-posta adresinizi girin size sıfırlama talimatlarını gönderelim.
                </p>

                {message ? (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center animate-in fade-in">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="font-bold text-green-800 mb-1">E-posta Gönderildi!</h3>
                        <p className="text-green-700 text-sm font-medium">
                            {message}
                        </p>
                        <Link
                            href="/login"
                            className="inline-block mt-4 text-sm font-bold text-green-700 hover:text-green-800 underline"
                        >
                            Giriş sayfasına dön
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center animate-in shake">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                E-posta Adresi
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="ornek@sirket.com"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all outline-none font-medium"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Sıfırlama Linki Gönder'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-gray-500 font-bold text-sm hover:text-black transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Giriş Yap
                    </Link>
                </div>
            </div>
        </div>
    )
}
