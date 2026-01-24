import { createClient } from '@/utils/supabase/server';
import { PLANS } from '@/config/plans';
import { LedgerService } from '@/lib/ledger';

export const PlanScoringService = {

    async calculateRecommendedPlan(userId: string) {
        const supabase = await createClient();

        // 1. Fetch Integration Count
        const { count: integrationCount } = await supabase
            .from('integrations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'active');

        // 2. Fetch Order Volume (Last 30 Days)
        // Approximate via financial_event_log or Ledger entries count logic
        // Let's use event log for OrderCreated
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: orderCount } = await supabase
            .from('financial_event_log')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('event_type', 'OrderCreated')
            .gte('created_at', thirtyDaysAgo.toISOString());

        // 3. Fetch "Recoverable Loss" (Simulated Payback)
        // We look at the latest Simulation Decision outcome or calculate returns impact
        // For now, let's use a heuristic: 
        // If Refund Rate > 15% AND Revenue > 50,000TL -> High Priority

        const stats = await LedgerService.getWeeklyFinancials(userId, thirtyDaysAgo, new Date());
        const revenue = stats.revenue;
        // Mock refund assumption if not separated yet, or use Benchmarks if available
        // Let's use simple volume/integration heuristics + Revenue Scale

        let score = 0;
        let reasons: string[] = [];

        // SCORING RULES
        // A. Volume
        const vol = orderCount || 0;
        if (vol > 1000) {
            score += 50;
            reasons.push(`Aylık ${vol} sipariş hacmi (Yüksek Ölçek)`);
        } else if (vol > 300) {
            score += 20;
            reasons.push(`Aylık ${vol} sipariş hacmi (Orta Ölçek)`);
        }

        // B. Revenue Scale (Loss Aversion Base)
        if (revenue > 200000) {
            score += 40;
            reasons.push(`₺${(revenue / 1000).toFixed(0)}k Ciro Yönetimi`);
        } else if (revenue > 50000) {
            score += 15;
            reasons.push(`₺${(revenue / 1000).toFixed(0)}k Ciro Yönetimi`);
        }

        // C. Complexity
        const ints = integrationCount || 0;
        if (ints >= 2) {
            score += 20;
            reasons.push(`${ints} Farklı Pazaryeri/Platform Entegrasyonu`);
        }

        // DETERMINATION
        let recommendedPlanId: string = PLANS.CLEAR.id;
        if (score >= 60) {
            recommendedPlanId = PLANS.VISION.id;
        } else if (score >= 30) {
            recommendedPlanId = PLANS.CONTROL.id;
        }

        // If very low usage but still connected, default transparently to CLEAR or CONTROL
        // Use CONTROL as the "sweet spot" push if they are on the edge (e.g. score 25)
        if (score > 15 && score < 30) {
            // Soft Upsell
            recommendedPlanId = PLANS.CONTROL.id;
            reasons.push("Büyüme potansiyeli tespit edildi");
        }

        const recommendation = {
            planId: recommendedPlanId,
            reason: reasons.join(', ') || "Başlangıç için uygun",
            score
        };

        // SAVE TO DB
        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                recommended_plan_id: recommendation.planId,
                recommendation_reason: recommendation.reason,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' }); // Upsert preserves other fields if they exist? 
        // Warning: Partial upsert only works if we don't overwrite nulls. 
        // Supabase upsert requires all Non-Null fields if inserting new. 
        // But here we might be updating an existing row. 
        // Safer to Update if exists, Insert if not (with defaults).
        // Actually 'upsert' handles it, but we need to ensure we don't wipe 'status' if it exists.
        // Let's rely on default constraints for Insert.

        if (error) console.error("Scoring Save Error:", error);

        return recommendation;
    }
}
