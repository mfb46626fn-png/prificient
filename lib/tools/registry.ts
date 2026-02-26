import type { ToolConfig } from './types'
import { cpmCpcCalculator, influencerRoiCalculator, emailMarketingRoi, conversionRateImpact, tiktokVsMetaCost } from './marketing-tools'
import { stripePaypalFeeCalculator, productPricingCalculator, bundleProfitCalculator, dropshippingProfitCalc, inventoryHoldingCost, utmBuilder, bfcmDiscountPlanner } from './ops-tools'

// ─── Tool Configurations ────────────────────────────────

const roasCalculator: ToolConfig = {
    slug: 'roas-calculator',
    title: 'ROAS Hesaplayıcı',
    description: 'Reklam harcamalarınızın gerçek geri dönüşünü hesaplayın. Minimum kârlı ROAS\'ınızı öğrenin.',
    category: 'marketing',
    platforms: ['global'],
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
            insight: (i) => {
                const roas = i.ad_spend > 0 ? i.revenue / i.ad_spend : 0
                if (roas < 2.0) {
                    return {
                        value: `${roas.toFixed(1)}x`,
                        level: 'danger',
                        title: 'Nakit Yakıyorsunuz! (Danger Zone)',
                        message: `ROAS ${roas.toFixed(1)}x ile şu an Meta/Google için çalışıyorsunuz, kendiniz için değil. Harcadığınız her ₺${Math.round(i.ad_spend / 30)} günlük bütçeden sadece ₺${Math.round(i.revenue / 30)} geri dönüyor.`,
                        recommendation: 'Reklamları durdurun veya AOV artırmak için "3 Al 2 Öde" kurgusuna geçin. Ürün sayfasındaki görselleri A/B test edin. Retargeting bütçesini soğuk kitleden çekin.',
                    }
                } else if (roas < 4.0) {
                    return {
                        value: `${roas.toFixed(1)}x`,
                        level: 'warning',
                        title: 'Bıçak Sırtı (Break-Even Yakın)',
                        message: `ROAS ${roas.toFixed(1)}x — kârlısınız ama bir iade dalgası veya CPC artışı sizi zarara sokabilir. Güvenlik marjınız çok dar.`,
                        recommendation: 'Retargeting bütçesini %10 artırın, soğuk kitleyi kısın. E-posta pazarlamaya ağırlık vererek organik satışları yükseltin.',
                    }
                } else {
                    return {
                        value: `${roas.toFixed(1)}x`,
                        level: 'success',
                        title: 'Ölçeklenebilir Sistem (Scalable)',
                        message: `ROAS ${roas.toFixed(1)}x — sisteminiz para basıyor. Şimdi gaza basma zamanı.`,
                        recommendation: 'Bütçeyi %20 artırın (Scaling). Lookalike oranlarını %1\'den %3\'e çıkararak yeni kitlelere ulaşın. Benzer ürünlerle katalog reklamlarını test edin.',
                    }
                }
            },
        },
    ],
    content: {
        intro: 'Reklam harcamalarınızın gerçekten ne kadar geri döndüğünü anlayın. ROAS (Return on Ad Spend), e-ticarette en kritik performans metriklerinden biridir.',
        howItWorks: 'Bu araç, toplam reklam harcamanızı ve bu reklamlardan elde ettiğiniz ciroyu karşılaştırarak ROAS değerinizi hesaplar. Ayrıca net getirinizi ve ciro başına reklam maliyetinizi gösterir. Giriş yaparak kârlı olmak için gereken minimum dönüşüm oranını da görebilirsiniz.',
        details: `## ROAS Nedir?\n\nROAS (Return on Ad Spend), reklam harcamalarınızın geri dönüş oranıdır. **Ciro ÷ Reklam Harcaması** formülü ile hesaplanır.\n\n### Neden Önemli?\n\n- **ROAS 1.0** = Harcadığınız kadar kazanıyorsunuz (kâr yok)\n- **ROAS 2.0** = Her 1₺ için 2₺ ciro (başa baş noktası genellikle burasıdır)\n- **ROAS 3.0+** = Sağlıklı bir geri dönüş\n\n### Dikkat Edilmesi Gerekenler\n\nROAS tek başına yeterli bir metrik değildir. Ürün maliyeti, kargo ve iade oranları gibi faktörleri de hesaba katmanız gerekir.`,
        faq: [
            { question: 'İyi bir ROAS değeri nedir?', answer: 'Sektöre göre değişir ama genel olarak 3.0 ve üzeri sağlıklı kabul edilir. Ancak düşük marjlı ürünlerde 4-5x gerekebilir. Break-Even ROAS hesaplayıcımızla kesin değerinizi bulabilirsiniz.' },
            { question: 'ROAS ile ROI arasındaki fark nedir?', answer: 'ROAS sadece reklam harcamasına karşı ciroyu ölçer. ROI ise tüm maliyetleri (ürün, kargo, operasyon) dahil ederek gerçek kârlılığı gösterir. ROAS yüksek ama ROI düşük olabilir.' },
            { question: 'ROAS nasıl artırılır?', answer: 'Hedeflemeyi daraltmak, reklam metinlerini A/B test etmek, dönüşüm oranını artırmak (ürün sayfası optimizasyonu) ve ortalama sipariş tutarını yükseltmek en etkili yöntemlerdir.' },
            { question: 'ROAS 1.0 altına düşerse ne olur?', answer: 'Bu, reklama harcadığınızdan daha az ciro elde ettiğiniz anlamına gelir. Reklam kampanyasını durdurup hedefleme, kreatif ve landing page stratejinizi gözden geçirmelisiniz.' },
        ],
    },
}

