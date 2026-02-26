'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'

export default function BetaApplicationForm() {
    const supabase = createClient()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        storeUrl: '',
        platform: '',
        orderVolume: '',
        criticalPainPoint: ''
    })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Write to beta_applications table
            const { error: insertError } = await supabase
                .from('beta_applications')
                .insert({
                    name: formData.name,
                    email: formData.email,
                    store_url: formData.storeUrl,
                    platform: formData.platform,
                    order_volume: formData.orderVolume,
                    critical_pain_point: formData.criticalPainPoint,
                    status: 'pending' // default status
                })

            if (insertError) throw insertError

            setSubmitted(true)
        } catch (err: any) {
            console.error('Beta application error:', err)
            setError(err.message || 'Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 sm:p-12 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center"
            >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Başvurunuz Alındı</h3>
                <p className="text-white/50 leading-relaxed font-medium">
                    We Cahan ekipleri başvurunuzu incelemeye aldı. Kısa süre içinde değerlendirme sonucu ve onboarding adımları için iletişime geçeceğiz.
                </p>
            </motion.div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="text-left space-y-6">
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Ad Soyad */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80">Ad Soyad</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                        placeholder="Örn: Ahmet Yılmaz"
                    />
                </div>

                {/* E-Posta */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80">E-Posta Adresi</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                        placeholder="ornek@sirketiniz.com"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Mağaza Linki */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80">Mağaza Linki (URL)</label>
                    <input
                        type="url"
                        name="storeUrl"
                        value={formData.storeUrl}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                        placeholder="https://sirketiniz.com"
                    />
                </div>

                {/* Platform */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/80">Ana Satış Platformunuz</label>
                    <select
                        name="platform"
                        value={formData.platform}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 focus:bg-[#1a1a1a] transition-colors appearance-none"
                    >
                        <option value="" disabled className="text-gray-500">Seçiniz...</option>
                        <option value="Shopify">Shopify</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Trendyol">Trendyol</option>
                        <option value="Diger">Diğer</option>
                    </select>
                </div>
            </div>

            {/* Hacim */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Aylık Ortalama Sipariş Hacminiz</label>
                <select
                    name="orderVolume"
                    value={formData.orderVolume}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white/30 focus:bg-[#1a1a1a] transition-colors appearance-none"
                >
                    <option value="" disabled className="text-gray-500">Seçiniz...</option>
                    <option value="0-100">0 - 100 Sipariş</option>
                    <option value="100-1000">100 - 1000 Sipariş</option>
                    <option value="1000+">1000+ Sipariş</option>
                </select>
            </div>

            {/* Kritik Soru */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">
                    Şu an işletmenizde hesaplamakta en çok zorlandığınız finansal &apos;kör noktanız&apos; nedir?
                </label>
                <textarea
                    name="criticalPainPoint"
                    value={formData.criticalPainPoint}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors resize-none"
                    placeholder="Lütfen detaylı olarak açıklayın..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 rounded-xl bg-white text-black text-base font-bold hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gönderiliyor...
                    </span>
                ) : (
                    'Başvuruyu Gönder ve İncelemeye Alın'
                )}
            </button>
            <p className="text-center text-xs text-white/30 mt-4">
                Verileriniz gizlilik politikamız kapsamında güvence altındadır.
            </p>
        </form>
    )
}
