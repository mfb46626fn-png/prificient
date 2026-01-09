// utils/demoData.ts

export const DEMO_DATA = {
  totalRevenue: 185400,
  totalExpense: 112350,
  netProfit: 73050,
  margin: "39.4",
  
  // Son İşlemler (Karma)
  transactions: [
    { id: '1', date: '2025-12-25', description: 'Shopify Satış #1024', amount: 4500, category: 'Satış', type: 'revenue' },
    { id: '2', date: '2025-12-25', description: 'Facebook Ads Harcaması', amount: 1200, category: 'Pazarlama', type: 'expense' },
    { id: '3', date: '2025-12-24', description: 'Trendyol Hakediş', amount: 12400, category: 'Satış', type: 'revenue' },
    { id: '4', date: '2025-12-24', description: 'MNG Kargo Ödemesi', amount: 3400, category: 'Lojistik', type: 'expense' },
    { id: '5', date: '2025-12-23', description: 'Amazon US Satışları', amount: 8500, category: 'Satış', type: 'revenue' },
    { id: '6', date: '2025-12-23', description: 'AWS Sunucu Ücreti', amount: 450, category: 'Yazılım', type: 'expense' },
    { id: '7', date: '2025-12-22', description: 'Etsy Satış Geliri', amount: 3200, category: 'Satış', type: 'revenue' },
    { id: '8', date: '2025-12-21', description: 'Grafik Tasarım (Freelance)', amount: 2000, category: 'Hizmet', type: 'expense' },
    { id: '9', date: '2025-12-20', description: 'Stok Alımı (Tedarikçi A)', amount: 15000, category: 'Ürün Maliyeti', type: 'expense' },
    { id: '10', date: '2025-12-19', description: 'Hepsiburada Satış', amount: 6700, category: 'Satış', type: 'revenue' },
  ],

  // Kategori Bazlı Giderler (Pie Chart için)
  expensesByCategory: [
    { name: 'Ürün Maliyeti', value: 45000, type: 'expense', category: 'Ürün Maliyeti' },
    { name: 'Pazarlama', value: 25000, type: 'expense', category: 'Pazarlama' },
    { name: 'Lojistik', value: 15000, type: 'expense', category: 'Lojistik' },
    { name: 'Yazılım/Hizmet', value: 5000, type: 'expense', category: 'Yazılım' },
    { name: 'Vergi/Resmi', value: 22350, type: 'expense', category: 'Vergi' },
  ]
}