/**
 * Event Engine - Event Sourcing Lite
 * 
 * Records merchant decisions and correlates them with outcomes.
 * Enables "What happened after X decision?" analysis.
 */

import { createClient } from '@/utils/supabase/server'

export type EventType =
    | 'PRICE_CHANGED'
    | 'AD_BUDGET_INCREASED'
    | 'AD_BUDGET_DECREASED'
    | 'PRODUCT_DISABLED'
    | 'PRODUCT_ENABLED'
    | 'RETURN_RATE_SPIKE'
    | 'NET_PROFIT_NEGATIVE'
    | 'STOCK_OUT'
    | 'NEW_CAMPAIGN_STARTED'
    | 'CAMPAIGN_STOPPED'

export interface MerchantEvent {
    id: string
    userId: string
    eventType: EventType
    entityType: 'product' | 'campaign' | 'order' | 'store'
    entityId: string
    payload: Record<string, any>
    outcome?: Record<string, any>
    outcomeDate?: Date
    createdAt: Date
}

export interface EventOutcome {
    profitChange: number
    revenueChange: number
    returnRateChange: number
    wasPositive: boolean
}

export class EventEngine {

    /**
     * Record a merchant event/decision
     */
    static async recordEvent(
        userId: string,
        eventType: EventType,
        entityType: MerchantEvent['entityType'],
        entityId: string,
        payload: Record<string, any>
    ): Promise<MerchantEvent | null> {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('merchant_events')
            .insert({
                user_id: userId,
                event_type: eventType,
                entity_type: entityType,
                entity_id: entityId,
                payload
            })
            .select()
            .single()

        if (error) {
            console.error('Failed to record event:', error)
            return null
        }

        return {
            id: data.id,
            userId: data.user_id,
            eventType: data.event_type,
            entityType: data.entity_type,
            entityId: data.entity_id,
            payload: data.payload,
            outcome: data.outcome,
            outcomeDate: data.outcome_date ? new Date(data.outcome_date) : undefined,
            createdAt: new Date(data.created_at)
        }
    }

    /**
     * Get events for a user with optional filters
     */
    static async getEvents(
        userId: string,
        options?: {
            eventType?: EventType
            entityType?: MerchantEvent['entityType']
            entityId?: string
            startDate?: Date
            endDate?: Date
            limit?: number
        }
    ): Promise<MerchantEvent[]> {
        const supabase = await createClient()

        let query = supabase
            .from('merchant_events')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (options?.eventType) {
            query = query.eq('event_type', options.eventType)
        }
        if (options?.entityType) {
            query = query.eq('entity_type', options.entityType)
        }
        if (options?.entityId) {
            query = query.eq('entity_id', options.entityId)
        }
        if (options?.startDate) {
            query = query.gte('created_at', options.startDate.toISOString())
        }
        if (options?.endDate) {
            query = query.lte('created_at', options.endDate.toISOString())
        }
        if (options?.limit) {
            query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) {
            console.error('Failed to fetch events:', error)
            return []
        }

        return data.map(e => ({
            id: e.id,
            userId: e.user_id,
            eventType: e.event_type,
            entityType: e.entity_type,
            entityId: e.entity_id,
            payload: e.payload,
            outcome: e.outcome,
            outcomeDate: e.outcome_date ? new Date(e.outcome_date) : undefined,
            createdAt: new Date(e.created_at)
        }))
    }

