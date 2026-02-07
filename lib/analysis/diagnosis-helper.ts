
import { ComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis';
import { PainDiagnosis, PainLevel } from '@/lib/scoring/pain-engine';

export function diagnoseFromAnalysis(analysis: ComprehensiveAnalysis): PainDiagnosis {
    let scorePenalty = 0;
    const factors = {
        toxic_product_impact: 0,
        refund_bleed_impact: 0,
        roas_trap_impact: 0,
        cash_flow_impact: 0,
        silent_fee_impact: 0
    };

    // 1. Toxic Products
    if (analysis && analysis.dangerProducts.length > 0) {
        // Impact scales with number of toxic products
        factors.toxic_product_impact = Math.min(analysis.dangerProducts.length * 10, 30);
        scorePenalty += factors.toxic_product_impact;
    }

    // 2. Refunds (> 10%)
    if (analysis) {
        const gross = analysis.realProfit.grossRevenue || 1;
        const refundRate = (analysis.costBreakdown.refunds / gross) * 100;
        if (refundRate > 10) {
            factors.refund_bleed_impact = 20;
            scorePenalty += 20;
        }
    }

    // 3. Cash Flow (Burn Rate)
    // If net profit is negative, burn rate > 0
    if (analysis && analysis.cashFlow.dailyBurnRate > 0) {
        factors.cash_flow_impact = 15;
        scorePenalty += 15;
    }

    // 4. ROAS Trap (Placeholder if logic exists in analysis)
    // Currently analysis doesn't have deep ROAS logic in MVP, defaulting to 0 or inferring
    // If ads spend > 30% of revenue and net profit < 0
    if (analysis) {
        const ads = analysis.costBreakdown.total_costs - analysis.costBreakdown.cogs - analysis.costBreakdown.shipping - analysis.costBreakdown.platform_fees - analysis.costBreakdown.tax - analysis.costBreakdown.refunds; // Rough Ads proxy? No, analysis has specific fields usually. 
        // comprehensive-analysis.ts doesn't explicitly return 'ads' in costBreakdown yet (generic 'total_costs').
        // But let's check kpi.ads in Dashboard. It was passed as 0. 
        // So ROAS logic is disabled for now.
    }

    const score = Math.max(0, 100 - scorePenalty);
    let level: PainLevel = 'safe';
    if (score < 60) level = 'critical';
    else if (score < 80) level = 'painful';
    else if (score < 95) level = 'unaware';

    // Opportunity Loss Calculation
    // Sum of toxic product losses + estimated refund loss + burn rate?
    // Dashboard used: analysis.opportunityCost.lostProfit / periodDays.
    const dailyLoss = analysis.opportunityCost.lostProfit / (analysis.overview.periodDays || 1);

    return {
        score,
        level,
        factors,
        opportunity_loss: dailyLoss,
        financials: {
            revenue: analysis.realProfit.grossRevenue,
            expenses: analysis.realProfit.totalCosts,
            profit: analysis.realProfit.netProfit,
            toxic_count: analysis.dangerProducts.length,
            fees: analysis.costBreakdown.platform_fees + analysis.costBreakdown.shipping + analysis.costBreakdown.tax
        }
    };
}
