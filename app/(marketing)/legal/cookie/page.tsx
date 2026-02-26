import { Cookie } from 'lucide-react'

export default function CookiePage() {
  return (
    <div className="max-w-4xl mx-auto py-32 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-12 border-b border-white/10 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Cookie className="w-8 h-8 text-white/80" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">Çerez Politikası</h1>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-white/30">Son Güncelleme: 26 Aralık 2025</p>
        </div>
      </div>

      <div className="space-y-12 text-lg text-white/50 leading-relaxed font-medium">
        <section className="space-y-4">
          <p>
            Her büyük yapının bir hafızası vardır. Biz, e-ticaret tablonuzu aydınlatan araçlarımızı geliştirirken, size en elit ve en hızlı deneyimi kesintisiz sunabilmek amacıyla ufak çaplı bellek dosyalarından (Çerez / Cookie) faydalanırız. Amacımız sizi bireysel olarak takip etmek değil; işletim sistemini, sizin operasyonlarınıza en uygun ve güvende hissedeceğiniz şekilde optimize etmektir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">1. Bu Sistem Neden Çerez Kullanıyor?</h2>
          <p>
            Hesap güvenliğinizi teyit etmek, karmaşık finansal dashboard'larınızın oturum açma hızını senkronize etmek ve sitemizin anonim trafiğini mimariye zarar vermeden analiz edebilmek için iz bırakıyoruz.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">2. Mimariyi Ayakta Tutan İki Tür Çerez</h2>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-white font-bold text-xl">Zorunlu Çerezler (Kapatılamayanlar)</h3>
              </div>
              <p className="text-sm">
                Supabase gibi güvenlik altyapılarımızın oturum bilginizi (token) doğrulaması ve sisteme giriş yaptığınızda hesabınızın sızılma girişimlerini engellemesi için cihazınızda tuttuğu kriptolojik teyit dosyalarıdır.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-white font-bold text-xl">Analitik (Akıllı) Çerezler</h3>
              </div>
              <p className="text-sm">
                Manifesto sayfamıza ne kadar okunma geldiğini veya "Net Kâr Simülatörü"nde ne kadar vakit geçirildiğini ölçmek adına verileri anonimleştiren çerezlerdir. Kim olduğunuzla değil, sistemin hangi parçasının iyileştirileceğiyle ilgilenir.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">3. Çerezlerin Anahtarı Sizde</h2>
          <p>
            İstemediğiniz özelliklere dair tarayıcı ayarlarınızdan çerezleri silebilir veya kısıtlayabilirsiniz. Ancak "zorunlu çerezleri" engellemeniz, platform içerisindeki güvenli giriş rotalarınızı kırabilir ve sistemin hizmet vermesini durdurabilir.
          </p>
        </section>
      </div>
    </div>
  )
}