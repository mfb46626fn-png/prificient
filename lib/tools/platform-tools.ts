import type { ToolConfig } from './types'

// ─── Amazon FBA Gerçek Kâr Hesaplayıcı ──────────────────

const amazonFbaProfit: ToolConfig = {
    slug: 'amazon-fba-profit-calculator',
    title: 'Amazon FBA Gerçek Kâr Hesaplayıcı',
    description: 'Amazon FBA ücretleri, komisyon ve depolama maliyetlerini hesaplayarak gerçek kâr marjınızı görün.',
    category: 'finance',
    platforms: ['amazon'],
    color: 'orange',
    icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
    inputs: [
        { id: 'selling_price', label: 'Satış Fiyatı ($)', type: 'currency', defaultValue: 29.99, placeholder: '29.99' },
        { id: 'cogs', label: 'Ürün Maliyeti ($)', type: 'currency', defaultValue: 8, placeholder: '8' },
        { id: 'fba_fee', label: 'FBA Gönderim Bedeli ($)', type: 'currency', defaultValue: 5.50, placeholder: '5.50', tooltip: 'Amazon FBA Fulfillment Fee — ürün boyutu ve ağırlığına göre değişir' },
        { id: 'referral_fee_percent', label: 'Kategori Komisyonu (%)', type: 'percent', defaultValue: 15, placeholder: '15', tooltip: 'Amazon referral fee — genelde %8-%15 arası' },
        { id: 'monthly_storage_estimate', label: 'Aylık Depolama Tahmini ($)', type: 'currency', defaultValue: 1.50, placeholder: '1.50' },
    ],
    results: [
        {
            id: 'referral_fee',
            label: 'Amazon Komisyonu',
            type: 'currency',
            formula: (i) => Math.round(i.selling_price * (i.referral_fee_percent / 100) * 100) / 100,
            description: 'Kategori bazlı referral fee',
        },
        {
            id: 'total_fees',
            label: 'Toplam Amazon Kesintisi',
            type: 'currency',
            formula: (i) => {
                const referral = i.selling_price * (i.referral_fee_percent / 100)
                return Math.round((referral + i.fba_fee + i.monthly_storage_estimate) * 100) / 100
            },
            sentiment: () => 'negative',
        },
        {
            id: 'net_profit',
            label: 'Net Kâr (Birim Başı)',
            type: 'currency',
            formula: (i) => {
                const referral = i.selling_price * (i.referral_fee_percent / 100)
                const totalFees = referral + i.fba_fee + i.monthly_storage_estimate
                return Math.round((i.selling_price - i.cogs - totalFees) * 100) / 100
            },
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'profit_margin',
            label: 'Kâr Marjı',
            type: 'percent',
            formula: (i) => {
                const referral = i.selling_price * (i.referral_fee_percent / 100)
                const totalFees = referral + i.fba_fee + i.monthly_storage_estimate
                const profit = i.selling_price - i.cogs - totalFees
                return i.selling_price > 0 ? Math.round((profit / i.selling_price) * 100) : 0
            },
            sentiment: (v) => (v as number) >= 20 ? 'positive' : (v as number) >= 10 ? 'neutral' : 'negative',
        },
        {
            id: 'tacos_limit',
            label: 'TACOS Limiti',
            type: 'percent',
            formula: (i) => {
                const referral = i.selling_price * (i.referral_fee_percent / 100)
                const totalFees = referral + i.fba_fee + i.monthly_storage_estimate
                const profit = i.selling_price - i.cogs - totalFees
                return i.selling_price > 0 ? Math.round((profit / i.selling_price) * 100) : 0
            },
            isLocked: true,
            description: 'Bu kâr marjıyla reklama en fazla ayırabileceğiniz yüzde',
            insight: (i) => {
                const referral = i.selling_price * (i.referral_fee_percent / 100)
                const totalFees = referral + i.fba_fee + i.monthly_storage_estimate
                const profit = i.selling_price - i.cogs - totalFees
                const margin = i.selling_price > 0 ? (profit / i.selling_price) * 100 : 0
                const tacos = Math.max(0, Math.round(margin))

                if (tacos <= 5) {
                    return {
                        value: `%${tacos} TACOS`,
                        level: 'danger',
                        title: 'Reklama Bütçe Yok — Organik Büyüme Zorunlu',
                        message: `Kâr marjınız sadece %${tacos}. Bu marjla PPC reklam harcaması yaparsanız kâr sıfıra iner. Amazon'da organik sıralamaya veya ürün maliyetini düşürmeye odaklanmalısınız.`,
                        recommendation: 'Ürün maliyetinizi düşürün veya satış fiyatını artırın. TACOS limitiniz en az %10 olmalı ki sürdürülebilir reklam yapabilesiniz.',
                    }
                }
                if (tacos <= 15) {
                    return {
                        value: `%${tacos} TACOS`,
                        level: 'warning',
                        title: 'Dikkatli Reklam — Dar Marj',
                        message: `TACOS limitiniz %${tacos}. Reklam harcamanızı toplam ciron %${Math.round(tacos * 0.7)}'inin altında tutmalısınız. Aksi halde kâr edemezsiniz.`,
                        recommendation: `Amazon PPC bütçenizi TACOS %${Math.round(tacos * 0.7)} ile sınırlayın. Exact match anahtar kelimelere ve yüksek dönüşümlü ürünlere odaklanın.`,
                    }
                }
                return {
                    value: `%${tacos} TACOS`,
                    level: 'success',
                    title: 'Güçlü Marj — Agresif Büyüme Fırsatı',
                    message: `TACOS limitiniz %${tacos}. Bu, Amazon PPC'de agresif büyüme stratejileri uygulamak için yeterli bir marj.`,
                    recommendation: `TACOS'unuzu %${Math.round(tacos * 0.5)} hedefinde tutarak hem kârlılığı koruyun hem de pazar payı büyütün. Sponsored Brands ve DSP kampanyaları düşünün.`,
                }
            },
        },
    ],
    content: {
        intro: 'Amazon FBA satıcısı mısınız? Referral fee, FBA fulfillment ücreti ve depolama maliyetlerini hesaplayarak ürün başına gerçek net kârınızı ve TACOS limitinizi öğrenin.',
        howItWorks: 'Satış fiyatı, ürün maliyeti, FBA bedeli, komisyon oranı ve depolama tahmininizi girin. Araç toplam Amazon kesintisini, net kâr ve kâr marjını hesaplar. Kilitli TACOS analizi ile reklama ne kadar ayırabileceğinizi öğrenirsiniz.',
        details: 'TACOS (Total Advertising Cost of Sale), Amazon reklam harcamanızın toplam cironuza oranıdır. Kâr marjınızdan yüksek bir TACOS, zarar ederek reklam yaptığınız anlamına gelir. Bu araç size güvenli TACOS limitinizi gösterir.',
        faq: [
            { question: 'FBA Fee nedir?', answer: 'Amazon\'un ürünü depolaması, paketlemesi ve gönderimi için aldığı ücrettir. Ürün boyutu ve ağırlığına göre değişir.' },
            { question: 'TACOS nedir?', answer: 'Total ACOS — toplam reklam harcamanızın toplam cironuza oranıdır. Kârlılığınızı koruyan en önemli Amazon metriğidir.' },
        ],
    },
}

