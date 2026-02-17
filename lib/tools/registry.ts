import type { ToolConfig } from './types'

// ─── Tool Configurations ────────────────────────────────

const roasCalculator: ToolConfig = {
    slug: 'roas-calculator',
    title: 'ROAS Hesaplayıcı',
    description: 'Reklam harcamalarınızın gerçek geri dönüşünü hesaplayın. Minimum kârlı ROAS\'ınızı öğrenin.',
    category: 'marketing',
    color: 'violet',
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    inputs: [
        { id: 'ad_spend', label: 'Reklam Harcaması (₺)', type: 'currency', defaultValue: 10000, placeholder: '10.000' },
        { id: 'revenue', label: 'Reklam Kaynaklı Ciro (₺)', type: 'currency', defaultValue: 40000, placeholder: '40.000' },
    ],
    results: [
        {
            id: 'roas',
            label: 'ROAS',
            type: 'number',
            formula: (i) => {
                const roas = i.ad_spend > 0 ? i.revenue / i.ad_spend : 0
                return Math.round(roas * 100) / 100
            },
            description: 'Harcadığınız her 1₺ için kazandığınız ciro',
            sentiment: (v) => (v as number) >= 3 ? 'positive' : (v as number) >= 2 ? 'neutral' : 'negative',
        },
        {
            id: 'net_return',
            label: 'Net Getiri',
            type: 'currency',
            formula: (i) => Math.round(i.revenue - i.ad_spend),
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'cost_per_revenue',
            label: 'Ciro Başına Reklam Maliyeti',
            type: 'percent',
            formula: (i) => i.revenue > 0 ? Math.round((i.ad_spend / i.revenue) * 1000) / 10 : 0,
        },
        {
            id: 'min_conversion_rate',
            label: 'Kârlı Olmak İçin Gereken Min. Dönüşüm Oranı',
            type: 'percent',
            formula: (i) => {
                // Assume average order ₺250, minimum 2x ROAS needed
                const minRevenue = i.ad_spend * 2
                const avgOrder = 250
                const minOrders = minRevenue / avgOrder
                const assumedVisitors = i.ad_spend / 5 // ₺5 CPC assumption
                return assumedVisitors > 0 ? Math.round((minOrders / assumedVisitors) * 10000) / 100 : 0
            },
            isLocked: true,
            description: 'Minimum %2 ROAS ile kârlı olmak için gerekli dönüşüm oranı',
        },
    ],
    content: {
        intro: 'Reklam harcamalarınızın gerçekten ne kadar geri döndüğünü anlayın. ROAS (Return on Ad Spend), e-ticarette en kritik performans metriklerinden biridir.',
        details: `## ROAS Nedir?

ROAS (Return on Ad Spend), reklam harcamalarınızın geri dönüş oranıdır. **Ciro ÷ Reklam Harcaması** formülü ile hesaplanır.

### Neden Önemli?

- **ROAS 1.0** = Harcadığınız kadar kazanıyorsunuz (kâr yok)
- **ROAS 2.0** = Her 1₺ için 2₺ ciro (başa baş noktası genellikle burasıdır)
- **ROAS 3.0+** = Sağlıklı bir geri dönüş

### Dikkat Edilmesi Gerekenler

ROAS tek başına yeterli bir metrik değildir. Ürün maliyeti, kargo ve iade oranları gibi faktörleri de hesaba katmanız gerekir. Gerçek kârlılığınız için **Kâr Simülatörümüzü** kullanın.`,
    },
}

