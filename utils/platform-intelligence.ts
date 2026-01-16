import { StoreSettings } from '@/types/store_settings';

// GERÇEK DÜNYA VERİLERİ (2024-2025 STANDARTLARI)

type PlatformRules = {
    name: string;
    commission_rate: number; // Ana Komisyon (Pazaryeri Kesintisi)
    transaction_fee_rate: number; // Altyapı Ücreti
    payment_processor_fee_rate: number; // Ödeme Yöntemi (Iyzico, PayTR vb.)
    fixed_fee: number; // İşlem başı sabit ücret (TL)
    description: string;
}

const PLATFORM_DATA: Record<string, PlatformRules> = {
    shopify: {
        name: 'Shopify',
        // Shopify Basic Plan (%2) - Bu değişmez, Shopify keser.
        commission_rate: 0.02,
        transaction_fee_rate: 0,
        // Varsayılan Ödeme Yöntemi: Iyzico/Stripe Ortalaması (%2.9)
        payment_processor_fee_rate: 0.029,
        fixed_fee: 3.00,
        description: 'Shopify Basic (%2) + Ödeme Altyapısı'
    },
    trendyol: {
        name: 'Trendyol',
        // Kategoriye göre değişir, ortalama %21 güvenli liman + Hizmet Bedeli
        commission_rate: 0.21,
        transaction_fee_rate: 0,
        payment_processor_fee_rate: 0, // Trendyol kendi öder
        fixed_fee: 5.00, // Teknoloji/Hizmet bedeli vb.
        description: 'Kategori Ortalaması (%21) + Hizmet Bedeli'
    },
    amazon: {
        name: 'Amazon',
        // Referral Fee (Ortalama %15)
        commission_rate: 0.15,
        transaction_fee_rate: 0,
        payment_processor_fee_rate: 0,
        fixed_fee: 0,
        description: 'Referral Fee (%15)'
    },
    etsy: {
        name: 'Etsy',
        // Transaction (%6.5) + Payment (%6.5 + sabit) + Listing ($0.20 ~7TL)
        commission_rate: 0.065,
        transaction_fee_rate: 0,
        payment_processor_fee_rate: 0.065,
        fixed_fee: 15.00, // Listing + Fixed Payment (~$0.20 + 3TL)
        description: 'Transaction (%6.5) + Payment (%6.5) + Listing'
    },
    hepsiburada: {
        name: 'Hepsiburada',
        commission_rate: 0.20,
        transaction_fee_rate: 0,
        payment_processor_fee_rate: 0,
        fixed_fee: 4.00,
        description: 'Pazaryeri Komisyonu (%20) + İşlem'
    },
    manual: {
        name: 'Manuel',
        commission_rate: 0,
        transaction_fee_rate: 0,
        payment_processor_fee_rate: 0,
        fixed_fee: 0,
        description: 'Manuel Giriş'
    }
}

export function estimatePlatformFees(platformName: string, totalAmount: number, userSettings?: StoreSettings) {
    const key = platformName?.toLowerCase().trim() || 'shopify'

    // Platformu bulamazsa Shopify varsay
    const rule = PLATFORM_DATA[key] || PLATFORM_DATA['shopify']

    // 1. Ana Komisyon (Pazaryeri / Shopify Kesintisi)
    const commission = totalAmount * rule.commission_rate

    // 2. Altyapı/İşlem Ücreti
    const transactionFee = totalAmount * rule.transaction_fee_rate

    // 3. Ödeme Altyapısı (User Settings Varsa Oradan Al)
    let paymentRate = rule.payment_processor_fee_rate
    let fixedPaymentFee = rule.fixed_fee

    // Eğer kullanıcı ayarları varsa ve bu Shopify/Woocommerce gibi kendi ödeme altyapımızı kullandığımız bir yerse:
    // Pazar yerlerinde (Trendyol, Amazon) genelde ödeme komisyonu dahil olur veya ayrı hesaplanmaz.
    // Ancak Shopify/Woocommerce/Manuel satışlarda POS komisyonu önemlidir.
    const isOwnInfrastructure = ['shopify', 'woocommerce', 'manual'].includes(key)

    if (userSettings && isOwnInfrastructure) {
        // Aktif ödeme yöntemini bul
        const activeGatewayKey = Object.keys(userSettings.payment_gateways).find(k => userSettings.payment_gateways[k].active)

        if (activeGatewayKey) {
            const gatewayInfo = userSettings.payment_gateways[activeGatewayKey]
            // Rate % cinsinden geliyor (2.99 gibi), 100'e bölmeliyiz.
            // Fakat mevcut sistemde 0.029 olarak tutuluyor olabilir mi? 
            // OnboardingPage'de: rate: 2.99 olarak initialize ediliyor.
            // Bu fonksiyonda ise 0.029 kullanılıyor.
            // DÖNÜŞÜM YAPILMALI: rate / 100
            paymentRate = gatewayInfo.rate / 100
            fixedPaymentFee = gatewayInfo.fixed
        }
    }

    const paymentFee = (totalAmount * paymentRate)

    // 4. Sabit Giderler
    const fixed = fixedPaymentFee

    const totalFee = commission + transactionFee + paymentFee + fixed

    // Açıklama Metni Oluştur
    let desc = rule.description
    if (userSettings && isOwnInfrastructure) {
        desc = `${rule.name} Plan (%${(rule.commission_rate * 100).toFixed(0)}) + POS (${(paymentRate * 100).toFixed(2)}%)`
    }

    return {
        estimatedFee: parseFloat(totalFee.toFixed(2)),
        breakdown: desc,
        isGuess: !userSettings // Eğer user settings varsa "tahmin" değil, "hesaplama"dır.
    }
}

export function analyzeProfitRisk(cost: number, price: number, fees: number) {
    // Fees (Platform + Kargo + Reklam)
    const profit = price - cost - fees
    const margin = price > 0 ? (profit / price) * 100 : 0

    if (margin < 0) return { level: 'critical', msg: 'ZARAR EDİYORSUNUZ' }
    if (margin < 10) return { level: 'critical', msg: 'Çok Riskli (%10 Altı)' }
    if (margin < 25) return { level: 'medium', msg: 'Dikkatli Olun (%10-25)' }
    return { level: 'safe', msg: 'Güvenli Bölge' }
}