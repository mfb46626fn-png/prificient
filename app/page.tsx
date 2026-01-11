import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { 
  ArrowRight, 
  PieChart, 
  TrendingUp, 
  Zap, 
  Search, 
  LayoutDashboard, 
  Check,
  CheckCircle2, 
  HelpCircle,
} from 'lucide-react'

// --- METADATA (SEO) ---
export const metadata: Metadata = {
  title: 'Prificient - E-Ticaret Kârlılık ve Finans Yönetimi',
  description: 'Satışın peşinde değil, gerçek kârın izindeyiz. E-ticaret finansınızı yapay zeka ile yönetin, gizli giderleri bulun ve net kârınızı artırın.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <LandingHeader />

      <main className="flex flex-col gap-0">
        
        {/* =========================================
            1. HERO SECTION (DÜZELTİLDİ: ÇERÇEVESİZ & FULL WIDTH)
           ========================================= */}
        <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-32 w-full overflow-hidden">
          
          {/* Arkaplan Efektleri (Tüm ekranı kaplayacak şekilde revize edildi) */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/60 via-indigo-50/20 to-transparent blur-[120px] -z-10 pointer-events-none"></div>

          <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
            
            {/* Beta Rozeti */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 mb-8 hover:bg-blue-100/50 transition-colors cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-sm font-bold text-blue-700 tracking-wide">v1.0 Beta Yayında</span>
            </div>
            
            {/* Manşet (H1) */}
            <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tight text-gray-900 sm:text-6xl lg:text-7xl leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              E-Ticaretin Görünmeyen <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Gerçek Kârını Keşfedin.
              </span>
            </h1>
            
            {/* Alt Metin (Subtext) */}
            <p className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-gray-600 font-medium text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Ciro yanıltıcıdır, kâr gerçektir. Prificient; gizli giderleri bulur, 
              iade zararlarını hesaplar ve işletmenizi verilerle büyütmenizi sağlar.
            </p>
            
            {/* CTA Butonları */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
              >
                Hemen Başla
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link 
                href="/demo" 
                className="w-full sm:w-auto rounded-2xl bg-white border border-gray-200 px-8 py-4 text-lg font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={20} className="text-gray-400"/>
                Demoyu İncele
              </Link>
            </div>

            {/* Güven Sinyali */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 animate-in fade-in delay-500">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Beta süresince kredi kartı gerekmez</span>
            </div>

            {/* Dashboard Görseli (BEYAZ KUTU KALDIRILDI) */}
            <div className="mt-20 relative max-w-6xl mx-auto group perspective-1000">
              {/* Arkaplan Glow (Daha yayvan ve doğal) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-600/20 rounded-[100%] blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700 -z-10"></div>
              
              {/* Görsel Wrapper: Artık bg-white ve padding YOK. Sadece gölge ve radius var. */}
              <div className="relative rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.01] bg-transparent">
                 <Image 
                    src="/dashboard-preview.png"
                    alt="Prificient Dashboard Arayüzü"
                    width={1364}
                    height={866}
                    quality={95}
                    className="rounded-2xl border border-gray-200/50 shadow-sm w-full h-auto"
                    priority
                 />
                 
                 {/* Floating Badge: Net Kâr Artışı */}
                 <div className="absolute -top-6 -right-6 hidden md:flex flex-col gap-1 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 animate-bounce duration-[4000ms] z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <TrendingUp size={24} className="text-emerald-600" />
                        </div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Net Kâr Artışı</p>
                    </div>
                    <div className="mt-2">
                        <p className="text-2xl font-black text-gray-900 tracking-tight">%24.5 <span className="text-base font-normal text-gray-400">/ay</span></p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            LOGO BANTI
           ========================================= */}
        <div className="py-10 border-y border-gray-100 bg-gray-50/30">
           <div className="container mx-auto px-6 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                 Global Pazaryerleri ile Tam Entegre
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                 <span className="text-lg font-black text-gray-800 flex items-center gap-2">Trendyol</span>
                 <span className="text-lg font-black text-gray-800 flex items-center gap-2">Hepsiburada</span>
                 <span className="text-lg font-black text-gray-800 flex items-center gap-2">Amazon</span>
                 <span className="text-lg font-black text-gray-800 flex items-center gap-2">Shopify</span>
                 <span className="text-lg font-black text-gray-800 flex items-center gap-2">WooCommerce</span>
                 <span className="text-lg font-black text-gray-800 flex items-center gap-2">Etsy</span>
              </div>
           </div>
        </div>

        {/* =========================================
            2. ÖZELLİKLER (ZIG-ZAG)
           ========================================= */}
        <section id="features" className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* SOL: İçerik */}
              <div>
                <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Yetenekler</h2>
                <p className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl mb-6">
                  Tahminler Değil, <br/>Veriler Konuşsun.
                </p>
                <p className="text-lg text-gray-600 mb-10">
                  Sadece bugünü raporlamıyoruz; geçmişteki hataları ortaya çıkarıyor, bugün için netlik sağlıyor ve geleceğe dair daha doğru kararlar alınmasını mümkün kılıyoruz.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Search size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Detaylı Maliyet Analizi</h4>
                      <p className="text-gray-600 mt-1 font-medium text-sm">Gözden kaçan operasyonel maliyetleri ve kârı eriten gizli giderleri tespit edin.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Yapay Zeka Destekli İçgörü</h4>
                      <p className="text-gray-600 mt-1 font-medium text-sm">AI katmanımız yanlış fiyatlandırmaları ve tekrar eden hataları yakalar.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <PieChart size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Net Kâr Görünürlüğü</h4>
                      <p className="text-gray-600 mt-1 font-medium text-sm">Cironun büyüsüne kapılmayın. Günün sonunda cebinize ne kaldığını net görün.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAĞ: Görsel Kart */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-[80px] -z-10"></div>
                
                <div className="relative bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 w-full max-w-md transform rotate-1 hover:rotate-0 transition-transform duration-500">
                   
                   <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
                      <div>
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Bu Ayın Net Kârı</p>
                        <p className="text-4xl font-black mt-2 text-gray-900">₺142.500</p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <TrendingUp className="text-emerald-600" size={24} />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                         <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
                            <span className="font-bold text-sm text-gray-700">Reklam Gideri</span>
                         </div>
                         <span className="text-red-600 font-bold">-₺12.400</span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                         <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
                            <span className="font-bold text-sm text-gray-700">Ürün Maliyeti</span>
                         </div>
                         <span className="text-gray-900 font-bold">-₺45.000</span>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mt-6">
                         <p className="text-emerald-900 text-sm font-semibold flex gap-3 items-start leading-snug">
                            <Zap size={18} className="mt-0.5 shrink-0 text-emerald-600 fill-emerald-600" /> 
                            <span>AI Önerisi: Reklam bütçesini optimize ederseniz kâr marjınız <span className="underline decoration-emerald-400 decoration-2">%12 artabilir.</span></span>
                         </p>
                      </div>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================
            3. NASIL ÇALIŞIR (3 ADIM)
           ========================================= */}
        <section id="nasil" className="py-24 bg-gray-50 relative overflow-hidden">
           <div className="container mx-auto px-6 lg:px-8 relative z-10 text-center">
              <h2 className="text-sm font-bold leading-7 text-blue-600 uppercase tracking-widest bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">Süreç</h2>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl mb-6">Nasıl Çalışır?</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-16 font-medium">
                 Platform bazlı çalışan, maliyet yapılarının farkında olan bir sistem kuruyoruz. 
              </p>
              
              <div className="grid md:grid-cols-3 gap-12 relative">
                 <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0"></div>

                 <div className="relative z-10 flex flex-col items-center group">
                    <div className="w-24 h-24 rounded-[2rem] bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-blue-500/5 mb-8 group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300">
                       <span className="text-4xl font-black text-blue-600">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Veri Entegrasyonu</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[250px] mx-auto font-medium">
                       Verileri sisteme alın ve maliyet yapılarına göre ayrıştırın.
                    </p>
                 </div>

                 <div className="relative z-10 flex flex-col items-center group">
                    <div className="w-24 h-24 rounded-[2rem] bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-indigo-500/5 mb-8 group-hover:scale-110 group-hover:border-indigo-200 transition-all duration-300">
                       <Zap size={40} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">AI Analizi</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[250px] mx-auto font-medium">
                       Yapay zeka katmanımız verileri işler ve gizli giderleri tespit eder.
                    </p>
                 </div>

                 <div className="relative z-10 flex flex-col items-center group">
                    <div className="w-24 h-24 rounded-[2rem] bg-white border border-gray-100 flex items-center justify-center shadow-lg shadow-emerald-500/5 mb-8 group-hover:scale-110 group-hover:border-emerald-200 transition-all duration-300">
                       <span className="text-4xl font-black text-emerald-500">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Net İçgörü</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[250px] mx-auto font-medium">
                       Doğrudan aksiyon alınabilir, net ve anlaşılır içgörüler sunuyoruz.
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* =========================================
            4. FİYATLANDIRMA
           ========================================= */}
        <section id="pricing" className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Şeffaf Fiyatlandırma</h2>
              <p className="text-lg text-gray-600 font-medium">
                Beta süreci boyunca tüm özellikler tamamen ücretsizdir.<br />
                Sürpriz fatura yok, taahhüt yok.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
              
              {/* PAKET 1: CLEAR (Gelecek) */}
              <div className="rounded-[2rem] p-8 border border-gray-100 bg-gray-50/50 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Clear</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">₺0</span>
                  <span className="text-sm text-gray-500 font-bold">/ay</span>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-8 min-h-[40px]">
                  Yeni başlayanlar için temel analiz araçları.
                </p>
                <button disabled className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-400 font-bold text-sm cursor-not-allowed">
                  Yakında
                </button>
              </div>

              {/* PAKET 2: CONTROL (Aktif & Beta Özel) */}
              <div className="relative rounded-[2rem] p-8 border-2 border-blue-600 bg-white shadow-2xl shadow-blue-500/10 transform md:-translate-y-4 z-10">
                <div className="absolute top-0 right-0 -mt-4 mr-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Beta Özel
                </div>
                
                <h3 className="text-xl font-bold text-blue-600 mb-4">Control</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-gray-900">₺0</span>
                  <span className="text-sm text-gray-500 font-bold">/sonsuza kadar*</span>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-8">
                  Beta kullanıcılarına özel tüm özellikler ücretsiz.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Sınırsız İşlem Geçmişi",
                    "Tüm Pazaryeri Entegrasyonları",
                    "AI Öneri Motoru",
                    "Gelişmiş Nakit Akışı"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Check size={14} className="text-blue-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/login"
                  className="block w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-center hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  Hemen Başla
                </Link>
                <p className="text-[10px] text-center text-gray-400 mt-4 font-medium">
                  *Beta sürecinde kayıt olanlar için erken erişim avantajları saklı kalacaktır.
                </p>
              </div>

              {/* PAKET 3: VISION (Gelecek) */}
              <div className="rounded-[2rem] p-8 border border-gray-100 bg-gray-50/50 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Vision</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">???</span>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-8 min-h-[40px]">
                  Büyük ölçekli satıcılar ve ajanslar için.
                </p>
                <button disabled className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-400 font-bold text-sm cursor-not-allowed">
                  Yakında
                </button>
              </div>

            </div>
          </div>
        </section>

{/* =========================================
            5. SSS (FAQ - AÇILIP KAPANIR)
           ========================================= */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-black text-gray-900 mb-4">Merak Edilenler</h2>
               <p className="text-gray-600 font-medium">Aklınızdaki soru işaretlerini giderelim.</p>
             </div>

             <div className="space-y-4">
                {[
                  { q: "Prificient gerçekten ücretsiz mi?", a: "Evet, Beta süreci boyunca tüm özellikler tamamen ücretsizdir. Kredi kartı bilgisi girmenize gerek yoktur. Amacımız sistemi sizin geri bildirimlerinizle mükemmelleştirmek." },
                  { q: "Verilerim güvende mi?", a: "Kesinlikle. Verileriniz endüstri standardı 256-bit SSL şifreleme yöntemleriyle korunur. Verilerinizi asla üçüncü şahıslara satmayız ve KVKK uyumluluğumuz tamdır." },
                  { q: "Hangi dosyaları yükleyebilirim?", a: "Trendyol, Hepsiburada, Amazon gibi pazaryerlerinden aldığınız işlem raporlarını veya kendi tuttuğunuz Excel (.xlsx) ve CSV dosyalarını kolayca yükleyebilirsiniz." },
                  { q: "Kurulum yapmam gerekiyor mu?", a: "Hayır. Prificient bulut tabanlı bir uygulamadır. Herhangi bir program indirmenize gerek yoktur; tarayıcınızdan giriş yapıp hemen kullanmaya başlayabilirsiniz." }
                ].map((item, idx) => (
                  <details key={idx} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden open:shadow-md open:border-blue-400 transition-all duration-300">
                    <summary className="flex w-full cursor-pointer items-center justify-between p-6 font-bold text-gray-900 list-none select-none hover:bg-gray-50/50 transition-colors">
                       <div className="flex items-center gap-3 text-left">
                          <HelpCircle size={20} className="text-blue-500 shrink-0" />
                          <span>{item.q}</span>
                       </div>
                       {/* Chevron İkonu - Açılınca döner */}
                       <svg 
                         className="h-5 w-5 text-gray-400 transition-transform duration-300 group-open:rotate-180 shrink-0" 
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                       >
                         <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                       </svg>
                    </summary>
                    <div className="px-6 pb-6 pl-14 text-gray-600 text-sm font-medium leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.a}
                    </div>
                  </details>
                ))}
             </div>
          </div>
        </section>

{/* =========================================
            6. CTA (GARANTİ CONTRAST - SOLID DARK)
           ========================================= */}
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 lg:px-8">
                {/* DÜZELTME: bg-gray-900 (Koyu Gri/Siyah) arka plan zorunlu tutuldu */}
                <div className="relative isolate overflow-hidden bg-white px-6 py-24 shadow-2xl rounded-[3rem] sm:px-24 text-center">
                    
                    {/* İçerik */}
                    <div className="mx-auto max-w-2xl relative z-10">
                        <h2 className="text-3xl font-black tracking-tight text-black sm:text-5xl mb-6">
                            Finansal Özgürlüğünüze <br />
                            Bugün Adım Atın.
                        </h2>
                        
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-500 font-medium">
                            Beta süreci boyunca Prificient'ın tüm özellikleri tamamen ücretsiz. 
                            Sürpriz fatura yok, taahhüt yok.
                        </p>
                        
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto rounded-2xl border border-gray-600 px-8 py-4 text-lg font-bold text-black hover:bg-gray-100 transition-all flex items-center justify-center"
                            >
                                Ücretsiz Başla
                            </Link>
                        </div>

                        {/* Alt Metin */}
                        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-wrap justify-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                             <span className="hidden sm:inline">•</span>
                             <span>Kredi Kartı Gerekmez</span>
                             <span className="hidden sm:inline">•</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  )
}