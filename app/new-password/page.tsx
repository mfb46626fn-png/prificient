'use client'

import { useState, Suspense } from 'react'
import { resetPasswordWithToken } from '@/lib/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

function NewPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<boolean>(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!token) {
            setError('Geçersiz bağlantı.')
            setLoading(false)
            return
        }

        const formData = new FormData(e.currentTarget)
        formData.append('token', token)

        const result = await resetPasswordWithToken(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else if (result.success) {
            setSuccess(true)
            // Optional: Redirect after delay
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        }
    }

    if (!token) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center font-bold">
                <p>Geçersiz Bağlantı</p>
                <Link href="/forgot-password" className="text-sm underline mt-2 block">Yeni bir link isteyin</Link>
            </div>
        )
    }

    return (
        <div className="w-full">
            {success ? (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center animate-in fade-in">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="font-bold text-green-800 mb-1">Şifreniz Güncellendi!</h3>
                    <p className="text-green-700 text-sm font-medium">
                        Giriş yapmak için yönlendiriliyorsunuz...
                    </p>
                    <Link href="/login" className="inline-block mt-4 text-sm font-bold text-green-700 hover:text-green-800 underline">
                        Hemen Giriş Yap
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
                        <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Yeni Şifre
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Şifre Tekrar
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Şifreyi Güncelle'}
                    </button>
                </form>
            )}
        </div>
    )
}

export default function NewPasswordPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-300">
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

                <h1 className="text-2xl font-black text-center text-gray-900 mb-2">Yeni Şifre Belirle</h1>
                <p className="text-gray-500 text-center text-sm font-medium mb-8">
                    Lütfen hesabınız için yeni ve güvenli bir şifre belirleyin.
                </p>

                <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>}>
                    <NewPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
