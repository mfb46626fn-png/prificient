import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get the integration to verify it exists
        const { data: integration, error: fetchError } = await supabase
            .from('integrations')
            .select('id, shop_domain')
            .eq('user_id', user.id)
            .eq('platform', 'shopify')
            .maybeSingle()

        if (fetchError) {
            console.error('Fetch Integration Error:', fetchError)
            return NextResponse.json({ error: 'Bağlantı bilgisi alınamadı' }, { status: 500 })
        }

        if (!integration) {
            return NextResponse.json({ error: 'Aktif Shopify bağlantısı bulunamadı' }, { status: 404 })
        }

        // 2. Delete financial event logs from Shopify
        const { error: eventLogError } = await supabase
            .from('financial_event_log')
            .delete()
            .eq('user_id', user.id)
            .in('stream_type', ['shopify_history_scan', 'shopify_webhook'])

        if (eventLogError) {
            console.error('Delete Event Log Error:', eventLogError)
            // Continue with integration deletion even if event log deletion fails
        }

        // 3. Delete ledger entries related to Shopify events
        // First get all event IDs that were from Shopify
        const { data: shopifyEvents } = await supabase
            .from('financial_event_log')
            .select('event_id')
            .eq('user_id', user.id)
            .in('stream_type', ['shopify_history_scan', 'shopify_webhook'])

        if (shopifyEvents && shopifyEvents.length > 0) {
            const eventIds = shopifyEvents.map(e => e.event_id)

            // Delete ledger entries linked to these events
            await supabase
                .from('ledger_entries')
                .delete()
                .eq('user_id', user.id)
                .in('event_id', eventIds)
        }

        // 4. Delete the integration record
        const { error: deleteError } = await supabase
            .from('integrations')
            .delete()
            .eq('user_id', user.id)
            .eq('platform', 'shopify')

        if (deleteError) {
            console.error('Delete Integration Error:', deleteError)
            return NextResponse.json({ error: 'Bağlantı iptal edilemedi' }, { status: 500 })
        }

        console.log(`[Shopify Disconnect] User ${user.id} disconnected store: ${integration.shop_domain}`)

        return NextResponse.json({
            success: true,
            message: 'Shopify bağlantısı başarıyla iptal edildi'
        })

    } catch (error: any) {
        console.error('Shopify Disconnect Error:', error)
        return NextResponse.json({ error: error.message || 'Bir hata oluştu' }, { status: 500 })
    }
}
