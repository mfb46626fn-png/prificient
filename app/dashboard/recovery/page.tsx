import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PainEngine } from '@/lib/scoring/pain-engine'
import RecoveryClient from '@/components/RecoveryClient'

export default async function RecoveryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Default Safe State
    let diagnosis = {
        score: 0,
        level: 'safe',
        factors: { toxic_product_impact: 0, refund_bleed_impact: 0, roas_trap_impact: 0, cash_flow_impact: 0, silent_fee_impact: 0 },
        opportunity_loss: 0
    } as any

    try {
        diagnosis = await PainEngine.diagnose(user.id)
    } catch (e) {
        console.error("Recovery Diagnosis Error", e)
    }

    return <RecoveryClient diagnosis={diagnosis} />
}
