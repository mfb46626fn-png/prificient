import type { ToolConfig } from './types'

// ─── KATEGORİ 3: OPERASYON VE FİYATLANDIRMA ──────────

export const stripePaypalFeeCalculator: ToolConfig = {
    slug: 'stripe-paypal-fee-calculator',
    title: 'Stripe & PayPal Komisyon Hesaplayıcı',
    description: 'Ödeme altyapılarının kestiği komisyonu ve cebinize giren net parayı hesaplayın.',
    category: 'operations',
    color: 'slate',
    icon: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
    inputs: [
        { id: 'transaction_amount', label: 'Satış Tutarı (₺)', type: 'currency', defaultValue: 500, placeholder: '500' },
        { id: 'is_international', label: 'Yurtdışı İşlem (1=Evet, 0=Hayır)', type: 'number', defaultValue: 0, placeholder: '0' },
        { id: 'monthly_orders', label: 'Aylık Sipariş Sayısı', type: 'number', defaultValue: 200, placeholder: '200' },
    ],
    results: [
        {
            id: 'stripe_fee',
            label: 'Stripe Komisyon',
            type: 'currency',
            formula: (i) => {
                const rate = i.is_international >= 1 ? 0.039 : 0.029
                return Math.round(((i.transaction_amount * rate) + 0.30) * 100) / 100
            },
        },
        {
            id: 'net_amount',
            label: 'Cebinize Giren Net Tutar',
            type: 'currency',
            formula: (i) => {
                const rate = i.is_international >= 1 ? 0.039 : 0.029
                const fee = (i.transaction_amount * rate) + 0.30
                return Math.round((i.transaction_amount - fee) * 100) / 100
            },
            sentiment: () => 'positive',
        },
        {
            id: 'fee_percent',
            label: 'Efektif Komisyon Oranı',
            type: 'percent',
            formula: (i) => {
                const rate = i.is_international >= 1 ? 0.039 : 0.029
                const fee = (i.transaction_amount * rate) + 0.30
                return i.transaction_amount > 0 ? Math.round((fee / i.transaction_amount) * 1000) / 10 : 0
            },
        },
        {
            id: 'monthly_total_fee',
            label: '1000 Siparişte Kaybedilen Toplam Komisyon',
            type: 'currency',
            formula: (i) => {
                const rate = i.is_international >= 1 ? 0.039 : 0.029
                const fee = (i.transaction_amount * rate) + 0.30
                return Math.round(fee * 1000)
            },
            isLocked: true,
            sentiment: () => 'negative',
        },
    ],
    content: {
        intro: 'Stripe, PayPal ve benzeri ödeme altyapılarının kestiği komisyonu hesaplayın.',
        howItWorks: 'Satış tutarınıza Stripe standart komisyon formülünü (%2.9 + $0.30) uygulayarak her işlemde ne kadar komisyon kesildiğini hesaplar. Uluslararası işlemlerde %3.9 uygulanır. Giriş yaparak 1000 siparişte toplam kaybı görebilirsiniz.',
        details: `## Ödeme Komisyonu Neden Önemli?

Her işlemde %3 civarı komisyon, yıl sonunda ciddi tutarlara ulaşır.

### Standart Oranlar

- **Stripe Yurtiçi**: %2.9 + $0.30
- **Stripe Uluslararası**: %3.9 + $0.30
- **PayPal**: %2.99 + sabit ücret`,
        faq: [
            { question: 'Stripe ile PayPal arasında fark var mı?', answer: 'Yaklaşık aynı oranlarda çalışırlar. Stripe teknik entegrasyon için daha esnektir, PayPal ise müşteri güveni ve hızlı checkout avantajı sunar.' },
            { question: 'Komisyonu müşteriye yansıtabilir miyim?', answer: 'Teknik olarak fiyata dahil edebilirsiniz ama ayrı bir "işlem ücreti" olarak yansıtmak çoğu ülkede sözleşmeye aykırıdır.' },
            { question: 'Komisyonu düşürmek mümkün mü?', answer: 'Yüksek hacimli işletmeler özel oran talep edebilir. Ayrıca iyzico, Param gibi Türk altyapıları genellikle daha düşük oranlar sunar.' },
        ],
    },
}