// ─── Trendyol Net Kâr ve Baremli Kargo ──────────────────

const trendyolProfit: ToolConfig = {
    slug: 'trendyol-profit-calculator',
    title: 'Trendyol Net Kâr ve Kargo Hesaplayıcı',
    description: 'Trendyol komisyon, kargo baremi ve kesintilerini hesaplayarak gerçek net kârınızı görün.',
    category: 'finance',
    platforms: ['trendyol', 'hepsiburada'],
    color: 'orange',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
    inputs: [
        { id: 'selling_price', label: 'Satış Fiyatı (₺)', type: 'currency', defaultValue: 299, placeholder: '299' },
        { id: 'cogs', label: 'Ürün Maliyeti (₺)', type: 'currency', defaultValue: 85, placeholder: '85' },
        { id: 'category_commission_percent', label: 'Kategori Komisyonu (%)', type: 'percent', defaultValue: 18.5, placeholder: '18.5', tooltip: 'Trendyol kategori komisyon oranı' },
        { id: 'shipping_desi', label: 'Kargo Desisi', type: 'number', defaultValue: 3, placeholder: '3', tooltip: 'Ürünün desi ölçüsü (en x boy x yükseklik / 3000)' },
    ],
    results: [
        {
            id: 'commission',
            label: 'Trendyol Komisyonu',
            type: 'currency',
            formula: (i) => Math.round(i.selling_price * (i.category_commission_percent / 100) * 100) / 100,
            sentiment: () => 'negative',
        },
        {
            id: 'shipping_cost',
            label: 'Kargo Maliyeti (Baremli)',
            type: 'currency',
            formula: (i) => {
                // Trendyol kargo barem simülasyonu (2024 güncel)
                const desi = i.shipping_desi
                if (desi <= 1) return 29.90
                if (desi <= 3) return 34.90
                if (desi <= 5) return 39.90
                if (desi <= 10) return 49.90
                if (desi <= 20) return 69.90
                return 89.90 + (desi - 20) * 3
            },
            description: 'Trendyol kargo barem tablosu bazlı',
        },
        {
            id: 'net_profit',
            label: 'Net Kâr',
            type: 'currency',
            formula: (i) => {
                const commission = i.selling_price * (i.category_commission_percent / 100)
                const desi = i.shipping_desi
                let shippingCost = 89.90 + (desi - 20) * 3
                if (desi <= 1) shippingCost = 29.90
                else if (desi <= 3) shippingCost = 34.90
                else if (desi <= 5) shippingCost = 39.90
                else if (desi <= 10) shippingCost = 49.90
                else if (desi <= 20) shippingCost = 69.90
                return Math.round((i.selling_price - i.cogs - commission - shippingCost) * 100) / 100
            },
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'cargo_barem_warning',
            label: 'Kargo Baremi Tuzak Analizi',
            type: 'text',
            formula: () => '—',
            isLocked: true,
            description: 'Fiyat değişikliğinin kargo baremi etkisi',
            insight: (i) => {
                const commission = i.selling_price * (i.category_commission_percent / 100)
                const desi = i.shipping_desi
                let shippingCost = 89.90 + (desi - 20) * 3
                if (desi <= 1) shippingCost = 29.90
                else if (desi <= 3) shippingCost = 34.90
                else if (desi <= 5) shippingCost = 39.90
                else if (desi <= 10) shippingCost = 49.90
                else if (desi <= 20) shippingCost = 69.90
                const netProfit = i.selling_price - i.cogs - commission - shippingCost
                const margin = i.selling_price > 0 ? (netProfit / i.selling_price) * 100 : 0

                // Check one desi bracket up
                let nextBracketShipping = shippingCost
                if (desi <= 1) nextBracketShipping = 34.90
                else if (desi <= 3) nextBracketShipping = 39.90
                else if (desi <= 5) nextBracketShipping = 49.90
                else if (desi <= 10) nextBracketShipping = 69.90
                else if (desi <= 20) nextBracketShipping = 89.90

                const bracketDiff = nextBracketShipping - shippingCost

                if (margin < 5) {
                    return {
                        value: `%${Math.round(margin)} marj`,
                        level: 'danger' as const,
                        title: 'Kargo Baremi Sizi Batırıyor',
                        message: `Net kâr marjınız sadece %${Math.round(margin)}. Trendyol komisyonu (₺${Math.round(commission)}) ve kargo (₺${shippingCost}) toplamı, satış fiyatınızın büyük bölümünü yiyor.`,
                        recommendation: `Satış fiyatınızı en az ₺${Math.round(i.cogs + commission + shippingCost + (i.selling_price * 0.15))} yapmalısınız. Veya desi boyutunu küçülterek bir alt baremeye (₺${bracketDiff} tasarruf) geçin.`,
                    }
                }
                if (margin < 15) {
                    return {
                        value: `%${Math.round(margin)} marj`,
                        level: 'warning' as const,
                        title: 'İnce Buz — Kargo Baremi Sınırında',
                        message: `Marjınız %${Math.round(margin)}. Desi bir üst baremeye geçerse ₺${bracketDiff} ek maliyet oluşur ve kârınız eriyebilir.`,
                        recommendation: `Ürün ambalajını optimize ederek desiyi düşürün. 1 desi fark bile ₺${bracketDiff} tasarruf sağlar. Fiyatı ₺${Math.round(i.selling_price * 1.05)} yapmayı düşünün.`,
                    }
                }
                return {
                    value: `%${Math.round(margin)} marj`,
                    level: 'success' as const,
                    title: 'Sağlıklı Marj — Kargo Baremi Kontrolünüzde',
                    message: `Net kâr marjınız %${Math.round(margin)}. Kargo baremi (₺${shippingCost}) marjınızı çok etkilemiyor.`,
                    recommendation: `Bu marjla Trendyol reklamlarına bütçe ayırabilirsiniz. Ürün fiyatını sabit tutup hacim artışına odaklanın.`,
                }
            },
        },
    ],
    content: {
        intro: 'Trendyol ve Hepsiburada satıcısı mısınız? Kategori komisyonu, baremli kargo kesintisi ve ürün maliyetinizi girerek gerçek net kârınızı öğrenin.',
        howItWorks: 'Satış fiyatı, ürün maliyeti, komisyon oranı ve kargo desisini girin. Araç Trendyol\'un barem tablosuna göre kargo maliyetini otomatik hesaplar. Kilitli analiz ile kargo bareminin marjınıza etkisini ve optimizasyon fırsatlarını gösterir.',
        details: 'Trendyol\'un kargo baremi, ürün desisine göre kademeli fiyatlandırma uygular. 1 desi fark bile onlarca TL maliyet değişikliği yaratabilir. Bu araç, hangi baremeye düştüğünüzü ve marjınızı nasıl optimize edebileceğinizi gösterir.',
        faq: [
            { question: 'Trendyol komisyon oranları nedir?', answer: 'Kategoriye göre %8 ile %25 arasında değişir. Giyim genelde %18-20, elektronik %12-15 civarıdır.' },
            { question: 'Kargo baremi nedir?', answer: 'Trendyol, ürünün desi ölçüsüne göre kademeli kargo ücreti uygular. Desi arttıkça kargo maliyeti yükselir.' },
        ],
    },
}

