import Link from 'next/link'
import { ArrowRight, BarChart3, Lock, Zap } from 'lucide-react'

export default function MarketingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white">P</span>
                        </div>
                        Prificient
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="#manifesto" className="hover:text-white transition-colors">Manifesto</Link>
                        <Link href="https://tools.prificient.com" className="hover:text-white transition-colors">Ücretsiz Araçlar</Link>
                        <Link href="https://app.prificient.com/login" className="text-white hover:text-blue-400 transition-colors">Giriş Yap</Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <main className="flex-1 pt-32 pb-20">
                <div className="container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        V17.0 Subdomain Mimarisi Yayında
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent pb-2">
                        E-Ticaretin Finansal <br /> İşletim Sistemi.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Prificient, sadece bir dashboard değil. Kârlılığınızı, reklam harcamalarınızı ve stok dengenizi
                        mikroskobik hassasiyetle yöneten bir karar destek mekanizmasıdır.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="https://app.prificient.com"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            Uygulamayı Aç <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="https://tools.prificient.com"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-medium transition-all backdrop-blur-sm"
                        >
                            Ücretsiz Araçlar
                        </Link>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="container mx-auto px-6 mt-32 grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Net Kâr Odaklı</h3>
                        <p className="text-gray-400 leading-relaxed">
                            ROAS yalanlarına kanmayın. Prificient, iadeler ve gizli giderler sonrası cebinize giren
                            gerçek net kârı hesaplar.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Karar Masası</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Veriye bakıp "ne yapmalıyım?" diye düşünmeyin. Sistem size hangi ürünü kapatıp hangisine
                            bütçe artırmanız gerektiğini söyler.
                        </p>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Kapalı Devre</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Sadece davetli üyeler ve onaylanmış ajanslar için. Verileriniz asla 3. parti veri brokerları ile paylaşılmaz.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/10 py-12 bg-black">
                <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Prificient Inc. Tüm hakları saklıdır.</p>
                </div>
            </footer>
        </div>
    )
}
