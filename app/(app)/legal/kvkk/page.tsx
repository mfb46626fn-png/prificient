import { ShieldCheck } from 'lucide-react'

export default function KVKKPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><ShieldCheck size={32}/></div>
        <h1 className="text-3xl font-black text-gray-900 m-0">KVKK Aydınlatma Metni</h1>
      </div>
      
      <p className="text-sm text-gray-500 font-bold mb-8">Son Güncelleme: 26 Aralık 2025</p>

      <h3 className="text-xl font-bold text-gray-900">1. Veri Sorumlusu</h3>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, <strong>Prificient</strong> ("Şirket") olarak, veri sorumlusu sıfatıyla kişisel verilerinizi aşağıda açıklanan amaçlar kapsamında; hukuka ve dürüstlük kurallarına uygun bir şekilde işleyebilecek, kaydedebilecek, saklayabilecek, sınıflandırabilecek, güncelleyebilecek ve mevzuatın izin verdiği hallerde üçüncü kişilere açıklayabilecek/devredebileceğiz.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-8">2. Kişisel Verilerin İşlenme Amacı</h3>
      <p>Kişisel verileriniz şu amaçlarla işlenmektedir:</p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>Prificient platformuna üyelik işlemlerinin gerçekleştirilmesi.</li>
        <li>E-ticaret finansal analiz hizmetlerinin (gelir, gider, kâr hesaplama) sunulabilmesi.</li>
        <li>Pazaryeri (Trendyol, Hepsiburada vb.) entegrasyonlarının sağlanması.</li>
        <li>Kullanıcı güvenliğinin sağlanması ve şüpheli işlemlerin takibi.</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-8">3. İşlenen Kişisel Veriler</h3>
      <p>Sistemimizde işlenen veriler şunlardır:</p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li><strong>Kimlik Bilgileri:</strong> Ad, Soyad.</li>
        <li><strong>İletişim Bilgileri:</strong> E-posta adresi.</li>
        <li><strong>Finansal Veriler:</strong> Yüklediğiniz Excel dosyaları, satış verileri, gider kalemleri (Bu veriler sadece analiz için kullanılır, 3. kişilerle paylaşılmaz).</li>
        <li><strong>İşlem Güvenliği:</strong> IP adresi, giriş-çıkış kayıtları.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-8">4. Veri Sahibinin Hakları</h3>
      <p>KVKK’nın 11. maddesi uyarınca herkes, veri sorumlusuna başvurarak kendisiyle ilgili;</p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
        <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
        <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme hakkına sahiptir.</li>
      </ul>

      <p className="mt-8 text-sm text-gray-500 border-t pt-4">
        Haklarınızı kullanmak için <strong>destek@prificient.com</strong> adresine e-posta gönderebilirsiniz.
      </p>
    </article>
  )
}