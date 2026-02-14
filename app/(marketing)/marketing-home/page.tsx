'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function MarketingHomePage() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleWaitlist = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setLoading(true)
        // Placeholder — gerçek API entegrasyonu yapılacak
        await new Promise((r) => setTimeout(r, 800))
        setSubmitted(true)
        setLoading(false)
    }

    return (
        <main className="relative overflow-hidden">

            {/* ═══════════════════════════════════════════ */}
            {/* HEADER */}
            {/* ═══════════════════════════════════════════ */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0a]/80">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-white/5">
                            <Image
                                src="/logo.png"
                                alt="Prificient"
                                width={28}
                                height={28}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-white/90">
                            Prificient
                        </span>
                    </div>
                    <a
                        href="#waitlist"
                        className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
                    >
                        Erken Erişim →
                    </a>
                </div>
            </header>

            {/* ═══════════════════════════════════════════ */}
            {/* HERO SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center justify-center px-6">
                {/* Background Glow */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-violet-900/20 via-transparent to-transparent rounded-full blur-3xl" />
                    <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-radial from-blue-900/15 via-transparent to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-10">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-medium text-white/50 tracking-widest uppercase">
                            Yapım Aşamasında
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                        <span className="text-white">
                            E-Ticarette &lsquo;Ciro&rsquo; Devri Bitti.
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            &lsquo;Gerçek Kâr&rsquo; Devri Başlıyor.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-12">
                        Prificient, satış yapıp para kaybedenler için değil;
                        <span className="text-white/70"> finansal gerçeklerle yüzleşip büyümek isteyenler </span>
                        için yeniden inşa ediliyor.
                    </p>

                    {/* CTA: Waitlist Form */}
                    <div id="waitlist" className="max-w-md mx-auto">
                        {!submitted ? (
                            <form onSubmit={handleWaitlist} className="flex gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-posta adresiniz"
                                    required
                                    className="flex-1 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all duration-300"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {loading ? '...' : 'Takip Et'}
                                </button>
                            </form>
                        ) : (
                            <div className="px-6 py-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm">
                                ✓ Kaydedildi. Gelişmelerden haberdar olacaksınız.
                            </div>
                        )}
                        <p className="text-xs text-white/20 mt-4">
                            Spam göndermiyoruz. Sadece önemli güncellemeler.
                        </p>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
                    <span className="text-xs tracking-widest uppercase">Keşfet</span>
                    <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* MANIFESTO SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section className="relative py-32 px-6">
                <div className="max-w-3xl mx-auto">

                    {/* Section Header */}
                    <div className="mb-24 text-center">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-white/30 mb-4">
                            Manifesto
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white/90 tracking-tight">
                            Neden Buradayız
                        </h2>
                    </div>

                    {/* Manifesto Items */}
                    <div className="space-y-24">

                        {/* Item 1 */}
                        <div className="group">
                            <div className="flex items-start gap-6">
                                <span className="text-5xl font-bold text-white/5 group-hover:text-violet-500/20 transition-colors duration-700 select-none shrink-0">
                                    01
                                </span>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white/90 mb-4 tracking-tight">
                                        ROAS Yalan Söylüyor.
                                    </h3>
                                    <p className="text-base sm:text-lg text-white/40 leading-relaxed">
                                        4x ROAS &ldquo;harika&rdquo; görünür. Ama reklam harcaman, iade maliyetin,
                                        kargo giderin, komisyon kesintilerin hesaba katılmadığında ortaya çıkan
                                        rakam seni şoke eder. <span className="text-white/60">Gerçek kârlılık,
                                            ROAS&apos;ın gösterdiğinden çok farklı.</span>
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 ml-[4.5rem] h-px bg-gradient-to-r from-white/5 to-transparent" />
                        </div>

                        {/* Item 2 */}
                        <div className="group">
                            <div className="flex items-start gap-6">
                                <span className="text-5xl font-bold text-white/5 group-hover:text-blue-500/20 transition-colors duration-700 select-none shrink-0">
                                    02
                                </span>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white/90 mb-4 tracking-tight">
                                        Shopify Sana Kâr Göstermiyor.
                                    </h3>
                                    <p className="text-base sm:text-lg text-white/40 leading-relaxed">
                                        Shopify bir satış platformu, bir muhasebe aracı değil. Ciro verilerini
                                        gösterir, ama <span className="text-white/60">gerçek maliyetlerini, net kâr
                                            marjlarını ve hangi ürünlerin seni batırdığını göstermez.</span> Sen de
                                        &ldquo;satış yapıyorum, iyi gidiyor&rdquo; derken para kaybetmeye devam edersin.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 ml-[4.5rem] h-px bg-gradient-to-r from-white/5 to-transparent" />
                        </div>

                        {/* Item 3 */}
                        <div className="group">
                            <div className="flex items-start gap-6">
                                <span className="text-5xl font-bold text-white/5 group-hover:text-cyan-500/20 transition-colors duration-700 select-none shrink-0">
                                    03
                                </span>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white/90 mb-4 tracking-tight">
                                        &ldquo;Acı Skoru&rdquo; ile Tanışın.
                                    </h3>
                                    <p className="text-base sm:text-lg text-white/40 leading-relaxed">
                                        Prificient, her ürüne bir <span className="text-white/60">&ldquo;Acı Skoru&rdquo;</span> atar.
                                        Bu skor; iade oranı, kâr marjı, reklam maliyeti ve stok durumunu tek bir metriğe indirir.
                                        <span className="text-white/60"> Yüksek acı skoru = seni sessizce batıran ürün.</span>
                                        {' '}Artık bunu görmezden gelmek yok.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 ml-[4.5rem] h-px bg-gradient-to-r from-white/5 to-transparent" />
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* PHILOSOPHY QUOTE */}
            {/* ═══════════════════════════════════════════ */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <blockquote className="text-2xl sm:text-3xl md:text-4xl font-medium text-white/80 leading-snug tracking-tight italic">
                        &ldquo;Ciro, gurur okşar.
                        <br />
                        <span className="text-white/40">Kâr, şirket büyütür.&rdquo;</span>
                    </blockquote>
                    <div className="mt-8 w-12 h-px bg-white/10 mx-auto" />
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* TOOLS TEASER */}
            {/* ═══════════════════════════════════════════ */}
            <section className="py-24 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 sm:p-14 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-6">
                            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white/90 mb-3 tracking-tight">
                            Beklerken Boş Durmayın.
                        </h3>
                        <p className="text-sm sm:text-base text-white/40 leading-relaxed mb-8">
                            İşletmeniz için geliştirdiğimiz ücretsiz finansal araçları hemen kullanmaya başlayın.
                            ROAS hesaplayıcı, kargo maliyet analizi ve daha fazlası.
                        </p>
                        <a
                            href="https://tools.prificient.com"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            Ücretsiz Araçlara Git
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* FOOTER */}
            {/* ═══════════════════════════════════════════ */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="Prificient"
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-sm text-white/30">
                            © {new Date().getFullYear()} Prificient
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-white/20">
                        <a href="https://app.prificient.com/legal/privacy" className="hover:text-white/40 transition-colors">
                            Gizlilik
                        </a>
                        <a href="https://app.prificient.com/legal/terms" className="hover:text-white/40 transition-colors">
                            Koşullar
                        </a>
                        <a href="mailto:destek@prificient.com" className="hover:text-white/40 transition-colors">
                            İletişim
                        </a>
                    </div>
                </div>
            </footer>

        </main>
    )
}
