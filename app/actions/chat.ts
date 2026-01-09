'use server'

import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getAIResponse(userMessage: string) {
  try {
    // 1. Kullanıcının Finansal Verilerini Çek (Context)
    const supabase = await createClient()
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(50) // Son 50 işlemi baz al

    // 2. Basit bir özet çıkar (AI anlasın diye)
    const totalIncome = transactions
      ?.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const totalExpense = transactions
      ?.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const balance = totalIncome - totalExpense

    // Veriyi metne döküyoruz
    const financialContext = `
      Kullanıcı Bakiyesi: ${balance} TL.
      Toplam Gelir: ${totalIncome} TL.
      Toplam Gider: ${totalExpense} TL.
      Son İşlemler: ${JSON.stringify(transactions?.map(t => `${t.date}: ${t.description} (${t.amount} TL)`).slice(0, 10))}
    `

    // 3. OpenAI'a Gönder
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Veya 'gpt-3.5-turbo'
      messages: [
        {
          role: 'system',
          content: `Sen Prificient adında yardımcı bir finansal asistansın. 
          Kullanıcının finansal verileri şunlar: ${financialContext}. 
          Bu verilere dayanarak kullanıcının sorularını samimi, kısa ve Türkçe cevapla. 
          Asla finansal tavsiye (yatırım tavsiyesi) verme, sadece durumu analiz et.`,
        },
        { role: 'user', content: userMessage },
      ],
    })

    return completion.choices[0].message.content || 'Bir cevap oluşturulamadı.'

  } catch (error) {
    console.error('AI Hatası:', error)
    return 'Üzgünüm, şu an bağlantı kuramıyorum. API anahtarını kontrol eder misin?'
  }
}