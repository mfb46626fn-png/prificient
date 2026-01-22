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

// --- RAPOR VERİSİ ÇEKME (LEDGER SYSTEM) ---
export async function getTransactions(config: { range: string, type: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Kullanıcı oturumu bulunamadı.' }
  }

  // 1. Ledger Entries Query (with Joins)
  let query = supabase
    .from('ledger_entries')
    .select(`
        amount,
        direction,
        account:ledger_accounts!inner(code, name, type),
        transaction:ledger_transactions!inner(created_at, description)
      `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false, foreignTable: 'ledger_transactions' })

  // 2. Date Filter
  let startDate = new Date(0)
  const now = new Date()
  if (config.range === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (config.range === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (config.range === '90d') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  if (config.range !== 'custom') {
    // Filter on the joined transaction table's created_at
    query = query.gte('ledger_transactions.created_at', startDate.toISOString())
  }

  const { data: rawData, error } = await query

  if (error) {
    console.error('getTransactions Ledger Error:', error)
    return { error: `Veri çekme hatası: ${error.message} (${error.code})` }
  }

  if (!rawData || rawData.length === 0) {
    return { data: [] }
  }

  // 3. Process & Map Data
  const processedData = rawData.reduce((acc: any[], entry: any) => {
    const code = entry.account.code
    const amount = Number(entry.amount)

    let type = 'other'
    let effectiveAmount = amount

    // Revenue Logic (600s) - Credit is normal
    if (code.startsWith('6')) {
      if (entry.direction === 'CREDIT') {
        type = 'income'
      } else {
        type = 'income'
        effectiveAmount = -amount // Refund/Return
      }
    }
    // Expense Logic (700s) - Debit is normal
    else if (code.startsWith('7')) {
      if (entry.direction === 'DEBIT') {
        type = 'expense'
      } else {
        type = 'expense'
        effectiveAmount = -amount // Cancelled expense
      }
    } else {
      // Skip assets/liabilities/equity for P&L Report queries
      return acc
    }

    // Filter by Requested Type
    if (config.type === 'revenue' && type !== 'income') return acc
    if (config.type === 'expense' && type !== 'expense') return acc

    acc.push({
      date: entry.transaction.created_at,
      category: entry.account.name, // e.g. "Yurt İçi Satışlar"
      description: entry.transaction.description, // e.g. "Sipariş #1024"
      amount: effectiveAmount,
      type: type
    })

    return acc
  }, [])

  return { data: processedData }
}