const breakEvenRoas: ToolConfig = {
    slug: 'break-even-roas',
    title: 'Break-Even ROAS Hesaplayıcı',
    description: 'Zarar etmemek için minimum kaç ROAS yapmanız gerektiğini hesaplayın.',
    category: 'finance',
    platforms: ['global'],
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
            insight: (i) => {
                const fees = i.selling_price * (i.fees / 100)
                const margin = i.selling_price - i.cogs - i.shipping - fees
                const beRoas = margin > 0 ? i.selling_price / margin : 0
                if (beRoas >= 5) {
                    return {
                        value: `${beRoas.toFixed(1)}x`,
                        level: 'danger',
                        title: 'Tehlike Bölgesi — Fiyatlamayı Gözden Geçirin',
                        message: `BE-ROAS ${beRoas.toFixed(1)}x çok yüksek. Net marjınız sadece ₺${Math.round(margin)} (${i.selling_price > 0 ? Math.round((margin / i.selling_price) * 100) : 0}%). Bu değerle kârlı reklam vermek neredeyse imkansız.`,
                        recommendation: 'Acilen fiyatı artırın veya tedarikçi maliyetini düşürün. Platform komisyonu düşük kanal arayın. Ürün maliyeti > satış fiyatının %60\'ı ise bu ürünü reklama sokmayın.',
                    }
                } else if (beRoas >= 3) {
                    return {
                        value: `${beRoas.toFixed(1)}x`,
                        level: 'warning',
                        title: 'Dikkatli Olun — Marj Dar',
                        message: `BE-ROAS ${beRoas.toFixed(1)}x — reklam verebilirsiniz ama hata payınız az. CPC artışı veya iade dalgası sizi zarara sokabilir.`,
                        recommendation: 'Kargo anlaşmanızı iyileştirin (₺${Math.round(i.shipping)} → paket anlaşma ile ₺${Math.max(10, Math.round(i.shipping * 0.7))} mümkün). Bundle satışıyla AOV artırarak BE-ROAS\'ı düşürün.',
                    }
                } else {
                    return {
                        value: `${beRoas.toFixed(1)}x`,
                        level: 'success',
                        title: 'Sağlıklı Marj — Ölçeklendirmeye Hazır',
                        message: `BE-ROAS sadece ${beRoas.toFixed(1)}x. Net marjınız ₺${Math.round(margin)} (${i.selling_price > 0 ? Math.round((margin / i.selling_price) * 100) : 0}%) ile rahat bir şekilde reklam verebilirsiniz.`,
                        recommendation: 'Bu ürünü reklam bütçesinde ön plana çıkarın. Düşük BE-ROAS avantajınızla rakipleri outbid edin. Scaling kampanyaları başlatın.',
                    }
                }
            },
        },
    ],
    content: {
        intro: 'Reklam verirken zarar etmemek için minimum kaç ROAS yapmanız gerektiğini bilin. Çoğu e-ticaret markası bu değeri bilmeden reklam verir.',
        howItWorks: 'Satış fiyatınızdan ürün maliyeti, kargo ve platform kesintilerini çıkararak net marjınızı bulur. Ardından satış fiyatını net marja bölerek zarar etmeyeceğiniz minimum ROAS değerini hesaplar. Giriş yaparak güvenlik payı eklenmiş hedef ROAS önerisini de görebilirsiniz.',
        details: `## Break-Even ROAS Nedir?\n\nBreak-Even ROAS, reklam harcamanızın tam olarak geri dönme noktasıdır. **Satış Fiyatı ÷ Net Marj** formülü ile hesaplanır.\n\n### Pratikte Ne Anlama Gelir?\n\n- **BE-ROAS 2.0**: Her 1₺ reklam harcaması için minimum 2₺ ciro yapmalısınız\n- **BE-ROAS 3.0+**: Marjlarınız dar, dikkat edin\n- **BE-ROAS 5.0+**: Tehlike bölgesi! Fiyatlamanızı gözden geçirin`,
        faq: [
            { question: 'Break-Even ROAS ile normal ROAS farkı nedir?', answer: 'Normal ROAS mevcut performansınızdır. Break-Even ROAS ise zarar etmemek için gereken minimum eşiktir. Gerçek ROAS, Break-Even ROAS\'ın üstünde olmalıdır.' },
            { question: 'Platform kesintisini nasıl hesaplamalıyım?', answer: 'Trendyol için %12-18, Hepsiburada için %8-15, kendi e-ticaret siteniz için ödeme komisyonları (%1.5-3) dahil edilmelidir. Tam oranlar sözleşmenize göre değişir.' },
            { question: 'BE-ROAS çok yüksek çıkıyorsa ne yapmalıyım?', answer: 'Bu düşük marj anlamına gelir. Seçenekleriniz: (1) Ürün maliyetini düşürmek, (2) Satış fiyatını artırmak, (3) Kargo anlaşmanızı iyileştirmek, (4) Platform komisyonu düşük kanal aramak.' },
            { question: 'Kargo bedava sunuyorsam nasıl hesaplarım?', answer: 'Kargo bedava olsa da maliyet size aittir. Kargo giderinizi tam olarak girin, çünkü bu sizin gerçek marjınızı etkiler.' },
        ],
    },
}

