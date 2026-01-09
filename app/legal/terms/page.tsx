import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FileText size={32}/></div>
        <h1 className="text-3xl font-black text-gray-900 m-0">Kullanıcı Sözleşmesi</h1>
      </div>

      <p className="text-sm text-gray-500 font-bold mb-8">Son Güncelleme: 26 Aralık 2025</p>

      <h3 className="text-xl font-bold text-gray-900">1. Taraflar</h3>
      <p>
        İşbu sözleşme, Prificient ("Sağlayıcı") ile https://prificient.com sitesine üye olan kullanıcı ("Kullanıcı") arasında akdedilmiştir.
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-8">2. Hizmetin Konusu</h3>
      <p>
        Prificient, e-ticaret satıcıları için gelir-gider takibi, kârlılık analizi ve finansal raporlama hizmeti sunan bulut tabanlı bir yazılımdır (SaaS).
      </p>

      <h3 className="text-xl font-bold text-gray-900 mt-8 bg-yellow-50 p-4 rounded-xl border border-yellow-100">3. Beta Sürümü Hakkında Uyarı</h3>
      <p className="font-medium text-gray-800">
        Kullanıcı, hizmetin şu anda "BETA" aşamasında olduğunu, yazılımın geliştirilme sürecinin devam ettiğini kabul eder. Beta sürecinde:
      </p>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>Yazılımda hatalar (bug) olabilir.</li>
        <li>Servis kesintileri yaşanabilir.</li>
        <li>Sağlayıcı, veri kaybından dolayı sorumlu tutulamaz (Kullanıcının düzenli yedek alması önerilir).</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-8">4. Kullanım Şartları</h3>
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>Kullanıcı, sisteme girdiği verilerin doğruluğundan kendisi sorumludur.</li>
        <li>Tek bir hesap birden fazla kişi tarafından paylaşılamaz.</li>
        <li>Sistemin güvenliğini tehdit edecek (reverse engineering, bot kullanımı vb.) faaliyetler yasaktır.</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-8">5. Sözleşmenin Feshi</h3>
      <p>
        Kullanıcı dilediği zaman üyeliğini iptal edebilir. Prificient, kötüye kullanım tespiti halinde hesabı askıya alma hakkını saklı tutar.
      </p>
    </article>
  )
}