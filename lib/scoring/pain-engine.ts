import { createClient } from '@/utils/supabase/server'
import { ProductAnalysis } from '@/lib/analysis/product-profitability'

export type PainLevel = 'safe' | 'unaware' | 'painful' | 'critical'

// Turkish segment names for UI display
export type PainSegment = 'Rahat' | 'Risk' | 'Tehlike' | 'Alarm'

// Beta package assignment based on usage score
export type BetaPackage = 'clear' | 'control' | 'vision'

export interface UsageScore {
    totalPoints: number
    breakdown: {
        apiCalls: number
        reportExports: number
        scenarioRuns: number
        dashboardViews: number
        productAnalysis: number
        metaImports: number
    }
    recommendedPackage: BetaPackage
}

export interface PainDiagnosis {
    score: number
    level: PainLevel
    factors: {
        toxic_product_impact: number
        refund_bleed_impact: number
        roas_trap_impact: number
        cash_flow_impact: number
        silent_fee_impact: number
    }
    opportunity_loss: number
    financials: {
        revenue: number
        expenses: number
        profit: number
        toxic_count: number
        fees: number
    }
}

export const PainEngine = {
    async diagnose(userId: string): Promise<PainDiagnosis> {
        const supabase = await createClient()
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - 30)

        // 1. Fetch Financial Aggregates
        const { data: accounts } = await supabase.from('ledger_accounts')
            .select('id, code')
            .eq('user_id', userId)

        const getAccId = (code: string) => accounts?.find(a => a.code === code)?.id

        const accIds = {
            revenue: getAccId('600'),
            returns: getAccId('610'),
            fees: getAccId('740'),
            marketing: getAccId('760'),
            admin: getAccId('770'),
            finance: getAccId('780')
        }

        const { data: entries } = await supabase.from('ledger_entries')
            .select('account_id, amount, direction')
            .eq('user_id', userId)
            .in('account_id', Object.values(accIds).filter(Boolean) as string[])

        const balances: Record<string, number> = { '600': 0, '610': 0, '740': 0, '760': 0, '770': 0 }

        entries?.forEach((e: any) => {
            const code = accounts?.find(a => a.id === e.account_id)?.code
            if (code) {
                if (code === '600' && e.direction === 'CREDIT') balances[code] += Number(e.amount)
                if (code === '600' && e.direction === 'DEBIT') balances[code] -= Number(e.amount)

                if (['610', '740', '760', '770'].includes(code) && e.direction === 'DEBIT') balances[code] += Number(e.amount)
                if (['610', '740', '760', '770'].includes(code) && e.direction === 'CREDIT') balances[code] -= Number(e.amount)
            }
        })

        const Revenue = balances['600'] || 0
        const Returns = balances['610'] || 0
        const Marketing = balances['760'] || 0
        const Fees = (balances['740'] || 0) + (balances['770'] || 0)
        const TotalExpense = Marketing + Fees + Returns
        const NetGap = Revenue - TotalExpense

        // --- SCORING LOGIC ---
        let score = 0
        let factors = {
            toxic_product_impact: 0,
            refund_bleed_impact: 0,
            roas_trap_impact: 0,
            cash_flow_impact: 0,
            silent_fee_impact: 0
        }
        let totalDailyLoss = 0

        // 1. Toxic Products (+5 each, max 30)
        const products = await ProductAnalysis.analyzeProductProfitability(userId, startDate, endDate)
        const toxicProducts = products.filter(p => p.status === 'toxic')

        factors.toxic_product_impact = Math.min(toxicProducts.length * 5, 30)
        score += factors.toxic_product_impact

        for (const tp of toxicProducts) {
            if (tp.net_sales < 0) {
                const dailyLoss = Math.abs(tp.net_sales) / 30
                totalDailyLoss += dailyLoss
                await this.logIssue(supabase, userId, 'toxic_product', tp.variant_id, dailyLoss)
            }
        }

        // 2. Refund Bleed (+3 per 1% > 10%, max 20)
        const refundRate = Revenue > 0 ? (Returns / Revenue) * 100 : 0
        if (refundRate > 10) {
            const bleedPoints = Math.min(Math.ceil(refundRate - 10) * 3, 20)
            factors.refund_bleed_impact = bleedPoints
            score += bleedPoints

            const dailyBleed = (Returns / 30) * 0.2
            totalDailyLoss += dailyBleed
            await this.logIssue(supabase, userId, 'high_refund_rate', 'global', dailyBleed)
        }

        // 3. ROAS Trap (+25)
        const roas = Marketing > 0 ? Revenue / Marketing : 0
        if (roas > 3 && NetGap < 0) {
            factors.roas_trap_impact = 25
            score += 25
            const dailyLoss = Math.abs(NetGap) / 30
            totalDailyLoss += dailyLoss
            await this.logIssue(supabase, userId, 'roas_trap', 'global', dailyLoss)
        }

        // 4. Cash Flow / High Expense Ratio (+15)
        if (Revenue > 0 && TotalExpense > (Revenue * 0.8)) {
            factors.cash_flow_impact = 15
            score += 15
        }

        // 5. Silent Fees (+10)
        if (Revenue > 0 && Fees > (Revenue * 0.15)) {
            factors.silent_fee_impact = 10
            score += 10
            const excessFees = Fees - (Revenue * 0.15)
            const dailyExcess = excessFees / 30
            totalDailyLoss += dailyExcess
            await this.logIssue(supabase, userId, 'silent_fees_high', 'global', dailyExcess)
        }

        const finalScore = Math.min(score, 100)
        let level: PainLevel = 'safe'
        if (finalScore > 80) level = 'critical'
        else if (finalScore > 60) level = 'painful'
        else if (finalScore > 30) level = 'unaware'

        await supabase.from('merchant_health_scores').upsert({
            user_id: userId,
            pain_score: finalScore,
            pain_level: level,
            factors: factors,
            updated_at: new Date().toISOString()
        })

        return {
            score: finalScore,
            level,
            factors,
            opportunity_loss: totalDailyLoss,
            financials: {
                revenue: Revenue,
                expenses: TotalExpense,
                profit: NetGap,
                toxic_count: toxicProducts.length,
                fees: Fees
            }
        }
    },

    async logIssue(supabase: any, userId: string, type: string, entityId: string, dailyLoss: number) {
        const { data: existing } = await supabase.from('opportunity_loss_log')
            .select('id')
            .eq('user_id', userId)
            .eq('issue_type', type)
            .eq('entity_id', entityId)
            .eq('status', 'ignored')
            .maybeSingle()

        if (existing) {
            await supabase.from('opportunity_loss_log').update({
                daily_loss_amount: dailyLoss,
                detected_at: new Date().toISOString()
            }).eq('id', existing.id)
        } else {
            await supabase.from('opportunity_loss_log').insert({
                user_id: userId,
                issue_type: type,
                entity_id: entityId,
                daily_loss_amount: dailyLoss,
                status: 'ignored'
            })
        }
    },

    /**
     * Get Turkish segment name for UI display
     */
    getSegmentName(score: number): PainSegment {
        if (score >= 81) return 'Alarm'
        if (score >= 61) return 'Tehlike'
        if (score >= 31) return 'Risk'
        return 'Rahat'
    },

    /**
     * Get segment color for UI
     */
    getSegmentColor(score: number): string {
        if (score >= 81) return '#dc2626' // Red - Alarm
        if (score >= 61) return '#f97316' // Orange - Tehlike
        if (score >= 31) return '#eab308' // Yellow - Risk
        return '#22c55e' // Green - Rahat
    },

    /**
     * Calculate beta usage score for package assignment
     * Point values:
     * - API calls: 10 pts each
     * - Report exports: 8 pts each
     * - Scenario runs: 5 pts each (changed from 2 to make it more valuable)
     * - Dashboard views: 1 pt each
     * - Product analysis: 3 pts each
     * - Meta imports: 10 pts each
     */
    async calculateUsageScore(userId: string): Promise<UsageScore> {
        const supabase = await createClient()

        const { data: logs } = await supabase
            .from('beta_usage_logs')
            .select('action_type, points')
            .eq('user_id', userId)

        const breakdown = {
            apiCalls: 0,
            reportExports: 0,
            scenarioRuns: 0,
            dashboardViews: 0,
            productAnalysis: 0,
            metaImports: 0
        }

        let totalPoints = 0

        logs?.forEach(log => {
            const points = log.points || 1
            totalPoints += points

            switch (log.action_type) {
                case 'api_call':
                    breakdown.apiCalls += points
                    break
                case 'report_export':
                    breakdown.reportExports += points
                    break
                case 'scenario_run':
                    breakdown.scenarioRuns += points
                    break
                case 'dashboard_view':
                    breakdown.dashboardViews += points
                    break
                case 'product_analysis':
                    breakdown.productAnalysis += points
                    break
                case 'meta_csv_import':
                    breakdown.metaImports += points
                    break
            }
        })

        // Determine recommended package based on usage
        // 0-9 points: Clear (basic)
        // 10-29 points: Control (intermediate)
        // 30+ points: Vision (full)
        let recommendedPackage: BetaPackage = 'clear'
        if (totalPoints >= 30) {
            recommendedPackage = 'vision'
        } else if (totalPoints >= 10) {
            recommendedPackage = 'control'
        }

        // Update user's usage score
        await supabase
            .from('users')
            .update({ usage_score: totalPoints })
            .eq('id', userId)

        return {
            totalPoints,
            breakdown,
            recommendedPackage
        }
    },

    /**
     * Log a usage action for beta scoring
     */
    async logUsage(userId: string, actionType: string, points: number = 1, metadata?: Record<string, any>) {
        const supabase = await createClient()

        await supabase.from('beta_usage_logs').insert({
            user_id: userId,
            action_type: actionType,
            points,
            metadata: metadata || {}
        })
    },

    /**
     * Get recommended package based on usage score
     */
    recommendPackage(usageScore: number): BetaPackage {
        if (usageScore >= 30) return 'vision'
        if (usageScore >= 10) return 'control'
        return 'clear'
    },

    /**
     * Update user's pain score in database
     */
    async updatePainScore(userId: string, score: number): Promise<void> {
        const supabase = await createClient()
        const segment = this.getSegmentName(score)

        await supabase
            .from('users')
            .update({
                pain_score: score,
                pain_segment: segment
            })
            .eq('id', userId)
    }
}
