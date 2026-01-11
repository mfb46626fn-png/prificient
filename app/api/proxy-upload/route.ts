import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    // .env.local dosyasındaki ayarları alıyoruz
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
    const n8nSecret = process.env.NEXT_PUBLIC_N8N_SECRET

    if (!n8nUrl) {
      return NextResponse.json({ error: 'N8N URL tanımlı değil' }, { status: 500 })
    }

    // n8n'e sunucudan sunucuya (Server-to-Server) istek atıyoruz
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'x-webhook-secret': n8nSecret || '',
      },
      body: formData,
    })

    if (!response.ok) {
        const errorText = await response.text()
        console.error('N8N Hatası:', errorText)
        return NextResponse.json({ error: 'N8N tarafında hata oluştu', details: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Proxy Hatası:', error)
    return NextResponse.json({ error: 'Sunucu tarafında işlem hatası' }, { status: 500 })
  }
}