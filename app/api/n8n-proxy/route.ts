import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // n8n Webhook URL'ini buraya yaz (Production URL olduğundan emin ol)
    const N8N_URL = 'https://mcakar.app.n8n.cloud/webhook/financial-data'

    // Kendi sunucumuzdan n8n'e isteği iletiyoruz (Burada CORS hatası olmaz)
    const response = await fetch(N8N_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `n8n hatası: ${response.statusText}` },
        { status: response.status }
      )
    }

    // n8n'den gelen cevabı (örneğin JSON verisini) alıp frontend'e dönelim
    const data = await response.text() // veya .json() eğer n8n JSON dönüyorsa
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Proxy Hatası:', error)
    return NextResponse.json(
      { error: 'Dosya n8n\'e iletilemedi.' },
      { status: 500 }
    )
  }
}