// ─── Etsy Fee & Kâr Marjı Simülatörü ───────────────────

const etsyFeeCalc: ToolConfig = {
    slug: 'etsy-fee-calculator',
    title: 'Etsy Fee & Kâr Marjı Simülatörü',
    description: 'Etsy\'nin karmaşık kesinti yapısını (Listing + Transaction + Processing + Offsite Ads) hesaplayın.',
    category: 'finance',
    platforms: ['etsy'],
    color: 'orange',
    icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
    inputs: [
        { id: 'selling_price', label: 'Satış Fiyatı ($)', type: 'currency', defaultValue: 45, placeholder: '45' },
        { id: 'shipping_charged', label: 'Müşteriden Alınan Kargo ($)', type: 'currency', defaultValue: 5.99, placeholder: '5.99' },
        { id: 'cogs', label: 'Ürün Maliyeti ($)', type: 'currency', defaultValue: 12, placeholder: '12' },
        { id: 'offsite_ads_percent', label: 'Offsite Ads Oranı (%)', type: 'percent', defaultValue: 15, placeholder: '15', tooltip: 'Yıllık $10.000 altı satışlar için %15, üstü için %12' },
    ],
    results: [
        {
            id: 'listing_fee',
            label: 'Listing Fee',
            type: 'currency',
            formula: () => 0.20,
            description: 'Etsy listeleme ücreti (sabit $0.20)',
        },
        {
            id: 'transaction_fee',
            label: 'Transaction Fee (%6.5)',
            type: 'currency',
            formula: (i) => Math.round((i.selling_price + i.shipping_charged) * 0.065 * 100) / 100,
        },
        {
            id: 'processing_fee',
            label: 'Payment Processing',
            type: 'currency',
            formula: (i) => Math.round(((i.selling_price + i.shipping_charged) * 0.03 + 0.25) * 100) / 100,
            description: '3% + $0.25',
        },
        {
            id: 'total_etsy_fees',
            label: 'Toplam Etsy Kesintisi',
            type: 'currency',
            formula: (i) => {
                const total = i.selling_price + i.shipping_charged
                const listing = 0.20
                const transaction = total * 0.065
                const processing = total * 0.03 + 0.25
                return Math.round((listing + transaction + processing) * 100) / 100
            },
            sentiment: () => 'negative',
        },
        {
            id: 'net_profit',
            label: 'Net Kâr (Reklamsız)',
            type: 'currency',
            formula: (i) => {
                const total = i.selling_price + i.shipping_charged
                const fees = 0.20 + total * 0.065 + total * 0.03 + 0.25
                return Math.round((i.selling_price - i.cogs - fees) * 100) / 100
            },
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'offsite_ads_risk',
            label: 'Offsite Ads Risk Raporu',
            type: 'text',
            formula: () => '—',
            isLocked: true,
            description: 'Dış reklam gelirse kâr durumunuz',
            insight: (i) => {
                const total = i.selling_price + i.shipping_charged
                const baseFees = 0.20 + total * 0.065 + total * 0.03 + 0.25
                const offsiteAdsFee = total * (i.offsite_ads_percent / 100)
                const profitWithAds = i.selling_price - i.cogs - baseFees - offsiteAdsFee
                const profitWithout = i.selling_price - i.cogs - baseFees
                const marginWithAds = i.selling_price > 0 ? (profitWithAds / i.selling_price) * 100 : 0

                if (profitWithAds < 0) {
                    return {
                        value: `-$${Math.abs(Math.round(profitWithAds * 100) / 100)}`,
                        level: 'danger' as const,
                        title: 'Offsite Ads Zarar Riski!',
                        message: `Müşteri Etsy dış reklamından gelirse $${Math.round(offsiteAdsFee * 100) / 100} ek kesinti ödenir ve birim başı $${Math.abs(Math.round(profitWithAds * 100) / 100)} zarara girersiniz. Reklamsız kârınız $${Math.round(profitWithout * 100) / 100}.`,
                        recommendation: `Fiyatınızı en az $${Math.round((i.cogs + baseFees + offsiteAdsFee) / 0.85)} yapın ki offsite ads geldiğinde bile %15 marj korunsun. Veya Etsy ayarlarından offsite ads'i kapatın (yıllık <$10K satış gerekli).`,
                    }
                }
                if (marginWithAds < 10) {
                    return {
                        value: `%${Math.round(marginWithAds)} marj`,
                        level: 'warning' as const,
                        title: 'Offsite Ads Marjı Eritiyor',
                        message: `Dış reklam gelirse marjınız %${Math.round(marginWithAds)}'e düşer. Normal kârınız $${Math.round(profitWithout * 100) / 100}, reklamla $${Math.round(profitWithAds * 100) / 100}.`,
                        recommendation: 'Offsite ads riskini karşılamak için fiyatlarınızı %10-15 artırın veya ürün maliyetini düşürün.',
                    }
                }
                return {
                    value: `%${Math.round(marginWithAds)} marj`,
                    level: 'success' as const,
                    title: 'Offsite Ads Güvenli',
                    message: `Dış reklam gelse bile %${Math.round(marginWithAds)} marj korunuyor. Offsite ads size ek müşteri getiriyor ve kârlılığınızı tehdit etmiyor.`,
                    recommendation: 'Offsite ads\'i açık bırakın — ek müşteri akışı sağlarken kâr marjınız korunuyor.',
                }
            },
        },
    ],
    content: {
        intro: 'Etsy satıcısı mısınız? Listing fee, transaction fee, payment processing ve offsite ads kesintilerini hesaplayarak gerçek kâr marjınızı öğrenin.',
        howItWorks: 'Satış fiyatı, kargo ücreti, ürün maliyeti ve offsite ads oranınızı girin. Araç tüm Etsy kesintilerini detaylı hesaplar. Kilitli analiz ile offsite ads riski — dış reklamdan gelen müşteride zarar edip etmeyeceğinizi gösterir.',
        details: 'Etsy\'nin kesinti yapısı karmaşıktır: $0.20 listing + %6.5 transaction + %3 + $0.25 processing + %12-15 offsite ads (opsiyonel). Bu araç tüm katmanları hesaplar.',
        faq: [
            { question: 'Etsy offsite ads zorunlu mu?', answer: 'Yıllık $10.000 üzeri satış yapıyorsanız zorunludur (%12). Altındaysanız isteğe bağlıdır (%15).' },
            { question: 'Transaction fee neyin üzerinden hesaplanır?', answer: 'Ürün fiyatı + kargo toplamı üzerinden %6.5 hesaplanır.' },
        ],
    },
}

