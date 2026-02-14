import { Cookie } from 'lucide-react'

export default function CookiePage() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Cookie size={32}/></div>
        <h1 className="text-3xl font-black text-gray-900 m-0">Çerez Politikası</h1>
      </div>

      <p className="text-sm text-gray-500 font-bold mb-8">Son Güncelleme: 26 Aralık 2025</p>

      <p>
        Prificient olarak, web sitemizden en verimli şekilde faydalanabilmeniz ve kullanıcı deneyiminizi geliştirebilmek için Çerez (Cookie) kullanıyoruz.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-8">1. Çerez Nedir?</h3>
      <p>
        Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalaridır.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-8">2. Hangi Çerezleri Kullanıyoruz?</h3>
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-900">Zorunlu Çerezler</h4>
          <p className="text-sm text-gray-600 mt-1">
            Web sitesinin doğru çalışması için gereklidir. Oturum açma bilgilerinizi hatırlamak ve güvenli giriş yapmanızı sağlamak için (Supabase Auth) kullanılır. Bu çerezler kapatılamaz.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-900">Analitik Çerezler</h4>
          <p className="text-sm text-gray-600 mt-1">
            Sitemizi nasıl kullandığınızı analiz ederek performansı artırmamıza yardımcı olur. Bu veriler anonim olarak toplanır.
          </p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8">3. Çerez Yönetimi</h3>
      <p>
        Tarayıcınızın ayarlarını değiştirerek çerezlere ilişkin tercihlerinizi kişiselleştirme imkanına sahipsiniz.
      </p>
    </article>
  )
}