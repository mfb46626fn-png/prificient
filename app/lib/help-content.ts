// lib/help-content.ts

export type Article = {
  slug: string
  title: string
  content: string // HTML veya Markdown destekli metin
  lastUpdated: string
}

export type Category = {
  id: string
  title: string
  description: string
  icon: 'rocket' | 'file' | 'shield' | 'credit-card'
  articles: Article[]
}

export const HELP_CATEGORIES: Category[] = [
  {
    id: 'baslangic',
    title: 'Başlangıç Rehberi',
    description: 'Hesap kurulumu, ilk adımlar ve temel kavramlar.',
    icon: 'rocket',
    articles: [
      {
        slug: 'nedir',
        title: 'Prificient Nedir ve Nasıl Çalışır?',
        content: '<p>Prificient, e-ticaret satıcıları için geliştirilmiş, olay tabanlı bir finansal analiz aracıdır. Cironuzdan ziyade net kârınıza odaklanır.</p><h3>Temel Özellikler:</h3><ul><li>Gizli maliyet analizi</li><li>Platform komisyon takibi</li><li>Gerçek zamanlı kâr takibi</li></ul>',
        lastUpdated: '10 Ocak 2026'
      },
      {
        slug: 'ilk-kurulum',
        title: 'Hesap Kurulumu ve İlk Ayarlar',
        content: '<p>Prificient hesabınızı oluşturduktan sonra yapmanız gereken ilk şey para biriminizi seçmek ve profil bilgilerinizi güncellemektir.</p>',
        lastUpdated: '12 Ocak 2026'
      }
    ]
  },
  {
    id: 'veri-yonetimi',
    title: 'Veri ve Excel İşlemleri',
    description: 'Excel yükleme, şablonlar ve veri temizliği.',
    icon: 'file',
    articles: [
      {
        slug: 'excel-yukleme',
        title: 'Excel Dosyası Nasıl Yüklenir?',
        // BURAYA DİKKAT: HTML İÇİNDE TAILWIND KULLANIYORUZ
        content: `
          <p class="lead">Prificient'a veri aktarmanın en hızlı yolu Excel veya CSV dosyalarını kullanmaktır. Bu işlem sadece saniyeler sürer.</p>

          <h3>Adım Adım Yükleme</h3>
          <ol>
            <li>Sol menüden <strong>Veri Girişi (Transactions)</strong> sayfasına gidin.</li>
            <li>Sağ üst köşedeki siyah <strong>"Excel Yükle"</strong> butonuna tıklayın.</li>
            <li>Açılan pencereye dosyanızı sürükleyin veya seçin.</li>
          </ol>

          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-xl">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-blue-700">💡 İpucu:</span>
            </div>
            <p class="text-sm text-blue-600 m-0">
              Dosyanızda sütun isimlerinin tam olarak eşleşmesine gerek yoktur. Prificient'ın yapay zekası sütunları otomatik tanır.
            </p>
          </div>

          <h3>Gerekli Sütunlar</h3>
          <p>Dosyanızda aşağıdaki bilgilerin olması yeterlidir:</p>
          <ul>
            <li><strong>Tarih:</strong> İşlemin gerçekleştiği gün.</li>
            <li><strong>Açıklama/Ürün Adı:</strong> Satılan ürünün ismi.</li>
            <li><strong>Tutar:</strong> Satış fiyatı.</li>
          </ul>

          <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mt-6 flex items-start gap-3">
             <div class="text-2xl">⚠️</div>
             <div>
                <h4 class="font-bold text-yellow-800 m-0 text-sm">Dikkat</h4>
                <p class="text-xs text-yellow-700 m-0 mt-1">
                   Yüklediğiniz dosya .xlsx veya .csv formatında olmalıdır. Şifreli Excel dosyaları desteklenmez.
                </p>
             </div>
          </div>
        `,
        lastUpdated: '14 Ocak 2026'
      },
      {
        slug: 'veri-silme',
        title: 'Hatalı Verileri Silme',
        content: '<p>Yanlış yüklenen verileri İşlemler sayfasından tek tek veya Ayarlar sayfasından toplu olarak silebilirsiniz.</p>',
        lastUpdated: '14 Ocak 2026'
      }
    ]
  },
  {
    id: 'abonelik',
    title: 'Abonelik ve Ödeme',
    description: 'Planlar, faturalar ve iptal süreçleri.',
    icon: 'credit-card',
    articles: [
      {
        slug: 'beta-sureci',
        title: 'Beta Süreci Ücretli mi?',
        content: '<p>Hayır. Beta süreci boyunca (v1.0) tüm özellikler tamamen ücretsizdir ve kredi kartı gerektirmez.</p>',
        lastUpdated: '01 Ocak 2026'
      }
    ]
  }
]