const profitSimulator: ToolConfig = {
    slug: 'profit-simulator',
    title: 'Gerçek Kâr Simülatörü',
    description: 'Tüm gizli maliyetler dahil gerçek net kârınızı hesaplayın. Mini-Prificient deneyimi.',
    category: 'finance',
    platforms: ['global'],
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
            insight: (i) => {
                const net = i.revenue - (i.revenue * i.cogs_percent / 100) - i.ad_spend - i.shipping_total - i.misc_fees
                const yearly = Math.round(net * 12)
                const monthlyMargin = i.revenue > 0 ? (net / i.revenue) * 100 : 0
                if (yearly <= 0) {
                    return {
                        value: `₺${yearly.toLocaleString('tr-TR')}`,
                        level: 'danger',
                        title: 'Yıllık Projeksiyon Zararda',
                        message: `Mevcut performansla 12 ay sonunda ₺${Math.abs(yearly).toLocaleString('tr-TR')} zarar edeceksiniz. Aylık net marj %${monthlyMargin.toFixed(1)}.`,
                        recommendation: 'Acil maliyet analizi yapın. En büyük gider kalemini tespit edin ve %15 kısın. COGS oranını düşürmek için toplu alım veya alternatif tedarikçi araştırın.',
                    }
                } else if (yearly < net * 15) {
                    return {
                        value: `₺${yearly.toLocaleString('tr-TR')}`,
                        level: 'warning',
                        title: 'Büyüme Potansiyeli Sınırlı',
                        message: `Yıllık projeksiyon: ₺${yearly.toLocaleString('tr-TR')}. Marj %${monthlyMargin.toFixed(1)} ile işletme ayakta ama agresif büyüme kapasitesi yok.`,
                        recommendation: 'Organik kanalları güçlendirin (e-posta, SEO). Reklam bütçesini daha verimli kullanmak için retargeting oranını artırın. AOV artışı için cross-sell kurun.',
                    }
                } else {
                    return {
                        value: `₺${yearly.toLocaleString('tr-TR')}`,
                        level: 'success',
                        title: 'Güçlü Yıllık Projeksiyon',
                        message: `₺${yearly.toLocaleString('tr-TR')} yıllık net kâr projeksiyonu. %${monthlyMargin.toFixed(1)} marj ile sağlıklı bir büyüme yolundasınız.`,
                        recommendation: 'Bu performansı koruyarak ölçeklendirin. Aylık kâr fazlasını yeni ürün/kanal testlerine yatırın. 6 aylık nakit rezervi oluşturun.',
                    }
                }
            },
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
            insight: (i) => {
                const net = i.revenue - (i.revenue * i.cogs_percent / 100) - i.ad_spend - i.shipping_total - i.misc_fees
                const marginPct = i.revenue > 0 ? (net / i.revenue) * 100 : 0
                if (marginPct < 5) {
                    return {
                        value: `%${marginPct.toFixed(1)}`,
                        level: 'danger',
                        title: 'Kâr Marjınız Kritik Seviyede',
                        message: `Aylık ₺${i.revenue.toLocaleString('tr-TR')} ciroya karşın sadece ₺${Math.round(net).toLocaleString('tr-TR')} net kâr. Marjınız %${marginPct.toFixed(1)} — tek bir beklenmedik gider sizi zarara sokar.`,
                        recommendation: 'Acil eylem: (1) Reklam bütçesini %20 kısın ve performansı koruyacak retargeting\'e odaklanın. (2) COGS oranını %5 düşürecek alternatif tedarikçi arayın. (3) Kargo anlaşmanızı toplu gönderimle optimize edin.',
                    }
                } else if (marginPct < 20) {
                    return {
                        value: `%${marginPct.toFixed(1)}`,
                        level: 'warning',
                        title: 'Orta Seviye — Büyüme Kapasitesi Sınırlı',
                        message: `Kâr marjınız %${marginPct.toFixed(1)}. İşletmeniz ayakta ama agresif büyüme için yeterli değil. Aylık ₺${Math.round(net).toLocaleString('tr-TR')} net kâr.`,
                        recommendation: 'AOV artırmak için cross-sell/upsell stratejisi kurun. E-posta otomasyonuyla reklam maliyeti olmadan tekrar satış yapın. Hedef: marjı %25+ seviyeye çıkarmak.',
                    }
                } else {
                    return {
                        value: `%${marginPct.toFixed(1)}`,
                        level: 'success',
                        title: 'Güçlü Kârlılık — Ölçeklendirin',
                        message: `%${marginPct.toFixed(1)} kâr marjı ile aylık ₺${Math.round(net).toLocaleString('tr-TR')} net kazanıyorsunuz. Yıllık projeksiyon: ₺${Math.round(net * 12).toLocaleString('tr-TR')}.`,
                        recommendation: 'Bu sağlıklı marjla büyüme zamanı. Reklam bütçesini kademeli (%10-15/hafta) artırın. Yeni ürün kategorileri test edin. Mevcut müşterilere sadakat programı başlatın.',
                    }
                }
            },
        },
    ],
    content: {
        intro: 'Ciro, kâr değildir. Tüm maliyetleri dahil ederek gerçekte ne kadar kazandığınızı hesaplayın.',
        howItWorks: 'Aylık cironuzdan ürün maliyeti, reklam harcaması, kargo ve diğer giderleri çıkararak gerçek brüt ve net kârınızı hesaplar. Kâr marjınızı gösterir ve giriş yaparak yıllık projeksiyon ile yatırım getirisi (ROI) analizini görebilirsiniz.',
        details: `## Neden "Gerçek" Kâr?\n\nÇoğu e-ticaret girişimci sadece ciro ve ürün maliyetine bakarak kâr hesaplar.\n\n### Gizli Maliyetler\n\n1. **Platform Komisyonları**: %8-15 komisyon\n2. **Ödeme Komisyonları**: %1.5-3\n3. **İade Maliyetleri**: Kargo ve operasyonel maliyet\n4. **Paketleme**: Kutu, dolgu, etiket\n\n### Kâr Marjı Benchmark\n\n- **%5 altı**: Tehlike bölgesi\n- **%10-20**: Orta, büyüme kapasitesi sınırlı\n- **%20+**: Sağlıklı, ölçeklendirme potansiyeli yüksek`,
        faq: [
            { question: 'Bu araç ile gerçek muhasebe arasında fark var mı?', answer: 'Evet, bu araç hızlı bir tahmin sunar. Gerçek muhasebede KDV, vergi, amortisman gibi kalemler de dahil edilir. Ancak operasyonel kârlılığınızı anlamak için güçlü bir başlangıçtır.' },
            { question: 'Ürün maliyeti yüzdesini nasıl hesaplarım?', answer: 'Toplam ürün alış maliyetinizi toplam satış tutarına bölün ve 100 ile çarpın. Örn: 40.000₺ maliyet / 100.000₺ satış = %40.' },
            { question: 'Diğer giderler kısmına neleri yazmalıyım?', answer: 'Platform komisyonları, ödeme gateway komisyonları, paketleme maliyetleri, depo kirası, personel giderleri gibi ciro dışı kalemleri yazabilirsiniz.' },
            { question: 'Kâr marjım negatif çıkıyorsa ne olur?', answer: 'Bu, sattıkça zarar ettiğiniz anlamına gelir. Acilen fiyatlandırma stratejinizi, maliyet yapınızı ve reklam bütçenizi gözden geçirmelisiniz.' },
            { question: 'Yıllık projeksiyon ne kadar güvenilir?', answer: 'Projeksiyon mevcut aylık verilerin 12 ile çarpılmasıyla oluşur. Mevsimsellik ve büyüme dahil değildir. Yön gösterici olarak kullanın.' },
        ],
    },
}

