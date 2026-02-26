import { ShieldAlert } from 'lucide-react'

export default function KVKKPage() {
  return (
    <div className="max-w-4xl mx-auto py-32 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-12 border-b border-white/10 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-white/80" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">KVKK Aydınlatma Metni</h1>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-white/30">Son Güncelleme: 26 Aralık 2025</p>
        </div>
      </div>

      <div className="space-y-12 text-lg text-white/50 leading-relaxed font-medium">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">1. Veri Sorumlusu ve Kimliğimiz</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, "We Cahan" şirketi projesi olan <strong>Prificient</strong> ("Veri Sorumlusu") sıfatıyla finansal şeffaflık vizyonumuzu, verilerinizin yasal korunması şemsiyesi altında da en üst düzeyde uyguluyoruz. Bize emanet ettiğiniz her veri parçasını, dürüstlük ve hukuki kurallar çerçevesinde işliyoruz.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">2. Verilerin İşlenme ve Aydınlatılma Amacı</h2>
          <p>Bize sağladığınız kişisel ve kurumsal metrikleriniz, sadece aşağıdaki meşru amaçlarla sistemimizde bulundurulmaktadır:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-white/20">
            <li><strong className="text-white">Finansal İşletim Sisteminin Kurulması:</strong> Gelir-gider tablolarınızın, kâr/zarar oranlarınızın tamamen size özel ve tutarlı olarak hesaplanıp şifrelenerek sunulması.</li>
            <li><strong className="text-white">Ekosistem Gerçekliği:</strong> Çoklu pazaryeri (Trendyol, Shopify vb.) senkronizasyonlarının problemsiz entegrasyonu.</li>
            <li><strong className="text-white">Elit Kulüp / Beta Yaklaşımı:</strong> Onboarding sürecinizin, iletişim kanallarımızın ve hesabınızın tam yetkilendirmesiyle güvenle aktive edilmesi.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">3. İşlenen Somut Veriler</h2>
          <p>Platform dâhilinde tarafımızca otomatik ve/veya manuel yollarla işlenen metrik grupları:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h3 className="text-white font-bold mb-2">Bireysel ve Kurumsal İmza</h3>
              <p className="text-sm">Mağaza adınız, temsilci ad-soyad bilgileriniz, vergi numaralarınız ve iletişim kanallarınız (E-posta vb.).</p>
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h3 className="text-white font-bold mb-2">Sübtil Finansal Akışlar</h3>
              <p className="text-sm">API aracılığıyla alınan ciro bilgileri, iade verileri, komisyon kesintileri. (Bu veriler 3. şahıslara / kurumlara satılamaz ve <strong className="text-white">paylaşılamaz</strong>).</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">4. Haklarınız ve Güç Elinizde</h2>
          <p>KVKK'nın 11. maddesi uyarınca dijital CFO'nuzdaki haklarınız limitsizdir:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-white/20">
            <li>Kişisel verilerinizin işlenip işlenmediği hususunda teyit talep etmek,</li>
            <li>İşlenme faaliyetine karşı detaylı bilgi almak ve amacına uygunluğu denetlemek,</li>
            <li>Grup şirketleri ve ortaklıklar hariç aktarım yapılan üçüncü kişileri bilmek,</li>
            <li>Verilerinizin sistemden kalıcı bir şekilde imha edilmesini ve yok edilmesini talep etmek.</li>
          </ul>
        </section>

        <section className="space-y-4 pt-8 border-t border-white/10">
          <p className="text-sm text-center">
            Verileriniz üzerindeki egemenliğinizi kullanmak ve taleplerinizi iletmek için <strong>destek@prificient.com</strong> ile direkt temasa geçebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  )
}