    /**
     * Analyze outcome for an event (called 14 days after event)
     * Compares metrics before and after the event
     */
    static async analyzeOutcome(eventId: string): Promise<EventOutcome | null> {
        const supabase = await createClient()

        const { data: event, error } = await supabase
            .from('merchant_events')
            .select('*')
            .eq('id', eventId)
            .single()

        if (error || !event) {
            console.error('Event not found:', error)
            return null
        }

        const eventDate = new Date(event.created_at)
        const now = new Date()
        const daysSinceEvent = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))

        // Only analyze if 14+ days have passed
        if (daysSinceEvent < 14) {
            return null
        }

        // Get 14-day metrics BEFORE the event
        const beforeStart = new Date(eventDate)
        beforeStart.setDate(beforeStart.getDate() - 14)

        // Get 14-day metrics AFTER the event
        const afterEnd = new Date(eventDate)
        afterEnd.setDate(afterEnd.getDate() + 14)

        // Query ledger for before/after comparison
        const [beforeMetrics, afterMetrics] = await Promise.all([
            this.getMetricsForPeriod(event.user_id, beforeStart, eventDate),
            this.getMetricsForPeriod(event.user_id, eventDate, afterEnd)
        ])

        const outcome: EventOutcome = {
            profitChange: afterMetrics.profit - beforeMetrics.profit,
            revenueChange: afterMetrics.revenue - beforeMetrics.revenue,
            returnRateChange: afterMetrics.returnRate - beforeMetrics.returnRate,
            wasPositive: afterMetrics.profit > beforeMetrics.profit
        }

        // Store outcome
        await supabase
            .from('merchant_events')
            .update({
                outcome,
                outcome_date: now.toISOString()
            })
            .eq('id', eventId)

        return outcome
    }

    /**
     * Get aggregated metrics for a period
     */
    private static async getMetricsForPeriod(
        userId: string,
        startDate: Date,
        endDate: Date
    ): Promise<{ profit: number; revenue: number; returnRate: number }> {
        const supabase = await createClient()

        // Get ledger entries for the period
        const { data: entries } = await supabase
            .from('ledger_entries')
            .select(`
        debit,
        credit,
        ledger_accounts (code)
      `)
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())

        let revenue = 0
        let expenses = 0

        entries?.forEach((entry: any) => {
            const code = entry?.ledger_accounts?.code || ''
            if (code.startsWith('4')) { // Revenue
                revenue += Number(entry.credit || 0) - Number(entry.debit || 0)
            } else if (code.startsWith('5') || code.startsWith('6')) { // Expenses
                expenses += Number(entry.debit || 0) - Number(entry.credit || 0)
            }
        })

        // Get return rate
        const { data: orders } = await supabase
            .from('processed_orders')
            .select('is_refunded')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())

        const totalOrders = orders?.length || 0
        const refundedOrders = orders?.filter(o => o.is_refunded).length || 0
        const returnRate = totalOrders > 0 ? (refundedOrders / totalOrders) * 100 : 0

        return {
            profit: revenue - expenses,
            revenue,
            returnRate
        }
    }

    /**
     * Get events pending outcome analysis (older than 14 days without outcome)
     */
    static async getEventsPendingAnalysis(limit: number = 100): Promise<MerchantEvent[]> {
        const supabase = await createClient()

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - 14)

        const { data, error } = await supabase
            .from('merchant_events')
            .select('*')
            .is('outcome', null)
            .lte('created_at', cutoffDate.toISOString())
            .limit(limit)

        if (error) {
            console.error('Failed to fetch pending events:', error)
            return []
        }

        return data.map(e => ({
            id: e.id,
            userId: e.user_id,
            eventType: e.event_type,
            entityType: e.entity_type,
            entityId: e.entity_id,
            payload: e.payload,
            createdAt: new Date(e.created_at)
        }))
    }

    /**
     * Helper: Record price change event
     */
    static async recordPriceChange(
        userId: string,
        productId: string,
        oldPrice: number,
        newPrice: number
    ): Promise<MerchantEvent | null> {
        return this.recordEvent(userId, 'PRICE_CHANGED', 'product', productId, {
            oldPrice,
            newPrice,
            changePercent: ((newPrice - oldPrice) / oldPrice) * 100
        })
    }

    /**
     * Helper: Record ad budget change
     */
    static async recordAdBudgetChange(
        userId: string,
        campaignId: string,
        oldBudget: number,
        newBudget: number
    ): Promise<MerchantEvent | null> {
        const eventType = newBudget > oldBudget ? 'AD_BUDGET_INCREASED' : 'AD_BUDGET_DECREASED'
        return this.recordEvent(userId, eventType, 'campaign', campaignId, {
            oldBudget,
            newBudget,
            changePercent: ((newBudget - oldBudget) / oldBudget) * 100
        })
    }

    /**
     * Helper: Record return rate spike
     */
    static async recordReturnRateSpike(
        userId: string,
        productId: string,
        currentRate: number,
        previousRate: number
    ): Promise<MerchantEvent | null> {
        return this.recordEvent(userId, 'RETURN_RATE_SPIKE', 'product', productId, {
            currentRate,
            previousRate,
            increasePercent: currentRate - previousRate
        })
    }

    /**
     * Helper: Record negative profit day
     */
    static async recordNegativeProfitDay(
        userId: string,
        date: string,
        netProfit: number
    ): Promise<MerchantEvent | null> {
        return this.recordEvent(userId, 'NET_PROFIT_NEGATIVE', 'store', 'daily', {
            date,
            netProfit
        })
    }
}

export default EventEngine
