import { createClient } from '@/utils/supabase/server'
import { PLANS } from '@/config/plans'

interface AssignmentResult {
    planId: string
    reason: string
    riskBand: 'safe' | 'risk' | 'danger' | 'critical'
    upgradeNeeded: boolean
}

export class AssignmentEngine {

    /**
     * Calculates the required plan based on user's diagnosis and volume.
     * @param userId The user to analyze
     * @param currentPlanId Current plan ID to check for upgrade need
     */
    static async calculateRequiredPlan(userId: string): Promise<AssignmentResult> {
        const supabase = await createClient()

        // 1. Fetch Data (Score & Volume)
        // In a real scenario, we might query 'orders' count or 'integrations' count.
        // For MVP, we will rely on 'merchant_health_scores' and mock volume if not available.

        const { data: health } = await supabase
            .from('merchant_health_scores')
            .select('pain_score, diagnosis_data')
            .eq('user_id', userId)
            .maybeSingle()

        // Default constraints (Mocked for now if real data missing)
        const painScore = health?.pain_score || 0
        const monthlyOrders = (health?.diagnosis_data as any)?.volume?.monthly_orders || 150 // Default low
        const integrationsCount = (health?.diagnosis_data as any)?.volume?.integrations_count || 1

        let assignedPlan: typeof PLANS[keyof typeof PLANS] = PLANS.CLEAR
        let reason = "Düşük hacim ve stabil risk skoru."
        let riskBand: AssignmentResult['riskBand'] = 'safe'

        // 2. Logic Matrix

        // A. Pain Score Logic
        if (painScore <= 30) {
            assignedPlan = PLANS.CLEAR
            riskBand = 'safe'
            reason = "Risk seviyeniz yönetilebilir düzeyde (Skor: 0-30). Temel izleme yeterli."
        } else if (painScore <= 80) {
            assignedPlan = PLANS.CONTROL
            riskBand = 'risk'
            reason = `Risk skorunuz yükseldi (${painScore}). Detaylı teşhis ve kontrol gerekiyor.`
        } else {
            assignedPlan = PLANS.VISION
            riskBand = 'critical'
            reason = `KRİTİK RİSK (${painScore}). Acil ve kapsamlı müdahale şart.`
        }

        // B. Technical Overrides (Volume/Complexity)

        // Rule: > 2000 Orders OR > 3 Integrations => Min CONTROL
        if (monthlyOrders > 2000 || integrationsCount > 3) {
            if (assignedPlan.id === PLANS.CLEAR.id) {
                assignedPlan = PLANS.CONTROL
                riskBand = 'risk' // Forced Upgrade
                reason = "İşletme hacminiz ve entegrasyon yoğunluğunuz nedeniyle en az CONTROL planı gereklidir."
            }
        }

        // Rule: > 10,000 Orders => Mandatory VISION
        if (monthlyOrders > 10000) {
            assignedPlan = PLANS.VISION
            riskBand = 'danger'
            reason = "Yüksek ticaret hacminiz (10k+ sipariş) bu ölçekte manuel yönetilemez. VISION protokolü zorunlu."
        }

        // 3. Check Subscription Status (Mock check)
        // In real app we fetch current sub. For now assuming passed in or fetched.
        // Let's assume we return the *Required* plan, and caller decides if upgrade needed.

        return {
            planId: assignedPlan.id,
            reason,
            riskBand,
            upgradeNeeded: false // Calculated by caller comparing with current
        }
    }

    /**
     * Updates the user's subscription record with the new assignment.
     */
    static async syncAssignment(userId: string) {
        const supabase = await createClient()
        const result = await this.calculateRequiredPlan(userId)

        // Determine Blind Mode: If logic dictates CONTROL/VISION but user is on FREE/TRIAL/CLEAR (if inadequate),
        // we might set blind mode? 
        // ACTUALLY: Blind Mode is strictly "Beta Expired & Unpaid".
        // Assignment just sets the target.

        const { error } = await supabase
            .from('subscriptions')
            .update({
                assigned_plan_id: result.planId,
                risk_band: result.riskBand,
                // churn_reason: result.reason // Maybe store explanation elsewhere or in metadata
            })
            .eq('user_id', userId)

        return result
    }
}
