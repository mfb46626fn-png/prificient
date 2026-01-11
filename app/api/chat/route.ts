import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // 1. KİMLİK DOĞRULAMA (Güvenlik Duvarı)
    // Sadece giriş yapmış kullanıcılar n8n'i tetikleyebilir.
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Frontend'den gelen mesajı al
    const body = await req.json()
    const { message } = body

    // 2. n8n BAĞLANTISI (Proxy)
    // Buraya n8n'deki Webhook URL'ini yapıştıracaksın.
    // Örn: https://webhook.prificient.com/webhook/ai-chat
    const N8N_WEBHOOK_URL = process.env.N8N_AI_WEBHOOK_URL || 'BURAYA_N8N_WEBHOOK_URL_YAZILACAK'

    // n8n'e veriyi gönderiyoruz
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,   // Kullanıcının sorusu
        user_id: user.id    // n8n bu ID ile Supabase'den veriyi çekecek ve hafıza tutacak
      })
    })

    if (!n8nResponse.ok) {
      console.error('n8n Hatası:', n8nResponse.statusText)
      throw new Error('AI servisine bağlanılamadı')
    }

    // 3. YANITI DÖNDÜR
    // n8n'den dönen JSON şuna benzer olmalı: { "output": "Merhaba..." }
    const data = await n8nResponse.json()

    return NextResponse.json(data)

  } catch (error) {
    console.error('AI Proxy Error:', error)
    return NextResponse.json({ error: 'İşlem başarısız oldu.' }, { status: 500 })
  }
}