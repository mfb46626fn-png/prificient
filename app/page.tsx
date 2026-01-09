import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  Zap, 
  PieChart, 
  ShieldCheck, 
  TrendingUp,
  LayoutDashboard,
  Search,
  Menu,
  X
} from 'lucide-react'

// --- NAVBAR COMPONENT (Bu dosya içinde tanımlandı, istersen components/LandingHeader.tsx'e taşı) ---
const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Prificient</span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="#features" className="hover:text-indigo-600 transition-colors">Özellikler</Link>
        <Link href="#tools" className="hover:text-indigo-600 transition-colors">Araçlar</Link>
        <Link href="#pricing" className="hover:text-indigo-600 transition-colors">Fiyatlar</Link>
      </div>

      {/* Actions */}
      <div className="hidden md:flex items-center gap-4">
        <Link href="/login" className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors">
          Giriş Yap
        </Link>
        <Link href="/login" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
          Ücretsiz Dene
        </Link>
      </div>

      {/* Mobile Menu Icon (Görsel Temsil) */}
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

      <main>
        
        {/* =========================================
            B. HERO SECTION (KARŞILAMA)
           ========================================= */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Arkaplan Bulanıklığı (Blob) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] -z-10"></div>

          <div className="container mx-auto px-6 text-center relative z-10">
            
            {/* 1. Üst Etiket (Pill Badge) */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8 hover:scale-105 transition-transform cursor-default">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Prificient v1.0 Beta Yayında</span>
            </div>

            {/* 2. Ana Başlık (H1) */}
            <h1 className="max-w-4xl mx-auto text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
              E-Ticaretin Görünmeyen <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Kârını Ortaya Çıkarın.
              </span>
            </h1>

            {/* 3. Alt Açıklama */}
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
              Satış rakamlarına aldanmayın. Prificient, gizli giderleri bulur, net kârınızı hesaplar ve işletmenizi verilerle büyütmenizi sağlar.
            </p>

            {/* 4. CTA Butonları */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group">
                Hemen Başla — Ücretsiz
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <LayoutDashboard size={20} className="text-gray-400"/>
                Demoyu İncele
              </Link>
            </div>

            {/* 5. Dashboard Görseli (Browser Mockup) */}
            <div className="relative max-w-6xl mx-auto">
              {/* Dekoratif Gölge */}
              <div className="absolute -inset-1 bg-gradient-to-b from-indigo-100 to-white rounded-[2rem] blur-xl opacity-50"></div>
              
              <div className="relative bg-gray-900 rounded-xl md:rounded-[20px] p-2 shadow-2xl ring-1 ring-gray-900/10">
                <div className="bg-white rounded-lg md:rounded-[12px] overflow-hidden border border-gray-200">
                   {/* Buraya gerçek dashboard resmini koyacaksın */}
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

              {/* Floating Badge Örneği (Sağ Üst) */}
              <div className="hidden lg:flex absolute -top-12 -right-12 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex-col gap-2 animate-bounce duration-[3000ms]">
                 <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                        <TrendingUp size={20}/>
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase">Net Kâr</span>
                 </div>
                 <div className="text-2xl font-black text-gray-900">₺142.500</div>
                 <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                    +%24.5 Artış
                 </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================
            C. SOSYAL KANIT (Logolar)
           ========================================= */}
        <section className="py-10 border-y border-gray-100 bg-gray-50/50">
          <div className="container mx-auto px-6 text-center">
            <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">
                Global Pazaryerleri ile Tam Entegre
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100 duration-500">
               {/* Buraya SVG Logolar Gelecek - Şimdilik Text */}
               {['Shopify', 'Trendyol', 'Amazon', 'Hepsiburada', 'WooCommerce', 'Etsy'].map(brand => (
                 <span key={brand} className="text-xl md:text-2xl font-black text-gray-800">{brand}</span>
               ))}
            </div>
          </div>
        </section>

        {/* =========================================
            D. ÖZELLİKLER (ZIG-ZAG LAYOUT)
           ========================================= */}
        <section id="features" className="py-24 md:py-32 overflow-hidden bg-white">
          <div className="container mx-auto px-6 space-y-24 md:space-y-32">
            
            {/* FEATURE 1: Metin Sol - Görsel Sağ */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                    <BarChart3 size={24} />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Gerçek Zamanlı <br/> Kârlılık Analizi.
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed">
                  Ciro yanıltıcıdır. Prificient, iadeler, komisyonlar, kargo ve pazarlama giderleri düştükten sonra cebinize kalan net tutarı saniye saniye hesaplar.
                </p>
                <ul className="space-y-3 pt-4">
                    {['Otomatik veri senkronizasyonu', 'Anlık döviz kuru dönüşümü', 'Detaylı kesinti dökümü'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                            <CheckCircle2 size={20} className="text-indigo-600" /> {item}
                        </li>
                    ))}
                </ul>
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-indigo-50 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white border border-gray-100 shadow-2xl rounded-2xl p-6 hover:-translate-y-2 transition-transform duration-500">
                    {/* Fake UI Element */}
                    <div className="flex justify-between items-end mb-4 border-b border-gray-50 pb-4">
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase">Bugünkü Net Kâr</p>
                            <p className="text-4xl font-black text-gray-900">₺8.450</p>
                        </div>
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-sm font-bold">+%12</div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full w-[70%] bg-indigo-600 rounded-full"></div></div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full w-[45%] bg-emerald-500 rounded-full"></div></div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full w-[60%] bg-amber-400 rounded-full"></div></div>
                    </div>
                </div>
              </div>
            </div>

            {/* FEATURE 2: Görsel Sol - Metin Sağ */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 mb-4">
                    <Zap size={24} />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Yapay Zeka Destekli <br/> Stratejik İçgörüler.
                </h2>
                <p className="text-lg text-gray-500 leading-relaxed">
                  Sadece veriyi göstermiyoruz, onu yorumluyoruz. AI asistanımız, reklam bütçenizi optimize etmeniz veya fiyat artırmanız gereken ürünleri size söyler.
                </p>
                <div className="bg-violet-50 border border-violet-100 p-4 rounded-xl mt-4">
                    <p className="text-sm font-bold text-violet-900 flex gap-2">
                        <Zap size={16} className="mt-0.5 fill-violet-600 text-violet-600"/>
                        "X Ürününde reklam maliyeti çok yüksek. Bütçeyi %10 kısarsan kâr marjın %5 artacak."
                    </p>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gray-100 rounded-3xl transform -rotate-3"></div>
                <div className="relative bg-white border border-gray-100 shadow-2xl rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 flex items-center justify-center aspect-square">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-200">
                            <Zap size={40} fill="currentColor"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">AI Analizi Tamamlandı</h3>
                        <p className="text-gray-400 mt-2">3 kritik fırsat tespit edildi.</p>
                        <button className="mt-6 px-6 py-2 bg-black text-white rounded-lg text-sm font-bold">Raporu Gör</button>
                    </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================
            E. ARAÇLAR GRID (TOOLS)
           ========================================= */}
        <section id="tools" className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                İhtiyacınız Olan Tüm Finansal Araçlar
              </h2>
              <p className="text-gray-500 text-lg">
                Dropshipping ve E-ticaret operasyonlarınızı yönetmek için geliştirilmiş özel modüller.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* TOOL CARDS */}
                {[
                    { icon: PieChart, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Kâr Hesaplayıcı', desc: 'Ürün bazlı başa baş noktası ve net kâr analizi.' },
                    { icon: Search, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Gider Avcısı', desc: 'Gözden kaçan abonelikleri ve gizli giderleri bulun.' },
                    { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Risk Analizi', desc: 'Nakit akışınızı bozabilecek riskleri önceden görün.' },
                    { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Satış Simülatörü', desc: 'Fiyat değişikliğinin kâra etkisini test edin (Sandbox).' },
                    { icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-50', title: 'Tek Ekran Yönetimi', desc: 'Trendyol, Shopify ve Amazon tek bir panelde.' },
                    { icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50', title: 'Anlık Bildirimler', desc: 'Kritik stok ve marj düşüşlerinde anında haber alın.' },
                ].map((tool, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                        <div className={`w-12 h-12 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <tool.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{tool.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">{tool.desc}</p>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* =========================================
            F. FOOTER
           ========================================= */}
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
                
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
                        <span className="text-xl font-bold text-gray-900">Prificient</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        E-ticaret girişimcileri için geliştirilmiş, veri odaklı finansal işletim sistemi.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Ürün</h4>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li><a href="#" className="hover:text-indigo-600">Özellikler</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Fiyatlandırma</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Entegrasyonlar</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Yol Haritası</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Şirket</h4>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li><a href="#" className="hover:text-indigo-600">Hakkımızda</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Kariyer</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Blog</a></li>
                        <li><a href="#" className="hover:text-indigo-600">İletişim</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Yasal</h4>
                    <ul className="space-y-4 text-sm text-gray-500 font-medium">
                        <li><a href="#" className="hover:text-indigo-600">Gizlilik Politikası</a></li>
                        <li><a href="#" className="hover:text-indigo-600">Kullanım Şartları</a></li>
                        <li><a href="#" className="hover:text-indigo-600">KVKK</a></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-400 text-sm font-medium">© 2026 Prificient Inc. Tüm hakları saklıdır.</p>
                <div className="flex gap-6">
                    {/* Sosyal Medya İkonları (Placeholder) */}
                    <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-indigo-600 transition-colors"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-indigo-600 transition-colors"></div>
                    <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-indigo-600 transition-colors"></div>
                </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  )
}