export const productPricingCalculator: ToolConfig = {
    slug: 'product-pricing-calculator',
    title: 'Ürün Fiyatlandırma Sihirbazı',
    description: 'Maliyetinize göre ideal satış fiyatını bulun.',
    category: 'operations',
    color: 'lime',
    icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z',
    inputs: [
        { id: 'product_cost', label: 'Ürün Maliyeti (₺)', type: 'currency', defaultValue: 80, placeholder: '80' },
        { id: 'shipping_cost', label: 'Kargo Maliyeti (₺)', type: 'currency', defaultValue: 20, placeholder: '20' },
        { id: 'desired_margin', label: 'Hedef Kâr Marjı (%)', type: 'percent', defaultValue: 40, placeholder: '40' },
    ],
    results: [
        {
            id: 'ideal_price',
            label: 'İdeal Satış Fiyatı',
            type: 'currency',
            formula: (i) => i.desired_margin < 100 ? Math.round(((i.product_cost + i.shipping_cost) / (1 - (i.desired_margin / 100))) * 100) / 100 : 0,
        },
        {
            id: 'markup',
            label: 'Markup Oranı',
            type: 'percent',
            formula: (i) => {
                const total = i.product_cost + i.shipping_cost
                const price = i.desired_margin < 100 ? total / (1 - (i.desired_margin / 100)) : 0
                return total > 0 ? Math.round(((price - total) / total) * 100) : 0
            },
        },
        {
            id: 'profit_per_unit',
            label: 'Birim Kâr',
            type: 'currency',
            formula: (i) => {
                const total = i.product_cost + i.shipping_cost
                const price = i.desired_margin < 100 ? total / (1 - (i.desired_margin / 100)) : 0
                return Math.round((price - total) * 100) / 100
            },
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'psychological_price',
            label: 'Önerilen Psikolojik Satış Fiyatı',
            type: 'text',
            formula: (i) => {
                const total = i.product_cost + i.shipping_cost
                const price = i.desired_margin < 100 ? total / (1 - (i.desired_margin / 100)) : 0
                const rounded = Math.ceil(price / 10) * 10 - 0.10
                return `₺${rounded.toFixed(2)}`
            },
            isLocked: true,
            description: 'Müşteri algısını optimize eden fiyat',
        },
    ],
    content: {
        intro: 'Ürün maliyetinize istediğiniz kâr marjını ekleyerek ideal satış fiyatını hesaplayın.',
        howItWorks: 'Toplam maliyetinizi (ürün + kargo) hedef marj formülüyle bölerek ideal satış fiyatını bulur. Ayrıca markup oranını ve birim kârı gösterir. Giriş yaparak psikolojik fiyatlandırma önerisini görebilirsiniz.',
        details: `## Margin vs Markup Farkı

- **Margin**: Satış fiyatının yüzdesi (Kâr / Satış Fiyatı)
- **Markup**: Maliyetin yüzdesi (Kâr / Maliyet)

### Psikolojik Fiyatlandırma

199₺ ile 200₺ arasında algı farkı büyüktür. Araç bunu otomatik önerir.`,
        faq: [
            { question: 'Margin ile markup aynı şey mi?', answer: '%40 margin ile %40 markup farklıdır. 100₺ maliyette %40 margin = 167₺, %40 markup = 140₺. Margin her zaman daha yüksek fiyat verir.' },
            { question: 'Kargo maliyetini dahil etmeli miyim?', answer: 'Eğer ücretsiz kargo sunuyorsanız evet. Kargo müşteriye yansıtılıyorsa dahil etmenize gerek yok.' },
            { question: 'Hangi kâr marjı hedeflemeliyim?', answer: 'E-ticarette %30-50 brüt marj sağlıklı kabul edilir. Rekabetçi ürünlerde %20, niş ürünlerde %50+ olabilir.' },
        ],
    },
}

