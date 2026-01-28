import { createClient } from '@/utils/supabase/client'

// --- Types ---
export type AccountType = 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE' | 'EQUITY'
export type NormalBalance = 'DEBIT' | 'CREDIT'

interface LedgerEntryInput {
    account_code: string
    direction: 'DEBIT' | 'CREDIT'
    amount: number
    metadata?: any
}

// --- Constants ---
export const DEFAULT_ACCOUNTS = [
    { code: '100', name: 'Kasa / Banka', type: 'ASSET', normal: 'DEBIT' },
    { code: '120', name: 'Alıcılar', type: 'ASSET', normal: 'DEBIT' },
    { code: '200', name: 'Ödenecek KDV/Vergiler', type: 'LIABILITY', normal: 'CREDIT' }, // New User Request (Pass-Through)
    { code: '391', name: 'Hesaplanan KDV', type: 'LIABILITY', normal: 'CREDIT' }, // Keeping for legacy/compatibility
    { code: '600', name: 'Yurt İçi Satışlar', type: 'REVENUE', normal: 'CREDIT' },
    { code: '610', name: 'Satış İadeleri', type: 'REVENUE', normal: 'DEBIT' }, // Contra-Revenue
    { code: '740', name: 'Hizmet Üretim Giderleri', type: 'EXPENSE', normal: 'DEBIT' }, // Fees
    { code: '750', name: 'Kargo Giderleri', type: 'EXPENSE', normal: 'DEBIT' },
    { code: '760', name: 'Pazarlama Giderleri', type: 'EXPENSE', normal: 'DEBIT' },
    { code: '770', name: 'Genel Yönetim Giderleri', type: 'EXPENSE', normal: 'DEBIT' },
    { code: '780', name: 'Finansman Giderleri (Kur Farkı)', type: 'EXPENSE', normal: 'DEBIT' },
] as const

export class LedgerService {

