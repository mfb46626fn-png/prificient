import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ──────────────────────────────────────────────

export interface LobbyProfile {
    waitlist_position: number | null
    store_revenue_range: string | null
    store_platform: string | null
    referral_code: string | null
    display_name: string | null
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
    supabase: SupabaseClient
): Promise<LobbyProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('profiles')
        .select('waitlist_position, store_revenue_range, store_platform, referral_code, display_name')
        .eq('id', user.id)
        .maybeSingle()

    return data as LobbyProfile | null
}

export async function updateStoreInfo(
    supabase: SupabaseClient,
    platform: string,
    revenueRange: string
): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Boost waitlist position by 500
    const { data: profile } = await supabase
        .from('profiles')
        .select('waitlist_position')
        .eq('id', user.id)
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
        .eq('id', user.id)

    return !error
}

export async function updateDisplayName(
    supabase: SupabaseClient,
    name: string
): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
        .from('profiles')
        .update({ display_name: name.trim() })
        .eq('id', user.id)

    return !error
}

// ─── Tool Usage History ─────────────────────────────────

export async function saveToolUsage(
    supabase: SupabaseClient,
    toolSlug: string,
    inputs: Record<string, string>,
    resultLevel: string,
    insightTitle: string | null
): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('tool_usage_history').insert({
        user_id: user.id,
        tool_slug: toolSlug,
        inputs,
        result_level: resultLevel,
        insight_title: insightTitle,
    })
}

export async function getToolUsageHistory(
    supabase: SupabaseClient,
    limit = 20
): Promise<ToolUsageRecord[]> {
    const { data } = await supabase
        .from('tool_usage_history')
        .select('id, tool_slug, inputs, result_level, insight_title, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

    return (data as ToolUsageRecord[]) || []
}

export async function getUsedToolSlugs(
    supabase: SupabaseClient
): Promise<string[]> {
    const { data } = await supabase
        .from('tool_usage_history')
        .select('tool_slug')

    if (!data) return []
    return [...new Set(data.map((d: { tool_slug: string }) => d.tool_slug))]
}