export const bundleProfitCalculator: ToolConfig = {
    slug: 'bundle-profit-calculator',
    title: 'Bundle (Paket) Kârlılık Hesaplayıcı',
    description: '"3 Al 2 Öde" kampanyalarının kârlılığını test edin.',
    category: 'operations',
    color: 'purple',
    icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
    inputs: [
        { id: 'single_unit_price', label: 'Tekli Satış Fiyatı (₺)', type: 'currency', defaultValue: 200, placeholder: '200' },
        { id: 'single_unit_cost', label: 'Tekli Ürün Maliyeti (₺)', type: 'currency', defaultValue: 80, placeholder: '80' },
        { id: 'bundle_quantity', label: 'Paketteki Ürün Adedi', type: 'number', defaultValue: 3, placeholder: '3' },
        { id: 'discount_percent', label: 'Paket İndirim Oranı (%)', type: 'percent', defaultValue: 33, placeholder: '33' },
    ],
    results: [
        {
            id: 'bundle_price',
            label: 'Paket Satış Fiyatı',
            type: 'currency',
            formula: (i) => Math.round(i.single_unit_price * i.bundle_quantity * (1 - i.discount_percent / 100)),
        },
        {
            id: 'bundle_profit',
            label: 'Paket Kârı',
            type: 'currency',
            formula: (i) => {
                const revenue = i.single_unit_price * i.bundle_quantity * (1 - i.discount_percent / 100)
                return Math.round(revenue - (i.single_unit_cost * i.bundle_quantity))
            },
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'bundle_margin',
            label: 'Paket Kâr Marjı',
            type: 'percent',
            formula: (i) => {
                const revenue = i.single_unit_price * i.bundle_quantity * (1 - i.discount_percent / 100)
                const profit = revenue - (i.single_unit_cost * i.bundle_quantity)
                return revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0
            },
            sentiment: (v) => (v as number) >= 20 ? 'positive' : (v as number) >= 0 ? 'neutral' : 'negative',
        },
        {
            id: 'margin_delta',
            label: 'Tekli Satışa Göre Marj Değişimi',
            type: 'text',
            formula: (i) => {
                const singleMargin = i.single_unit_price > 0 ? ((i.single_unit_price - i.single_unit_cost) / i.single_unit_price) * 100 : 0
                const bundleRevenue = i.single_unit_price * i.bundle_quantity * (1 - i.discount_percent / 100)
                const bundleProfit = bundleRevenue - (i.single_unit_cost * i.bundle_quantity)
                const bundleMargin = bundleRevenue > 0 ? (bundleProfit / bundleRevenue) * 100 : 0
                const delta = Math.round((bundleMargin - singleMargin) * 10) / 10
                return delta >= 0 ? `+${delta} puan (Marj korunuyor)` : `${delta} puan (Marj erime riski!)`
            },
            isLocked: true,
        },
    ],
    content: {
        intro: 'Paket kampanyalarının gerçekten kârlı olup olmadığını test edin.',
        howItWorks: 'Tekli fiyat ve maliyetinize paket indirimi uygulayarak paket kârını ve marjını hesaplar. Tekli satış ile karşılaştırarak marj değişimini gösterir. Giriş yaparak marj erime riskini görebilirsiniz.',
        details: `## Bundle Stratejisi

Paket kampanyaları ortalama sipariş tutarını artırır ama dikkat edilmezse marjı eritir.

### Altın Kural

Paket indirimi, tekli marjınızın yarısını geçmemelidir. %60 marjlı üründe en fazla %30 paket indirimi.`,
        faq: [
            { question: '"3 Al 2 Öde" ne kadar indirim demek?', answer: '3 al 2 öde = %33 indirim. 2 al 1 öde = %50 indirim. Bu oranları hesaplayıcıya girin ve marj etkisini görün.' },
            { question: 'Paket indirimi ne zaman mantıklı?', answer: 'Stok eritme, ortalama sipariş tutarı artırma veya tekrar satın alma alışkanlığı yaratma amacıyla kullanılır.' },
            { question: 'Kargo maliyetini dahil etmeli miyim?', answer: 'Ürün maliyetine kargo payını da ekleyin. Paketlerde kargo avantajı (tek paket = tek kargo) bir avantajdır.' },
        ],
    },
}

