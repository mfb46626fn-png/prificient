import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-32 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-12 border-b border-white/10 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <FileText className="w-8 h-8 text-white/80" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">Kullanım Şartları</h1>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-white/30">Son Güncelleme: 26 Aralık 2025</p>
        </div>
      </div>

      <div className="space-y-12 text-lg text-white/50 leading-relaxed font-medium">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">1. Taraflar ve Vizyon</h2>
          <p>
            İşbu sözleşme, "We Cahan" markasının amiral gemisi vizyon projesi olan Prificient ("Sistem") ile erken erişim, kapalı beta veya genel kullanıma dâhil olan işletme sahibi ("Partner" veya "Kullanıcı") arasında, şeffaf bir ekosistem inşa etmek amacıyla akdedilmiştir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">2. Prificient Master Planı&apos;nın Konusu</h2>
          <p>
            Prificient, satış platformlarının (Shopify, Amazon, Etsy vb.) yanıltıcı cirolarından sıyrılarak, işletmelerin kârlılıklarını şeffafça görebilmelerini sağlayan kurumsal bir <strong className="text-white">finansal işletim sistemidir.</strong> Eklenen her bir özellik, e-ticaret satıcılarının gizli maliyetlerini tespit edip yok etme amacını güder.
          </p>
        </section>

        <section className="space-y-4">
          <div className="p-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none" />
            <h2 className="text-2xl font-bold text-white tracking-tight mb-4 relative z-10">3. Kapalı Beta Gerçekleri (Uyarı)</h2>
            <p className="relative z-10 text-white/60">
              Sistem şu anda "Kapalı Beta" aşamasında olup, kurumsal yapılaşmasına devam etmektedir. Sistem üzerinde işlem yaparken, aşağıdaki koşulları dürüstlük ilkesi çerçevesinde kabul etmiş sayılırsınız:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-yellow-500/50 relative z-10 text-white/60">
              <li><strong className="text-white">Kesintiler:</strong> Sürekli altyapı güçlendirmeleri (deployments) esnasında anlık kesintiler yaşanabilir.</li>
              <li><strong className="text-white">Asimetrik Veriler:</strong> API gecikmelerinden dolayı paneldeki verilerde saniyelik veya saatlik kur / komisyon oynamaları gözlemlenebilir. Nihai kararlar verilirken entegrasyon sağlık durumları kontrol edilmelidir.</li>
              <li><strong className="text-white">Sorumluluk Çerçevesi:</strong> Prificient, beta süreçlerinde oluşan platform hatalarından doğabilecek dolaylı kâr/gelir kayıplarında yasal yükümlülük taşımaz.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">4. Elit Partnerlik Şartları</h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-white/20">
            <li>Prificient platformundaki hesabınızı veya entegrasyon API anahtarlarınızı bir başka şahıs veya kurumla <strong className="text-white">paylaşamazsınız.</strong></li>
            <li>Sistemi tersine mühendislikle kopyalamaya veya "scraping" gibi otonom bot yollarıyla suistimal etmeye kalkışmak hesabınızın kalıcı olarak feshine neden olur.</li>
            <li>Prificient&apos;e sağlanan mağaza log, sipariş, maliyet ve finansal verilerin doğruluğunun tüm yasal sorumluluğu sadece size aittir.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">5. Sözleşmenin Feshi ve Yeni Dönem</h2>
          <p>
            Kullanıcı veya Prificient dilediği an üyeliği tek taraflı iptal edebilir. Sistemimizi kötü niyetli kullanım veya vizyon dışı suiistimal tespiti halinde Prificient, profili derhal askıya alma hakkını saklı tutar.
          </p>
        </section>
      </div>
    </div>
  )
}