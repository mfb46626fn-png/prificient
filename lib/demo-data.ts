export const DEMO_DATA = {
    profile: {
        id: 'demo-user',
        full_name: 'Demo Kullanıcı',
        username: 'demo_store',
        email: 'demo@prificient.com'
    },
    store_settings: {
        store_name: 'Demo Mağaza',
        currency: 'TRY',
        timezone: 'Europe/Istanbul'
    },
    metrics: {
        revenue: 145250.00,
        expenses: 42350.50,
        equity: 102899.50,
        loading: false,
        connected: true
    },
    decisions: [
        {
            id: 1,
            title: 'Reklam Bütçesi Artışı',
            description: 'ROAS değeriniz 4.5 seviyesine ulaştı. Günlük bütçeyi %20 artırmanız öneriliyor.',
            date: 'Bugün',
            type: 'suggestion'
        },
        {
            id: 2,
            title: 'Stok Uyarısı',
            description: '"Premium Deri Çanta" ürününün stoğu kritik seviyenin (5 adet) altına düştü.',
            date: 'Dün',
            type: 'warning'
        }
    ],
    integration: {
        status: 'active',
        last_sync: '10 dakika önce',
        platform: 'shopify',
        shop_url: 'demo-store.myshopify.com'
    },
    activities: [
        { id: 1, type: 'order', message: 'Yeni Sipariş #1024', amount: '1.250,00 ₺', time: '5 dk önce', status: 'positive' },
        { id: 2, type: 'expense', message: 'Facebook Ads Harcaması', amount: '-450,00 ₺', time: '1 saat önce', status: 'negative' },
        { id: 3, type: 'order', message: 'Yeni Sipariş #1023', amount: '890,50 ₺', time: '2 saat önce', status: 'positive' },
        { id: 4, type: 'system', message: 'Günlük Veri Senkronizasyonu', amount: '', time: '09:00', status: 'neutral' },
        { id: 5, type: 'expense', message: 'Shopify Uygulama Ücreti', amount: '-29.00 $', time: 'Dün', status: 'negative' }
    ]
}