export const dropshippingProfitCalc: ToolConfig = {
    slug: 'dropshipping-profit-calc',
    title: 'Dropshipping Kâr Analizörü',
    description: 'AliExpress/CJ maliyeti ile Shopify satış fiyatı arasındaki gerçek marjı görün.',
    category: 'operations',
    color: 'red',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.136-.504 1.136-1.125v-2.625M2.25 14.25V5.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.625m3.375-4.5h3c.621 0 1.125.504 1.125 1.125v3.375',
    inputs: [
        { id: 'supplier_cost', label: 'Tedarikçi Maliyeti (₺)', type: 'currency', defaultValue: 50, placeholder: '50' },
        { id: 'shipping_cost', label: 'Kargo Maliyeti (₺)', type: 'currency', defaultValue: 30, placeholder: '30' },
        { id: 'ad_cpa', label: 'Sipariş Başı Reklam Maliyeti (₺)', type: 'currency', defaultValue: 40, placeholder: '40' },
        { id: 'selling_price', label: 'Satış Fiyatı (₺)', type: 'currency', defaultValue: 200, placeholder: '200' },
    ],
    results: [
        {
            id: 'net_profit',
            label: 'Sipariş Başı Net Kâr',
            type: 'currency',
            formula: (i) => Math.round((i.selling_price - i.supplier_cost - i.shipping_cost - i.ad_cpa) * 100) / 100,
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'profit_margin',
            label: 'Kâr Marjı',
            type: 'percent',
            formula: (i) => {
                const profit = i.selling_price - i.supplier_cost - i.shipping_cost - i.ad_cpa
                return i.selling_price > 0 ? Math.round((profit / i.selling_price) * 1000) / 10 : 0
            },
            sentiment: (v) => (v as number) >= 30 ? 'positive' : (v as number) >= 15 ? 'neutral' : 'negative',
        },
        {
            id: 'monthly_10_orders',
            label: 'Günde 10 Sipariş ile Aylık Net Gelir',
            type: 'currency',
            formula: (i) => {
                const profit = i.selling_price - i.supplier_cost - i.shipping_cost - i.ad_cpa
                return Math.round(profit * 10 * 30)
            },
            isLocked: true,
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
    ],
    content: {
        intro: 'Dropshipping modelinde gerçekten ne kadar kazanacağınızı hesaplayın.',
        howItWorks: 'Satış fiyatınızdan tedarikçi maliyeti, kargo ve reklam giderini çıkararak sipariş başı net kârınızı hesaplar. Giriş yaparak günde 10 siparişle aylık kazancınızı görebilirsiniz.',
        details: `## Dropshipping Kâr Gerçeği

Çoğu dropshipper marjı olduğundan yüksek hesaplar çünkü reklam maliyetini unutur.

### Dikkat

- Reklam CPA yükselince marj sıfıra iner
- İade oranı %10-20 arası ekstra maliyet yaratır
- Platform komisyonları dahil edilmeli`,
        faq: [
            { question: 'Gerçekçi bir CPA ne kadar?', answer: 'Ürüne ve platforma göre değişir. Türkiye\'de ₺20-80 arası yaygındır. Niş ürünlerde ₺15, rekabetçi ürünlerde ₺100+ olabilir.' },
            { question: 'İade maliyetini dahil etmeli miyim?', answer: 'Evet, ortalama iade oranınızı biliyorsanız (genelde %10-15), CPA\'ya ekleyerek daha gerçekçi bir hesap yapabilirsiniz.' },
            { question: 'Tedarikçi maliyetini hangi kuru kullanarak hesaplamalıyım?', answer: 'Alış anındaki kuru değil, son 30 günlük ortalama kuru kullanın. Kur dalgalanması en büyük gizli risktir.' },
        ],
    },
}

export const inventoryHoldingCost: ToolConfig = {
    slug: 'inventory-holding-cost',
    title: 'Stok Tutma Maliyeti Hesaplayıcı',
    description: 'Depoda bekleyen ürünlerin size gizli maliyeti nedir?',
    category: 'operations',
    color: 'yellow',
    icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
    inputs: [
        { id: 'inventory_value', label: 'Toplam Stok Değeri (₺)', type: 'currency', defaultValue: 100000, placeholder: '100.000' },
        { id: 'storage_monthly', label: 'Aylık Depo Kirası (₺)', type: 'currency', defaultValue: 3000, placeholder: '3.000' },
        { id: 'capital_interest', label: 'Sermaye Faiz Oranı (Yıllık %)', type: 'percent', defaultValue: 50, placeholder: '50', tooltip: 'Bu parayı bankada tutsaydınız kazanacağınız faiz' },
    ],
    results: [
        {
            id: 'monthly_capital_cost',
            label: 'Aylık Sermaye Maliyeti',
            type: 'currency',
            formula: (i) => Math.round((i.inventory_value * (i.capital_interest / 100) / 12) * 100) / 100,
        },
        {
            id: 'total_monthly_cost',
            label: 'Aylık Toplam Yük',
            type: 'currency',
            formula: (i) => Math.round((i.inventory_value * (i.capital_interest / 100) / 12) + i.storage_monthly),
            sentiment: () => 'negative',
        },
        {
            id: 'yearly_cost',
            label: 'Yıllık Stok Tutma Maliyeti',
            type: 'currency',
            formula: (i) => Math.round((i.inventory_value * (i.capital_interest / 100)) + (i.storage_monthly * 12)),
            sentiment: () => 'negative',
        },
        {
            id: 'turnover_savings',
            label: 'Stok Devir Hızını 2x Artırırsan Tasarruf',
            type: 'currency',
            formula: (i) => {
                const monthly = (i.inventory_value * (i.capital_interest / 100) / 12) + i.storage_monthly
                return Math.round(monthly * 6)
            },
            isLocked: true,
            sentiment: () => 'positive',
            description: '6 aylık tasarruf potansiyeli',
        },
    ],
    content: {
        intro: 'Depodaki ürünlerin gizli maliyetini hesaplayın. Stok para demektir ve para beklerse erir.',
        howItWorks: 'Stok değerinize sermaye maliyetini (faiz oranı) ve depo kirasını ekleyerek stoğun aylık gerçek maliyetini hesaplar. Giriş yaparak stok devir hızını artırmanın tasarruf etkisini görebilirsiniz.',
        details: `## Stok Neden Maliyet?

Depoda duran ürün = bağlı sermaye.

### Gizli Maliyetler

1. **Sermaye fırsat maliyeti** (faiz)
2. **Depo/kira gideri**
3. **Sigorta ve fire**
4. **Değer kaybı** (modası geçme)`,
        faq: [
            { question: 'Sermaye faiz oranı olarak ne girmeliyim?', answer: 'Alternatif yatırım getirinizi girin. Türkiye\'de mevduat faizi %40-50 civarındaysa, bu oranı kullanın.' },
            { question: 'Stok devir hızı nedir?', answer: 'Yılda stoğunuzu kaç kez satıp yenilediğiniz. Yıllık satış / ortalama stok = devir hızı. E-ticarette 4-8 arası sağlıklıdır.' },
            { question: 'Stok maliyetini nasıl düşürürüm?', answer: 'Talep tahminini iyileştirin, ön sipariş modeli deneyin, dropshipping ile hibrit çalışın veya JIT (tam zamanında) tedarik uygulayın.' },
        ],
    },
}

// ─── KATEGORİ 4: PRATİK ARAÇLAR ──────────────────────

export const utmBuilder: ToolConfig = {
    slug: 'utm-builder',
    title: 'UTM Link Oluşturucu',
    description: 'Reklamlarınız için takip edilebilir linkler oluşturun.',
    category: 'utility',
    color: 'zinc',
    icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
    inputs: [
        { id: 'website_url', label: 'Web Sitesi URL', type: 'text', defaultValue: 'https://ornek.com/urun', placeholder: 'https://ornek.com/urun' },
        { id: 'source', label: 'Kaynak (utm_source)', type: 'text', defaultValue: 'facebook', placeholder: 'facebook' },
        { id: 'medium', label: 'Ortam (utm_medium)', type: 'text', defaultValue: 'cpc', placeholder: 'cpc' },
        { id: 'campaign_name', label: 'Kampanya Adı (utm_campaign)', type: 'text', defaultValue: 'yaz_kampanyasi', placeholder: 'yaz_kampanyasi' },
    ],
    results: [
        {
            id: 'utm_url',
            label: 'UTM Etiketli Link',
            type: 'text',
            formula: (_i, t) => {
                const url = t?.website_url || 'https://ornek.com/urun'
                const source = t?.source || 'facebook'
                const medium = t?.medium || 'cpc'
                const campaign = t?.campaign_name || 'yaz_kampanyasi'
                const separator = url.includes('?') ? '&' : '?'
                return `${url}${separator}utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`
            },
            description: 'Bu linki kopyalayarak reklamlarınızda kullanabilirsiniz',
        },
        {
            id: 'utm_breakdown',
            label: 'Parametre Özeti',
            type: 'text',
            formula: (_i, t) => {
                const source = t?.source || 'facebook'
                const medium = t?.medium || 'cpc'
                const campaign = t?.campaign_name || 'yaz_kampanyasi'
                return `source: ${source} | medium: ${medium} | campaign: ${campaign}`
            },
        },
        {
            id: 'short_link',
            label: 'Kısaltılmış Link (Coming Soon)',
            type: 'text',
            formula: () => 'Yakında: Bu linki kısalt ve takip et',
            isLocked: true,
        },
    ],
    content: {
        intro: 'Reklam ve pazarlama kampanyalarınız için UTM parametreli linkler oluşturun.',
        howItWorks: 'URL\'nize utm_source, utm_medium ve utm_campaign parametreleri ekleyerek Google Analytics\'te kampanya performansını ayrı ayrı takip etmenizi sağlar.',
        details: `## UTM Parametreleri Nedir?

- **utm_source**: Trafik kaynağı (facebook, google)
- **utm_medium**: Reklam türü (cpc, email)
- **utm_campaign**: Kampanya adı

### Neden Önemli?

UTM olmadan hangi reklamdan satış geldiğini bilemezsiniz.`,
        faq: [
            { question: 'UTM parametreleri SEO\'yu etkiler mi?', answer: 'Hayır, UTM parametreleri yalnızca analitik takibi içindir ve arama motoru sıralamalarını etkilemez.' },
            { question: 'Kaç UTM parametresi kullanabilirim?', answer: 'source, medium ve campaign zorunlu. İsteğe bağlı: utm_term (anahtar kelime) ve utm_content (A/B test varyasyonu).' },
            { question: 'UTM\'siz link paylaşırsam ne olur?', answer: 'Google Analytics trafiği "direct" veya "referral" olarak sınıflandırır. Hangi kampanyadan geldiğini takip edemezsiniz.' },
        ],
    },
}

export const bfcmDiscountPlanner: ToolConfig = {
    slug: 'bfcm-discount-planner',
    title: 'BFCM İndirim Hacim Planlayıcı',
    description: 'İndirim dönemlerinde zarar etmemek için gereken satış hacmini hesaplayın.',
    category: 'marketing',
    color: 'stone',
    icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z',
    inputs: [
        { id: 'original_margin', label: 'Mevcut Kâr Marjı (%)', type: 'percent', defaultValue: 50, placeholder: '50' },
        { id: 'discount_offered', label: 'Planlanan İndirim (%)', type: 'percent', defaultValue: 25, placeholder: '25' },
        { id: 'current_monthly_units', label: 'Mevcut Aylık Satış Adedi', type: 'number', defaultValue: 200, placeholder: '200' },
    ],
    results: [
        {
            id: 'volume_multiplier',
            label: 'Gereken Hacim Artışı Katsayısı',
            type: 'text',
            formula: (i) => {
                const diff = i.original_margin - i.discount_offered
                if (diff <= 0) return 'İndirim oranı marjı aşıyor — zarar kesin!'
                const mult = Math.round((i.discount_offered / diff) * 100) / 100
                return `${mult}x daha fazla satmalısınız`
            },
        },
        {
            id: 'new_margin',
            label: 'İndirim Sonrası Kâr Marjı',
            type: 'percent',
            formula: (i) => {
                const newMargin = i.original_margin - i.discount_offered
                return Math.round(newMargin * 10) / 10
            },
            sentiment: (v) => (v as number) >= 15 ? 'positive' : (v as number) > 0 ? 'neutral' : 'negative',
        },
        {
            id: 'extra_units_needed',
            label: 'Kârı Korumak İçin Gereken Ekstra Adet',
            type: 'number',
            formula: (i) => {
                const diff = i.original_margin - i.discount_offered
                if (diff <= 0) return 0
                const mult = i.discount_offered / diff
                return Math.ceil(i.current_monthly_units * mult)
            },
            isLocked: true,
            description: 'İndirimli dönemde bu kadar ekstra satmalısınız',
        },
    ],
    content: {
        intro: 'İndirim kampanyalarında aynı kârı korumak için ne kadar daha fazla satmanız gerektiğini hesaplayın.',
        howItWorks: 'Mevcut marjınızdan indirim oranını çıkararak yeni marjı bulur. Eski kârı korumak için gereken hacim artışını hesaplar. Giriş yaparak ihtiyacınız olan ekstra satış adedini görebilirsiniz.',
        details: `## İndirim Tuzağı

%25 indirim, %25 daha fazla satmak anlamına GELMEZ.

### Örnek

%50 marj + %25 indirim = Önceki kârı korumak için **%100 daha fazla** satış gerekir.`,
        faq: [
            { question: 'Neden bu kadar çok ekstra satış gerekiyor?', answer: 'İndirim, marjınızdan düşer. %50 marjda %25 indirim verirseniz yeni marj %25 olur — yani her satıştan yarısı kadar kâr edersiniz. Aynı toplam kâr için 2 kat satmalısınız.' },
            { question: 'Hangi indirim oranı güvenli?', answer: 'Marjınızın yarısından fazla indirim vermeyin. %40 marj varsa en fazla %15-20 indirim. Bu araçla farklı senaryoları test edin.' },
            { question: 'İndirim yerine ne yapabilirim?', answer: 'Bundle teklifleri, ücretsiz kargo, hediye ürün veya sadakat puanı gibi alternatifler marjınızı korurken müşteriye değer sunar.' },
        ],
    },
}
