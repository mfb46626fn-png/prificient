import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ──────────────────────────────────────────────

export interface LobbyProfile {
    waitlist_position: number | null
    store_revenue_range: string | null
    store_platform: string | null
    referral_code: string | null
}

export interface FinancialAuditRecord {
    id: string
    tool_slug: string
    inputs: Record<string, string>
    severity_level: string
    insight_title: string | null
    created_at: string
}

// ─── Profile / Waitlist ─────────────────────────────────

export async function getLobbyProfile(
    supabase: SupabaseClient,
    userId: string
): Promise<LobbyProfile | null> {

    const { data } = await supabase
        .from('profiles')
        .select('waitlist_position, store_revenue_range, store_platform, referral_code')
        .eq('id', userId)
        .maybeSingle()

    return data as LobbyProfile | null
}



export async function updateDisplayName(
    supabase: SupabaseClient,
    userId: string,
    name: string
): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim() }
    })

    return !error
}

// ─── Financial Audits ─────────────────────────────────

export async function saveFinancialAudit(
    supabase: SupabaseClient,
    userId: string,
    toolSlug: string,
    inputs: Record<string, string>,
    severityLevel: string,
    insightTitle: string | null
): Promise<void> {

    await supabase.from('financial_audits').insert({
        user_id: userId,
        tool_slug: toolSlug,
        inputs,
        severity_level: severityLevel,
        insight_title: insightTitle,
    })
}

export async function getAuditHistory(
    supabase: SupabaseClient,
    userId: string,
    limit = 20
): Promise<FinancialAuditRecord[]> {
    const { data } = await supabase
        .from('financial_audits')
        .select('id, tool_slug, inputs, severity_level, insight_title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    return (data as FinancialAuditRecord[]) || []
}

export async function getUsedToolSlugs(
    supabase: SupabaseClient,
    userId: string
): Promise<string[]> {
    const { data } = await supabase
        .from('financial_audits')
        .select('tool_slug')
        .eq('user_id', userId)

    if (!data) return []
    return [...new Set(data.map((d: { tool_slug: string }) => d.tool_slug))]
}
