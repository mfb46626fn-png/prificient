// utils/platform-intelligence.ts

// GERÇEK DÜNYA VERİLERİ (2024-2025 STANDARTLARI)

type PlatformRules = {
    name: string;
    commission_rate: number; // Ana Komisyon
    transaction_fee_rate: number; // İşlem/Altyapı Ücreti
    payment_processor_fee_rate: number; // Ödeme Yöntemi (Iyzico/Stripe)
    fixed_fee: number; // İşlem başı sabit ücret (TL)
    description: string;
}

const PLATFORM_DATA: Record<string, PlatformRules> = {
    shopify: {
        name: 'Shopify',
        // Shopify Basic Plan (%2) + Iyzico/Stripe Ortalaması (%2.9)
        commission_rate: 0.02, 
        transaction_fee_rate: 0, 
        payment_processor_fee_rate: 0.029, 
        fixed_fee: 3.00, // Iyzico işlem başı yaklaşık maliyet
        description: 'Shopify Basic (%2) + Ödeme Altyapısı (%2.9 + 3₺)'
    },
    trendyol: {
        name: 'Trendyol',
        // Kategoriye göre değişir, ortalama %21 güvenli liman + Hizmet Bedeli
        commission_rate: 0.21,
        transaction_fee_rate: 0,
        payment_processor_fee_rate: 0,
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

export function estimatePlatformFees(platformName: string, totalAmount: number) {
    const key = platformName?.toLowerCase().trim() || 'shopify'
    
    // Platformu bulamazsa Shopify varsay
    const rule = PLATFORM_DATA[key] || PLATFORM_DATA['shopify'] 

    // 1. Ana Komisyon (Satış Fiyatı üzerinden)
    const commission = totalAmount * rule.commission_rate

    // 2. Altyapı/İşlem Ücreti
    const transactionFee = totalAmount * rule.transaction_fee_rate

    // 3. Ödeme Altyapısı (Genelde Toplam Tutar üzerinden)
    const paymentFee = totalAmount * rule.payment_processor_fee_rate

    // 4. Sabit Giderler
    const fixed = rule.fixed_fee

    const totalFee = commission + transactionFee + paymentFee + fixed
    
    return {
        estimatedFee: parseFloat(totalFee.toFixed(2)),
        breakdown: rule.description,
        isGuess: true
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