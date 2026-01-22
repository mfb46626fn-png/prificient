'use server'

import { createClient } from '@/utils/supabase/server'
import { MetaService } from '@/lib/meta'
import { revalidatePath } from 'next/cache'

export async function getIntegrationAndAccounts() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Oturum açılmamış.' }

    // 1. Get Integration Token
    const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'meta-ads')
        .single()

    if (!integration || !integration.access_token) {
        return { error: 'Meta bağlantısı bulunamadı.' }
    }

    try {
        // 2. Fetch Accounts
        const accounts = await MetaService.getAdAccounts(integration.access_token)
        return { accounts }
    } catch (error: any) {
        console.error('Fetch Accounts Error:', error)
        return { error: 'Hesaplar çekilemedi: ' + error.message }
    }
}

export async function saveAccountSelection(accountId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        // Update Integration
        const { error } = await supabase
            .from('integrations')
            .update({
                metadata: { ad_account_id: accountId }, // Store selection
                status: 'active', // Mark as ready
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('provider', 'meta-ads')

        if (error) throw error
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}