const returnCostCalculator: ToolConfig = {
    slug: 'return-cost-calculator',
    title: 'İade Maliyeti Analizörü',
    description: 'İadelerin işletmenize gerçek maliyetini hesaplayın. Sessiz kâr katili.',
    category: 'operations',
    platforms: ['global'],
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
            insight: (i) => {
                const returnRate = i.return_rate
                const monthlyReturns = Math.round(i.monthly_orders * (returnRate / 100))
                const costPerReturn = i.shipping_cost_one_way * 2 + i.handling_cost
                const monthlyLoss = monthlyReturns * costPerReturn
                if (returnRate > 20) {
                    return {
                        value: `%${returnRate}`,
                        level: 'danger',
                        title: 'Operasyonel Kan Kaybı',
                        message: `Her 5 siparişten ${Math.round(returnRate / 20)} tanesi iade ediliyor. Aylık ₺${Math.round(monthlyLoss).toLocaleString('tr-TR')} doğrudan çöpe gidiyor. Kargo firması kazanıyor, siz kaybediyorsunuz.`,
                        recommendation: 'Acil adımlar: (1) İade politikanızı "Mağaza Kredisi" olarak değiştirin. (2) Beden tablosu ve 360° ürün fotoğrafı ekleyin. (3) En çok iade alan ilk 5 ürünü tespit edip listing\'lerini iyileştirin.',
                    }
                } else if (returnRate > 10) {
                    return {
                        value: `%${returnRate}`,
                        level: 'warning',
                        title: 'Optimize Edilebilir — Gizli Fırsat',
                        message: `İade oranınız %${returnRate} sektör ortalamasında. Aylık ₺${Math.round(monthlyLoss).toLocaleString('tr-TR')} iade maliyetiniz var. %5 düşüş bile ciddi tasarruf sağlar.`,
                        recommendation: 'Ürün paketlemesine "Teşekkür Kartı" ekleyerek duygusal bağ kurun (iadeleri %2-3 azaltır). Sipariş onay mailinde ürün kullanım videosu paylaşın.',
                    }
                } else {
                    return {
                        value: `%${returnRate}`,
                        level: 'success',
                        title: 'İade Oranınız Mükemmel',
                        message: `%${returnRate} iade oranı sektör ortalamasının çok altında. Aylık iade maliyetiniz sadece ₺${Math.round(monthlyLoss).toLocaleString('tr-TR')}.`,
                        recommendation: 'Bu avantajı pazarlamada kullanın! "Müşterilerimizin %${100 - returnRate}\'i memnun" gibi sosyal kanıt mesajları reklamlarda dönüşümü artırır.',
                    }
                }
            },
        },
    ],
    content: {
        intro: 'İadeler sadece kayıp ciro değildir. Kargo, operasyon ve fırsat maliyetleriyle birlikte düşünülmeli.',
        howItWorks: 'Aylık sipariş sayınızı ve iade oranınızı kullanarak kaç iade olduğunu hesaplar. Her iade için çift yönlü kargo + operasyonel maliyet toplayarak aylık toplam iade maliyetinizi gösterir. Giriş yaparak iade oranını %5 düşürmenin ne kadar tasarruf sağlayacağını görebilirsiniz.',
        details: `## İadenin Gerçek Maliyeti\n\nBir iade, sadece satış kaybı değildir:\n\n1. **Çift Yönlü Kargo**: Gidiş + dönüş\n2. **Operasyonel Maliyet**: İnceleme, paketleme\n3. **Fırsat Maliyeti**: Satışta olmayan ürün\n4. **Değer Kaybı**: Hasar riski\n\n### Türkiye Sektör Ortalamaları\n\n- **Giyim**: %20-35\n- **Elektronik**: %5-10\n- **Kozmetik**: %8-15\n- **Ev & Dekorasyon**: %10-15`,
        faq: [
            { question: 'İade oranımı nasıl hesaplarım?', answer: 'İade edilen sipariş sayısını toplam sipariş sayısına bölüp 100 ile çarpın. Örn: 60 iade / 400 sipariş = %15 iade oranı.' },
            { question: 'Operasyonel maliyet neleri kapsar?', answer: 'İade paketini teslim alma, ürünü kontrol etme, yeniden paketleme, stoka geri ekleme ve kalite kontrolü süreçlerini kapsar. İnsan gücü ve zaman maliyetini de dahil edin.' },
            { question: 'İade oranını nasıl düşürebilirim?', answer: 'Beden tabloları ve detaylı ürün açıklamaları ekleyin, ürün fotoğraflarını gerçekçi yapın, sipariş öncesi canlı destek sunun ve müşteri yorumlarını ön plana çıkarın.' },
            { question: 'Ücretsiz iade sunmak zorunda mıyım?', answer: 'Yasal olarak ayıplı ürünlerde iade kargo ücretsiz olmalıdır. Cayma hakkı kullanımlarında ise taşıma maliyetini müşteriye yansıtabilirsiniz (satış koşullarınızda belirtilmişse).' },
        ],
    },
}

