import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message } = await req.json()

    // --- BETA / PAKET KONTROLÜ ---
    // Şu an BETA olduğu için herkese izin veriyoruz.
    // İlerde buraya: if (user.plan === 'free' && usage > 5) throw Error('Limit Doldu')
    const IS_BETA = true; 
    
    if (!IS_BETA) {
        // Burada paket kontrolü yapılacak
        // const usage = await supabase.from('ai_chat_history').select('*', { count: 'exact' }).eq('user_id', user.id)...
    }

    // Kullanımı Kaydet (Loglama)
    await supabase.from('ai_chat_history').insert({
        user_id: user.id,
        message: message
    })

    // n8n'e Gönder
    const N8N_WEBHOOK_URL = process.env.N8N_AI_WEBHOOK_URL
    const response = await fetch(N8N_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, user_id: user.id })
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json({ error: 'AI Servisi Meşgul' }, { status: 500 })
  }
}