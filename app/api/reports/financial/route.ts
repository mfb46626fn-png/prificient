/**
 * Financial Report API
 * GET /api/reports/financial
 * 
 * Returns detailed financial breakdown for reporting
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { FinancialEngine } from '@/lib/engine/financial'
import { PainEngine } from '@/lib/scoring/pain-engine'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        // Get daily financials for the period
        const dailyData: Array<{
            date: string
            revenue: number
            cogs: number
            fees: number
            adSpend: number
            netProfit: number
        }> = []

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const data = await FinancialEngine.getDailyFinancials(user.id, new Date(d))
            dailyData.push({
                date: data.date,
                revenue: data.totalRevenue,
                cogs: data.totalCOGS,
                fees: data.totalTransactionFees,
                adSpend: data.totalAdSpend,
                netProfit: data.totalNetProfit
            })
        }

        // Get product profitability
        const products = await FinancialEngine.getProductProfitability(user.id, days)
        const zombieProducts = products.filter(p => p.isZombie)
        const toxicProducts = products.filter(p => p.isToxic)

        // Calculate totals
        const totals = dailyData.reduce((acc, day) => ({
            revenue: acc.revenue + day.revenue,
            cogs: acc.cogs + day.cogs,
            fees: acc.fees + day.fees,
            adSpend: acc.adSpend + day.adSpend,
            netProfit: acc.netProfit + day.netProfit
        }), { revenue: 0, cogs: 0, fees: 0, adSpend: 0, netProfit: 0 })

        // Get user's currency
        const { data: userData } = await supabase
            .from('users')
            .select('store_currency')
            .eq('id', user.id)
            .single()

        // Log usage for beta scoring
        await PainEngine.logUsage(user.id, 'report_export', 8, { days, type: 'financial' })

        return NextResponse.json({
            success: true,
            period: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
                days
            },
            totals: {
                ...totals,
                margin: totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0
            },
            breakdown: {
                revenue: totals.revenue,
                costs: {
                    cogs: totals.cogs,
                    fees: totals.fees,
                    adSpend: totals.adSpend,
                    total: totals.cogs + totals.fees + totals.adSpend
                },
                netProfit: totals.netProfit
            },
            dailyData,
            products: {
                total: products.length,
                profitable: products.length - zombieProducts.length,
                zombie: zombieProducts.length,
                toxic: toxicProducts.length,
                zombieLoss: zombieProducts.reduce((sum, p) => sum + Math.abs(p.netProfit), 0),
                topProfitable: products.filter(p => !p.isZombie).slice(-5).reverse(),
                worstZombies: zombieProducts.slice(0, 5)
            },
            currency: userData?.store_currency || 'TRY'
        })

    } catch (error) {
        console.error('Financial report error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to generate report',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