// ─── E-İhracat Kur Etki Aracı ──────────────────────────

const crossBorderCurrency: ToolConfig = {
    slug: 'cross-border-currency-impact',
    title: 'E-İhracat Kur Etki Hesaplayıcı',
    description: 'Kur değişikliğinin Türkiye operasyonlarınıza etkisini hesaplayın ve kur koruma eşiğinizi öğrenin.',
    category: 'finance',
    platforms: ['global', 'shopify', 'etsy'],
    color: 'indigo',
    icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
    inputs: [
        { id: 'revenue_usd', label: 'Aylık Ciro ($)', type: 'currency', defaultValue: 5000, placeholder: '5000' },
        { id: 'current_exchange_rate', label: 'Mevcut Kur ($/₺)', type: 'number', defaultValue: 36.5, placeholder: '36.5' },
        { id: 'expected_exchange_rate', label: 'Beklenen Kur ($/₺)', type: 'number', defaultValue: 38, placeholder: '38' },
        { id: 'local_expenses_try', label: 'Yerel Giderler (₺/ay)', type: 'currency', defaultValue: 50000, placeholder: '50000', tooltip: 'Kira, personel, depo vb. TL cinsinden aylık giderler' },
    ],
    results: [
        {
            id: 'current_revenue_try',
            label: 'Mevcut ₺ Ciro',
            type: 'currency',
            formula: (i) => Math.round(i.revenue_usd * i.current_exchange_rate),
        },
        {
            id: 'expected_revenue_try',
            label: 'Beklenen ₺ Ciro',
            type: 'currency',
            formula: (i) => Math.round(i.revenue_usd * i.expected_exchange_rate),
        },
        {
            id: 'revenue_delta',
            label: '₺ Ciro Farkı',
            type: 'currency',
            formula: (i) => Math.round(i.revenue_usd * (i.expected_exchange_rate - i.current_exchange_rate)),
            sentiment: (v) => (v as number) >= 0 ? 'positive' : 'negative',
        },
        {
            id: 'current_profit_try',
            label: 'Mevcut Aylık Kâr (₺)',
            type: 'currency',
            formula: (i) => Math.round(i.revenue_usd * i.current_exchange_rate - i.local_expenses_try),
            sentiment: (v) => (v as number) > 0 ? 'positive' : 'negative',
        },
        {
            id: 'hedge_threshold',
            label: 'Kur Koruma Eşiği',
            type: 'number',
            formula: (i) => i.revenue_usd > 0 ? Math.round((i.local_expenses_try / i.revenue_usd) * 100) / 100 : 0,
            isLocked: true,
            description: 'Bu kurun altına düşerse zarara girersiniz',
            insight: (i) => {
                const threshold = i.revenue_usd > 0 ? i.local_expenses_try / i.revenue_usd : 0
                const currentProfit = i.revenue_usd * i.current_exchange_rate - i.local_expenses_try
                const expectedProfit = i.revenue_usd * i.expected_exchange_rate - i.local_expenses_try
                const buffer = ((i.current_exchange_rate - threshold) / i.current_exchange_rate) * 100

                if (i.current_exchange_rate <= threshold) {
                    return {
                        value: `${threshold.toFixed(2)} ₺/$`,
                        level: 'danger' as const,
                        title: 'Kur Altında — Zarar Ediyorsunuz!',
                        message: `Başa baş kurunuz ${threshold.toFixed(2)} ₺/$. Mevcut kur (${i.current_exchange_rate} ₺) bu eşiğin altında. operasyonel giderlerinizi karşılayamıyorsunuz.`,
                        recommendation: `Acil: USD cironuzu en az $${Math.round(i.local_expenses_try / i.current_exchange_rate)}'a çıkarın veya TL giderlerinizi ₺${Math.round(i.revenue_usd * i.current_exchange_rate * 0.8)} altına düşürün.`,
                    }
                }
                if (buffer < 10) {
                    return {
                        value: `${threshold.toFixed(2)} ₺/$`,
                        level: 'warning' as const,
                        title: 'Kur Tamponu Dar — Risk Yüksek',
                        message: `Başa baş kurunuz ${threshold.toFixed(2)} ₺/$. Mevcut kurla sadece %${Math.round(buffer)} tampon var. Kur düşerse hızla zarara geçersiniz. Mevcut kâr: ₺${Math.round(currentProfit)}, beklenen: ₺${Math.round(expectedProfit)}.`,
                        recommendation: `Forward kontrat veya opsiyonlarla kur riskini hedge edin. Ya da TL giderlerinizi %15 azaltarak tampon oluşturun.`,
                    }
                }
                return {
                    value: `${threshold.toFixed(2)} ₺/$`,
                    level: 'success' as const,
                    title: 'Güvenli Tampon — Kur Riski Düşük',
                    message: `Başa baş kurunuz ${threshold.toFixed(2)} ₺/$. %${Math.round(buffer)} tampon mevcut. Kur düşse bile kârlılığınız korunuyor. Mevcut kâr: ₺${Math.round(currentProfit)}.`,
                    recommendation: `Kur avantajından yararlanarak TL bazlı büyüme yatırımları yapın. Forward kontrat ile kârınızı sabitlemeyi düşünün.`,
                }
            },
        },
    ],
    content: {
        intro: 'USD veya EUR cinsinden satış yapıp Türkiye\'den operasyon yürüten e-ihracatçılar için kur değişiminin gerçek etkisini hesaplayın.',
        howItWorks: 'Aylık USD cironuzu, mevcut ve beklenen kuru, yerel TL giderlerinizi girin. Araç kur değişiminin kâr/zarara etkisini ve kur koruma eşiğinizi hesaplar.',
        details: 'Kur koruma eşiği, giderlerinizi karşılayabilmeniz için kurun düşmemesi gereken minimum seviyedir. Bu eşiğe yaklaştığınızda forward kontrat veya opsiyon stratejileri düşünmelisiniz.',
        faq: [
            { question: 'Kur koruma eşiği nedir?', answer: 'TL giderlerinizi USD cironuzla karşılayabilmeniz için minimum döviz kurudur. Bunun altına düşerse zarar edersiniz.' },
            { question: 'Hedge nedir?', answer: 'Kur riskinden korunmak için forward kontrat veya opsiyon kullanarak belirli bir kuru sabitlemektir.' },
        ],
    },
}

// ─── Registry ───────────────────────────────────────────

export const platformTools: ToolConfig[] = [
    amazonFbaProfit,
    trendyolProfit,
    etsyFeeCalc,
    crossBorderCurrency,
]
