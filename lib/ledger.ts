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
    { code: '153', name: 'Ticari Mallar (Stok)', type: 'ASSET', normal: 'DEBIT' }, // Inventory
    { code: '200', name: 'Ödenecek KDV/Vergiler', type: 'LIABILITY', normal: 'CREDIT' }, // New User Request (Pass-Through)
    { code: '391', name: 'Hesaplanan KDV', type: 'LIABILITY', normal: 'CREDIT' },
    { code: '600', name: 'Yurt İçi Satışlar', type: 'REVENUE', normal: 'CREDIT' },
    { code: '610', name: 'Satış İadeleri', type: 'REVENUE', normal: 'DEBIT' },
    { code: '621', name: 'Satılan Malın Maliyeti', type: 'EXPENSE', normal: 'DEBIT' }, // COGS
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

        // Always try to ensure Default Accounts exist (UPSERT)
        // This fixes the issue where old users don't get new default accounts (like '200')
        const payload = DEFAULT_ACCOUNTS.map(acc => ({
            user_id,
            code: acc.code,
            name: acc.name,
            type: acc.type,
            normal_balance: acc.normal
        }))

        // Conflict on (user_id, code) means we won't duplicate, but we ensure existence.
        const { error } = await supabase.from('ledger_accounts').upsert(payload, { onConflict: 'user_id, code', ignoreDuplicates: true })

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
    // 2. Olay Kaydedici (Immutable Event Log)
    // skipProcessing=true for fast sync (batch process later)
    // 2. Olay Kaydedici (Immutable Event Log)
    // skipProcessing=true for fast sync (batch process later)
    static async recordEvent(user_id: string, stream_type: string, event_type: string, payload: any, supabaseClient?: any, skipProcessing = false, transactionDateOverride?: Date) {
        const supabase = supabaseClient || createClient()

        // Deterministic Source ID extraction
        let source_id = null;
        if (payload.id) source_id = String(payload.id);
        else if (payload.order_id) source_id = String(payload.order_id);

        // If we can't identify it, let it pass (or generate a hash?)
        // For OrderCreated, payload.id is mandatory.

        const { data, error } = await supabase.from('financial_event_log').insert({
            user_id,
            stream_type,
            event_type,
            payload,
            source_id // NEW: Helper field for uniqueness
        })
            .select('event_id')
            .maybeSingle()

        // Handle Duplicates gracefully (Idempotency)
        if (error) {
            // Postgres error code for Unique Violation is 23505
            if (error.code === '23505' || error.message.includes('unique')) {
                console.log(`[Ledger] Skipped duplicate event: ${event_type} #${source_id}`);
                return null; // Silent skip
            }
            throw new Error(`Event Log Error: ${error.message}`)
        }

        if (!data) return null; // Should not happen usually

        // Skip heavy processing during sync if requested
        if (!skipProcessing) {
            await this.processEvent(data.event_id, user_id, event_type, payload, supabase, transactionDateOverride)
        }

        return data.event_id
    }

    // 3. Muhasebeleştirici (Event -> Ledger)
    static async processEvent(event_id: string, user_id: string, event_type: string, payload: any, supabaseClient?: any, transactionDateOverride?: Date) {
        const supabase = supabaseClient || createClient()

        // Hesap planının var olduğundan emin ol
        await this.initializeAccounts(user_id, supabase) // Reuse client!

        // Determine Transaction Date (Critical for Historical Sync)
        // Default to NOW() IF AND ONLY IF we cannot find a valid date.
        // Priority: Override -> created_at (snake) -> createdAt (camel) -> processed_at
        let transactionDate = transactionDateOverride || new Date();

        if (!transactionDateOverride) {
            const p = payload as any;
            const dateStr = p.created_at || p.createdAt || p.processed_at || p.processedAt;

            if (dateStr) {
                transactionDate = new Date(dateStr);
            } else {
                console.warn(`[Ledger] Warning: No date found for event ${event_type} and no override provided. Using NOW().`);
            }
        }

        switch (event_type) {
            case 'OrderCreated':
                // Örnek: payload = { total_price: "120.00", subtotal_price: "100.00", total_tax: "20.00", id: 12345 }
                const total = parseFloat(payload.total_price || '0')
                const tax = parseFloat(payload.total_tax || '0')
                const revenue = parseFloat(payload.subtotal_price || (total - tax).toString())

                // Eğer tutar 0 ise kayda gerek yok (veya 0 TL'lik fiş kesilebilir)
                if (total === 0) return

                // 1. Prepare Entries
                const entries: LedgerEntryInput[] = []

                // A. Kasa/Banka (Borç) - Total Tutar
                entries.push({ account_code: '100', direction: 'DEBIT', amount: total })

                // B. KDV (Alacak) - Toplam Vergi
                if (tax > 0) {
                    entries.push({ account_code: '200', direction: 'CREDIT', amount: tax })
                }

                // C. Satışlar (Alacak) - Granular Line Items for Product Analysis
                // We split the revenue per line item to enable "Product Profitability" calculation
                if (payload.line_items && Array.isArray(payload.line_items)) {
                    payload.line_items.forEach((item: any) => {
                        // Calculate item revenue share
                        // Item Price * Qty - (Discount per item if any)
                        // Simple approach: Price * Qty
                        const itemRevenue = parseFloat(item.price) * (item.quantity || 1)
                        // Note: Discount logic might be complex, MVP uses price * qty. 
                        // If subtotal mismatch, we add a rounding correction entry later.

                        // Metadata is CRITICAL for ProductAnalysis
                        entries.push({
                            account_code: '600',
                            direction: 'CREDIT',
                            amount: itemRevenue,
                            metadata: {
                                variant_id: String(item.variant_id),
                                product_id: String(item.product_id),
                                sku: item.sku,
                                title: item.title,
                                qty: item.quantity
                            }
                        })
                    })

                    // Correction for rounding diff between sum(items) and subtotal_price
                    // (Discounts often apply to subtotal, affecting revenue)
                    const calculatedRevenue = payload.line_items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0)
                    const diff = revenue - calculatedRevenue

                    if (Math.abs(diff) > 0.01) {
                        // Add correction entry (often discount)
                        entries.push({
                            account_code: '600',
                            direction: diff > 0 ? 'CREDIT' : 'DEBIT', // Adjust revenue
                            amount: Math.abs(diff),
                            metadata: { type: 'rounding_or_discount_correction' }
                        })
                    }
                } else {
                    // Fallback if no line items
                    entries.push({ account_code: '600', direction: 'CREDIT', amount: revenue })
                }

                await this.postTransaction(
                    user_id,
                    `Sipariş #${payload.id || payload.order_number}`,
                    entries,
                    event_id,
                    supabase, // Pass client!
                    transactionDate // Pass Date
                )

                // 2. Maliyet Kaydı (COGS)
                // History Scanner tarafından 'line_items' içine '__cost' enjekte edildiğini varsayıyoruz.
                let totalCost = 0
                if (payload.line_items && Array.isArray(payload.line_items)) {
                    totalCost = payload.line_items.reduce((sum: number, item: any) => {
                        const unitCost = Number(item.__cost || item.cost_per_item || 0)
                        return sum + (unitCost * (item.quantity || 1))
                    }, 0)
                }

                if (totalCost > 0) {
                    const costEntries: LedgerEntryInput[] = []

                    // Granular Cost Entries
                    payload.line_items.forEach((item: any) => {
                        const unitCost = Number(item.__cost || item.cost_per_item || 0)
                        const lineCost = unitCost * (item.quantity || 1)

                        if (lineCost > 0) {
                            // 621 Expense - Debit
                            costEntries.push({
                                account_code: '621',
                                direction: 'DEBIT',
                                amount: lineCost,
                                metadata: {
                                    variant_id: String(item.variant_id),
                                    product_id: String(item.product_id),
                                    sku: item.sku,
                                    title: item.title
                                }
                            })
                            // 153 Inventory - Credit (Asset decrease)
                            // We lump this or split it. Splitting is fine.
                            costEntries.push({
                                account_code: '153',
                                direction: 'CREDIT',
                                amount: lineCost
                            })
                        }
                    })

                    if (costEntries.length > 0) {
                        await this.postTransaction(
                            user_id,
                            `Maliyet Fişi: Sipariş #${payload.order_number}`,
                            costEntries,
                            event_id,
                            supabase,
                            transactionDate
                        )
                    }
                }

                break

            case 'AdSpendRecorded':
                // payload = { provider: 'meta', campaign_name: '...', amount: 150.50, date: '2023-10-25' }
                const expenseAmount = Number(payload.amount);
                if (expenseAmount <= 0) return;

                // Override date if provided in payload specifically for ads
                if (payload.date) transactionDate = new Date(payload.date);

                await this.postTransaction(
                    user_id,
                    `${payload.provider === 'meta' ? 'Meta Ads' : 'Ads'} Harcaması: ${payload.campaign_name}`,
                    [
                        // Borç: Pazarlama Giderleri (760) -> Gider Artışı
                        { account_code: '760', direction: 'DEBIT', amount: expenseAmount },
                        // Alacak: 100 Kasa/Banka
                        { account_code: '100', direction: 'CREDIT', amount: expenseAmount }
                    ],
                    event_id,
                    supabase, // Pass client!
                    transactionDate
                )
                break;

            case 'RefundCreated':
                // ... Refund Logic ...
                // Use transactionDate derived from processed_at usually

                const refundTransactions = payload.transactions || []
                let totalRefund = 0
                for (const tx of refundTransactions) {
                    // Only count successful refunds
                    if (tx.kind === 'refund' && tx.status === 'success') {
                        totalRefund += parseFloat(tx.amount)
                    }
                }

                if (totalRefund === 0) return // No money moved

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

                const mappedRefund = refundNet + refundTax
                const diff = totalRefund - mappedRefund

                if (diff > 0.05) {
                    refundEntries.push({
                        account_code: '610',
                        direction: 'DEBIT',
                        amount: diff,
                        metadata: { type: 'shipping_refund' }
                    })
                }

                if (refundTax > 0) {
                    refundEntries.push({
                        account_code: '200',
                        direction: 'DEBIT',
                        amount: refundTax
                    })
                }

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
                    supabase, // Pass client!
                    transactionDate
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
        supabaseClient?: any,
        transactionDate?: Date
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
            event_id,
            transaction_date: transactionDate ? transactionDate.toISOString() : new Date().toISOString()
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
                transaction:ledger_transactions!inner(transaction_date)
            `)
            .eq('user_id', user_id)
            .gte('transaction.transaction_date', start_date.toISOString())
            .lte('transaction.transaction_date', end_date.toISOString())

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
                transaction:ledger_transactions!inner(transaction_date)
            `)
            .eq('user_id', user_id)
            .gte('transaction.transaction_date', start.toISOString())
            .lte('transaction.transaction_date', end.toISOString())

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
