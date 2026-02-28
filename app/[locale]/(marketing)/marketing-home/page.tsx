'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart2 } from 'lucide-react'
import BetaApplicationForm from '@/components/marketing/BetaApplicationForm'
import { useTranslations } from 'next-intl'

export default function ManifestoPage() {
    const t = useTranslations('MarketingHome');
    const scrollToForm = (e: React.MouseEvent) => {
        e.preventDefault()
        document.getElementById('beta-application-form')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="w-full relative overflow-x-hidden">

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
                                {t('hero.badge')}
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                            {t('hero.headline')}
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-white/50 max-w-4xl mx-auto leading-relaxed mb-12 font-medium">
                            {t.rich('hero.description', {
                                white: (chunks) => <strong className="text-white">{chunks}</strong>
                            })}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            <button
                                onClick={scrollToForm}
                                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-full bg-white text-black text-base sm:text-lg font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
                            >
                                {t('hero.ctaPrimary')}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <a
                                href="https://tools.prificient.com"
                                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-full border border-white/20 bg-transparent text-white text-base sm:text-lg font-bold hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                            >
                                <BarChart2 className="w-5 h-5 text-red-500" />
                                {t('hero.ctaSecondary')}
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* THE ILLUSION SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section id="illusion" className="relative py-32 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="mb-20 text-center sm:text-left"
                    >
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
                            {t('illusion.headlineLine1')} <br className="hidden sm:block" />
                            <span className="text-red-500">{t('illusion.headlineLine2')}</span>
                        </h2>
                        <p className="text-lg text-white/40 max-w-3xl leading-relaxed">
                            {t('illusion.description')}
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
                            <h3 className="text-2xl font-bold text-white mb-4">{t('illusion.card1.title')}</h3>
                            <p className="text-white/40 leading-relaxed font-medium">
                                {t.rich('illusion.card1.description', {
                                    highlight: (chunks) => <strong className="text-white/80 font-semibold">{chunks}</strong>
                                })}
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
                            <h3 className="text-2xl font-bold text-white mb-4">{t('illusion.card2.title')}</h3>
                            <p className="text-white/40 leading-relaxed font-medium">
                                {t.rich('illusion.card2.description', {
                                    danger: (chunks) => <strong className="text-red-400 font-semibold">{chunks}</strong>
                                })}
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
                                <h3 className="text-2xl font-bold text-white mb-4">{t('illusion.card3.title')}</h3>
                                <p className="text-white/40 leading-relaxed font-medium">
                                    {t.rich('illusion.card3.description', {
                                        highlight: (chunks) => <strong className="text-white/80 font-semibold">{chunks}</strong>
                                    })}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* THE VISION SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section id="vision" className="relative py-32 px-6 bg-[#050505]">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="relative max-w-4xl mx-auto">
                    <div className="mb-24">
                        <span className="text-red-500 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">{t('vision.badge')}</span>
                        <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter">{t('vision.headline')}</h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-16 mt-32">
                        {/* Text Content */}
                        <div className="flex-1">
                            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">{t('vision.title')}</h3>
                            <p className="text-xl text-white/50 leading-relaxed font-medium">
                                {t.rich('vision.description', {
                                    white: (chunks) => <strong className="text-white">{chunks}</strong>
                                })}
                            </p>
                        </div>

                        {/* Logos Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                            <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-white/80 font-bold text-lg">Shopify</span>
                                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            </div>

                            <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden opacity-50">
                                <span className="text-white/40 font-bold text-lg">Amazon</span>
                                <div className="absolute bottom-3 right-3 text-[10px] uppercase font-bold text-white/30 tracking-wider">{t('vision.comingSoon')}</div>
                            </div>

                            <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden opacity-50">
                                <span className="text-white/40 font-bold text-lg">Etsy</span>
                                <div className="absolute bottom-3 right-3 text-[10px] uppercase font-bold text-white/30 tracking-wider">{t('vision.comingSoon')}</div>
                            </div>

                            <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden opacity-50">
                                <span className="text-white/40 font-bold text-lg">Trendyol</span>
                                <div className="absolute bottom-3 right-3 text-[10px] uppercase font-bold text-white/30 tracking-wider">{t('vision.comingSoon')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════ */}
            {/* THE BETA PROCESS & FORM SECTION */}
            {/* ═══════════════════════════════════════════ */}
            <section id="beta" className="relative py-32 px-6 bg-[#050505] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-radial from-violet-900/10 via-transparent to-transparent opacity-60 pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                            {t('beta.headlineLine1')} <br className="hidden sm:block" />
                            <span className="text-white/60">{t('beta.headlineLine2')}</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                            <h4 className="text-white font-bold text-xl mb-3">{t('beta.card1.title')}</h4>
                            <p className="text-white/50 leading-relaxed">{t('beta.card1.description')}</p>
                        </div>
                        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                            <h4 className="text-white font-bold text-xl mb-3">{t('beta.card2.title')}</h4>
                            <p className="text-white/50 leading-relaxed">{t('beta.card2.description')}</p>
                        </div>
                        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
                            <h4 className="text-white font-bold text-xl mb-3">{t('beta.card3.title')}</h4>
                            <p className="text-white/50 leading-relaxed">{t('beta.card3.description')}</p>
                        </div>
                    </div>

                    <div id="beta-application-form" className="max-w-3xl mx-auto bg-black border border-white/10 rounded-3xl p-6 sm:p-12 shadow-2xl">
                        <div className="text-center mb-10">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4">{t('beta.form.badge')}</span>
                            <h3 className="text-2xl font-bold text-white mb-2">{t('beta.form.title')}</h3>
                            <p className="text-white/40">{t('beta.form.description')}</p>
                        </div>
                        <BetaApplicationForm />
                    </div>

                </div>
            </section>
        </div>
    )
}
