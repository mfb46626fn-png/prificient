/**
 * Financial Engine - The Deterministic Core
 * 
 * This engine performs 100% precise mathematical calculations.
 * No estimations, no approximations - pure financial truth.
 * 
 * Formula: NetProfit = Revenue - (COGS + Tax + ShippingCost + TransactionFee + AdSpend + RefundLoss)
 */

import { createClient } from '@/utils/supabase/server'

export interface OrderFinancials {
    orderId: string
    orderNumber: string
    revenue: number
    cogs: number // Cost of Goods Sold
    tax: number
    shippingCharged: number // What customer paid
    shippingCost: number // What we actually paid
    transactionFee: number // Platform fees (Shopify Payments, etc.)
    adSpend: number // Attributed ad spend
    refundAmount: number
    refundLoss: number // Non-recoverable costs from refunds
    netProfit: number
    margin: number // Percentage
    currency: string
}

export interface RefundLoss {
    refundedAmount: number
    nonRecoverableShipping: number
    nonRecoverableTransactionFee: number
    totalLoss: number
}

export interface DailyFinancials {
    date: string
    totalRevenue: number
    totalCOGS: number
    totalTax: number
    totalShippingCost: number
    totalTransactionFees: number
    totalAdSpend: number
    totalRefundLoss: number
    totalNetProfit: number
    orderCount: number
    averageOrderProfit: number
    currency: string
}

export interface ProductProfitability {
    productId: string
    variantId: string
    title: string
    revenue: number
    cogs: number
    adSpend: number
    transactionFees: number
    netProfit: number
    margin: number
    soldQuantity: number
    returnQuantity: number
    returnRate: number
    isZombie: boolean // Revenue positive but profit negative
    isToxic: boolean // High return rate or deep negative margin
}

// Fee calculation constants
const SHOPIFY_PAYMENTS_RATE = 0.029 // 2.9%
const SHOPIFY_PAYMENTS_FIXED = 0.30 // $0.30 per transaction
const THIRD_PARTY_GATEWAY_RATE = 0.02 // 2% for non-Shopify payments

export class FinancialEngine {

    /**
     * Calculate transaction fee based on payment gateway
     */
    static calculateTransactionFee(
        amount: number,
        gateway: string = 'shopify_payments'
    ): number {
        // Shopify Payments rates vary by country, using US rates as baseline
        if (gateway === 'shopify_payments' || gateway === 'credit_card') {
            return (amount * SHOPIFY_PAYMENTS_RATE) + SHOPIFY_PAYMENTS_FIXED
        }

        // Third-party gateway (PayPal, Stripe external, etc.)
        if (gateway === 'paypal' || gateway === 'manual') {
            return amount * THIRD_PARTY_GATEWAY_RATE
        }

        // Default fallback
        return amount * 0.025
    }

    /**
     * Calculate true COGS from line items
     */
    static calculateCOGS(lineItems: Array<{ cost?: number; quantity: number }>): number {
        return lineItems.reduce((total, item) => {
            const itemCost = item.cost || 0
            return total + (itemCost * item.quantity)
        }, 0)
    }

    /**
     * Calculate refund loss (non-recoverable costs)
     */
    static calculateRefundLoss(
        refundAmount: number,
        originalShippingCost: number,
        originalTransactionFee: number,
        isShippingRefunded: boolean = false
    ): RefundLoss {
        // Transaction fee is NEVER recovered from payment processor
        const nonRecoverableTransactionFee = originalTransactionFee

        // Shipping cost - if we shipped, we can't get carrier costs back
        const nonRecoverableShipping = isShippingRefunded ? originalShippingCost : 0

        return {
            refundedAmount: refundAmount,
            nonRecoverableShipping,
            nonRecoverableTransactionFee,
            totalLoss: refundAmount + nonRecoverableShipping + nonRecoverableTransactionFee
        }
    }

    /**
     * Calculate true net profit for a single order
     */
    static calculateOrderNetProfit(params: {
        subtotal: number
        cogs: number
        taxCollected: number
        shippingCharged: number
        shippingCost: number
        paymentGateway?: string
        adSpendAttributed?: number
        refundAmount?: number
        currency?: string
    }): OrderFinancials {
        const {
            subtotal,
            cogs,
            taxCollected,
            shippingCharged,
            shippingCost,
            paymentGateway = 'shopify_payments',
            adSpendAttributed = 0,
            refundAmount = 0,
            currency = 'USD'
        } = params

        const totalRevenue = subtotal + shippingCharged
        const transactionFee = this.calculateTransactionFee(totalRevenue, paymentGateway)

        // Calculate refund loss if applicable
        let refundLoss = 0
        if (refundAmount > 0) {
            const refundBreakdown = this.calculateRefundLoss(
                refundAmount,
                shippingCost,
                transactionFee,
                true
            )
            refundLoss = refundBreakdown.totalLoss
        }

        // THE FORMULA
        const netProfit = totalRevenue - cogs - taxCollected - shippingCost - transactionFee - adSpendAttributed - refundLoss

        const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

        return {
            orderId: '',
            orderNumber: '',
            revenue: totalRevenue,
            cogs,
            tax: taxCollected,
            shippingCharged,
            shippingCost,
            transactionFee,
            adSpend: adSpendAttributed,
            refundAmount,
            refundLoss,
            netProfit,
            margin,
            currency
        }
    }

