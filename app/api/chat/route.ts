import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // 1. KİMLİK DOĞRULAMA
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await req.json()

    // 2. VERİ TOPLAMA (HAM VERİ)
    const [profileData, transactionsData, expensesData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(50), // Son 50 işlem yeterli
      supabase.from('expenses').select('*').eq('user_id', user.id)
    ])

    const databaseDump = {
      user_profile: profileData.data,
      transaction_history: transactionsData.data,
      fixed_expenses: expensesData.data,
      meta: {
        currency: 'TRY',
        today: new Date().toISOString().split('T')[0]
      }
    }

    // 3. SİSTEM İSTEMİ (YENİ CFO PERSONASI)
    const systemPrompt = `
      GÖREV:
      Sen Prificient kullanıcılarının "Finansal Direktörü (CFO)"sün.
      Eline ham veriler (JSON) gelecek. Sen bu veriyi işleyip, yönetici özeti (Executive Summary) formatında sunacaksın.

      KURALLAR VE ÜSLUP:
      1. **ASLA** teknik terim kullanma (tablo, row, database, JSON, type değeri vb. YASAK).
      2. **ASLA** hesaplama yöntemini açıklama ("Şunu şununla topladım" deme). Sadece sonucu söyle.
      3. **MİNİMALİST OL:** Uzun paragraflar yazma. Maddeler, emojiler ve kalın yazılar (**Bold**) kullan.
      4. **ŞABLON KULLAN:** Kullanıcı "Durumum ne?" dediğinde aşağıdaki formatı kullan:

      ---
      📉 **Net Durum:** [Tutar] [Para Birimi]
      
      📊 **Özet Tablo:**
      • Toplam Gelir: [Tutar]
      • Toplam Gider: [Tutar]
      • Kâr Marjı: %[Oran]

      💡 **Tespit:** [Tek cümlelik en önemli içgörü. Örn: "Sabit giderleriniz çok yüksek, acil satış lazım."]
      ---

      5. **HESAPLAMA MANTIĞI:**
         - Gelir = 'transaction_history' içindeki (income) tipleri.
         - Gider = 'transaction_history' içindeki (expense) + 'fixed_expenses' içindeki tüm kalemler.
         - Eğer gelir 0 ise bunu net bir şekilde belirt ("Henüz gelir akışı başlamamış").

      MEVCUT VERİLER:
      ${JSON.stringify(databaseDump)}
    `

    // 4. OpenAI ÇAĞRISI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.3, // Biraz daha tutarlı olması için düşük sıcaklık
    })

    return NextResponse.json({ response: completion.choices[0].message.content })

  } catch (error) {
    console.error('AI Error:', error)
    return NextResponse.json({ error: 'AI servisinde hata oluştu.' }, { status: 500 })
  }
}