const breakEvenRoas: ToolConfig = {
    slug: 'break-even-roas',
    title: 'Break-Even ROAS Hesaplayıcı',
    description: 'Zarar etmemek için minimum kaç ROAS yapmanız gerektiğini hesaplayın.',
    category: 'finance',
    color: 'blue',
    icon: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z',
    inputs: [
        { id: 'selling_price', label: 'Satış Fiyatı (₺)', type: 'currency', defaultValue: 300, placeholder: '300' },
        { id: 'cogs', label: 'Ürün Maliyeti (₺)', type: 'currency', defaultValue: 100, placeholder: '100' },
        { id: 'shipping', label: 'Kargo Gideri (₺)', type: 'currency', defaultValue: 25, placeholder: '25' },
        { id: 'fees', label: 'Platform Kesintisi (%)', type: 'percent', defaultValue: 5, placeholder: '5', tooltip: 'Trendyol, Hepsiburada gibi platform komisyonları' },
    ],
    results: [
        {
            id: 'net_margin_tl',
            label: 'Net Marj (₺)',
            type: 'currency',
            formula: (i) => {
                const fees = i.selling_price * (i.fees / 100)
                return Math.round((i.selling_price - i.cogs - i.shipping - fees) * 100) / 100
            },
            description: 'Her satıştan elinize kalan',
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'net_margin_pct',
            label: 'Net Marj (%)',
            type: 'percent',
            formula: (i) => {
                const fees = i.selling_price * (i.fees / 100)
                const margin = i.selling_price - i.cogs - i.shipping - fees
                return i.selling_price > 0 ? Math.round((margin / i.selling_price) * 1000) / 10 : 0
            },
            sentiment: (v) => (v as number) >= 30 ? 'positive' : (v as number) >= 15 ? 'neutral' : 'negative',
        },
        {
            id: 'break_even_roas',
            label: 'Break-Even ROAS',
            type: 'number',
            formula: (i) => {
                const fees = i.selling_price * (i.fees / 100)
                const margin = i.selling_price - i.cogs - i.shipping - fees
                return margin > 0 ? Math.round((i.selling_price / margin) * 100) / 100 : 0
            },
            description: 'Bu değerin altında zarar edersiniz',
            sentiment: (v) => (v as number) <= 3 ? 'positive' : (v as number) <= 5 ? 'neutral' : 'negative',
        },
        {
            id: 'safe_roas_target',
            label: 'Güvenli ROAS Hedefi',
            type: 'number',
            formula: (i) => {
                const fees = i.selling_price * (i.fees / 100)
                const margin = i.selling_price - i.cogs - i.shipping - fees
                const beRoas = margin > 0 ? i.selling_price / margin : 0
                return Math.round(beRoas * 1.5 * 100) / 100 // 50% buffer
            },
            isLocked: true,
            description: '%50 güvenlik payı ile hedeflemeniz gereken ROAS',
        },
    ],
    content: {
        intro: 'Reklam verirken zarar etmemek için minimum kaç ROAS yapmanız gerektiğini bilin. Çoğu e-ticaret markası bu değeri bilmeden reklam verir.',
        details: `## Break-Even ROAS Nedir?

Break-Even ROAS, reklam harcamanızın tam olarak geri dönme noktasıdır. Bu değerin altında her reklam harcaması zarardır.

### Nasıl Hesaplanır?

**Break-Even ROAS = Satış Fiyatı ÷ Net Marj**

Örneğin satış fiyatınız 300₺, marjınız 150₺ ise: BE-ROAS = 300 / 150 = **2.0**

### Pratikte Ne Anlama Gelir?

- **BE-ROAS 2.0**: Her 1₺ reklam harcaması için minimum 2₺ ciro yapmalısınız
- **BE-ROAS 3.0+**: Marjlarınız dar, reklam maliyetlerinize dikkat edin
- **BE-ROAS 5.0+**: Tehlike bölgesi! Ürün fiyatlamanızı gözden geçirin`,
    },
}