const cltvCalculator: ToolConfig = {
    slug: 'cltv-calculator',
    title: 'CLTV Hesaplayıcı',
    description: 'Bir müşterinin ömür boyu değerini ve ödeyebileceğiniz maksimum reklam maliyetini bilin.',
    category: 'marketing',
    platforms: ['global'],
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
            insight: (i) => {
                const cltv = i.avg_order_value * i.purchase_frequency * i.customer_lifespan
                const ltvProfit = cltv * (i.profit_margin / 100)
                const maxCac = Math.round(ltvProfit * 0.33)
                if (maxCac < 50) {
                    return {
                        value: `₺${maxCac}`,
                        level: 'danger',
                        title: 'Müşteri Edinme Bütçeniz Çok Dar',
                        message: `Bir müşteriye en fazla ₺${maxCac} harcayabilirsiniz. Bu bütçeyle Meta/Google'da kaliteli müşteri bulmak çok zor. CLTV: ₺${Math.round(cltv).toLocaleString('tr-TR')}.`,
                        recommendation: 'CLTV artırma planı: (1) Sipariş sonrası cross-sell e-postaları kurun (sıklığı artırır). (2) Sadakat programı başlatın (ömrü uzatır). (3) Bundle/upsell ile AOV artırın.',
                    }
                } else if (maxCac < 150) {
                    return {
                        value: `₺${maxCac}`,
                        level: 'warning',
                        title: 'Dikkatli Harcayın — Sınırlı Bütçe',
                        message: `Müşteri başına ₺${maxCac} bütçeniz var. CLTV ₺${Math.round(cltv).toLocaleString('tr-TR')}, toplam kâr potansiyeli ₺${Math.round(ltvProfit).toLocaleString('tr-TR')}. CPA'yı sıkı takip edin.`,
                        recommendation: 'Retargeting ve lookalike kampanyalarına odaklanın (düşük CPA). Soğuk kitle için organik içerik (Reels/TikTok) ile awareness oluşturun. E-posta listesi büyütmeye yatırım yapın.',
                    }
                } else {
                    return {
                        value: `₺${maxCac}`,
                        level: 'success',
                        title: 'Güçlü CLTV — Agresif Büyüyebilirsiniz',
                        message: `Müşteri başına ₺${maxCac} harcama kapasiteniz var. CLTV ₺${Math.round(cltv).toLocaleString('tr-TR')} ile rakiplerinizi outbid edebilirsiniz.`,
                        recommendation: 'Agresif müşteri edinme stratejisi uygulayın. İlk satışta kâr etmeseniz bile LTV ile kazanırsınız. Influencer ve referral programlarına bütçe ayırın.',
                    }
                }
            },
        },
    ],
    content: {
        intro: 'Müşterilerinizin değerini bilin, daha akıllı reklam kararları verin. CLTV, sürdürülebilir büyümenin temelidir.',
        howItWorks: 'Ortalama sipariş tutarı, yıllık satın alma sıklığı ve müşteri ömrünü çarparak bir müşterinin size toplam getireceği değeri hesaplar. Kâr marjınızı uygulayarak net CLTV bulur. Giriş yaparak ödeyebileceğiniz maksimum müşteri edinme maliyetini (CAC) görebilirsiniz.',
        details: `## CLTV Nedir?\n\nCustomer Lifetime Value, bir müşterinin sizden toplam ne kadar alışveriş yapacağının tahminidir.\n\n### Formül\n\n**CLTV = Ortalama Sipariş × Yıllık Sıklık × Müşteri Ömrü**\n\n### Neden Önemli?\n\n- **CLTV > CAC**: Müşteri kazanmak kârlı\n- **CLTV < CAC**: Her yeni müşteri zarar\n- **Kural**: CAC, CLTV'nin %30'undan fazla olmamalı\n\n### CLTV Artırma\n\n1. **Cross-sell & Upsell**: Sipariş tutarını artırın\n2. **Sadakat Programları**: Sıklığı artırın\n3. **Mükemmel Deneyim**: Ömrü uzatın`,
        faq: [
            { question: 'CLTV ile CAC ilişkisi nasıl olmalıdır?', answer: 'Genel kural: CAC, CLTV\'nin %30\'undan az olmalıdır. Yani CLTV 3.000₺ ise müşteri edinme maliyetiniz 900₺\'yi geçmemelidir. Bu oran sağlıklı büyüme için kritiktir.' },
            { question: 'Müşteri ömrünü nasıl tahmin ederim?', answer: 'Son 2-3 yılın churn (terk) oranını bakın. Aylık churn %5 ise ortalama müşteri ömrü = 1 / 0.05 = 20 ay ≈ 1.7 yıl. İlk müşterilerinizin ne kadar süre aktif kaldığı da iyi bir referanstır.' },
            { question: 'Yeni açılan mağaza CLTV nasıl hesaplar?', answer: 'Henüz verisi yoksa sektör ortalamalarını kullanın: e-ticaret genelinde yıllık 2-3 sipariş, 1.5-2 yıl müşteri ömrü. 6 ay sonra kendi verinizle güncelleyin.' },
            { question: 'CLTV artırmak için en etkili yöntem nedir?', answer: 'En hızlı etki: e-posta ile cross-sell kampanyaları (sipariş sonrası tamamlayıcı ürün önerileri). Orta vadede: sadakat programı. Uzun vadede: müşteri deneyimi iyileştirme.' },
        ],
    },
}

