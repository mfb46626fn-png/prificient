'use client'

import { useState } from 'react'
import Link from 'next/link'
import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import IntegrationModal from '@/components/IntegrationModal'
import BetaInfoModal from '@/components/BetaInfoModal'
import {
  ArrowRight,
  PieChart,
  TrendingUp,
  Zap,
  Search,
  Check,
  ShoppingBag,
  Activity,
  Layers,
  ArrowLeftRight,
  ShieldCheck,
  Globe
} from 'lucide-react'

export default function Home() {
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false)
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <LandingHeader />

      <main className="flex flex-col gap-0">

        {/* =========================================
            1. HERO SECTION (BLUE THEME)
           ========================================= */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 w-full overflow-hidden">

          {/* Arkaplan */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-tr from-blue-100/40 via-indigo-100/30 to-purple-100/30 blur-[130px] rounded-full -z-10 pointer-events-none animate-pulse duration-[5000ms]"></div>

          <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">

            {/* Beta Rozeti */}
            <button
              onClick={() => setIsBetaModalOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-full bg-white border border-gray-200 px-5 py-2 mb-10 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm"
            >
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </div>
              <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600 transition-colors">Prificient v1.0 Yayında</span>
              <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* H1 Headline */}
            <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tighter text-gray-900 sm:text-7xl lg:text-[5.5rem] leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              Shopify Mağazanızı <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 drop-shadow-sm">
                Finansal Motora
              </span>
              <span className="ml-4 inline-block transform hover:rotate-12 transition-transform duration-500 cursor-default">🚀</span> Dönüştürün.
            </h1>

            {/* Subtext */}
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-gray-600 font-medium text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Ciroyla yetinmeyin, cebinize giren net parayı görün. Prificient; siparişleri, iadeleri ve reklam giderlerini tek bir merkezde toplar.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link
                href="/connect/shopify"
                className="w-full sm:w-auto relative rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <ShoppingBag size={20} className="text-blue-200" />
                Mağazanızı Bağlayın
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform text-blue-200" />
              </Link>

              <button
                onClick={() => setIsIntegrationModalOpen(true)}
                className="w-full sm:w-auto rounded-2xl bg-white border border-gray-200 px-8 py-5 text-lg font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Layers size={20} className="text-gray-400" />
                Entegrasyonlar
              </button>
            </div>

            {/* Platform Badges (Greyscale) */}
            <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 animate-in fade-in delay-700">
              <span className="font-black text-xl text-gray-800 flex items-center gap-2"><ShoppingBag size={20} className="text-[#95BF47]" /> Shopify</span>
            </div>

          </div>
        </section>

        {/* =========================================
            2. NASIL ÇALIŞIR? (USER FRIENDLY V2)
           ========================================= */}
        <section id="nasil" className="py-24 bg-white relative">
          <div className="container mx-auto px-6 lg:px-8">

            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Sistem Nasıl İşler?</h2>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">Siz Satış Yapın, Hesabı Biz Tutalım.</h3>
            </div>

            {/* Simplified Flow */}
            <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
              {/* Line connection for desktop */}
              <div className="hidden md:block absolute top-[28%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 -z-10 border-t-2 border-dashed border-blue-200"></div>

              {/* Step 1 */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-blue-500/5 text-center relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black border-4 border-white shadow-lg">1</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Sipariş Gelir</h4>
                <p className="text-gray-500 font-medium">
                  Shopify mağazanıza bir sipariş düştüğü an, sistemimiz bunu saniyesinde algılar.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-indigo-500/5 text-center relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black border-4 border-white shadow-lg">2</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Akıllı Hesaplama</h4>
                <p className="text-gray-500 font-medium">
                  Kargo, komisyon ve ürün maliyeti otomatik düşülür. Gizli gider kalmaz.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-emerald-500/5 text-center relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black border-4 border-white shadow-lg">3</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Net Kâr Görünür</h4>
                <p className="text-gray-500 font-medium">
                  Cebinize giren gerçek para, net kâr olarak dashboard’unuza yansır.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            3. ÖZELLİKLER (FEATURES)
           ========================================= */}
        <section id="ozellikler" className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Neden Prificient?</h2>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">Metriklere Değil,<br />Gerçek Paraya Odaklanın.</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* F1 */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                  <Search size={32} />
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-4">Görünmeyen Giderler</h4>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Kargo, iade maliyetleri, pazaryeri komisyonları ve işlem ücretleri... Hepsini kuruşu kuruşuna takip ediyoruz.
                </p>
              </div>

              {/* F2 */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform">
                  <PieChart size={32} />
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-4">Otomatik İşlem Kaydı</h4>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Excel ile uğraşmayın. Her satış, arka planda otomatik olarak muhasebeleştirilir. Hata payı sıfırdır.
                </p>
              </div>

              {/* F3 */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 hover:border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform">
                  <Zap size={32} />
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-4">Anlık İçgörü</h4>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Hangi ürün kâr ettiriyor, hangisi zarar yazıyor? Anlık olarak görün ve kampanya stratejinizi değiştirin.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================
            4. VİZYONUMUZ (VISION)
           ========================================= */}
        <section id="vision" className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="bg-black rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
              <div className="relative z-10 max-w-3xl mx-auto">
                <Activity size={48} className="text-blue-500 mx-auto mb-8" />
                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
                  "E-ticaretin <span className="text-blue-500">Finansal İşletim Sistemi</span> Oluyoruz."
                </h2>
                <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed mb-10">
                  Amacımız sadece rapor vermek değil; e-ticaret girişimcilerinin önünü görebilmesini sağlamak.
                  Finansal belirsizliği ortadan kaldırıp, büyümeye odaklanmanız için buradayız.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            5. FİYATLAR (PRICING)
           ========================================= */}
        <section id="pricing" className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <div className="mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Şeffaf Fiyatlandırma</h2>
              <p className="text-lg text-gray-600 font-medium">
                Sürpriz fatura yok. Sadece ihtiyacınız kadar ödeyin.
              </p>
              <div className="mt-4 bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full inline-block animate-pulse">
                🚀 ŞU AN BETA SÜRECİNDEYİZ - TÜM ÖZELLİKLER ÜCRETSİZ!
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* CLEAR PLAN */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col relative">
                <h3 className="text-xl font-black text-gray-900 mb-2">Clear</h3>
                <p className="text-sm text-gray-500 font-medium min-h-[40px] mb-6">Başlangıç için ideal. Excel karmaşasından kurtulun.</p>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-4xl font-black text-gray-900">₺299</span>
                  <span className="text-gray-400 font-bold">/ay</span>
                </div>

                <ul className="space-y-4 mb-10 flex-1 text-left">
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> 1 Platform Entegrasyonu
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> 3 Ay Geçmiş Veri
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> Temel Raporlama
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> 30 AI Sorgusu / Ay
                  </li>
                </ul>

                <Link href="/login" className="w-full py-4 rounded-xl bg-gray-100 text-gray-900 font-black hover:bg-gray-200 transition-all">
                  Şimdi Başla
                </Link>
              </div>

              {/* CONTROL PLAN (POPULAR) */}
              <div className="bg-white rounded-[2.5rem] p-8 border-2 border-blue-600 shadow-2xl shadow-blue-200 flex flex-col relative scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg tracking-widest uppercase">
                  EN POPÜLER
                </div>
                <h3 className="text-xl font-black text-blue-900 mb-2">Control</h3>
                <p className="text-sm text-gray-500 font-medium min-h-[40px] mb-6">Büyüyen mağazalar için tam kontrol.</p>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-5xl font-black text-gray-900">₺899</span>
                  <span className="text-gray-400 font-bold">/ay</span>
                </div>

                <ul className="space-y-4 mb-10 flex-1 text-left">
                  <li className="flex items-center gap-3 text-sm font-extrabold text-gray-800">
                    <Check className="text-blue-600 shrink-0" size={18} /> 3 Platform Entegrasyonu
                  </li>
                  <li className="flex items-center gap-3 text-sm font-extrabold text-gray-800">
                    <Check className="text-blue-600 shrink-0" size={18} /> 12 Ay Geçmiş Veri
                  </li>
                  <li className="flex items-center gap-3 text-sm font-extrabold text-gray-800">
                    <Check className="text-blue-600 shrink-0" size={18} /> CFO Simülasyonu
                  </li>
                  <li className="flex items-center gap-3 text-sm font-extrabold text-gray-800">
                    <Check className="text-blue-600 shrink-0" size={18} /> 100 AI Sorgusu / Ay
                  </li>
                  <li className="flex items-center gap-3 text-sm font-extrabold text-gray-800">
                    <Check className="text-blue-600 shrink-0" size={18} /> Kârlılık Analizi (Ürün Bazlı)
                  </li>
                </ul>

                <Link href="/login" className="w-full py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 hover:shadow-lg transition-all">
                  Ücretsiz Dene
                </Link>
                <p className="text-[10px] text-gray-400 font-bold mt-3">*Beta süresince ücret talep edilmez.</p>
              </div>

              {/* VISION PLAN */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-xl transition-all hover:scale-[1.02] flex flex-col relative">
                <h3 className="text-xl font-black text-gray-900 mb-2">Vision</h3>
                <p className="text-sm text-gray-500 font-medium min-h-[40px] mb-6">CFO deneyimi ve sınırsız analiz.</p>
                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-4xl font-black text-gray-900">₺1.999</span>
                  <span className="text-gray-400 font-bold">/ay</span>
                </div>

                <ul className="space-y-4 mb-10 flex-1 text-left">
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> Sınırsız Platform
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> Sınırsız Geçmiş
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> Gelişmiş Simülasyon + Senaryolar
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> 200 AI Sorgusu / Ay
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Check className="text-emerald-500 shrink-0" size={18} /> Öncelikli 7/24 Destek
                  </li>
                </ul>

                <Link href="/login" className="w-full py-4 rounded-xl bg-black text-white font-black hover:bg-gray-800 transition-all">
                  İletişime Geç
                </Link>
              </div>
            </div>

            <p className="mt-12 text-sm text-gray-500 font-medium max-w-2xl mx-auto">
              Tüm paketlerde veri güvenliği, günlük yedekleme ve SSL şifreleme standarttır.
              Beta sürecimiz boyunca hiçbir kart bilgisi girmeden tüm özelliklere erişebilirsiniz.
            </p>
          </div>
        </section>

        {/* =========================================
            6. CTA (FIXED VISIBILITY)
           ========================================= */}
        <section className="py-24 bg-blue-600 border-t border-blue-500 relative overflow-hidden">

          {/* Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-50%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[100px]"></div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                Finansal Özgürlüğe <br /> İlk Adımı Atın.
              </h2>
              <p className="text-blue-100 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Beta süreci boyunca %100 ücretsiz. Shopify mağazanızı bağlayın,
                dakikalar içinde net kârınızı görmeye başlayın.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/connect/shopify"
                  className="px-10 py-5 bg-white text-blue-600 font-black text-xl rounded-2xl transition-all hover:-translate-y-1 shadow-2xl shadow-blue-900/20 hover:bg-blue-50 flex items-center justify-center gap-3"
                >
                  Ücretsiz Başlayın <ArrowRight size={24} />
                </Link>
              </div>
              <div className="mt-10 flex items-center justify-center gap-6 text-blue-200 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><ShieldCheck size={16} /> SSL Korumalı</span>
                <span className="flex items-center gap-2"><Globe size={16} /> Global Uyumlu</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />

      {/* MODALS */}
      <IntegrationModal isOpen={isIntegrationModalOpen} onClose={() => setIsIntegrationModalOpen(false)} />
      <BetaInfoModal
        isOpen={isBetaModalOpen}
        onClose={() => setIsBetaModalOpen(false)}
        actionLabel="Hesap Oluştur & Başla"
        onAction={() => window.location.href = '/login'}
      />
    </div>
  )
}