const profitSimulator: ToolConfig = {
    slug: 'profit-simulator',
    title: 'Gerçek Kâr Simülatörü',
    description: 'Tüm gizli maliyetler dahil gerçek net kârınızı hesaplayın. Mini-Prificient deneyimi.',
    category: 'finance',
    color: 'emerald',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
    inputs: [
        { id: 'revenue', label: 'Aylık Ciro (₺)', type: 'currency', defaultValue: 100000, placeholder: '100.000' },
        { id: 'cogs_percent', label: 'Ürün Maliyeti (%)', type: 'percent', defaultValue: 40, placeholder: '40', tooltip: 'Satış fiyatının yüzde kaçı ürün maliyeti?' },
        { id: 'ad_spend', label: 'Reklam Harcaması (₺)', type: 'currency', defaultValue: 15000, placeholder: '15.000' },
        { id: 'shipping_total', label: 'Toplam Kargo Gideri (₺)', type: 'currency', defaultValue: 5000, placeholder: '5.000' },
        { id: 'misc_fees', label: 'Diğer Giderler (₺)', type: 'currency', defaultValue: 3000, placeholder: '3.000', tooltip: 'Platform komisyonları, ödeme sistemi komisyonları vb.' },
    ],
    results: [
        {
            id: 'gross_profit',
            label: 'Brüt Kâr',
            type: 'currency',
            formula: (i) => Math.round(i.revenue - (i.revenue * i.cogs_percent / 100)),
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'total_expenses',
            label: 'Toplam Giderler',
            type: 'currency',
            formula: (i) => Math.round((i.revenue * i.cogs_percent / 100) + i.ad_spend + i.shipping_total + i.misc_fees),
            description: 'COGS + Reklam + Kargo + Diğer',
        },
        {
            id: 'net_profit',
            label: 'Net Kâr',
            type: 'currency',
            formula: (i) => Math.round(i.revenue - (i.revenue * i.cogs_percent / 100) - i.ad_spend - i.shipping_total - i.misc_fees),
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'profit_margin',
            label: 'Kâr Marjı',
            type: 'percent',
            formula: (i) => {
                const net = i.revenue - (i.revenue * i.cogs_percent / 100) - i.ad_spend - i.shipping_total - i.misc_fees
                return i.revenue > 0 ? Math.round((net / i.revenue) * 1000) / 10 : 0
            },
            sentiment: (v) => (v as number) >= 20 ? 'positive' : (v as number) >= 10 ? 'neutral' : 'negative',
        },
        {
            id: 'annual_projection',
            label: 'Yıllık Projeksiyon',
            type: 'currency',
            formula: (i) => {
                const net = i.revenue - (i.revenue * i.cogs_percent / 100) - i.ad_spend - i.shipping_total - i.misc_fees
                return Math.round(net * 12)
            },
            isLocked: true,
            description: '12 aylık projeksiyon (aynı performansla)',
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'roi',
            label: 'Yatırım Getirisi (ROI)',
            type: 'percent',
            formula: (i) => {
                const totalInvest = (i.revenue * i.cogs_percent / 100) + i.ad_spend + i.shipping_total + i.misc_fees
                const net = i.revenue - totalInvest
                return totalInvest > 0 ? Math.round((net / totalInvest) * 1000) / 10 : 0
            },
            isLocked: true,
            description: 'Toplam yatırımınıza oranla getiriniz',
            sentiment: (v) => (v as number) >= 30 ? 'positive' : (v as number) >= 0 ? 'neutral' : 'negative',
        },
    ],
    content: {
        intro: 'Ciro, kâr değildir. Tüm maliyetleri dahil ederek gerçekte ne kadar kazandığınızı hesaplayın.',
        details: `## Neden "Gerçek" Kâr?

Çoğu e-ticaret girişimci sadece ciro ve ürün maliyetine bakarak kâr hesaplar. Oysa gerçek resim çok farklı olabilir.

### Gizli Maliyetler

1. **Platform Komisyonları**: Trendyol, Hepsiburada gibi platformlarda %8-15 komisyon
2. **Ödeme Komisyonları**: Kredi kartı, kapıda ödeme vb. %1.5-3
3. **İade Maliyetleri**: Sadece ürün değil, kargo ve operasyonel maliyet
4. **Paketleme**: Kutu, dolgu, etiket maliyetleri

### Kâr Marjı Benchmark

- **%5 altı**: Tehlike bölgesi, sürdürülebilir değil
- **%10-20**: Orta, büyüme için yatırım kapasitesi sınırlı
- **%20+**: Sağlıklı, ölçeklendirme potansiyeli yüksek`,
    },
}