const breakEvenCalculator: ToolConfig = {
    slug: 'breakeven-calculator',
    title: 'Başa Baş Hesaplayıcı',
    description: 'Ürününüzün başa baş noktasını bulun. Ayda kaç adet satmalısınız?',
    category: 'finance',
    platforms: ['global'],
    color: 'sky',
    icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5',
    inputs: [
        { id: 'selling_price', label: 'Satış Fiyatı (₺)', type: 'currency', defaultValue: 300, placeholder: '300' },
        { id: 'product_cost', label: 'Ürün Maliyeti (₺)', type: 'currency', defaultValue: 120, placeholder: '120' },
        { id: 'fixed_costs', label: 'Aylık Sabit Giderler (₺)', type: 'currency', defaultValue: 10000, placeholder: '10.000', tooltip: 'Kira, maaş, yazılım abonelikleri vb.' },
        { id: 'shipping_per_unit', label: 'Birim Kargo Gideri (₺)', type: 'currency', defaultValue: 25, placeholder: '25' },
        { id: 'ad_spend_monthly', label: 'Aylık Reklam Bütçesi (₺)', type: 'currency', defaultValue: 5000, placeholder: '5.000' },
    ],
    results: [
        {
            id: 'contribution_margin',
            label: 'Katkı Payı (Birim)',
            type: 'currency',
            formula: (i) => Math.round((i.selling_price - i.product_cost - i.shipping_per_unit) * 100) / 100,
            description: 'Her birim satıştan sabit giderlere katkı',
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'contribution_margin_pct',
            label: 'Katkı Payı Marjı',
            type: 'percent',
            formula: (i) => {
                const cm = i.selling_price - i.product_cost - i.shipping_per_unit
                return i.selling_price > 0 ? Math.round((cm / i.selling_price) * 1000) / 10 : 0
            },
            sentiment: (v) => (v as number) >= 40 ? 'positive' : (v as number) >= 20 ? 'neutral' : 'negative',
        },
        {
            id: 'breakeven_units',
            label: 'Başa Baş Noktası (Adet/Ay)',
            type: 'number',
            formula: (i) => {
                const cm = i.selling_price - i.product_cost - i.shipping_per_unit
                const totalFixed = i.fixed_costs + i.ad_spend_monthly
                return cm > 0 ? Math.ceil(totalFixed / cm) : 0
            },
            description: 'Bu kadar satmalısınız ki zarar etmeyesiniz',
        },
        {
            id: 'breakeven_revenue',
            label: 'Başa Baş Cirosu',
            type: 'currency',
            formula: (i) => {
                const cm = i.selling_price - i.product_cost - i.shipping_per_unit
                const totalFixed = i.fixed_costs + i.ad_spend_monthly
                const beu = cm > 0 ? Math.ceil(totalFixed / cm) : 0
                return Math.round(beu * i.selling_price)
            },
            description: 'Başa baş için gereken minimum aylık ciro',
        },
        {
            id: 'profit_at_100',
            label: '100 Adet Satarsanız Kâr',
            type: 'currency',
            formula: (i) => {
                const cm = i.selling_price - i.product_cost - i.shipping_per_unit
                const totalFixed = i.fixed_costs + i.ad_spend_monthly
                return Math.round(100 * cm - totalFixed)
            },
            isLocked: true,
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
            insight: (i) => {
                const cm = i.selling_price - i.product_cost - i.shipping_per_unit
                const totalFixed = i.fixed_costs + i.ad_spend_monthly
                const beu = cm > 0 ? Math.ceil(totalFixed / cm) : 0
                const cmPct = i.selling_price > 0 ? (cm / i.selling_price) * 100 : 0
                if (beu > 200) {
                    return {
                        value: `${beu} adet/ay`,
                        level: 'danger',
                        title: 'Başa Baş Noktanız Çok Yüksek',
                        message: `Ayda ${beu} adet satmadan kâra geçemezsiniz. Birim katkı payı sadece ₺${Math.round(cm)} (%${cmPct.toFixed(0)} marj). Sabit giderleriniz ₺${totalFixed.toLocaleString('tr-TR')}.`,
                        recommendation: 'Fiyat artışı veya maliyet düşüşü şart. Sabit giderleri %20 azaltma planı yapın. Reklam bütçesini performans bazlı modele çevirin.',
                    }
                } else if (beu > 50) {
                    return {
                        value: `${beu} adet/ay`,
                        level: 'warning',
                        title: 'Ulaşılabilir Ama Dikkatli Olun',
                        message: `Başa baş noktası: ${beu} adet/ay. Katkı payı ₺${Math.round(cm)} (%${cmPct.toFixed(0)}). Düşük satış aylarında zarar riski var.`,
                        recommendation: 'Sabit giderleri gözden geçirin — gereksiz abonelikleri iptal edin. Bundle/upsell ile AOV artırarak başa baş noktasını düşürün.',
                    }
                } else {
                    return {
                        value: `${beu} adet/ay`,
                        level: 'success',
                        title: 'Düşük Başa Baş — Güçlü Pozisyon',
                        message: `Sadece ${beu} adet satışla kâra geçiyorsunuz. Katkı payı ₺${Math.round(cm)} (%${cmPct.toFixed(0)} marj). Her ek satış doğrudan kâra dönüşür.`,
                        recommendation: 'Bu avantajla agresif büyüyün. Reklam bütçesini artırarak hacmi yükseltin. Yeni ürün kategorileri ekleyin — düşük başa baş noktası risk toleransınızı artırır.',
                    }
                }
            },
        },
        {
            id: 'profit_at_500',
            label: '500 Adet Satarsanız Kâr',
            type: 'currency',
            formula: (i) => {
                const cm = i.selling_price - i.product_cost - i.shipping_per_unit
                const totalFixed = i.fixed_costs + i.ad_spend_monthly
                return Math.round(500 * cm - totalFixed)
            },
            isLocked: true,
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
    ],
    content: {
        intro: 'Ürününüzün başa baş noktasını bulun. Ayda kaç adet satmanız gerektiğini ve farklı senaryolarda ne kadar kâr edeceğinizi hesaplayın.',
        howItWorks: 'Satış fiyatınızdan ürün maliyetini ve kargo giderini çıkararak birim katkı payınızı bulur. Sabit giderlerinizi (kira, maaş, reklam) katkı payına bölerek ayda minimum kaç adet satmanız gerektiğini hesaplar. Giriş yaparak 100 ve 500 adet senaryolarındaki kâr tahminlerini görebilirsiniz.',
        details: `## Başa Baş Noktası Nedir?\n\nBaşa baş noktası, gelirinizin giderlerinize eşit olduğu satış adedidir. Altında zarar, üstünde kâr edersiniz.\n\n### Formül\n\n**Başa Baş = Sabit Giderler ÷ Katkı Payı**\n\nKatkı Payı = Satış Fiyatı - Değişken Maliyetler\n\n### Neden Önemli?\n\n- Minimum satış hedefini belirler\n- Fiyat değişikliğinin etkisini gösterir\n- Reklam bütçesi planlamasında kritiktir`,
        faq: [
            { question: 'Sabit giderler ile değişken giderler arasındaki fark nedir?', answer: 'Sabit giderler satış olsun olmasın ödenir: kira, maaş, yazılım abonelikleri. Değişken giderler ise her satışla birlikte artar: ürün maliyeti, kargo, paketleme.' },
            { question: 'Reklam bütçesi sabit mi değişken mi gider?', answer: 'Teknik olarak yarı-değişken bir giderdir. Ancak çoğu e-ticaret markası aylık sabit bir reklam bütçesi belirler, bu yüzden bu araçta sabit gider olarak ele alınır.' },
            { question: 'Katkı payı negatif çıkıyorsa ne anlama gelir?', answer: 'Satış fiyatınız, ürün + kargo maliyetinizden düşük demektir. Her satışta zarar ediyorsunuz. Acilen fiyat artırmalı veya maliyet düşürmelisiniz.' },
            { question: 'Birden fazla ürün satıyorsam nasıl hesaplarım?', answer: 'En çok satan veya ortalama ürününüzün değerlerini girin. Detaylı analiz için her ürün grubunu ayrı ayrı hesaplayıp toplam başa baş adedini bulabilirsiniz.' },
        ],
    },
}

const bfcmPlanner: ToolConfig = {
    slug: 'bfcm-planner',
    title: 'BFCM Kâr Planlayıcı',
    description: 'Black Friday ve Cyber Monday kampanyalarınızın gerçek kârlılığını önceden simüle edin.',
    category: 'marketing',
    platforms: ['global'],
    color: 'orange',
    icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    inputs: [
        { id: 'avg_order_value', label: 'Ortalama Sipariş Tutarı (₺)', type: 'currency', defaultValue: 350, placeholder: '350' },
        { id: 'discount_percent', label: 'İndirim Oranı (%)', type: 'percent', defaultValue: 25, placeholder: '25' },
        { id: 'expected_orders', label: 'Beklenen Sipariş Sayısı', type: 'number', defaultValue: 500, placeholder: '500' },
        { id: 'product_cost_percent', label: 'Ürün Maliyeti (%)', type: 'percent', defaultValue: 40, placeholder: '40' },
        { id: 'ad_budget', label: 'Kampanya Reklam Bütçesi (₺)', type: 'currency', defaultValue: 20000, placeholder: '20.000' },
        { id: 'return_rate', label: 'Tahmini İade Oranı (%)', type: 'percent', defaultValue: 12, placeholder: '12' },
    ],
    results: [
        {
            id: 'gross_revenue',
            label: 'Brüt Ciro',
            type: 'currency',
            formula: (i) => Math.round(i.avg_order_value * i.expected_orders),
        },
        {
            id: 'discount_loss',
            label: 'İndirim Kaybı',
            type: 'currency',
            formula: (i) => Math.round(i.avg_order_value * i.expected_orders * (i.discount_percent / 100)),
            sentiment: () => 'negative',
        },
        {
            id: 'net_revenue',
            label: 'Net Gelir',
            type: 'currency',
            formula: (i) => {
                const gross = i.avg_order_value * i.expected_orders
                const disc = gross * (i.discount_percent / 100)
                const discounted = gross - disc
                const retLoss = discounted * (i.return_rate / 100)
                return Math.round(discounted - retLoss)
            },
        },
        {
            id: 'net_profit',
            label: 'Net Kâr',
            type: 'currency',
            formula: (i) => {
                const gross = i.avg_order_value * i.expected_orders
                const disc = gross * (i.discount_percent / 100)
                const discounted = gross - disc
                const retLoss = discounted * (i.return_rate / 100)
                const netRev = discounted - retLoss
                const prodCost = netRev * (i.product_cost_percent / 100)
                return Math.round(netRev - prodCost - i.ad_budget)
            },
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'profit_margin',
            label: 'Kampanya Kâr Marjı',
            type: 'percent',
            formula: (i) => {
                const gross = i.avg_order_value * i.expected_orders
                const disc = gross * (i.discount_percent / 100)
                const discounted = gross - disc
                const retLoss = discounted * (i.return_rate / 100)
                const netRev = discounted - retLoss
                const prodCost = netRev * (i.product_cost_percent / 100)
                const net = netRev - prodCost - i.ad_budget
                return netRev > 0 ? Math.round((net / netRev) * 1000) / 10 : 0
            },
            isLocked: true,
            sentiment: (v) => (v as number) >= 15 ? 'positive' : (v as number) >= 0 ? 'neutral' : 'negative',
            insight: (i) => {
                const gross = i.avg_order_value * i.expected_orders
                const disc = gross * (i.discount_percent / 100)
                const discounted = gross - disc
                const retLoss = discounted * (i.return_rate / 100)
                const netRev = discounted - retLoss
                const prodCost = netRev * (i.product_cost_percent / 100)
                const net = netRev - prodCost - i.ad_budget
                const margin = netRev > 0 ? (net / netRev) * 100 : 0
                if (margin < 0) {
                    return {
                        value: `%${margin.toFixed(1)}`,
                        level: 'danger',
                        title: 'BFCM Kampanyanız Zararda!',
                        message: `Bu indirim + reklam + iade kombinasyonunda kampanya ₺${Math.abs(Math.round(net)).toLocaleString('tr-TR')} zarar üretir. İndirim çok yüksek veya reklam bütçesi orantısız.`,
                        recommendation: 'İndirim oranını %5 düşürün veya bundle teklifine geçin. Reklam bütçesini sadece warm audience\'a yönlendirin. Yüksek marjlı ürünleri kampanyada öne çıkarın.',
                    }
                } else if (margin < 10) {
                    return {
                        value: `%${margin.toFixed(1)}`,
                        level: 'warning',
                        title: 'Kârlı Ama Riskli Kampanya',
                        message: `Kampanya marjı %${margin.toFixed(1)} — kârlısınız ama iade oranı beklenenden yüksek gelirse zarara dönebilir. Net kâr: ₺${Math.round(net).toLocaleString('tr-TR')}.`,
                        recommendation: 'İade oranı için %5 ekstra tampon ekleyin. Early-bird listesine özel indirim verin (daha düşük iade riski). Stok yönetimine dikkat edin.',
                    }
                } else {
                    return {
                        value: `%${margin.toFixed(1)}`,
                        level: 'success',
                        title: 'Güçlü BFCM Planı',
                        message: `Kampanya marjı %${margin.toFixed(1)}, net kâr: ₺${Math.round(net).toLocaleString('tr-TR')}. İndirim ve giderler kontrol altında.`,
                        recommendation: 'Bu planı uygulayın. Reklam bütçesini kademeli artırın. VIP müşterilere 24 saat erken erişim vererek ilk gün satışları artırın.',
                    }
                }
            },
        },
        {
            id: 'roas_needed',
            label: 'Gereken Minimum ROAS',
            type: 'number',
            formula: (i) => {
                const gross = i.avg_order_value * i.expected_orders
                const disc = gross * (i.discount_percent / 100)
                const discounted = gross - disc
                const retLoss = discounted * (i.return_rate / 100)
                const netRev = discounted - retLoss
                const prodCost = netRev * (i.product_cost_percent / 100)
                const totalCosts = prodCost + i.ad_budget + retLoss
                return i.ad_budget > 0 ? Math.round((totalCosts / i.ad_budget) * 100) / 100 : 0
            },
            isLocked: true,
            description: 'Bu ROAS altında kampanya zarardadır',
        },
    ],
    content: {
        intro: 'Black Friday ve Cyber Monday kampanyalarınızın gerçekten kârlı olup olmadığını önceden test edin. İndirim, iade ve reklam maliyetlerini dahil ederek gerçek resmi görün.',
        howItWorks: 'Kampanya indirim oranı, beklenen sipariş sayısı ve reklam bütçesini kullanarak brüt ciro, indirim kaybı, iade kaybı ve net kârınızı hesaplar. Giriş yaparak kampanya kâr marjını ve kârlı olabilmek için gereken minimum ROAS değerini görebilirsiniz.',
        details: `## BFCM Kampanyası Neden Riskli?\n\nYüksek indirimler + artan reklam maliyetleri + yüksek iade oranları = zarar riski.\n\n### Dikkat Noktaları\n\n1. **İndirim Oranı**: %30+ marjı eritir\n2. **İade Artışı**: %50-100 artış\n3. **CPC Artışı**: 2-3x artış\n4. **Stok Riski**: Fazla stok = nakit sorunu\n\n### Başarılı Strateji\n\n- Bundle teklifleri sunun\n- Önceden müşteri listesi oluşturun\n- Detaylı ürün içerikleri hazırlayın\n- Yüksek marjlı ürünlere odaklanın`,
        faq: [
            { question: 'BFCM kampanyasında ideal indirim oranı nedir?', answer: 'Marjınıza bağlı. %40 marjlı bir üründe %20 indirim güvenlidir. %25+ indirimde iade ve reklam maliyetlerini mutlaka dahil edin. Bu araçla test ederek kendi ideal oranınızı bulun.' },
            { question: 'BFCM döneminde iade oranı neden artar?', answer: 'Müşteriler dürtüsel alışveriş yapar, indirim baskısıyla düşünmeden satın alır. Ayrıca hediye amaçlı alımlar ve beden hataları artar. Bazı müşteriler birden fazla beden alıp beğenmediğini iade eder.' },
            { question: 'Kampanya reklam bütçesini nasıl belirlemeliyim?', answer: 'Normal aylık bütçenizin 2-3 katını BFCM haftasına yoğunlaştırın. Ancak CPC artışını hesaba katın — aynı bütçe daha az tıklama getirecektir. Bu araçla farklı bütçe senaryolarını test edin.' },
            { question: 'İndirim yerine ne tür kampanyalar yapabilirim?', answer: 'Bundle (paket) teklifleri, belirli tutarın üstüne ücretsiz kargo, hediye ürün, sadakat puanı çarpanı veya erken erişim kampanyaları marjınızı koruyan alternatiflerdir.' },
            { question: 'Kampanyayı ne zaman başlatmalıyım?', answer: 'Black Friday\'dan 1-2 hafta önce teaser kampanyası başlatın. "Erken erişim" listeye kayıt toplamak CPC artmadan önce trafik çekmenizi sağlar.' },
        ],
    },
}

// ─── Registry ──────────────────────────────────────
import { platformTools } from './platform-tools'

export const toolRegistry: ToolConfig[] = [
    // Kategori 1: Çekirdek Finansal
    profitSimulator,
    roasCalculator,
    breakEvenRoas,
    breakEvenCalculator,
    returnCostCalculator,
    cltvCalculator,
    bfcmPlanner,
    // Kategori 2: Pazarlama Matematiği
    cpmCpcCalculator,
    influencerRoiCalculator,
    emailMarketingRoi,
    conversionRateImpact,
    tiktokVsMetaCost,
    // Kategori 3: Operasyon & Fiyatlandırma
    stripePaypalFeeCalculator,
    productPricingCalculator,
    bundleProfitCalculator,
    dropshippingProfitCalc,
    inventoryHoldingCost,
    // Kategori 4: Pratik Araçlar
    utmBuilder,
    bfcmDiscountPlanner,
    // Kategori 5: Platform Bazlı
    ...platformTools,
]

export function getToolBySlug(slug: string): ToolConfig | undefined {
    return toolRegistry.find((t) => t.slug === slug)
}

export function getToolsByCategory(category: ToolConfig['category']): ToolConfig[] {
    return toolRegistry.filter((t) => t.category === category)
}

export function getToolsByPlatform(platform: string): ToolConfig[] {
    if (platform === 'all') return toolRegistry
    if (platform === 'trendyol-hb') return toolRegistry.filter((t) => t.platforms.includes('trendyol') || t.platforms.includes('hepsiburada'))
    return toolRegistry.filter((t) => t.platforms.includes(platform as ToolConfig['platforms'][number]))
}

export function getAllSlugs(): string[] {
    return toolRegistry.map((t) => t.slug)
}
