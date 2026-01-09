'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- İŞLEM EKLEME ---
export async function addTransactionAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.' }
  }

  const type = formData.get('type') as string
  const amount = formData.get('amount')
  const category = formData.get('category') as string 
  const description = formData.get('description') as string
  const date = formData.get('date') as string

  // Tarih Kontrolü (Gelecek tarih engelleme)
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (selectedDate > today) {
    return { error: 'Geleceğe yönelik işlem girilemez.' }
  }

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type,
    amount: Number(amount),
    category,
    description,
    date,
  })

  if (error) {
    console.error('Ekleme hatası:', error)
    return { error: 'İşlem eklenirken bir hata oluştu.' }
  }

  revalidatePath('/dashboard')
  
  return { success: true }
}

// --- İŞLEM SİLME (YENİ EKLENDİ) ---
export async function deleteTransactionAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  console.log("Silinmeye çalışılan ID:", id) // Terminalde logları gör
  console.log("İşlemi yapan User ID:", user.id)

  // count: 'exact' ile gerçekten silindi mi kontrol ediyoruz
  const { error, count } = await supabase
    .from('transactions')
    .delete({ count: 'exact' }) 
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Supabase Hatası:', error)
    return { error: `Veritabanı hatası: ${error.message}` }
  }

  // Eğer hata yoksa ama count 0 ise, demek ki veri silinemedi (Yetki yok veya ID yanlış)
  if (count === 0) {
    return { error: 'Bu işlemi silmeye yetkiniz yok veya işlem zaten silinmiş.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}