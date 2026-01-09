import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  PlayCircle,
  CreditCard,
  Lock
} from 'lucide-react'

// --- BASİT NAVBAR BİLEŞENİ ---
const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">P</div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Prificient</span>
      </div>

      {/* Menü Linkleri */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
        <Link href="#features" className="hover:text-indigo-600 transition-colors">Özellikler</Link>
        <Link href="#demo" className="hover:text-indigo-600 transition-colors">Demo</Link>
        <Link href="#pricing" className="hover:text-indigo-600 transition-colors">Fiyatlar</Link>
        <Link href="#faq" className="hover:text-indigo-600 transition-colors">SSS</Link>
      </div>

      {/* Aksiyon Butonları */}
      <div className="hidden md:flex items-center gap-4">
        <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors">
          Giriş Yap
        </Link>
        <Link href="/login" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black hover:scale-105 transition-all shadow-xl shadow-gray-200">
          Ücretsiz Dene
        </Link>
      </div>

      {/* Mobil Menü İkonu */}
      <div className="md:hidden text-gray-600">
        <Menu />
      </div>
    </div>
  </nav>
)

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-600 selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex flex-col">
        
        {/* =========================================
            1. HERO SECTION (KARŞILAMA)
           ========================================= */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Arkaplan Efektleri (Blob) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-50/80 to-transparent rounded-full blur-[100px] -z-10 opacity-60"></div>

          <div className="container mx-auto px-6 text-center relative z-10">
            
            {/* Rozet */}
            <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 rounded-full px-4 py-1.5 mb-8 shadow-sm hover:shadow-md transition-all cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">v1.0 Beta Yayında — Tamamen Ücretsiz</span>
            </div>

            {/* H1 Başlık */}
            <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              E-Ticaretin Görünmeyen <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] animate-gradient">
                Gerçek Kârını Keşfedin.
              </span>
            </h1>

            {/* Alt Metin */}
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100">
              Ciro yanıltıcıdır, kâr gerçektir. Prificient; gizli giderleri bulur, iade zararlarını hesaplar ve işletmenizi verilerle büyütmenizi sağlar.
            </p>

            {/* CTA Butonları */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                Hemen Başla
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <PlayCircle size={20} className="text-gray-400"/>
                Demoyu İncele
              </Link>
            </div>

            {/* Kredi Kartı Uyarısı */}
            <div className="flex items-center justify-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-wide animate-in fade-in delay-300">
                <span className="flex items-center gap-1.5"><CreditCard size={14}/> Kredi Kartı Gerekmez</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={14}/> 1 Dakikada Kurulum</span>
            </div>

            {/* Dashboard Görseli (3D Efektli) */}
            <div className="mt-16 relative max-w-6xl mx-auto group perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative bg-gray-900 rounded-2xl md:rounded-[2rem] p-2 shadow-2xl ring-1 ring-gray-900/10 transform transition-transform duration-700 group-hover:rotate-x-2">
                <div className="bg-white rounded-xl md:rounded-[1.5rem] overflow-hidden border border-gray-200">
                   <Image 
                      src="/dashboard-preview.png"
                      alt="Prificient Dashboard"
                      width={1400}
                      height={900}
                      className="w-full h-auto"
                      priority
                   />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================
            2. GÜVEN & SOCIAL PROOF
           ========================================= */}
        <section className="py-12 border-y border-gray-100 bg-gray-50/50">
          <div className="container mx-auto px-6 text-center">
            <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">
                Tüm Pazaryerleri ile Tam Uyumlu
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100 duration-500">
               {['Shopify', 'Trendyol', 'Amazon', 'Hepsiburada', 'WooCommerce', 'Etsy'].map(brand => (
                 <span key={brand} className="text-xl md:text-2xl font-black text-gray-800 cursor-default">{brand}</span>
               ))}
            </div>
          </div>
        </section>

        {/* =========================================
            3. DEĞER ÖNERİSİ & ÖZELLİKLER
           ========================================= */}
        <section id="features" className="py-24 md:py-32 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-base font-bold text-indigo-600 uppercase tracking-widest mb-3">Yetenekler</h2>
              <p className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                Verileriniz Konuşsun, <br/> Siz Büyüyün.
              </p>
              <p className="text-xl text-gray-500">
                Karmaşık Excel tablolarından kurtulun. Prificient, e-ticaret operasyonunuzun röntgenini çeker.
              </p>
            </div>

            {/* Özellik Grid */}
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: 'Net Kâr Görünürlüğü', desc: 'Cironun büyüsüne kapılmayın. Komisyon, kargo ve iade sonrası gerçek cebinize kalanı görün.', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { title: 'Gizli Gider Avcısı', desc: 'Gözden kaçan abonelikleri, kayıp kargoları ve beklenmedik kesintileri otomatik tespit edin.', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { title: 'AI Finans Asistanı', desc: 'Hangi ürüne zam yapmalısın? Hangi reklamı durdurmalısın? Yapay zeka size söylesin.', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((feature, idx) => (
                    <div key={idx} className="group bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                        <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                        <p className="text-gray-500 leading-relaxed font-medium">
                            {feature.desc}
                        </p>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* =========================================
            4. DEMO BÖLÜMÜ
           ========================================= */}
        <section id="demo" className="py-24 bg-gray-900 text-white relative overflow-hidden">
             {/* Arkaplan Efekti */}
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
             
             <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <div className="inline-block bg-indigo-900/50 border border-indigo-500/30 rounded-full px-4 py-1 text-xs font-bold text-indigo-300 uppercase">
                            Canlı Önizleme
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            Kayıt Olmadan <br/> Denemeye Başlayın.
                        </h2>
                        <p className="text-lg text-gray-400 max-w-lg">
                            Sistemin gücünü görmek için kredi kartına veya üyeliğe ihtiyacınız yok. Sandbox ortamında sanal verilerle hemen oynayın.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/demo" className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                <LayoutDashboard size={20}/> Demoyu Aç
                            </Link>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-500"/> Sınırsız Erişim</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-500"/> Anlık Simülasyon</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        {/* Demo Görseli / Videosu */}
                        <div className="relative bg-gray-800 rounded-2xl p-2 border border-gray-700 shadow-2xl">
                             <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center border border-gray-800 relative overflow-hidden group cursor-pointer">
                                 {/* Buraya Demo GIF veya Screenshot gelecek */}
                                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent z-0"></div>
                                 <PlayCircle size={64} className="text-white opacity-80 group-hover:scale-110 transition-transform z-10 relative"/>
                                 <p className="absolute bottom-6 font-bold text-sm tracking-widest uppercase z-10">Demo Turunu Başlat</p>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
        </section>

        {/* =========================================
            5. FİYATLANDIRMA
           ========================================= */}
        <section id="pricing" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Şeffaf Fiyatlandırma</h2>
                    <p className="text-lg text-gray-500">
                        Beta süreci boyunca tüm özellikler tamamen ücretsizdir. <br/>
                        Sürpriz fatura yok, taahhüt yok.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* PLAN 1 */}
                    <div className="p-8 rounded-[2rem] border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Başlangıç</h3>
                        <div className="text-4xl font-extrabold text-gray-900 mb-6">₺0 <span className="text-sm font-medium text-gray-400">/ay</span></div>
                        <p className="text-sm text-gray-500 mb-8 font-medium">Yeni başlayanlar için temel analiz araçları.</p>
                        <button disabled className="w-full py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-400 cursor-not-allowed">Yakında</button>
                    </div>

                    {/* PLAN 2 (ACTIVE) */}
                    <div className="p-8 rounded-[2rem] border-2 border-indigo-600 bg-white shadow-2xl shadow-indigo-200/50 relative transform md:-translate-y-4">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Beta Özel
                        </div>
                        <h3 className="text-xl font-bold text-indigo-900 mb-2">Pro</h3>
                        <div className="text-5xl font-extrabold text-gray-900 mb-6">₺0 <span className="text-lg font-medium text-gray-400">/sonsuza kadar*</span></div>
                        <p className="text-sm text-gray-500 mb-8 font-medium">Beta kullanıcılarına özel tüm özellikler ücretsiz.</p>
                        
                        <ul className="space-y-4 mb-8">
                            {['Sınırsız İşlem Geçmişi', 'Tüm Pazaryeri Entegrasyonları', 'AI Öneri Motoru', 'Gelişmiş Nakit Akışı'].map(f => (
                                <li key={f} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                    <CheckCircle2 size={18} className="text-indigo-600 shrink-0"/> {f}
                                </li>
                            ))}
                        </ul>

                        <Link href="/login" className="block w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                            Hemen Başla
                        </Link>
                        <p className="text-[10px] text-center text-gray-400 mt-4 font-medium">*Beta sürecinde kayıt olanlar için erken erişim avantajları saklı kalacaktır.</p>
                    </div>

                    {/* PLAN 3 */}
                    <div className="p-8 rounded-[2rem] border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                        <div className="text-4xl font-extrabold text-gray-900 mb-6">???</div>
                        <p className="text-sm text-gray-500 mb-8 font-medium">Büyük ölçekli satıcılar ve ajanslar için.</p>
                        <button disabled className="w-full py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-400 cursor-not-allowed">Yakında</button>
                    </div>
                </div>
            </div>
        </section>

        {/* =========================================
            6. SSS (FAQ)
           ========================================= */}
        <section id="faq" className="py-24 bg-gray-50">
            <div className="container mx-auto px-6 max-w-3xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">Sıkça Sorulan Sorular</h2>
                
                <div className="space-y-4">
                    {[
                        { q: "Prificient gerçekten ücretsiz mi?", a: "Evet. Beta sürümü boyunca platformun tüm özelliklerini ücretsiz sunuyoruz. Amacımız sistemi sizin geri bildirimlerinizle mükemmelleştirmek." },
                        { q: "Verilerim güvende mi?", a: "Kesinlikle. Verileriniz endüstri standardı 256-bit SSL şifreleme ile korunur. Verilerinizi asla üçüncü taraflara satmayız. KVKK uyumluluğumuz tamdır." },
                        { q: "Kurulum ne kadar sürer?", a: "Yaklaşık 2 dakika. Sadece pazaryeri maliyetlerinizi ve sabit giderlerinizi girmeniz yeterli. Geçmiş verilerinizi Excel ile toplu yükleyebilirsiniz." },
                        { q: "Hangi platformları destekliyorsunuz?", a: "Şu an Trendyol, Hepsiburada, Amazon, Shopify, WooCommerce ve Etsy yapılarına uygun veri girişi sağlayabilirsiniz." }
                    ].map((item, i) => (
                        <details key={i} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden open:shadow-lg transition-all duration-300">
                            <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-gray-900 list-none select-none">
                                <span>{item.q}</span>
                                <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition-transform duration-300"/>
                            </summary>
                            <div className="px-6 pb-6 pt-0 text-gray-600 font-medium leading-relaxed">
                                {item.a}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>

        {/* =========================================
            7. FOOTER & YASAL
           ========================================= */}
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
                
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
                        <span className="text-xl font-bold text-gray-900">Prificient</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        E-ticaret girişimcileri için geliştirilmiş, veri odaklı finansal işletim sistemi.
                    </p>
                    <div className="flex gap-4">
                        {/* Sosyal İkonlar */}
                        <div className="w-8 h-8 bg-gray-100 rounded-full hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer">X</div>
                        <div className="w-8 h-8 bg-gray-100 rounded-full hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer">In</div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Ürün</h4>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li><Link href="#features" className="hover:text-indigo-600 transition-colors">Özellikler</Link></li>
                        <li><Link href="#pricing" className="hover:text-indigo-600 transition-colors">Fiyatlar</Link></li>
                        <li><Link href="#demo" className="hover:text-indigo-600 transition-colors">Demo</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Destek</h4>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li><a href="#" className="hover:text-indigo-600 transition-colors">Yardım Merkezi</a></li>
                        <li><a href="#" className="hover:text-indigo-600 transition-colors">Topluluk</a></li>
                        <li><a href="mailto:destek@prificient.com" className="hover:text-indigo-600 transition-colors">İletişim</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Yasal</h4>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li><Link href="/legal/privacy" className="hover:text-indigo-600 transition-colors">Gizlilik Politikası</Link></li>
                        <li><Link href="/legal/terms" className="hover:text-indigo-600 transition-colors">Kullanım Şartları</Link></li>
                        <li><Link href="/legal/kvkk" className="hover:text-indigo-600 transition-colors flex items-center gap-2"><Lock size={14}/> KVKK Aydınlatma</Link></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-400 text-sm font-medium">© 2026 Prificient Inc. Tüm hakları saklıdır.</p>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sistemler Çalışıyor
                </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  )
}