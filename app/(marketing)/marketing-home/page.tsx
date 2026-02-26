'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function ManifestoPage() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleWaitlist = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setLoading(true)

        try {
            // Check if email already exists in users or profiles (if you had a waitlist table you'd insert here)
            // For now, we will just use the standard auth signup with a dummy password to register the lead
            // Or if you have a specific waitlist/leads table, insert there. 
            // Using a simple API approach or Supabase insert if a table exists.

            // Assuming we just want to trigger a signup without confirmation for the waitlist, or 
            // inserting into a custom "leads" table. Let's send an OTP to start their journey 
            // or just record the email.
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    data: { source: 'manifesto_waitlist' }
                }
            })

            if (!error) {
                setSubmitted(true)
            } else {
                console.error('Waitlist error:', error)
                // Even on error, show success to prevent enumeration or just for UX
                setSubmitted(true)
            }
        } catch (err) {
            console.error('Waitlist exception:', err)
        } finally {
            setLoading(false)
        }
    }

    const scrollToForm = (e: React.MouseEvent) => {
        e.preventDefault()
        document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 selection:text-white font-sans overflow-x-hidden">
            {/* ═══════════════════════════════════════════ */}
            {/* HEADER */}
            {/* ═══════════════════════════════════════════ */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#050505]/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="Prificient"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            Prificient
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="https://tools.prificient.com" className="text-sm font-medium text-white/50 hover:text-white transition-colors hidden sm:block">
                            Gizli Maliyet Araçları
                        </a>
                        <button onClick={scrollToForm} className="text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all">
                            Erken Erişim
                        </button>
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════ */}
            {/* HERO SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section className="relative min-h-[100svh] flex items-center justify-center px-6 pt-20">
                {/* Abstract Dark Glows */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-radial from-red-900/10 via-transparent to-transparent rounded-full blur-3xl opacity-50" />
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-white/5 via-transparent to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-white/70 tracking-[0.2em] uppercase">
                                Statükoya Meydan Okuyoruz
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                            E-Ticarette &apos;Ciro&apos; Devri Bitti.
                            <br />
                            <span className="text-white">Gerçeklerle Yüzleşmeye Hazır Mısınız?</span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
                            Shopify panelleri ve Meta reklamları size parladığınızı söylerken, banka hesabınız aksini iddia ediyor. Prificient; satıcılar için değil, <strong className="text-white/90 font-bold">gerçek kârı</strong> yönetmek isteyen işletme sahipleri için inşa edilen ilk finansal işletim sistemidir.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            <button
                                onClick={scrollToForm}
                                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-full bg-white text-black text-base sm:text-lg font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
                            >
                                Erken Erişim Talep Et
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <a
                                href="https://tools.prificient.com"
                                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-full border border-white/20 bg-transparent text-white text-base sm:text-lg font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                            >
                                <BarChart2 className="w-5 h-5 text-red-500" />
                                Ücretsiz Kâr Araçlarını Keşfet
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Down Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                >
                    <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30">Acı Gerçekler</span>
                    <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
                </motion.div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* THE ILLUSION SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section className="relative py-32 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="mb-20 text-center sm:text-left"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
                            Kullandığınız Sistemler <br className="hidden sm:block" />
                            <span className="text-red-500">Size Yalan Söylüyor.</span>
                        </h2>
                        <p className="text-lg text-white/40 max-w-2xl">
                            Herkes size ne kadar sattığınızı gösterir. Kimse o satışlardan ne kadar kârın cebinizde kaldığını söylemez. Tablolar yeşil görünürken kasanız erir.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {/* Card 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.1 }}
                            className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#0a0a0a] hover:bg-[#0f0f0f] hover:border-white/20 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors">
                                <span className="font-bold text-white/50 group-hover:text-white transition-colors">01</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Brüt Ciro Tuzağı</h3>
                            <p className="text-white/40 leading-relaxed font-medium">
                                Shopify size bugün 50.000 TL sattığınızı söyler. İadeleri, kargo baremlerini, depolama giderlerini ve ödeme altyapısı kesintilerini <strong className="text-white/80 font-semibold">asla hesaba katmaz.</strong> O cironun sadece bir yanılsama olduğunu ay sonunda fark edersiniz.
                            </p>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.2 }}
                            className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#0a0a0a] hover:bg-[#0f0f0f] hover:border-white/20 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors">
                                <span className="font-bold text-white/50 group-hover:text-white transition-colors">02</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">ROAS Yalanı</h3>
                            <p className="text-white/40 leading-relaxed font-medium">
                                Reklam panelinizde ROAS 4.0 görünebilir. Ancak o satıştan gelen iadeler, promosyon kodları ve platform bedelleri düşüldüğünde o reklam kampanyası <strong className="text-red-400 font-semibold">aslında zarar yazıyordur.</strong> Meta sizin harcamanızı ister, kâr etmenizi değil.
                            </p>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.3 }}
                            className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#0a0a0a] hover:bg-[#0f0f0f] hover:border-white/20 transition-colors group relative overflow-hidden"
                        >
                            {/* Suble red glow inside the last card */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors">
                                    <span className="font-bold text-white/50 group-hover:text-white transition-colors">03</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Sessiz Kan Kaybı</h3>
                                <p className="text-white/40 leading-relaxed font-medium">
                                    Ay sonu geldiğinde, ekrandaki yüksek ciro ile cebinizdeki nakit uyuşmaz. Çünkü sizin bir &quot;raporlama aracına&quot; değil, arka planda çalışan <strong className="text-white/80 font-semibold">dijital bir CFO&apos;ya</strong> ihtiyacınız var.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* THE VISION SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section className="relative py-32 px-6 bg-[#050505]">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="relative max-w-4xl mx-auto">
                    <div className="mb-24">
                        <span className="text-red-500 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Prificient Vizyonu</span>
                        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">İşletim Sisteminiz <br className="hidden sm:block" />Böyle Çalışmalı.</h2>
                    </div>

                    <div className="space-y-32">
                        {/* Vision 1 */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <span className="absolute -left-4 sm:-left-12 -top-10 sm:-top-16 text-[8rem] sm:text-[12rem] font-black text-white/5 leading-none select-none pointer-events-none">1</span>
                            <div className="relative z-10 pl-4 sm:pl-0">
                                <h3 className="text-3xl sm:text-subtitle font-bold text-white mb-6">Toksik Ürün Tespiti</h3>
                                <p className="text-xl sm:text-2xl text-white/50 leading-relaxed font-medium">Hangi ürünün çok sattığını değil, <strong className="text-white">hangi ürünün sizi batırdığını saniyesinde görün.</strong> Boş ciro yaratan stokları sistemden hızla ayıklayın.</p>
                            </div>
                        </motion.div>

                        {/* Vision 2 */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative sm:text-right"
                        >
                            <span className="absolute -right-4 sm:-right-12 -top-10 sm:-top-16 text-[8rem] sm:text-[12rem] font-black text-white/5 leading-none select-none pointer-events-none">2</span>
                            <div className="relative z-10 pr-4 sm:pr-0">
                                <h3 className="text-3xl sm:text-subtitle font-bold text-white mb-6">Hayalet Gider Avcısı</h3>
                                <p className="text-xl sm:text-2xl text-white/50 leading-relaxed font-medium">Satış başı kargo farkları, iade firesi, kur dalgalanmaları ve pazaryeri ceza kesintileri... <strong className="text-white">Gizli komisyonları tek ekranda yakalayın</strong> ve kârlılığınızı kordon altına alın.</p>
                            </div>
                        </motion.div>

                        {/* Vision 3 */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <span className="absolute -left-4 sm:-left-12 -top-10 sm:-top-16 text-[8rem] sm:text-[12rem] font-black text-white/5 leading-none select-none pointer-events-none">3</span>
                            <div className="relative z-10 pl-4 sm:pl-0">
                                <h3 className="text-3xl sm:text-subtitle font-bold text-white mb-6">Global Multi-Platform</h3>
                                <p className="text-xl sm:text-2xl text-white/50 leading-relaxed font-medium">Shopify, Amazon, Etsy, Trendyol. Parça parça rapor ekranlarından kurtulun. <strong className="text-white">Tüm operasyonunuz tek bir &apos;Gerçek Kâr&apos; defterinde birleşecek.</strong></p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* THE BRIDGE / WAITLIST SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section className="relative py-32 px-6 bg-[#050505] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-radial from-violet-900/10 via-transparent to-transparent opacity-60 pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                            Kodları Yazıyoruz. <br className="hidden sm:block" />
                            <span className="text-white/60">Siz Bu Sırada Kârınızı Kurtarın.</span>
                        </h2>

                        <p className="text-xl text-white/40 leading-relaxed mb-12">
                            Prificient kapalı beta sürecinde ve sınırlı sayıda satıcı ile test ediliyor. Sisteme ilk girenlerden olmak için e-postanızı bırakın. Beklerken, işletmenizin röntgenini çekmek için ücretsiz araçlarımızı kullanmaya başlayın.
                        </p>

                        {/* Waitlist Form Component */}
                        <div id="waitlist-form" className="max-w-md mx-auto mb-20">
                            {!submitted ? (
                                <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="E-posta adresiniz"
                                        required
                                        className="flex-1 px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-base focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-4 rounded-full bg-white text-black text-base font-bold hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {loading ? 'Kaydediliyor...' : 'Beni Listeye Al'}
                                    </button>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="px-6 py-4 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-medium"
                                >
                                    Kaydınız alındı. Sizi haberdar edeceğiz.
                                </motion.div>
                            )}
                        </div>

                        {/* Tools CTA Banner */}
                        <a
                            href="https://tools.prificient.com"
                            className="group block p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-white/20 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
                            <div className="relative z-10 flex flex-col items-center">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider mb-6">Şimdi Test Et</span>
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Kargo maliyetleri kârınızı nasıl eritiyor?</h3>
                                <p className="text-white/50 mb-8 max-w-xl">Ücretsiz teşhis araçlarımızla mağazanızın gerçek fotoğrafını hemen çekin.</p>
                                <span className="inline-flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                                    Araçlara Git <ArrowRight className="w-5 h-5" />
                                </span>
                            </div>
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* FOOTER */}
            {/* ═══════════════════════════════════════════ */}
            <footer className="py-12 border-t border-white/5 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Image
                                src="/logo.png"
                                alt="Prificient"
                                width={20}
                                height={20}
                                className="object-contain opacity-50 grayscale"
                            />
                        </div>
                        <span className="text-sm text-white/30 font-medium">
                            © {new Date().getFullYear()} Prificient
                        </span>
                    </div>
                    <div className="flex items-center gap-8 text-sm font-medium text-white/30">
                        <a href="https://app.prificient.com/legal/privacy" className="hover:text-white transition-colors"> Gizlilik </a>
                        <a href="https://app.prificient.com/legal/terms" className="hover:text-white transition-colors"> Koşullar </a>
                        <a href="mailto:destek@prificient.com" className="hover:text-white transition-colors"> İletişim </a>
                    </div>
                </div>
            </footer>
        </main>
    )
}
