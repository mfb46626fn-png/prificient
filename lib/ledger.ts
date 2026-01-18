import { createClient } from '@/utils/supabase/client'

// --- Types ---
export type AccountType = 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE' | 'EQUITY'
export type NormalBalance = 'DEBIT' | 'CREDIT'

interface LedgerEntryInput {
    account_code: string
    direction: 'DEBIT' | 'CREDIT'
    amount: number
}

// --- Constants ---
export const DEFAULT_ACCOUNTS = [
    { code: '100', name: 'Kasa / Banka', type: 'ASSET', normal: 'DEBIT' },
    { code: '120', name: 'Alıcılar', type: 'ASSET', normal: 'DEBIT' },
    { code: '391', name: 'Hesaplanan KDV', type: 'LIABILITY', normal: 'CREDIT' },
    { code: '600', name: 'Yurt İçi Satışlar', type: 'REVENUE', normal: 'CREDIT' },
    { code: '760', name: 'Pazarlama Giderleri', type: 'EXPENSE', normal: 'DEBIT' },
    { code: '770', name: 'Genel Yönetim Giderleri', type: 'EXPENSE', normal: 'DEBIT' },
] as const

export class LedgerService {

    // 1. Hesap Planı Başlatıcı
    static async initializeAccounts(user_id: string) {
        const supabase = createClient()

        // Hesaplar var mı kontrol et
        const { count } = await supabase.from('ledger_accounts').select('*', { count: 'exact', head: true }).eq('user_id', user_id)

        if (count === 0) {
            const payload = DEFAULT_ACCOUNTS.map(acc => ({
                user_id,
                code: acc.code,
                name: acc.name,
                type: acc.type,
                normal_balance: acc.normal
            }))

            const { error } = await supabase.from('ledger_accounts').insert(payload)
            if (error) console.error("Account Init Error:", error)
        }
    }

    // 2. Olay Kaydedici (Immutable Event Log)
    static async recordEvent(user_id: string, stream_type: string, event_type: string, payload: any) {
        const supabase = createClient()

        const { data, error } = await supabase.from('financial_event_log').insert({
            user_id,
            stream_type,
            event_type,
            payload
        }).select('event_id').single()

        if (error) throw new Error(`Event Log Error: ${error.message}`)
        if (!data) throw new Error("Event ID not returned")

        return data.event_id
    }

    // 3. Muhasebeleştirici (Event -> Ledger)
    static async processEvent(event_id: string, user_id: string, event_type: string, payload: any) {
        // Hesap planının var olduğundan emin ol
        await this.initializeAccounts(user_id)

        switch (event_type) {
            case 'OrderCreated':
                // Örnek: payload = { total_price: "120.00", subtotal_price: "100.00", total_tax: "20.00", id: 12345 }
                const total = parseFloat(payload.total_price || '0')
                const tax = parseFloat(payload.total_tax || '0')
                const revenue = parseFloat(payload.subtotal_price || (total - tax).toString())

                // Eğer tutar 0 ise kayda gerek yok (veya 0 TL'lik fiş kesilebilir)
                if (total === 0) return

                await this.postTransaction(
                    user_id,
                    `Sipariş #${payload.id || payload.order_number}`,
                    [
                        // Borç: Kasa/Banka (Varlık artışı) -> 120 TL
                        { account_code: '100', direction: 'DEBIT', amount: total },
                        // Alacak: Satışlar (Gelir) -> 100 TL
                        { account_code: '600', direction: 'CREDIT', amount: revenue },
                        // Alacak: KDV (Yükümlülük) -> 20 TL
                        { account_code: '391', direction: 'CREDIT', amount: tax }
                    ],
                    event_id
                )
                break

            // İleride eklenecek: 'AdSpendRecorded', 'RefundCreated' vs.
            default:
                console.warn(`Unknown Event Type: ${event_type}`)
        }
    }

    // Yardımcı: Fiş Oluştur (Low Level)
    private static async postTransaction(
        user_id: string,
        description: string,
        entries: LedgerEntryInput[],
        event_id?: string
    ) {
        const supabase = createClient()

        // 1. Denge Kontrolü
        const totalDebit = entries.filter(e => e.direction === 'DEBIT').reduce((sum, e) => sum + e.amount, 0)
        const totalCredit = entries.filter(e => e.direction === 'CREDIT').reduce((sum, e) => sum + e.amount, 0)

        if (Math.abs(totalDebit - totalCredit) > 0.05) { // Tolerans 0.05
            throw new Error(`Dengesiz Fiş: Borç (${totalDebit}) !== Alacak (${totalCredit})`)
        }

        // 2. Hesap ID Çözümleme
        const { data: accounts } = await supabase.from('ledger_accounts').select('id, code').eq('user_id', user_id)
        if (!accounts) throw new Error("Hesap planı bulunamadı.")

        const resolvedEntries = entries.map(entry => {
            const acc = accounts.find(a => a.code === entry.account_code)
            if (!acc) throw new Error(`Hesap Kodu Bulunamadı: ${entry.account_code}`)
            return {
                user_id,
                account_id: acc.id,
                direction: entry.direction, // 'DEBIT' | 'CREDIT'
                amount: entry.amount
            }
        })

        // 3. Başlık (Transaction)
        const { data: trx, error: trxError } = await supabase.from('ledger_transactions').insert({
            user_id,
            description,
            event_id
        }).select('id').single()

        if (trxError) throw new Error(trxError.message)

        // 4. Satırlar (Entries)
        const entriesPayload = resolvedEntries.map(e => ({
            ...e,
            transaction_id: trx.id
        }))

        const { error: entryError } = await supabase.from('ledger_entries').insert(entriesPayload)
        if (entryError) throw new Error(entryError.message)

        return trx.id
    }
}
