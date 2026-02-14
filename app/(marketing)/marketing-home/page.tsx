import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Prificient — E-Ticarette Gerçek Kâr Devri',
    description:
        'Ciro yanılsamasından çıkın. Prificient, e-ticaret işletmenizin gerçek finansal tablosunu ortaya koyar. Reklam harcamalarından iadelere, gizli giderlerden net kâra — her şeyi görün.',
    openGraph: {
        title: 'Prificient — E-Ticarette Gerçek Kâr Devri',
        description: 'Ciro yanılsamasından çıkın. Gerçek kârlılığınızı keşfedin.',
        type: 'website',
        url: 'https://prificient.com',
    },
}

export default function ManifestoPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30 selection:text-emerald-200 antialiased">

            {/* ═══════════════════════════════════════════ */}
            {/*  HEADER — Minimal, No Login/Register       */}
            {/* ═══════════════════════════════════════════ */}
            <header className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-2xl">
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-md flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <span className="font-semibold text-[15px] tracking-tight text-white/90">Prificient</span>
                    </div>
                    <nav className="flex items-center gap-6 text-[13px] text-white/40 font-medium">
                        <Link href="#manifesto" className="hover:text-white/80 transition-colors hidden sm:block">
                            Manifesto
                        </Link>
                        <Link
                            href="https://tools.prificient.com"
                            className="hover:text-white/80 transition-colors hidden sm:block"
                        >
                            Araçlar
                        </Link>
                        <Link
                            href="#waitlist"
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            Erken Erişim
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* ═══════════════════════════════════════════ */}
                {/*  HERO — The Statement                      */}
                {/* ═══════════════════════════════════════════ */}
                <section className="relative pt-40 pb-28 px-6 overflow-hidden">
                    {/* Ambient glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-emerald-500/[0.07] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-medium uppercase tracking-[0.15em] text-white/30 mb-10">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            Yapım Aşamasında
                        </div>

                        <h1 className="text-[clamp(2.2rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.035em] mb-8">
                            <span className="bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                                E-Ticarette &lsquo;Ciro&rsquo; Devri Bitti.
                            </span>
                            <br />
                            <span className="bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                                &lsquo;Gerçek Kâr&rsquo; Devri Başlıyor.
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-white/35 max-w-2xl mx-auto leading-relaxed mb-14 font-light">
                            Prificient, satış yapıp para kaybedenler için değil;
                            <br className="hidden md:block" />
                            <span className="text-white/50">finansal gerçeklerle yüzleşip büyümek isteyenler</span> için
                            yeniden inşa ediliyor.
                        </p>

                        {/* Waitlist Form */}
                        <div id="waitlist" className="max-w-md mx-auto">
                            <form
                                action="https://formspree.io/f/placeholder"
                                method="POST"
                                className="flex gap-2"
                            >
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="E-posta adresiniz"
                                    className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/20 shrink-0"
                                >
                                    Takip Et
                                </button>
                            </form>
                            <p className="text-[11px] text-white/15 mt-3 font-light">
                                Gelişmeleri takip edin. Spam yok, söz.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/*  DIVIDER                                    */}
                {/* ═══════════════════════════════════════════ */}
                <div className="max-w-6xl mx-auto px-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/*  MANIFESTO — The Philosophy                 */}
                {/* ═══════════════════════════════════════════ */}
                <section id="manifesto" className="py-28 px-6">
                    <div className="max-w-3xl mx-auto">
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/60 mb-10">
                            Manifesto
                        </p>

                        {/* Block 1 */}
                        <div className="mb-20">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-white/90">
                                ROAS yalan söylüyor.
                            </h2>
                            <p className="text-white/30 leading-[1.8] text-[15px] font-light">
                                Reklam platformları size &ldquo;10x ROAS&rdquo; gösterir. Siz de kutlama yaparsınız.
                                Ama ay sonunda kasaya baktığınızda para yoktur.
                                Çünkü ROAS, iadeleri saymaz. Kargo giderlerini bilmez. Vergiyi hesaplamaz.
                                <span className="text-white/50 font-normal"> Prificient, bu yalanı ortadan kaldırmak için var.</span>
                            </p>
                        </div>

                        {/* Block 2 */}
                        <div className="mb-20">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-white/90">
                                Shopify bunu söylemez.
                            </h2>
                            <p className="text-white/30 leading-[1.8] text-[15px] font-light">
                                Shopify size toplamda ne kadar sattığınızı söyler. Ama hangi ürünün size para
                                <em className="text-white/50 not-italic font-normal"> kaybettirdiğini </em>
                                asla söylemez. &ldquo;En çok satan ürün&rdquo; ile &ldquo;en çok kâr eden ürün&rdquo; neredeyse hiçbir zaman
                                aynı ürün değildir.
                                <span className="text-white/50 font-normal"> Bu farkı görmemeniz, sizi yavaşça batırır.</span>
                            </p>
                        </div>

                        {/* Block 3 */}
                        <div className="mb-20">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-white/90">
                                &ldquo;Acı Skoru&rdquo; nedir?
                            </h2>
                            <p className="text-white/30 leading-[1.8] text-[15px] font-light">
                                Her ürünün bir &ldquo;Acı Skoru&rdquo; vardır. Düşük marjın, yüksek iade oranının, fazla reklam
                                harcamasının ve düşük stok devir hızının birleşimi bir skorla ifade edilir.
                                <span className="text-white/50 font-normal"> Skor ne kadar yüksekse, o ürün kasanızdan o kadar çok
                                    para çalıyordur.</span>
                                {' '}Prificient bunu hesaplar ve size
                                <span className="text-white/50 font-normal"> ne yapmanız gerektiğini </span>
                                söyler.
                            </p>
                        </div>

                        {/* Closing Statement */}
                        <div className="border-l-2 border-emerald-500/30 pl-6">
                            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light italic">
                                &ldquo;Biz bir dashboard değiliz.
                                <br />
                                Biz, e-ticaret işletmenizin
                                <span className="text-emerald-400/80 not-italic font-normal"> finansal gerçeğiyle yüzleşme aracıyız.</span>&rdquo;
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/*  DIVIDER                                    */}
                {/* ═══════════════════════════════════════════ */}
                <div className="max-w-6xl mx-auto px-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>

                {/* ═══════════════════════════════════════════ */}
                {/*  TOOLS TEASER                               */}
                {/* ═══════════════════════════════════════════ */}
                <section className="py-28 px-6">
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/20 mb-6">
                            Beklerken
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5 text-white/90">
                            Boş durmayın.
                        </h2>
                        <p className="text-white/30 text-[15px] leading-relaxed mb-10 font-light">
                            Prificient&apos;i beklerken, işletmeniz için geliştirdiğimiz ücretsiz finansal
                            araçları şimdi kullanmaya başlayın. ROAS hesaplayıcı, kargo maliyet analizi ve daha fazlası.
                        </p>
                        <Link
                            href="https://tools.prificient.com"
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/[0.08] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white rounded-lg text-sm font-medium transition-all"
                        >
                            Ücretsiz Araçlara Git
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-40">
                                <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                </section>
            </main>

            {/* ═══════════════════════════════════════════ */}
            {/*  FOOTER                                      */}
            {/* ═══════════════════════════════════════════ */}
            <footer className="border-t border-white/[0.04] py-10 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[12px] text-white/15 font-light">
                        &copy; {new Date().getFullYear()} Prificient. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-6 text-[12px] text-white/15 font-light">
                        <Link href="/legal/privacy" className="hover:text-white/30 transition-colors">
                            Gizlilik
                        </Link>
                        <Link href="/legal/terms" className="hover:text-white/30 transition-colors">
                            Kullanım Koşulları
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
