import { ShieldCheck } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-32 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-12 border-b border-white/10 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-white/80" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">Gizlilik Politikası</h1>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-white/30">Son Güncelleme: 26 Aralık 2025</p>
        </div>
      </div>

      <div className="space-y-12 text-lg text-white/50 leading-relaxed font-medium">
        <p>
          "We Cahan" şirketi vizyonu çerçevesinde, Prificient olarak finansal verilerinizin ve şahsi bilgilerinizin gizliliğine mutlak bir hassasiyetle yaklaşıyoruz. E-ticaret operasyonlarınızın kalbindeki verileri, en yüksek güvenlik standartlarıyla nasıl koruduğumuzu aşağıda şeffafça açıklıyoruz.
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">1. Entegre Edilen Veriler</h2>
          <p>Sistemin "Gerçek Kâr" vizyonunu yerine getirebilmesi için gerekli olan temel metrikler:</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h3 className="text-white font-bold mb-2">Platform Metrikleri</h3>
              <p className="text-sm">Shopify, Amazon, Trendyol ve benzeri satış platformlarından çekilen brüt ciro, komisyon oranları ve iade maliyetleri.</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h3 className="text-white font-bold mb-2">Kimlik & Temas Bilgileri</h3>
              <p className="text-sm">Erken erişim ve onboarding süreçlerinde sağladığınız temel erişim (e-posta, mağaza URL'si, ad-soyad) bilgileri.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">2. Askeri Düzeyde Koruma</h2>
          <p>Dijital CFO'nuz olarak, gizliliğinizi şansa bırakmıyoruz. Alınan önlemler:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-white/20">
            <li>Tüm veri akışı ve senkronizasyon süreçleri uçtan uca <strong className="text-white">SSL (Secure Socket Layer)</strong> protokolü ile şifrelenir.</li>
            <li>Hassas finansal verileriniz ve ciro raporlarınız modern kriptografi standartlarıyla veritabanımızda güvence altındadır.</li>
            <li>Beta sürümleri dâhil olmak üzere, kart bilgileri kesinlikle doğrudan sunucularımızda <strong className="text-red-400">tutulmaz</strong>.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">3. Ekosistem Ortakları</h2>
          <p>Sistemin operasyonel hızını ve güvenliğini sağlamak amacıyla alanında lider, uluslararası standartlara sahip altyapı sağlayıcılarıyla çalışıyoruz:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-white/20">
            <li><strong className="text-white">Supabase:</strong> Gerçek zamanlı veritabanı ve güvenli yetkilendirme katmanı.</li>
            <li><strong className="text-white">Vercel:</strong> Global ölçekte hızlı ve güvenli barındırma altyapısı.</li>
          </ul>
        </section>

        <section className="space-y-4 pt-8 border-t border-white/10">
          <p className="text-sm">
            Kurumsal gizlilik yaklaşımımızla ilgili detaylı sorularınız için bize <a href="mailto:destek@prificient.com" className="text-white hover:underline transition-all">destek@prificient.com</a> adresi üzerinden ulaşabilirsiniz.
          </p>
        </section>
      </div>
    </div>
  )
}