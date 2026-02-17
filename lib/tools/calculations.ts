import type { SupabaseClient } from '@supabase/supabase-js'

export interface ToolCalculation {
    id: string
    tool_name: string
    inputs: Record<string, string>
    results: Record<string, number>
    created_at: string
}

export async function saveCalculation(
    supabase: SupabaseClient,
    toolName: string,
    inputs: Record<string, string>,
    results: Record<string, number>
): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('tool_calculations').insert({
        user_id: user.id,
        tool_name: toolName,
        inputs,
        results,
    })
}

export async function getCalculationHistory(
    supabase: SupabaseClient,
    toolName: string,
    limit = 10
): Promise<ToolCalculation[]> {
    const { data } = await supabase
        .from('tool_calculations')
        .select('id, tool_name, inputs, results, created_at')
        .eq('tool_name', toolName)
        .order('created_at', { ascending: false })
        .limit(limit)

    return (data as ToolCalculation[]) || []
}