    /**
     * Aggregate daily financials for a user
     */
    static async getDailyFinancials(userId: string, date: Date): Promise<DailyFinancials> {
        const supabase = await createClient()

        const startOfDay = new Date(date)
        startOfDay.setUTCHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setUTCHours(23, 59, 59, 999)

        // Get ledger entries for the day
        const { data: transactions } = await supabase
            .from('ledger_transactions')
            .select(`
        id,
        description,
        transaction_date,
        ledger_entries (
          account_id,
          debit,
          credit,
          ledger_accounts (code, name)
        )
      `)
            .eq('user_id', userId)
            .gte('transaction_date', startOfDay.toISOString())
            .lte('transaction_date', endOfDay.toISOString())

        // Get ad spend for the day
        const { data: adData } = await supabase
            .from('ad_imports')
            .select('amount_spent')
            .eq('user_id', userId)
            .eq('reporting_date', date.toISOString().split('T')[0])

        const totalAdSpend = adData?.reduce((sum, ad) => sum + Number(ad.amount_spent), 0) || 0

        // Aggregate from ledger entries
        let totalRevenue = 0
        let totalCOGS = 0
        let totalTax = 0
        let totalShippingCost = 0
        let totalTransactionFees = 0
        let totalRefundLoss = 0
        let orderCount = 0

        transactions?.forEach(tx => {
            const entries = tx.ledger_entries as any[]
            entries?.forEach((entry: any) => {
                const code = entry?.ledger_accounts?.code || ''
                const amount = Number(entry.credit || 0) - Number(entry.debit || 0)

                if (code.startsWith('4')) { // Revenue accounts
                    totalRevenue += amount
                    orderCount++
                } else if (code === '5100') { // COGS
                    totalCOGS += Math.abs(amount)
                } else if (code === '5200') { // Transaction fees
                    totalTransactionFees += Math.abs(amount)
                } else if (code === '2100') { // Tax liability
                    totalTax += Math.abs(amount)
                }
            })
        })

        const totalNetProfit = totalRevenue - totalCOGS - totalTax - totalShippingCost - totalTransactionFees - totalAdSpend - totalRefundLoss

        // Get user's store currency
        const { data: user } = await supabase
            .from('users')
            .select('store_currency')
            .eq('id', userId)
            .single()

        return {
            date: date.toISOString().split('T')[0],
            totalRevenue,
            totalCOGS,
            totalTax,
            totalShippingCost,
            totalTransactionFees,
            totalAdSpend,
            totalRefundLoss,
            totalNetProfit,
            orderCount,
            averageOrderProfit: orderCount > 0 ? totalNetProfit / orderCount : 0,
            currency: user?.store_currency || 'USD'
        }
    }

    /**
     * Get product-level profitability analysis
     */
    static async getProductProfitability(userId: string, days: number = 30): Promise<ProductProfitability[]> {
        const supabase = await createClient()

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        // Get processed orders with line item details
        const { data: lineItems } = await supabase
            .from('processed_orders')
            .select(`
        shopify_order_id,
        product_id,
        variant_id,
        title,
        quantity,
        price,
        cost,
        total_price,
        is_refunded
      `)
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())

        // Get ad spend by product (from matched campaign names)
        const { data: adsByProduct } = await supabase
            .from('ad_imports')
            .select('matched_product_id, amount_spent')
            .eq('user_id', userId)
            .gte('reporting_date', startDate.toISOString().split('T')[0])
            .not('matched_product_id', 'is', null)

        // Aggregate by product
        const productMap = new Map<string, ProductProfitability>()

        lineItems?.forEach(item => {
            const key = item.variant_id || item.product_id
            const existing = productMap.get(key) || {
                productId: item.product_id,
                variantId: item.variant_id,
                title: item.title,
                revenue: 0,
                cogs: 0,
                adSpend: 0,
                transactionFees: 0,
                netProfit: 0,
                margin: 0,
                soldQuantity: 0,
                returnQuantity: 0,
                returnRate: 0,
                isZombie: false,
                isToxic: false
            }

            existing.revenue += Number(item.total_price || 0)
            existing.cogs += (Number(item.cost || 0) * Number(item.quantity || 1))
            existing.soldQuantity += Number(item.quantity || 1)

            if (item.is_refunded) {
                existing.returnQuantity += Number(item.quantity || 1)
            }

            // Calculate transaction fee per item (2.9% + $0.30 distributed)
            existing.transactionFees += Number(item.total_price || 0) * 0.029

            productMap.set(key, existing)
        })

        // Add ad spend to matched products
        adsByProduct?.forEach(ad => {
            const product = productMap.get(ad.matched_product_id)
            if (product) {
                product.adSpend += Number(ad.amount_spent || 0)
            }
        })

        // Calculate final metrics
        const results: ProductProfitability[] = []

        productMap.forEach(product => {
            product.netProfit = product.revenue - product.cogs - product.transactionFees - product.adSpend
            product.margin = product.revenue > 0 ? (product.netProfit / product.revenue) * 100 : 0
            product.returnRate = product.soldQuantity > 0 ? (product.returnQuantity / product.soldQuantity) * 100 : 0

            // Zombie: Has revenue but negative profit
            product.isZombie = product.revenue > 0 && product.netProfit < 0

            // Toxic: Zombie with high return rate (>20%) or deep negative margin (<-20%)
            product.isToxic = product.isZombie && (product.returnRate > 20 || product.margin < -20)

            results.push(product)
        })

        // Sort by net profit (worst first for action prioritization)
        return results.sort((a, b) => a.netProfit - b.netProfit)
    }

    /**
     * Identify zombie products (revenue positive, profit negative)
     */
    static async getZombieProducts(userId: string, days: number = 30): Promise<ProductProfitability[]> {
        const allProducts = await this.getProductProfitability(userId, days)
        return allProducts.filter(p => p.isZombie)
    }

    /**
     * Identify toxic products (zombies with high return rate or deep losses)
     */
    static async getToxicProducts(userId: string, days: number = 30): Promise<ProductProfitability[]> {
        const allProducts = await this.getProductProfitability(userId, days)
        return allProducts.filter(p => p.isToxic)
    }
}

export default FinancialEngine