const returnCostCalculator: ToolConfig = {
    slug: 'return-cost-calculator',
    title: 'İade Maliyeti Analizörü',
    description: 'İadelerin işletmenize gerçek maliyetini hesaplayın. Sessiz kâr katili.',
    category: 'operations',
    color: 'rose',
    icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3',
    inputs: [
        { id: 'avg_order_value', label: 'Ortalama Sipariş Tutarı (₺)', type: 'currency', defaultValue: 250, placeholder: '250' },
        { id: 'monthly_orders', label: 'Aylık Sipariş Sayısı', type: 'number', defaultValue: 400, placeholder: '400' },
        { id: 'return_rate', label: 'İade Oranı (%)', type: 'percent', defaultValue: 15, placeholder: '15' },
        { id: 'shipping_cost_one_way', label: 'Tek Yön Kargo Maliyeti (₺)', type: 'currency', defaultValue: 20, placeholder: '20' },
        { id: 'handling_cost', label: 'Operasyonel Maliyet / İade (₺)', type: 'currency', defaultValue: 15, placeholder: '15', tooltip: 'İnceleme, yeniden paketleme, depo maliyetleri' },
    ],
    results: [
        {
            id: 'monthly_returns',
            label: 'Aylık İade Sayısı',
            type: 'number',
            formula: (i) => Math.round(i.monthly_orders * (i.return_rate / 100)),
        },
        {
            id: 'cost_per_return',
            label: 'İade Başına Maliyet',
            type: 'currency',
            formula: (i) => Math.round((i.shipping_cost_one_way * 2 + i.handling_cost) * 100) / 100,
            description: 'Gidiş + dönüş kargo + operasyonel',
        },
        {
            id: 'monthly_return_cost',
            label: 'Aylık Toplam İade Maliyeti',
            type: 'currency',
            formula: (i) => {
                const returns = Math.round(i.monthly_orders * (i.return_rate / 100))
                const costPerReturn = i.shipping_cost_one_way * 2 + i.handling_cost
                return Math.round(returns * costPerReturn)
            },
            sentiment: () => 'negative',
        },
        {
            id: 'revenue_lost',
            label: 'Kaybedilen Ciro',
            type: 'currency',
            formula: (i) => Math.round(i.avg_order_value * i.monthly_orders * (i.return_rate / 100)),
            description: 'İade edilen siparişlerin toplam tutarı',
            sentiment: () => 'negative',
        },
        {
            id: 'savings_5pct',
            label: 'İade Oranını %5 Düşürürsen Cebine Kalacak',
            type: 'currency',
            formula: (i) => {
                const currentReturns = i.monthly_orders * (i.return_rate / 100)
                const newReturns = i.monthly_orders * (Math.max(0, i.return_rate - 5) / 100)
                const savedReturns = currentReturns - newReturns
                const costPerReturn = i.shipping_cost_one_way * 2 + i.handling_cost
                const savedCost = savedReturns * costPerReturn
                const savedRevenue = savedReturns * i.avg_order_value
                return Math.round(savedCost + savedRevenue * 0.3) // 30% marj assumption
            },
            isLocked: true,
            description: 'Maliyet tasarrufu + kurtarılan kâr (aylık)',
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'neutral',
        },
    ],
    content: {
        intro: 'İadeler sadece kayıp ciro değildir. Kargo, operasyon ve fırsat maliyetleriyle birlikte düşünülmeli.',
        details: `## İadenin Gerçek Maliyeti

Bir iade, sadece satış kaybı değildir. İşte rakamların ardındaki gerçek:

### İade Maliyeti Bileşenleri

1. **Çift Yönlü Kargo**: Müşteriye gidiş + müşteriden dönüş
2. **Operasyonel Maliyet**: İnceleme, kontrol, yeniden paketleme
3. **Fırsat Maliyeti**: O ürün satışta değilken kaçırılan gelir
4. **Değer Kaybı**: Ürün hasarı, yeniden satılamama riski

### Türkiye'de Sektör Ortalamaları

- **Giyim / Moda**: %20-35 iade oranı
- **Elektronik**: %5-10 iade oranı
- **Kozmetik**: %8-15 iade oranı
- **Ev & Dekorasyon**: %10-15 iade oranı`,
    },
}

