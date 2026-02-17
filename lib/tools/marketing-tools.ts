import type { ToolConfig } from './types'

// ─── KATEGORİ 2: PAZARLAMA MATEMATİĞİ ─────────────────

export const cpmCpcCalculator: ToolConfig = {
    slug: 'cpm-cpc-calculator',
    title: 'CPM & CPC Hesaplayıcı',
    description: 'Reklam bütçenizi, gösterim ve tıklama sayılarını girin; birim maliyetlerinizi öğrenin.',
    category: 'marketing',
    color: 'indigo',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
    inputs: [
        { id: 'budget', label: 'Toplam Bütçe (₺)', type: 'currency', defaultValue: 10000, placeholder: '10.000' },
        { id: 'impressions', label: 'Gösterim Sayısı', type: 'number', defaultValue: 500000, placeholder: '500.000' },
        { id: 'clicks', label: 'Tıklama Sayısı', type: 'number', defaultValue: 5000, placeholder: '5.000' },
    ],
    results: [
        {
            id: 'cpc',
            label: 'Tıklama Başı Maliyet (CPC)',
            type: 'currency',
            formula: (i) => i.clicks > 0 ? Math.round((i.budget / i.clicks) * 100) / 100 : 0,
            sentiment: (v) => (v as number) <= 2 ? 'positive' : (v as number) <= 5 ? 'neutral' : 'negative',
        },
        {
            id: 'cpm',
            label: '1000 Gösterim Maliyeti (CPM)',
            type: 'currency',
            formula: (i) => i.impressions > 0 ? Math.round((i.budget / i.impressions) * 1000 * 100) / 100 : 0,
        },
        {
            id: 'ctr',
            label: 'Tıklama Oranı (CTR)',
            type: 'percent',
            formula: (i) => i.impressions > 0 ? Math.round((i.clicks / i.impressions) * 10000) / 100 : 0,
            sentiment: (v) => (v as number) >= 2 ? 'positive' : (v as number) >= 1 ? 'neutral' : 'negative',
        },
        {
            id: 'performance_score',
            label: 'Sektör Ortalamasına Göre Performans Puanı',
            type: 'text',
            formula: (i) => {
                const ctr = i.impressions > 0 ? (i.clicks / i.impressions) * 100 : 0
                const cpc = i.clicks > 0 ? i.budget / i.clicks : 0
                let score = 50
                if (ctr >= 2) score += 20; else if (ctr >= 1) score += 10
                if (cpc <= 2) score += 20; else if (cpc <= 5) score += 10
                if (ctr >= 3 && cpc <= 1.5) score += 10
                return score >= 80 ? `${score}/100 — Mükemmel performans` : score >= 60 ? `${score}/100 — Ortalamanın üstünde` : `${score}/100 — İyileştirme gerekiyor`
            },
            isLocked: true,
        },
    ],
    content: {
        intro: 'Dijital reklamlarınızın birim maliyetlerini öğrenin. CPM, CPC ve CTR metriklerini tek bir yerden hesaplayın.',
        howItWorks: 'Toplam bütçenizi gösterim ve tıklama sayılarına bölerek birim maliyetlerinizi hesaplar. CTR oranınızı gösterir. Giriş yaparak kampanyanızın sektör ortalamasına göre puanını görebilirsiniz.',
        details: `## CPM ve CPC Nedir?\\n\\n- **CPC** (Cost Per Click): Her tıklama için ödediğiniz tutar\\n- **CPM** (Cost Per Mille): 1000 gösterim için ödediğiniz tutar\\n- **CTR** (Click-Through Rate): Gösterime karşı tıklama oranı\\n\\n### Sektör Ortalamaları (Türkiye)\\n\\n- E-ticaret CPC: ₺1.50-4.00\\n- E-ticaret CPM: ₺15-40\\n- Ortalama CTR: %1-3`,
        faq: [
            { question: 'CPC mi CPM mi kullanmalıyım?', answer: 'Satış odaklı kampanyalarda CPC, marka bilinirliği kampanyalarında CPM daha anlamlıdır. CPC ile dönüşüm maliyetinizi doğrudan kontrol edersiniz.' },
            { question: 'CTR düşükse ne yapmalıyım?', answer: 'Reklam görsellerinizi ve metinlerinizi A/B test edin, hedeflemeyi daraltın, ve landing page ile reklam mesajı uyumunu kontrol edin.' },
            { question: 'İyi bir CTR oranı nedir?', answer: '%1 altı düşük, %1-2 ortalama, %2+ iyi kabul edilir. Sektör ve platforma göre değişir. Remarketing kampanyalarında %3-5 normal olabilir.' },
        ],
    },
}

