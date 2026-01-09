import { createClient } from '@/utils/supabase/client'

// Anomali Kontrol Fonksiyonu
export const runNotificationEngine = async (currentRevenue: number, currentExpense: number, netProfit: number) => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  // --- YENİ EKLENEN KISIM: KULLANICI TERCİHİ KONTROLÜ ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('notify_anomalies')
    .eq('id', user.id)
    .single()

  // Eğer kullanıcı anomali bildirimlerini kapattıysa, motoru durdur.
  if (profile && profile.notify_anomalies === false) {
    return 
  }

  // --- TARİH ARALIKLARINI BELİRLE ---
  const now = new Date()
  
  // Bu Ayın Başı ve Sonu
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
  
  // Geçen Ayın Başı ve Sonu
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  // --- KATEGORİ BAZLI HARCAMALARI ÇEK ---
  // Helper: Belirli bir tarih aralığında ve kategorideki toplam gideri çeker
  const getCategoryTotal = async (category: string, start: string, end: string) => {
    const { data } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .ilike('category', category) // 'Lojistik', 'Kargo' vb.
      .gte('date', start)
      .lte('date', end)
    
    // Topla
    return data?.reduce((sum, item) => sum + item.amount, 0) || 0
  }

  // 1. KARGO / LOJİSTİK ANALİZİ
  const thisMonthLogistic = await getCategoryTotal('%Lojistik%', thisMonthStart, thisMonthEnd)
  const lastMonthLogistic = await getCategoryTotal('%Lojistik%', lastMonthStart, lastMonthEnd)

  // 2. REKLAM / PAZARLAMA ANALİZİ
  const thisMonthMarketing = await getCategoryTotal('%Pazarlama%', thisMonthStart, thisMonthEnd)
  const lastMonthMarketing = await getCategoryTotal('%Pazarlama%', lastMonthStart, lastMonthEnd)


  // --- ANOMALİ KONTROLLERİ VE BİLDİRİM OLUŞTURMA ---
  const createAlert = async (title: string, message: string, type: 'warning' | 'danger') => {
    // Aynı gün içinde aynı başlıkla bildirim atılmış mı kontrol et (Spam önleme)
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('notifications')
      .select('*')
      .eq('title', title)
      .gte('created_at', today)
    
    if (existing && existing.length > 0) return // Zaten uyarılmış

    // Bildirimi Kaydet
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: title,
      message: message,
      is_read: false,
      type: type // DB'de type sütunu yoksa meta data gibi düşünebiliriz, şimdilik title/message yeterli
    })
  }

  // KURAL 1: KARGO MALİYETİ SAPMASI (> %20)
  // Sadece kayda değer tutarlar varsa (örn: 1000 TL üzeri) kontrol et
  if (lastMonthLogistic > 1000) {
    const logisticChange = ((thisMonthLogistic - lastMonthLogistic) / lastMonthLogistic) * 100
    if (logisticChange > 20) {
       await createAlert(
         "⚠️ Kargo Maliyetinde Anomali",
         `Lojistik giderleriniz geçen aya göre %${logisticChange.toFixed(0)} arttı. Beklenmedik bir artış olabilir, kargo faturalarını kontrol edin.`,
         'danger'
       )
    }
  }

  // KURAL 2: REKLAM GİDERİ SAPMASI (> %30)
  if (lastMonthMarketing > 1000) {
    const marketingChange = ((thisMonthMarketing - lastMonthMarketing) / lastMonthMarketing) * 100
    if (marketingChange > 30) {
       await createAlert(
         "📢 Reklam Bütçesi Uyarısı",
         `Pazarlama harcamalarınız %${marketingChange.toFixed(0)} yükseldi. Bu artışın satışlara yansıyıp yansımadığını kontrol edin.`,
         'warning'
       )
    }
  }

  // KURAL 3: KÂR MARJI DÜŞÜŞÜ (Kritik)
  // (Bu kısım zaten SmartSummary'de var ama bildirim olarak da düşmesi iyidir)
  if (currentRevenue > 0) {
      const margin = (netProfit / currentRevenue) * 100
      if (margin < 10 && margin > 0) {
          await createAlert(
              "📉 Kritik Kâr Marjı",
              `Net kâr marjınız %${margin.toFixed(1)} seviyesine geriledi. %10'un altı riskli bölgedir.`,
              'danger'
          )
      }
  }
}