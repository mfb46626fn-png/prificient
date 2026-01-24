export const PLANS = {
    CLEAR: {
        id: 'plan_clear',
        name: 'CLEAR',
        price: 299,
        intervention_level: 'monitor',
        description: 'Düşük riskli işletmeler için temel izleme protokolü.',
        target_score_max: 30, // 0-30
        features: [
            'Temel Risk Göstergesi',
            'Günlük Özet',
            'Manuel Veri Kontrolü'
        ],
        specs: {
            platform_count: 1,
            history_months: 3,
            advanced_simulation: false
        }
    },
    CONTROL: {
        id: 'plan_control',
        name: 'CONTROL',
        price: 899,
        intervention_level: 'diagnose',
        description: 'Orta seviye risk ve hacim için teşhis ve kontrol mekanizması.',
        target_score_max: 80, // 31-80
        features: [
            'Detaylı Finansal Otopsi',
            'Otomatik Kaçak Tespiti',
            'Dinamik Uyarı Sistemi',
            'Haftalık Kriz Raporu'
        ],
        specs: {
            platform_count: 3,
            history_months: 12,
            advanced_simulation: true
        }
    },
    VISION: {
        id: 'plan_vision',
        name: 'VISION',
        price: 1999,
        intervention_level: 'intervene',
        description: 'Yüksek hacim ve kritik riskler için tam kapsamlı müdahale.',
        target_score_max: 100, // 81-100
        features: [
            'Gerçek Zamanlı Simülasyon',
            'CFO Düzeyinde Karar Destek',
            'Yapay Zeka Müdahale Önerileri',
            '7/24 Kesintisiz Takip'
        ],
        specs: {
            platform_count: 10,
            history_months: 24,
            advanced_simulation: true
        }
    }
} as const;

export type PlanLevel = keyof typeof PLANS;
export type PlanId = typeof PLANS[PlanLevel]['id'];