export const influencerRoiCalculator: ToolConfig = {
    slug: 'influencer-roi-calculator',
    title: 'Influencer ROI Hesaplayıcı',
    description: 'Fenomenlere ödediğiniz paranın geri dönüşünü hesaplayın.',
    category: 'marketing',
    color: 'pink',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    inputs: [
        { id: 'influencer_fee', label: 'Influencer Ücreti (₺)', type: 'currency', defaultValue: 5000, placeholder: '5.000' },
        { id: 'product_cost', label: 'Gönderilen Ürün Maliyeti (₺)', type: 'currency', defaultValue: 500, placeholder: '500' },
        { id: 'sales_generated', label: 'Gelen Ciro (₺)', type: 'currency', defaultValue: 15000, placeholder: '15.000' },
    ],
    results: [
        {
            id: 'roi_percent',
            label: 'ROI',
            type: 'percent',
            formula: (i) => i.influencer_fee > 0 ? Math.round(((i.sales_generated - i.influencer_fee - i.product_cost) / i.influencer_fee) * 100) : 0,
            sentiment: (v) => (v as number) > 100 ? 'positive' : (v as number) > 0 ? 'neutral' : 'negative',
        },
        {
            id: 'net_profit',
            label: 'Net Kâr',
            type: 'currency',
            formula: (i) => Math.round(i.sales_generated - i.influencer_fee - i.product_cost),
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'breakeven_sales',
            label: 'Break-Even İçin Gereken Minimum Satış',
            type: 'currency',
            formula: (i) => Math.round(i.influencer_fee + i.product_cost),
            isLocked: true,
            description: 'Bu tutarın altında zarar edersiniz',
        },
    ],
    content: {
        intro: 'Influencer işbirliklerinin gerçek getirisini ölçün. Ödediğiniz ücretin karşılığını alıyor musunuz?',
        howItWorks: 'Influencer\'a ödenen ücreti ve ürün maliyetini gelen cirodan çıkararak net kârınızı ve ROI oranınızı hesaplar. Giriş yaparak zarar etmemek için gereken minimum satış tutarını görebilirsiniz.',
        details: `## Influencer ROI Neden Önemli?\\n\\nInfluencer pazarlaması ölçülmezse para çöpe gider.\\n\\n### ROI Benchmark\\n\\n- **%0 altı**: Zarar — işbirliğini tekrarlamayın\\n- **%0-100**: Başa baş civarı — koşulları iyileştirin\\n- **%100+**: Kârlı — tekrar edin ve ölçeklendirin`,
        faq: [
            { question: 'Influencer seçerken neye dikkat etmeliyim?', answer: 'Takipçi sayısından çok etkileşim oranına bakın. %3+ etkileşim oranı iyi kabul edilir. Ayrıca hedef kitlenizle uyumu kontrol edin.' },
            { question: 'Gelen ciroyu nasıl takip ederim?', answer: 'Influencer\'a özel indirim kodu veya UTM parametreli link verin. Google Analytics veya platform analitiğinden takip edin.' },
            { question: 'Mikro mu makro mu influencer tercih etmeliyim?', answer: 'Mikro influencer\'lar (10K-50K) genelde daha yüksek ROI verir çünkü takipçileriyle güven ilişkisi daha güçlüdür. Makro, marka bilinirliği için uygundur.' },
        ],
    },
}

