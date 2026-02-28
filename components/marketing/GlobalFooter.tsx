import Image from 'next/image'
import Link from 'next/link'
import { LegalSheet } from '@/components/legal/LegalSheet'
import { useTranslations } from 'next-intl'

export default function GlobalFooter() {
    const t = useTranslations('GlobalFooter')
    return (
        <footer className="py-20 px-6 border-t border-white/5 bg-[#050505]">
            <div className="max-w-7xl mx-auto flex flex-col items-center sm:items-start text-center sm:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-16 tracking-tight">
                    {t('headline')}
                </h3>

                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8 mb-20 border-b border-white/5 pb-16">
                    {/* Column 1 */}
                    <div className="flex flex-col gap-4">
                        <span className="text-white/80 font-semibold mb-2">{t('categories.tools')}</span>
                        <a href="https://tools.prificient.com/roas-calculator" className="text-white/40 hover:text-white transition-colors">{t('links.roas')}</a>
                        <a href="https://tools.prificient.com/profit-simulator" className="text-white/40 hover:text-white transition-colors">{t('links.profit')}</a>
                        <a href="https://tools.prificient.com/shipping-cost" className="text-white/40 hover:text-white transition-colors">{t('links.shipping')}</a>
                        <a href="https://tools.prificient.com" className="text-violet-400 hover:text-violet-300 font-medium transition-colors mt-2" dangerouslySetInnerHTML={{ __html: t('links.allTools') }}></a>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col gap-4">
                        <span className="text-white/80 font-semibold mb-2">{t('categories.prificient')}</span>
                        <Link href="/marketing-home#vision" className="text-white/40 hover:text-white transition-colors">{t('links.vision')}</Link>
                        <Link href="/marketing-home#beta-application-form" className="text-white/40 hover:text-white transition-colors">{t('links.beta')}</Link>
                        <a href="mailto:destek@prificient.com" className="text-white/40 hover:text-white transition-colors">{t('links.contact')}</a>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-4">
                        <span className="text-white/80 font-semibold mb-2">{t('categories.legal')}</span>
                        <LegalSheet type="privacy" triggerText={t('links.privacy')} triggerClassName="text-white/40 hover:text-white transition-colors text-left" />
                        <LegalSheet type="terms" triggerText={t('links.terms')} triggerClassName="text-white/40 hover:text-white transition-colors text-left" />
                        <LegalSheet type="cookie" triggerText={t('links.cookie')} triggerClassName="text-white/40 hover:text-white transition-colors text-left" />
                    </div>
                </div>

                <div className="w-full flex w-full flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="Prificient"
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-sm text-white/30 font-medium">
                            © {new Date().getFullYear()} Prificient
                        </span>
                    </div>

                    {/* We Cahan Signature */}
                    <div className="flex items-center">
                        <span className="text-sm font-medium tracking-[0.2em] uppercase text-white/50">
                            A <strong className="text-white">We Cahan</strong> Company
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
