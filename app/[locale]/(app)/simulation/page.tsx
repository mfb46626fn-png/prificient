import { createClient } from '@/utils/supabase/server'
import { LedgerService } from '@/lib/ledger'
import { ProductAnalysis } from '@/lib/analysis/product-profitability'
import SimulationClient from '@/components/SimulationClient'
import { redirect } from 'next/navigation'
import { HybridSimulationInput, ProductSimData } from '@/lib/simulation/engine'

export const dynamic = 'force-dynamic';

export default async function SimulationPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // --- FETCH DATA ---
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    // 1. Precise Globals (Ledger)
    const { data: rawEntries, error } = await supabase.from('ledger_entries')
        .select(`
            amount,
            direction,
            ledger_accounts!inner(code, type),
            ledger_transactions!inner(created_at)
        `)
        .eq('user_id', user.id)
        .gte('ledger_transactions.created_at', startDate.toISOString())
        .lte('ledger_transactions.created_at', endDate.toISOString())

    let global_gross_sales = 0
    let global_returns = 0
    let global_ad_spend = 0
    let global_shipping = 0
    let global_cogs = 0

    rawEntries?.forEach((e: any) => {
        const code = e.ledger_accounts.code
        const amount = Number(e.amount)
        const direction = e.direction

        if (code === '600') {
            if (direction === 'CREDIT') global_gross_sales += amount
            else global_gross_sales -= amount
        } else if (code === '610') {
            if (direction === 'DEBIT') global_returns += amount
            else global_returns -= amount
        } else if (code === '760') {
            if (direction === 'DEBIT') global_ad_spend += amount
            else global_ad_spend -= amount
        } else if (code === '750') {
            if (direction === 'DEBIT') global_shipping += amount
            else global_shipping -= amount
        } else if (e.ledger_accounts.type === 'EXPENSE') {
            if (direction === 'DEBIT') global_cogs += amount
            else global_cogs -= amount
        }
    })

    // 2. Product Data (Analysis)
    const allProducts = await ProductAnalysis.analyzeProductProfitability(user.id, startDate, endDate)

    // 3. Attribution Logic (Allocate Globals to Products)
    // We assume Costs follow Volume (Gross Sales) for now.
    // Except Returns, which is per-product already.

    // Calculate Ratios
    const total_analyzed_gross = allProducts.reduce((sum, p) => sum + p.gross_sales, 0) || 1

    const productsWithCosts: ProductSimData[] = allProducts.map(p => {
        const ratio = p.gross_sales / total_analyzed_gross

        // Quantity approximation: Gross Sales / Avg Price ? 
        // We don't have quantity in `ProductFinancials` yet (it has gross_sales).
        // Let's assume AOV or just store Quantity in `ProductFinancials` refactor?
        // Easier: Just pass 1 if unknown, but better:
        // Assume price is part of metadata? Or just use ratio.
        // Let's assume quantity = 100 (arbitrary) for elasticity model base? 
        // No, `engine.ts` uses volume. 
        // Let's use `gross_sales` as proxy for quantity (Price=1) if we simplify.
        // OR: Update `ProductAnalysis` to fetch Quantity. 
        // *Quick fix*: Assume Quantity = Gross Sales / 100 (Avg Price).

        return {
            variant_id: p.variant_id,
            title: p.title || 'Unknown',
            gross_sales: p.gross_sales,
            returns_amount: p.returns,
            net_sales: p.net_sales,
            return_rate: p.return_rate / 100, // convert percentage to 0-1

            // Allocated
            cogs: global_cogs * ratio,
            ad_spend: global_ad_spend * ratio,
            shipping_cost: global_shipping * ratio,
            quantity: Math.floor(p.gross_sales / 500) || 1 // Fallback quantity proxy
        }
    })

    // 4. Split Top 100 vs Rest
    // Sort by Impact (Net Sales or Loss) - actually `allProducts` is sorted by Net Sales descending.
    // We want mainly big movers.
    const top100 = productsWithCosts.slice(0, 100)
    const rest = productsWithCosts.slice(100)

    // Aggregate Rest
    const restOfStore: ProductSimData = rest.reduce((acc, curr) => ({
        variant_id: 'rest_of_store',
        title: 'Diğer Ürünler',
        gross_sales: acc.gross_sales + curr.gross_sales,
        returns_amount: acc.returns_amount + curr.returns_amount,
        net_sales: acc.net_sales + curr.net_sales,
        cogs: acc.cogs + curr.cogs,
        ad_spend: acc.ad_spend + curr.ad_spend,
        shipping_cost: acc.shipping_cost + curr.shipping_cost,
        quantity: acc.quantity + curr.quantity,
        return_rate: 0 // Recalculate below
    }), {
        variant_id: 'rest_of_store',
        title: 'Diğer Ürünler',
        gross_sales: 0, returns_amount: 0, net_sales: 0, cogs: 0, ad_spend: 0, shipping_cost: 0, quantity: 0, return_rate: 0
    })

    if (restOfStore.gross_sales > 0) {
        restOfStore.return_rate = restOfStore.returns_amount / restOfStore.gross_sales
    }

    const input: HybridSimulationInput = {
        products: top100,
        rest_of_store: restOfStore,
        global_ad_spend,
        global_cogs,
        global_shipping_cost: global_shipping
    }

    return (
        <SimulationClient
            input={input}
            isDemo={user.email === 'demo@prificient.com'}
        />
    )
}
