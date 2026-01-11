import { createClient } from '@/utils/supabase/client'

// DB ile uyumlu tipler
type NotificationType = 'info' | 'success' | 'warning' | 'alert' | 'ai_insight'

export const runNotificationEngine = async (totalRevenue: number, totalExpense: number, netProfit: number) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // 1. KULLANICI TERCİHİ KONTROLÜ
  // Eğer 'profiles' tablosunda bu sütun yoksa hata vermemesi için try-catch veya opsiyonel zincirleme
  try {
    const { data: profile } = await supabase
        .from('profiles')
        .select('notify_anomalies')
        .eq('id', user.id)
        .single()

    if (profile && profile.notify_anomalies === false) {
        return 
    }
  } catch (error) {
    // Sütun yoksa veya hata varsa varsayılan olarak devam et
  }

  // --- YARDIMCI: BİLDİRİM OLUŞTURUCU (SPAM KORUMALI) ---
  const createUniqueNotification = async (title: string, message: string, type: NotificationType) => {
    // Son 24 saat içinde aynı başlıkla bildirim atılmış mı?
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('title', title)
      .gte('created_at', yesterday.toISOString())
      .maybeSingle() // single() yerine maybeSingle() hata riskini azaltır
    
    if (!existing) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title,
        message,
        type, // DB Check Constraint'e uygun tip
        is_read: false
      })
    }
  }

  // --- BÖLÜM 1: GENEL FİNANSAL SAĞLIK (Props'tan gelen verilerle) ---
  
  // A. ZARAR UYARISI (Kritik)
  if (netProfit < 0) {
    await createUniqueNotification(
      'Zarar Uyarısı 📉',
      `Dikkat! Giderleriniz gelirlerinizden fazla (Net: ${netProfit.toLocaleString('tr-TR')} TL). Sabit giderleri gözden geçirin.`,
      'alert' // DB'deki karşılığı 'alert' (danger yok)
    )
  }

  // B. DÜŞÜK KÂR MARJI
  if (totalRevenue > 0) {
    const margin = (netProfit / totalRevenue) * 100
    if (margin < 15 && margin > 0) {
        await createUniqueNotification(
            'Düşük Kâr Marjı ⚠️',
            `Kâr marjınız %${margin.toFixed(1)} seviyesine geriledi. Sağlıklı büyüme için fiyatlandırmanızı kontrol edin.`,
            'warning'
        )
    }
  }

  // C. AI INSIGHT (Yüksek Burn Rate)
  if (totalRevenue > 0 && totalExpense > (totalRevenue * 0.85)) {
      await createUniqueNotification(
          'AI Finansal Tespit 🤖',
          'Gelirinizin %85\'inden fazlası gidere harcanıyor. Nakit akışını yönetmek zorlaşabilir.',
          'ai_insight'
      )
  }

  // --- BÖLÜM 2: KATEGORİ ANOMALİLERİ (DB Sorgusu ile) ---
  
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  // Helper: Kategori Toplamı
  const getCategoryTotal = async (categoryPattern: string, start: string, end: string) => {
    // Hem 'expenses' (sabit) hem 'transactions' (değişken) tablolarına bakmak daha doğrudur
    // Şimdilik senin kodundaki gibi expenses üzerinden gidiyoruz
    const { data } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .ilike('category', categoryPattern) 
      .gte('date', start)
      .lte('date', end)
    
    return data?.reduce((sum, item) => sum + item.amount, 0) || 0
  }

  // 1. KARGO / LOJİSTİK ANALİZİ
  const thisMonthLogistic = await getCategoryTotal('%Lojistik%', thisMonthStart, thisMonthEnd)
  const lastMonthLogistic = await getCategoryTotal('%Lojistik%', lastMonthStart, lastMonthEnd)

  if (lastMonthLogistic > 1000) {
    const logisticChange = ((thisMonthLogistic - lastMonthLogistic) / lastMonthLogistic) * 100
    // %20 artış varsa uyar
    if (logisticChange > 20) {
       await createUniqueNotification(
         "Kargo Maliyetinde Anomali 📦",
         `Lojistik giderleriniz geçen aya göre %${logisticChange.toFixed(0)} arttı. Beklenmedik bir artış olabilir.`,
         'warning'
       )
    }
  }

  // 2. REKLAM / PAZARLAMA ANALİZİ
  const thisMonthMarketing = await getCategoryTotal('%Pazarlama%', thisMonthStart, thisMonthEnd)
  const lastMonthMarketing = await getCategoryTotal('%Pazarlama%', lastMonthStart, lastMonthEnd)

  if (lastMonthMarketing > 1000) {
    const marketingChange = ((thisMonthMarketing - lastMonthMarketing) / lastMonthMarketing) * 100
    // %30 artış varsa uyar
    if (marketingChange > 30) {
       await createUniqueNotification(
         "Reklam Bütçesi Uyarısı 📢",
         `Pazarlama harcamalarınız %${marketingChange.toFixed(0)} yükseldi. ROI (Geri Dönüş) analizi yapmanızı öneririz.`,
         'ai_insight'
       )
    }
  }
}