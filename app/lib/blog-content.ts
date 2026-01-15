// lib/blog-content.ts

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string 
  date: string
  author: string
  role: string 
  category: string
  readTime: string
  gradientFrom: string 
  gradientTo: string
  accentColor: string // Etiket rengi
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'shopify-gizli-giderler',
    title: "Shopify'da Gizli Giderleri Bulmanın 5 Yolu",
    excerpt: "İşlem ücretleri, uygulama abonelikleri ve iade maliyetleri... Shopify mağazanızda gözden kaçan giderleri nasıl tespit edersiniz?",
    date: "14 Ocak 2026",
    author: "Can Akar",
    role: "Prificient Kurucusu",
    category: "Rehber",
    readTime: "5 dk okuma",
    gradientFrom: "from-blue-600",
    gradientTo: "to-indigo-900",
    accentColor: "bg-blue-100 text-blue-700",
    content: `
      <p class="lead">Shopify harika bir platform, ancak "Basic" plan ücretini ödemekle iş bitmiyor. Kâr marjınızı kemiren görünmez giderleri ifşa ediyoruz.</p>

      <h3>1. İşlem Ücretleri (Transaction Fees)</h3>
      <p>Kendi ödeme altyapınızı kullanıyorsanız, Shopify sizden ek bir kesinti yapabilir. Buna ödeme sağlayıcınızın (Iyzico, Stripe) kestiği %2.9 + 3₺ gibi rakamlar eklendiğinde, cironuzun %5'i daha bankaya gelmeden buharlaşır.</p>

      <div class="bg-rose-50 border-l-4 border-rose-500 p-4 my-6 rounded-r-xl">
        <h4 class="font-bold text-rose-800 m-0 text-sm">Kritik Uyarı</h4>
        <p class="text-sm text-rose-700 m-0 mt-1">
          Pek çok satıcı bu gideri "Genel Gider" olarak yazar. Oysa bu, doğrudan satılan ürünün maliyetine (COGS) eklenmelidir.
        </p>
      </div>

      <h3>2. İade Lojistiği: Sessiz Katil</h3>
      <p>Bir ürün iade edildiğinde sadece satışı kaybetmezsiniz:</p>
      <ul class="list-disc pl-5 space-y-2">
        <li>Gidiş kargo ücreti (Yandı)</li>
        <li>Dönüş kargo ücreti (Ödemek zorundasınız)</li>
        <li>Paketleme maliyeti</li>
        <li>Ürünün hasar görme riski</li>
      </ul>

      <h3>3. Uygulama "Küçük" Abonelikleri</h3>
      <p>Email marketing için 20$, Upsell için 15$, Review için 10$... Tek tek bakıldığında küçük görünen bu rakamlar, ay sonunda ciddi bir sabit gidere dönüşür.</p>

      <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8">
        <h4 class="font-bold text-blue-900 mb-2">Prificient Nasıl Çözer?</h4>
        <p class="text-blue-800 text-sm">
          Sistemimiz, Excel ile yüklediğiniz ekstrenizi analiz eder ve "Bu ay Shopify'a ve Uygulamalara toplam 450$ ödediniz, bu da sipariş başına 1.2$ maliyet demek" diyerek size gerçek birim maliyeti gösterir.
        </p>
      </div>
    `
  },
  {
    id: '2',
    slug: 'roas-vs-net-kar',
    title: "ROAS vs. Net Kâr: Hangisine Odaklanmalısınız?",
    excerpt: "Reklam harcamalarından elde edilen gelir (ROAS) yanıltıcı olabilir. Gerçek büyüme için neden Net Kâr marjına bakmalısınız?",
    date: "10 Ocak 2026",
    author: "Ece Yılmaz",
    role: "Finans Analisti",
    category: "Strateji",
    readTime: "4 dk okuma",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-900",
    accentColor: "bg-emerald-100 text-emerald-700",
    content: `
      <p class="lead">Facebook Business Manager'da ROAS 4.0 görmek harika hissettirir. "1 koydum 4 aldım" dersiniz. Ama gerçekten 4 aldınız mı?</p>

      <h3>ROAS Matematiği vs. Gerçek Hayat</h3>
      <p>Diyelim ki 100 TL reklam verdiniz ve 400 TL ciro yaptınız (ROAS 4). Harika görünüyor. Peki ya giderler?</p>

      <div class="overflow-x-auto my-6">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="p-3 rounded-tl-lg">Kalem</th>
              <th class="p-3 rounded-tr-lg text-right">Tutar</th>
            </tr>
          </thead>
          <tbody class="border border-gray-100">
            <tr class="border-b border-gray-50"><td class="p-3 font-bold">Ciro</td><td class="p-3 text-right font-bold">400 TL</td></tr>
            <tr class="border-b border-gray-50"><td class="p-3 text-red-500">Ürün Maliyeti (%40)</td><td class="p-3 text-right text-red-500">-160 TL</td></tr>
            <tr class="border-b border-gray-50"><td class="p-3 text-red-500">KDV (%20)</td><td class="p-3 text-right text-red-500">-66 TL</td></tr>
            <tr class="border-b border-gray-50"><td class="p-3 text-red-500">Kargo</td><td class="p-3 text-right text-red-500">-50 TL</td></tr>
            <tr class="border-b border-gray-50"><td class="p-3 text-red-500">Reklam (ROAS 4)</td><td class="p-3 text-right text-red-500">-100 TL</td></tr>
            <tr class="bg-emerald-50"><td class="p-3 font-black text-emerald-800">NET KÂR</td><td class="p-3 text-right font-black text-emerald-600">24 TL</td></tr>
          </tbody>
        </table>
      </div>

      <p>Gördüğünüz gibi, ROAS 4 olmasına rağmen cebinize sadece 24 TL kaldı. Eğer ROAS 3'e düşerse, <strong>zarar edersiniz.</strong></p>

      <h3>Çözüm: Net Marj Odaklı Büyüme</h3>
      <p>Reklam ajansınız size ROAS raporlar. Muhasebeciniz size Vergi raporlar. Prificient ise size <strong>"Cebime ne kaldı?"</strong> raporunu sunar.</p>
    `
  },
  {
    id: '3',
    slug: '2026-eticaret-trendleri',
    title: "2026 E-Ticaret Vergi ve Finans Trendleri",
    excerpt: "Yeni yılda e-ticaret satıcılarını bekleyen vergi değişiklikleri ve finansal hazırlık rehberi.",
    date: "02 Ocak 2026",
    author: "Mehmet Demir",
    role: "Mali Müşavir",
    category: "Trendler",
    readTime: "6 dk okuma",
    gradientFrom: "from-purple-600",
    gradientTo: "to-pink-900",
    accentColor: "bg-purple-100 text-purple-700",
    content: `
      <p class="lead">E-ticaret her yıl daha regüle ve daha rekabetçi hale geliyor. 2026'da ayakta kalmak için sadece iyi pazarlama yetmez, sıkı bir finans yönetimi şart.</p>

      <h3>1. Veri Odaklı Karar Alma</h3>
      <p>"Hissiyatla" iş yönetme devri bitti. Artık hangi ürünün iade oranının yüksek olduğunu, hangi varyantın kâr marjının düşük olduğunu bilmek zorundasınız.</p>

      <h3>2. Mikro İhracat ve KDV İadeleri</h3>
      <p>Döviz kazanmak artık bir lüks değil, zorunluluk. Mikro ihracat yapan firmalar KDV iadelerini doğru takip ederek nakit akışlarını %18-20 oranında iyileştirebilirler.</p>

      <div class="grid md:grid-cols-2 gap-4 my-8">
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h4 class="font-bold mb-2">Eski Yöntem</h4>
          <p class="text-sm text-gray-500">Ay sonu muhasebeciden gelen Excel'e bakıp "Umarım kâr etmişimdir" demek.</p>
        </div>
        <div class="bg-black text-white p-4 rounded-xl border border-gray-800">
          <h4 class="font-bold mb-2">Yeni Yöntem</h4>
          <p class="text-sm text-gray-300">Prificient Dashboard'undan anlık net kârı izleyip, gün içinde reklam bütçesini ona göre ayarlamak.</p>
        </div>
      </div>
    `
  }
]