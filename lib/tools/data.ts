// ─── Cross-Pollination Data ─────────────────────────────
// Her araç için "Sıradaki Mantıksal Adım" tanımları.
// Netflix "Sıradaki Bölüm" mantığı — kullanıcıyı sitede tutar.

export interface NextToolLink {
    slug: string
    message: string      // Kullanıcıya gösterilecek cross-sell metni
    ctaLabel: string     // Buton yazısı
}

/** slug → next tool mapping */
export const nextToolMap: Record<string, NextToolLink> = {
    // ── Finance Tools ────────────────────────
    'roas-calculator': {
        slug: 'return-cost-calculator',
        message: 'ROAS\'ınızı hesapladınız. Peki iadelerin bu kârı nasıl erittiğini biliyor musunuz?',
        ctaLabel: 'İade Maliyeti Analizörüne Geç',
    },
    'break-even-roas': {
        slug: 'bfcm-planner',
        message: 'Başa baş noktanızı biliyorsunuz. Peki BFCM indirimlerinde bu marjı nasıl koruyacaksınız?',
        ctaLabel: 'BFCM Kâr Planlayıcıya Geç',
    },
    'profit-simulator': {
        slug: 'inventory-holding-cost',
        message: 'Kârınızı simüle ettiniz. Peki depodaki ürünlerin size gizli maliyetini gördünüz mü?',
        ctaLabel: 'Stok Maliyeti Hesaplayıcıya Geç',
    },
    'return-cost-calculator': {
        slug: 'cltv-calculator',
        message: 'İade maliyetinizi hesapladınız. Peki karlı müşterileri elde tutmanın değerini biliyor musunuz?',
        ctaLabel: 'Müşteri Yaşam Boyu Değeri Hesapla',
    },
    'cltv-calculator': {
        slug: 'email-marketing-roi',
        message: 'Müşteri değerinizi biliyorsunuz. Peki e-posta pazarlamasıyla bu değeri nasıl artırırsınız?',
        ctaLabel: 'E-posta ROI Hesaplayıcıya Geç',
    },
    'breakeven-calculator': {
        slug: 'profit-simulator',
        message: 'Başa baş noktanızı buldunuz. Şimdi farklı senaryolarda kârınızı simüle edin.',
        ctaLabel: 'Kâr Simülatörüne Geç',
    },
    'bfcm-planner': {
        slug: 'bfcm-discount-planner',
        message: 'BFCM kâr planınızı yaptınız. Peki indirim oranlarınız doğru mu?',
        ctaLabel: 'İndirim Simülatörüne Geç',
    },

    // ── Marketing Tools ──────────────────────
    'cpm-cpc-calculator': {
        slug: 'roas-calculator',
        message: 'CPC ve CPM\'inizi hesapladınız. Peki toplam reklam harcamanız kâr getiriyor mu?',
        ctaLabel: 'ROAS Hesaplayıcıya Geç',
    },
    'influencer-roi-calculator': {
        slug: 'cpm-cpc-calculator',
        message: 'Influencer ROI\'nizi hesapladınız. Peki kendi reklam kampanyalarınız daha mı verimli?',
        ctaLabel: 'CPM/CPC Hesaplayıcıya Geç',
    },
    'email-marketing-roi': {
        slug: 'conversion-rate-impact',
        message: 'E-posta ROI\'nizi gördünüz. Peki dönüşüm oranınızı %1 artırmanın etkisini biliyor musunuz?',
        ctaLabel: 'CRO Etkisi Hesaplayıcıya Geç',
    },
    'conversion-rate-impact': {
        slug: 'tiktok-vs-meta-cost',
        message: 'Dönüşüm oranı etkisini hesapladınız. Peki hangi platform size daha ucuza müşteri getiriyor?',
        ctaLabel: 'TikTok vs Meta Karşılaştırıcıya Geç',
    },
    'tiktok-vs-meta-cost': {
        slug: 'roas-calculator',
        message: 'Platform karşılaştırmanızı yaptınız. Şimdi genel ROAS\'ınızı hesaplayın.',
        ctaLabel: 'ROAS Hesaplayıcıya Geç',
    },

    // ── Operations Tools ─────────────────────
    'stripe-paypal-fee-calculator': {
        slug: 'product-pricing-calculator',
        message: 'Ödeme komisyonlarınızı hesapladınız. Peki fiyatlarınız bu maliyetleri karşılıyor mu?',
        ctaLabel: 'Fiyatlama Hesaplayıcıya Geç',
    },
    'product-pricing-calculator': {
        slug: 'bundle-profit-calculator',
        message: 'Fiyatlarınızı optimize ettiniz. Peki ürünleri bundle yaparak marjınızı artırabilir misiniz?',
        ctaLabel: 'Bundle Kâr Hesaplayıcıya Geç',
    },
    'bundle-profit-calculator': {
        slug: 'dropshipping-profit-calc',
        message: 'Bundle kârınızı hesapladınız. Dropshipping modeline geçseniz kâr ne olur?',
        ctaLabel: 'Dropshipping Kâr Hesaplayıcıya Geç',
    },
    'dropshipping-profit-calc': {
        slug: 'stripe-paypal-fee-calculator',
        message: 'Dropshipping kârınızı gördünüz. Peki ödeme komisyonları kârınızdan ne kadar yiyor?',
        ctaLabel: 'Komisyon Hesaplayıcıya Geç',
    },
    'inventory-holding-cost': {
        slug: 'breakeven-calculator',
        message: 'Stok maliyetinizi hesapladınız. Bu maliyetle kaç satış yapmanız gerekiyor?',
        ctaLabel: 'Başa Baş Hesaplayıcıya Geç',
    },
    'bfcm-discount-planner': {
        slug: 'profit-simulator',
        message: 'İndirim simülasyonunuzu yaptınız. Şimdi genel kâr durumunuzu simüle edin.',
        ctaLabel: 'Kâr Simülatörüne Geç',
    },
}

/** Get the next tool suggestion for a given slug */
export function getNextTool(slug: string): NextToolLink | null {
    return nextToolMap[slug] ?? null
}