export const emailMarketingRoi: ToolConfig = {
    slug: 'email-marketing-roi',
    title: 'E-Posta Pazarlama Getiri Analizi',
    description: 'Bültenlerinizin ve otomasyonlarınızın gerçek değerini ölçün.',
    category: 'marketing',
    color: 'teal',
    icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
    inputs: [
        { id: 'campaign_cost', label: 'Yazılım + Tasarım Maliyeti (₺)', type: 'currency', defaultValue: 2000, placeholder: '2.000' },
        { id: 'total_revenue', label: 'E-postadan Gelen Ciro (₺)', type: 'currency', defaultValue: 25000, placeholder: '25.000' },
        { id: 'cogs', label: 'Satılan Malın Maliyeti (₺)', type: 'currency', defaultValue: 10000, placeholder: '10.000' },
        { id: 'emails_sent', label: 'Gönderilen E-posta Sayısı', type: 'number', defaultValue: 10000, placeholder: '10.000' },
    ],
    results: [
        {
            id: 'net_contribution',
            label: 'Net Katkı',
            type: 'currency',
            formula: (i) => Math.round(i.total_revenue - i.campaign_cost - i.cogs),
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'roi',
            label: 'E-posta ROI',
            type: 'percent',
            formula: (i) => i.campaign_cost > 0 ? Math.round(((i.total_revenue - i.campaign_cost - i.cogs) / i.campaign_cost) * 100) : 0,
            sentiment: (v) => (v as number) > 200 ? 'positive' : (v as number) > 0 ? 'neutral' : 'negative',
        },
        {
            id: 'rpe',
            label: 'E-posta Başına Kazanç (RPE)',
            type: 'currency',
            formula: (i) => i.emails_sent > 0 ? Math.round(((i.total_revenue - i.cogs) / i.emails_sent) * 100) / 100 : 0,
            isLocked: true,
            description: 'Her gönderilen e-postanın size kazandırdığı tutar',
        },
    ],
    content: {
        intro: 'E-posta pazarlamasının gerçek getirisini hesaplayın. Liste büyüklüğünüzün değerini somut rakamlarla görün.',
        howItWorks: 'E-posta kampanyalarınızın toplam maliyetini (yazılım + tasarım) gelen cirodan çıkararak net katkıyı ve ROI oranını hesaplar. Giriş yaparak e-posta başına kazancınızı (RPE) görebilirsiniz.',
        details: `## E-Posta Pazarlaması Neden Güçlü?\\n\\nE-posta, ortalama **36:1 ROI** ile en yüksek getirili dijital pazarlama kanalıdır.\\n\\n### Benchmark\\n\\n- Açılma oranı: %20-30\\n- Tıklama oranı: %2-5\\n- Dönüşüm oranı: %1-3`,
        faq: [
            { question: 'İyi bir e-posta ROI oranı nedir?', answer: 'Sektör ortalaması 36:1\'dir (yani harcanan her 1₺ için 36₺ gelir). %500+ ROI başarılı kabul edilir.' },
            { question: 'Gönderim yazılımı maliyetini nasıl dahil edeyim?', answer: 'Aylık abonelik ücretinizi (Mailchimp, Klaviyo vb.) + varsa tasarım/içerik üretim maliyetini toplayın.' },
            { question: 'RPE neden önemli?', answer: 'RPE, liste büyüklüğünüzün parasal değerini gösterir. Listeniz 50K kişi ve RPE 0.50₺ ise her gönderim 25.000₺ potansiyel değer taşır.' },
        ],
    },
}

