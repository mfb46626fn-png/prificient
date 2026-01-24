import { NextRequest, NextResponse } from 'next/server'
import shopify from '@/lib/shopify'
import { LedgerService } from '@/lib/ledger'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
    const topic = req.headers.get('x-shopify-topic') || ''
    const shop = req.headers.get('x-shopify-shop-domain') || ''

    // Read body as text for verification
    const rawBody = await req.text()

    // 1. Verify HMAC
    const { valid } = await shopify.webhooks.validate({
        rawBody,
        rawRequest: req,
    })

    if (!valid) {
        console.error("Webhook Verification Failed")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)

    // 2. Resolve User from Shop Domain
    const supabase = await createClient()
    const { data: integration } = await supabase
        .from('integrations')
        .select('user_id')
        .eq('shop_domain', shop)
        .eq('platform', 'shopify')
        .single()

    if (!integration) {
        console.error(`Unknown Shop: ${shop}`)
        return NextResponse.json({ message: "Shop not linked to any user" }, { status: 200 })
    }

    const userId = integration.user_id

    try {
        console.log(`Received Webhook: ${topic} for user ${userId}`)

        // 3. Record & Process
        let eventType = 'Unknown'
        if (topic === 'orders/create') eventType = 'OrderCreated'
        else if (topic === 'refunds/create') eventType = 'RefundCreated'
        else if (topic === 'app/uninstalled') eventType = 'AppUninstalled'

        const eventId = await LedgerService.recordEvent(
            userId,
            'shopify_webhook',
            eventType,
            payload
        )

        await LedgerService.processEvent(eventId, userId, eventType, payload)

        return NextResponse.json({ success: true, eventId })

    } catch (e: any) {
        console.error("Webhook Processing Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