const cltvCalculator: ToolConfig = {
    slug: 'cltv-calculator',
    title: 'CLTV Hesaplayıcı',
    description: 'Bir müşterinin ömür boyu değerini ve ödeyebileceğiniz maksimum reklam maliyetini bilin.',
    category: 'marketing',
    color: 'amber',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    inputs: [
        { id: 'avg_order_value', label: 'Ortalama Sipariş Tutarı (₺)', type: 'currency', defaultValue: 250, placeholder: '250' },
        { id: 'purchase_frequency', label: 'Yıllık Satın Alma Sıklığı', type: 'number', defaultValue: 3, placeholder: '3', tooltip: 'Bir müşteri yılda ortalama kaç kez alışveriş yapar?' },
        { id: 'customer_lifespan', label: 'Müşteri Ömrü (Yıl)', type: 'number', defaultValue: 2, placeholder: '2', tooltip: 'Bir müşteri ortalama kaç yıl aktif kalır?' },
        { id: 'profit_margin', label: 'Kâr Marjı (%)', type: 'percent', defaultValue: 25, placeholder: '25' },
    ],
    results: [
        {
            id: 'cltv',
            label: 'Müşteri Ömür Boyu Değeri (CLTV)',
            type: 'currency',
            formula: (i) => Math.round(i.avg_order_value * i.purchase_frequency * i.customer_lifespan),
            description: 'Bir müşterinin toplam harcama tahmini',
            sentiment: () => 'positive',
        },
        {
            id: 'annual_value',
            label: 'Yıllık Müşteri Değeri',
            type: 'currency',
            formula: (i) => Math.round(i.avg_order_value * i.purchase_frequency),
        },
        {
            id: 'ltv_profit',
            label: 'Müşteri Başına Toplam Kâr',
            type: 'currency',
            formula: (i) => {
                const cltv = i.avg_order_value * i.purchase_frequency * i.customer_lifespan
                return Math.round(cltv * (i.profit_margin / 100))
            },
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'max_cac',
            label: 'Ödeyebileceğiniz Maks. Reklam Maliyeti (CAC Limit)',
            type: 'currency',
            formula: (i) => {
                const cltv = i.avg_order_value * i.purchase_frequency * i.customer_lifespan
                const ltvProfit = cltv * (i.profit_margin / 100)
                return Math.round(ltvProfit * 0.33) // Max 1/3 of LTV profit
            },
            isLocked: true,
            description: 'Bir müşteri kazanmak için harcayabileceğiniz üst limit',
            sentiment: () => 'positive',
        },
    ],
    content: {
        intro: 'Müşterilerinizin değerini bilin, daha akıllı reklam kararları verin. CLTV, sürdürülebilir büyümenin temelidir.',
        details: `## CLTV Nedir?

Customer Lifetime Value (Müşteri Ömür Boyu Değeri), bir müşterinin sizden toplam ne kadar alışveriş yapacağının tahminidir.

### Basit Formül

**CLTV = Ortalama Sipariş × Yıllık Sıklık × Müşteri Ömrü**

### Neden Bu Kadar Önemli?

CLTV bilmek, **tam olarak ne kadar reklam harcaması yapabileceğinizi** söyler:

- **CLTV > CAC**: Müşteri kazanmak kârlı
- **CLTV < CAC**: Her yeni müşteri zarar demek
- **Kural**: CAC, CLTV'nin **%30'undan** fazla olmamalı

### CLTV Artırma Stratejileri

1. **Cross-sell & Upsell**: Ortalama sipariş tutarını artırın
2. **Sadakat Programları**: Satın alma sıklığını artırın
3. **Mükemmel Deneyim**: Müşteri ömrünü uzatın`,
    },
}

// ─── Registry ──────────────────────────────────────

export const toolRegistry: ToolConfig[] = [
    profitSimulator,
    roasCalculator,
    breakEvenRoas,
    returnCostCalculator,
    cltvCalculator,
]

export function getToolBySlug(slug: string): ToolConfig | undefined {
    return toolRegistry.find((t) => t.slug === slug)
}

export function getToolsByCategory(category: ToolConfig['category']): ToolConfig[] {
    return toolRegistry.filter((t) => t.category === category)
}

export function getAllSlugs(): string[] {
    return toolRegistry.map((t) => t.slug)
}