    // 1. Hesap Planı Başlatıcı
    static async initializeAccounts(user_id: string, supabaseClient?: any) {
        const supabase = supabaseClient || createClient()

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

            // count=0 olsa bile race condition ihtimaline karşı upsert kullanıyoruz.
            const { error } = await supabase.from('ledger_accounts').upsert(payload, { onConflict: 'user_id, code' })

            if (error) {
                console.error("Account Init Error Details:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    fullError: JSON.stringify(error)
                })
            }
        }
    }
    // 2. Olay Kaydedici (Immutable Event Log)
    static async recordEvent(user_id: string, stream_type: string, event_type: string, payload: any, supabaseClient?: any) {
        const supabase = supabaseClient || createClient()

        const { data, error } = await supabase.from('financial_event_log').insert({
            user_id,
            stream_type,
            event_type,
            payload
        }).select('event_id').single()

        if (error) throw new Error(`Event Log Error: ${error.message}`)
        if (!data) throw new Error("Event ID not returned")

        // Auto-process for immediate consistency (Optional: could be async worker)
        // We pass the same client to keep context (e.g. Admin rights)
        await this.processEvent(data.event_id, user_id, event_type, payload, supabase)

        return data.event_id
    }

    // 3. Muhasebeleştirici (Event -> Ledger)
    static async processEvent(event_id: string, user_id: string, event_type: string, payload: any, supabaseClient?: any) {
        const supabase = supabaseClient || createClient()

        // Hesap planının var olduğundan emin ol
        await this.initializeAccounts(user_id, supabase) // Reuse client!

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
                        // Alacak: KDV/Vergiler (Yükümlülük) -> 20 TL (User Requested Account 200)
                        { account_code: '200', direction: 'CREDIT', amount: tax }
                    ],
                    event_id,
                    supabase // Pass client!
                )
                break

            case 'AdSpendRecorded':
                // payload = { provider: 'meta', campaign_name: '...', amount: 150.50, date: '2023-10-25' }
                const expenseAmount = Number(payload.amount);
                if (expenseAmount <= 0) return;

                await this.postTransaction(
                    user_id,
                    `${payload.provider === 'meta' ? 'Meta Ads' : 'Ads'} Harcaması: ${payload.campaign_name}`,
                    [
                        // Borç: Pazarlama Giderleri (760) -> Gider Artışı
                        { account_code: '760', direction: 'DEBIT', amount: expenseAmount },

                        // Alacak: Satıcılar/Meta (320) -> Borç Artışı (Kredi Kartı borcu gibi düşünülebilir)
                        // Şimdilik 100 Kasa'dan çıkmış gibi değil, bir yükümlülük (ödenecek) olarak kaydedelim.
                        // Ya da direkt Kasa/Banka (100) düşelim eğer otomatik ödeme ise.
                        // Güvenli yol 320 (Satıcılar) veya 300 (Banka Kredileri).
                        // Ancak kullanıcı "Harcama yaptım" dediğinde genellikle karttan çekilmiştir.
                        // MVP için varsayılan olarak 329 (Diğer Ticari Borçlar) veya 320 kullanalım.
                        // Ancak DEFAULT_ACCOUNTS içinde 320 yok. 100 (Kasa/Banka) kullanalım (Nakit/Kart Çıkışı).
                        { account_code: '100', direction: 'CREDIT', amount: expenseAmount }
                    ],
                    event_id,
                    supabase // Pass client!
                )
                break;

            case 'RefundCreated':
                // payload is the Refund object from Shopify
                // It has 'refund_line_items' and 'transactions'
                // We need to calculate Total Refunded Amount and Tax Refunded.

                // 1. Calculate Amounts
                // transactions contain the actual money movement.
                const refundTransactions = payload.transactions || []
                let totalRefund = 0
                for (const tx of refundTransactions) {
                    // Only count successful refunds
                    if (tx.kind === 'refund' && tx.status === 'success') {
                        totalRefund += parseFloat(tx.amount)
                    }
                }

                if (totalRefund === 0) return // No money moved

                // Calculate Tax Refunded from refund_line_items ?
                // Shopify refund_line_items has 'total_tax' (but it's per line item tax line).
                // Also 'total_tax_set' property on the refund object root? usually not.
                // We iterate refund_line_items to sum tax and net sales.

                let refundTax = 0
                let refundNet = 0

                const refundEntries: LedgerEntryInput[] = []
                const refundLineItems = payload.refund_line_items || []

                for (const rli of refundLineItems) {
                    const rAmount = parseFloat(rli.subtotal) // Revenue part
                    const rTax = parseFloat(rli.total_tax)    // Tax part

                    refundNet += rAmount
                    refundTax += rTax

                    // Debit Returns (610) - Revenue Contra
                    // We store metadata here for Toxic Product analysis
                    refundEntries.push({
                        account_code: '610',
                        direction: 'DEBIT',
                        amount: rAmount,
                        metadata: {
                            variant_id: rli.line_item?.variant_id?.toString(),
                            product_id: rli.line_item?.product_id?.toString(),
                            sku: rli.line_item?.sku,
                            title: rli.line_item?.title,
                            refund_id: payload.id
                        }
                    })
                }

                // Adjustments? (Shipping refund?)
                // If totalRefund > (refundNet + refundTax), the difference is usually Shipping Refund.
                const mappedRefund = refundNet + refundTax
                const diff = totalRefund - mappedRefund

                if (diff > 0.05) {
                    // This is likely Shipping Refund. 
                    // We should Debit Shipping Revenue (600) or Returns (610)?
                    // If we put it to 610, it increases Return stats.
                    // Let's put it to 610 but metadata type 'shipping_refund'
                    refundEntries.push({
                        account_code: '610',
                        direction: 'DEBIT',
                        amount: diff,
                        metadata: { type: 'shipping_refund' }
                    })
                }

                // Debit Tax (200) - Reduce Liability
                if (refundTax > 0) {
                    refundEntries.push({
                        account_code: '200',
                        direction: 'DEBIT',
                        amount: refundTax
                    })
                }

                // Credit Bank (100) - Reduce Asset
                refundEntries.push({
                    account_code: '100',
                    direction: 'CREDIT',
                    amount: totalRefund
                })

                await this.postTransaction(
                    user_id,
                    `İade #${payload.order_id} (Ref: ${payload.id})`,
                    refundEntries,
                    event_id,
                    supabase // Pass client!
                )
                break;
                console.warn(`Unknown Event Type: ${event_type}`)
        }
    }

    // Yardımcı: Fiş Oluştur (Low Level)
    private static async postTransaction(
        user_id: string,
        description: string,
        entries: LedgerEntryInput[],
        event_id?: string,
        supabaseClient?: any
    ) {
        const supabase = supabaseClient || createClient()

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
            // Robust check: cast to string and trim
            const searchCode = String(entry.account_code).trim();
            const acc = accounts.find((a: any) => String(a.code).trim() === searchCode);

            if (!acc) {
                const availableCodes = accounts.map((a: any) => a.code).join(', ');
                throw new Error(`Hesap Kodu Bulunamadı: "${entry.account_code}" (Aranan: "${searchCode}"). Mevcut Kodlar: [${availableCodes}]`)
            }
            return {
                user_id,
                account_id: acc.id,
                direction: entry.direction, // 'DEBIT' | 'CREDIT'
                amount: entry.amount,
                metadata: entry.metadata // Pass metadata
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

    // 4. Haftalık Rapor Verisi (Helper)
    static async getWeeklyFinancials(user_id: string, start_date: Date, end_date: Date) {
        const supabase = createClient()

        // Hesapları çek (760 Pazarlama Giderleri dahil)
        const { data: accounts } = await supabase.from('ledger_accounts')
            .select('id, type, code')
            .eq('user_id', user_id)
            .in('type', ['REVENUE', 'EXPENSE'])

        if (!accounts) return { revenue: 0, expense: 0, netProfit: 0, adSpend: 0, roi: 0 }

        const revenueAccountIds = accounts.filter(a => a.type === 'REVENUE').map(a => a.id)
        const expenseAccountIds = accounts.filter(a => a.type === 'EXPENSE').map(a => a.id)
        const adSpendAccountIds = accounts.filter(a => a.code === '760').map(a => a.id) // 760 = Pazarlama

        // Transactionları çek
        const { data: entries } = await supabase.from('ledger_entries')
            .select(`
                amount,
                direction,
                account_id,
                transaction:ledger_transactions!inner(created_at)
            `)
            .eq('user_id', user_id)
            .gte('transaction.created_at', start_date.toISOString())
            .lte('transaction.created_at', end_date.toISOString())

        if (!entries) return { revenue: 0, expense: 0, netProfit: 0, adSpend: 0, roi: 0 }

        let revenue = 0
        let expense = 0
        let adSpend = 0

        entries.forEach((e: any) => {
            const amount = Number(e.amount)

            // Gelir
            if (revenueAccountIds.includes(e.account_id)) {
                if (e.direction === 'CREDIT') revenue += amount
                else revenue -= amount
            }
            // Gider
            else if (expenseAccountIds.includes(e.account_id)) {
                if (e.direction === 'DEBIT') expense += amount
                else expense -= amount

                // Ad Spend (Expenses içinde subset)
                if (adSpendAccountIds.includes(e.account_id)) {
                    if (e.direction === 'DEBIT') adSpend += amount
                    else adSpend -= amount
                }
            }
        })

        const netProfit = revenue - expense
        // ROI = (Revenue - AdSpend) / AdSpend * 100 ?? Or usually (Profit / Cost)
        // Marketing ROI often: (Revenue - MarketingCost) / MarketingCost
        const roi = adSpend > 0 ? ((revenue - adSpend) / adSpend) * 100 : 0

        return {
            revenue,
            expense,
            netProfit,
            adSpend,
            roi
        }
    }
    // 5. Günlük Otopsi (Daily Autopsy)
    static async getDailyAutopsy(user_id: string, date: Date) {
        const supabase = createClient()

        // Start and End of the given date
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)

        // Fetch Accounts to Map Codes
        const { data: accounts } = await supabase.from('ledger_accounts')
            .select('id, code, type')
            .eq('user_id', user_id)

        if (!accounts) return null

        // Fetch Entries for that Day
        const { data: entries } = await supabase.from('ledger_entries')
            .select(`
                amount,
                direction,
                account_id,
                transaction:ledger_transactions!inner(created_at)
            `)
            .eq('user_id', user_id)
            .gte('transaction.created_at', start.toISOString())
            .lte('transaction.created_at', end.toISOString())

        let grossRevenue = 0
        let returns = 0
        let ads = 0
        let cogsAndFees = 0

        const accountMap = new Map(accounts.map(a => [a.id, a]))

        entries?.forEach((e: any) => {
            const acc = accountMap.get(e.account_id)
            const amount = Number(e.amount)
            if (!acc) return

            // 600: Revenue
            if (acc.code === '600') {
                if (e.direction === 'CREDIT') grossRevenue += amount
                else grossRevenue -= amount
            }
            // 610: Returns
            else if (acc.code === '610') {
                // Returns are Debit usually. 
                if (e.direction === 'DEBIT') returns += amount
                else returns -= amount
            }
            // 760: Marketing (Ads)
            else if (acc.code === '760') {
                if (e.direction === 'DEBIT') ads += amount
                else ads -= amount
            }
            // 740, 750, 770, 780, etc: COGS/Fees/Overhead
            else if (acc.type === 'EXPENSE' && acc.code !== '760') {
                if (e.direction === 'DEBIT') cogsAndFees += amount
                else cogsAndFees -= amount
            }
        })

        const netPocket = grossRevenue - returns - ads - cogsAndFees

        return {
            grossRevenue,
            returns: -returns, // Show as negative for display logic
            ads: -ads,
            cogsAndFees: -cogsAndFees,
            netPocket,
            date: date.toISOString()
        }
    }
}
