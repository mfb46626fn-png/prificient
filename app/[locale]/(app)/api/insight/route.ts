import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 1. Kullanıcıyı doğrula
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Senin o süper SQL fonksiyonunu çağır (Tüm veriyi çeker)
    // get_ai_full_context fonksiyonunu kullanıyoruz, zaten yazmıştık.
    const { data: context, error } = await supabase.rpc('get_ai_full_context', { 
        target_user_id: user.id 
    })

    if (error) throw error

    // 3. Mini-AI'a Analiz Ettir (Hızlı model kullanıyoruz: gpt-4o-mini)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Çok hızlı ve ucuz
      response_format: { type: "json_object" }, // Kesin JSON döner
      messages: [
        {
          role: "system",
          content: `Sen bir finansal dashboard bileşenisin. Görevin veriyi analiz edip JSON formatında durum özeti çıkarmak.
          
          KURALLAR:
          1. Başlık: 3-4 kelimelik, durumu özetleyen çarpıcı bir başlık. (Örn: "Nakit Akışı Dengeli", "Stok Riski Var", "Harika İlerleme")
          2. Mesaj: Kullanıcıya ne yapması gerektiğini söyleyen, motive edici veya uyarıcı 1-2 cümle.
          3. Sentiment: Durumun rengini belirle. Sadece şunlardan biri olabilir: 'positive' (İyi/Yeşil), 'warning' (Dikkat/Sarı), 'critical' (Kötü/Kırmızı).
          4. Veri yoksa veya yeniyse motive et.

          ÇIKTI FORMATI (JSON):
          {
            "title": "...",
            "message": "...",
            "sentiment": "positive" | "warning" | "critical"
          }`
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ]
    })

    const insight = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json(insight)

  } catch (error) {
    console.error('Insight Error:', error)
    // Hata olursa varsayılan dön
    return NextResponse.json({
        title: "Analiz Hazırlanıyor",
        message: "Verilerinizi işliyoruz, kısa süre içinde güncel durumunuz burada belirecek.",
        sentiment: "neutral"
    })
  }
}