export const conversionRateImpact: ToolConfig = {
    slug: 'conversion-rate-impact',
    title: 'Dönüşüm Oranı Etki Simülatörü',
    description: 'Dönüşüm oranınız %1 artarsa cironuz ne kadar artar?',
    category: 'marketing',
    color: 'cyan',
    icon: 'M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941',
    inputs: [
        { id: 'monthly_visitors', label: 'Aylık Ziyaretçi', type: 'number', defaultValue: 50000, placeholder: '50.000' },
        { id: 'current_cr', label: 'Mevcut Dönüşüm Oranı (%)', type: 'percent', defaultValue: 2, placeholder: '2' },
        { id: 'aov', label: 'Ortalama Sepet Tutarı (₺)', type: 'currency', defaultValue: 250, placeholder: '250' },
        { id: 'projected_cr', label: 'Hedef Dönüşüm Oranı (%)', type: 'percent', defaultValue: 3, placeholder: '3' },
    ],
    results: [
        {
            id: 'current_revenue',
            label: 'Mevcut Aylık Ciro',
            type: 'currency',
            formula: (i) => Math.round(i.monthly_visitors * (i.current_cr / 100) * i.aov),
        },
        {
            id: 'projected_revenue',
            label: 'Hedef Aylık Ciro',
            type: 'currency',
            formula: (i) => Math.round(i.monthly_visitors * (i.projected_cr / 100) * i.aov),
        },
        {
            id: 'monthly_extra',
            label: 'Aylık Ekstra Ciro',
            type: 'currency',
            formula: (i) => Math.round(i.monthly_visitors * ((i.projected_cr - i.current_cr) / 100) * i.aov),
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'yearly_extra',
            label: 'Yıllık Kümülatif Ciro Artışı',
            type: 'currency',
            formula: (i) => Math.round(i.monthly_visitors * ((i.projected_cr - i.current_cr) / 100) * i.aov * 12),
            isLocked: true,
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
    ],
    content: {
        intro: 'Dönüşüm oranındaki küçük bir artışın cironuza olan büyük etkisini simüle edin.',
        howItWorks: 'Mevcut ve hedef dönüşüm oranlarınız arasındaki farkı ziyaretçi sayısı ve ortalama sepet tutarıyla çarparak aylık ekstra ciroyu hesaplar. Giriş yaparak yıllık kümülatif etkiyi görebilirsiniz.',
        details: `## Dönüşüm Optimizasyonu Neden Kritik?\\n\\nTrafiğinizi artırmak pahalıdır. Mevcut trafikten daha fazla satış almak çok daha kârlıdır.\\n\\n### Sektör Ortalamaları\\n\\n- E-ticaret genel: %1-3\\n- Moda: %1-2\\n- Elektronik: %2-4`,
        faq: [
            { question: 'Dönüşüm oranımı nasıl artırırım?', answer: 'Ürün sayfası iyileştirme, güven sinyalleri (yorumlar, güvenlik rozetleri), checkout basitleştirme ve site hızı optimizasyonu en etkili yöntemlerdir.' },
            { question: '%1 artış gerçekçi mi?', answer: 'Evet, doğru A/B testleriyle 3-6 ayda %0.5-1 artış sağlamak mümkündür. Özellikle checkout optimizasyonu hızlı sonuç verir.' },
            { question: 'Bu hesaplama bileşik etkiyi dahil ediyor mu?', answer: 'Yıllık projeksiyon basit çarpma ile yapılır. Tekrar eden müşteriler ve marka etkisi dahil değildir — gerçek etki daha yüksek olabilir.' },
        ],
    },
}

export const tiktokVsMetaCost: ToolConfig = {
    slug: 'tiktok-vs-meta-cost',
    title: 'TikTok vs. Meta Maliyet Kıyaslayıcı',
    description: 'Hangi platformda reklam vermek daha ucuz ve etkili?',
    category: 'marketing',
    color: 'fuchsia',
    icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    inputs: [
        { id: 'meta_cpm', label: 'Meta CPM (₺)', type: 'currency', defaultValue: 35, placeholder: '35' },
        { id: 'tiktok_cpm', label: 'TikTok CPM (₺)', type: 'currency', defaultValue: 20, placeholder: '20' },
        { id: 'meta_ctr', label: 'Meta CTR (%)', type: 'percent', defaultValue: 1.5, placeholder: '1.5' },
        { id: 'tiktok_ctr', label: 'TikTok CTR (%)', type: 'percent', defaultValue: 1.2, placeholder: '1.2' },
    ],
    results: [
        {
            id: 'meta_cpc',
            label: 'Meta CPC',
            type: 'currency',
            formula: (i) => i.meta_ctr > 0 ? Math.round((i.meta_cpm / (i.meta_ctr / 100 * 1000)) * 100) / 100 : 0,
        },
        {
            id: 'tiktok_cpc',
            label: 'TikTok CPC',
            type: 'currency',
            formula: (i) => i.tiktok_ctr > 0 ? Math.round((i.tiktok_cpm / (i.tiktok_ctr / 100 * 1000)) * 100) / 100 : 0,
        },
        {
            id: 'cheaper_platform',
            label: 'Daha Ucuz Platform',
            type: 'text',
            formula: (i) => {
                const metaCpc = i.meta_ctr > 0 ? i.meta_cpm / (i.meta_ctr / 100 * 1000) : 999
                const tikCpc = i.tiktok_ctr > 0 ? i.tiktok_cpm / (i.tiktok_ctr / 100 * 1000) : 999
                const diff = Math.round(Math.abs(metaCpc - tikCpc) * 100) / 100
                return metaCpc < tikCpc ? `Meta (₺${diff} daha ucuz)` : tikCpc < metaCpc ? `TikTok (₺${diff} daha ucuz)` : 'Eşit'
            },
        },
        {
            id: 'roas_recommendation',
            label: 'Hangi Platformda Daha Yüksek ROAS Beklenmeli?',
            type: 'text',
            formula: (i) => {
                const metaCpc = i.meta_ctr > 0 ? i.meta_cpm / (i.meta_ctr / 100 * 1000) : 999
                const tikCpc = i.tiktok_ctr > 0 ? i.tiktok_cpm / (i.tiktok_ctr / 100 * 1000) : 999
                if (metaCpc < tikCpc) return 'Meta — Düşük CPC genellikle daha iyi ROAS sağlar. Ancak TikTok\'ta organik reach avantajı var.'
                return 'TikTok — Düşük CPC avantajı var. Meta\'da ise retargeting daha güçlü, bu yüzden iki platformu birlikte kullanmayı değerlendirin.'
            },
            isLocked: true,
        },
    ],
    content: {
        intro: 'Meta ve TikTok reklam maliyetlerinizi karşılaştırın. Hangisi sizin için daha verimli?',
        howItWorks: 'İki platformun CPM ve CTR değerlerini kullanarak efektif CPC\'lerini hesaplar ve karşılaştırır. Giriş yaparak hangi platformda daha yüksek ROAS beklenebileceğini görebilirsiniz.',
        details: `## TikTok mu Meta mı?\\n\\nDoğru cevap: "ikisi de, ama farklı amaçlarla."\\n\\n### Genel Karşılaştırma\\n\\n- **Meta**: Retargeting, lookalike, detaylı demografi\\n- **TikTok**: Düşük CPM, organik reach, genç kitle`,
        faq: [
            { question: 'TikTok neden genelde daha ucuz?', answer: 'Platform henüz doygunluğa ulaşmadığı için rekabet daha az ve CPM\'ler düşük. Ancak bu avantaj zamanla azalıyor.' },
            { question: 'Hangi platform daha iyi dönüşüm verir?', answer: 'Ürününe bağlı. Dürtüsel alımlarda TikTok, araştırma gerektiren ürünlerde Meta genellikle daha iyi performans gösterir.' },
            { question: 'İki platformda da aynı anda reklam vermelim mi?', answer: 'Bütçeniz yetiyorsa evet. TikTok ile farkındalık, Meta ile retargeting stratejisi çok etkili çalışır.' },
        ],
    },
}
