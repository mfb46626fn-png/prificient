import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ──────────────────────────────────────────────

export interface LobbyProfile {
    waitlist_position: number | null
    store_revenue_range: string | null
    store_platform: string | null
    referral_code: string | null
}

export interface ToolUsageRecord {
    id: string
    tool_slug: string
    inputs: Record<string, string>
    result_level: string
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

export async function updateStoreInfo(
    supabase: SupabaseClient,
    userId: string,
    platform: string,
    revenueRange: string
): Promise<boolean> {

    // Boost waitlist position by 500
    const { data: profile } = await supabase
        .from('profiles')
        .select('waitlist_position')
        .eq('id', userId)
        .maybeSingle()

    const currentPos = profile?.waitlist_position ?? 9999
    const newPos = Math.max(1, currentPos - 500)

    const { error } = await supabase
        .from('profiles')
        .update({
            store_platform: platform,
            store_revenue_range: revenueRange,
            waitlist_position: newPos,
        })
        .eq('id', userId)

    return !error
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

// ─── Tool Usage History ─────────────────────────────────

export async function saveToolUsage(
    supabase: SupabaseClient,
    userId: string,
    toolSlug: string,
    inputs: Record<string, string>,
    resultLevel: string,
    insightTitle: string | null
): Promise<void> {

    await supabase.from('tool_usage_history').insert({
        user_id: userId,
        tool_slug: toolSlug,
        inputs,
        result_level: resultLevel,
        insight_title: insightTitle,
    })
}

export async function getToolUsageHistory(
    supabase: SupabaseClient,
    userId: string,
    limit = 20
): Promise<ToolUsageRecord[]> {
    const { data } = await supabase
        .from('tool_usage_history')
        .select('id, tool_slug, inputs, result_level, insight_title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    return (data as ToolUsageRecord[]) || []
}

export async function getUsedToolSlugs(
    supabase: SupabaseClient,
    userId: string
): Promise<string[]> {
    const { data } = await supabase
        .from('tool_usage_history')
        .select('tool_slug')
        .eq('user_id', userId)

    if (!data) return []
    return [...new Set(data.map((d: { tool_slug: string }) => d.tool_slug))]
}
