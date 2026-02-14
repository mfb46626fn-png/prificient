import { Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Lock size={32}/></div>
        <h1 className="text-3xl font-black text-gray-900 m-0">Gizlilik Politikası</h1>
      </div>

      <p className="text-sm text-gray-500 font-bold mb-8">Son Güncelleme: 26 Aralık 2025</p>

      <p>
        Prificient olarak gizliliğinize büyük önem veriyoruz. Bu Gizlilik Politikası, web sitemizi ve hizmetlerimizi kullandığınızda bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-8">1. Topladığımız Bilgiler</h3>
      <p>Hizmetimizi kullanırken aşağıdaki bilgileri toplayabiliriz:</p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li><strong>Hesap Bilgileri:</strong> Google ile giriş yaptığınızda Google profilinizden (Ad, E-posta, Profil Resmi) alınan temel bilgiler.</li>
        <li><strong>Kullanım Verileri:</strong> Yüklediğiniz Excel dosyaları ve girdiğiniz finansal kayıtlar. Bu veriler sadece sizin dashboard'unuzu oluşturmak için kullanılır.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-8">2. Veri Güvenliği</h3>
      <p>
        Verileriniz endüstri standardı güvenlik önlemleriyle korunmaktadır:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>Tüm veri transferleri <strong>SSL (Secure Socket Layer)</strong> şifrelemesi ile yapılır.</li>
        <li>Veritabanımızda hassas veriler şifrelenmiş olarak saklanır.</li>
        <li>Kredi kartı bilgileri sistemimizde <strong>saklanmaz</strong>. (Beta sürecinde ödeme alınmamaktadır).</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-8">3. Üçüncü Taraf Hizmetler</h3>
      <p>
        Hizmetlerimizi sunabilmek için güvenilir altyapı sağlayıcıları kullanıyoruz:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li><strong>Supabase:</strong> Veritabanı ve kimlik doğrulama hizmetleri.</li>
        <li><strong>Google Cloud:</strong> Google ile giriş altyapısı.</li>
      </ul>
      <p>Bu sağlayıcılar, verilerinizi sadece hizmetin devamlılığı için gerekli olduğu ölçüde işler.</p>

      <h3 className="text-xl font-bold text-gray-900 mt-8">4. İletişim</h3>
      <p>
        Gizlilik politikamızla ilgili sorularınız için bizimle <strong>destek@prificient.com</strong> üzerinden iletişime geçebilirsiniz.
      </p>
    </article>
  )
}