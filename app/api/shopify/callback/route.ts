import { NextRequest, NextResponse } from 'next/server'
import shopify from '@/lib/shopify'
import { createClient } from '@/utils/supabase/server'
import { ShopifyHistoryScanner } from '@/lib/sync/shopify-history'

export const dynamic = 'force-dynamic';
// Increase timeout for Vercel Pro (max 60s on Pro, 10s on Hobby)
export const maxDuration = 60;

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const shop = url.searchParams.get('shop')

    try {
        console.log('[Shopify Callback] Starting for shop:', shop)

        const callbackResponse = await shopify.auth.callback({
            rawRequest: req,
        })

        const { session } = callbackResponse

        if (!session || !session.shop || !session.accessToken) {
            throw new Error("Session creation failed")
        }

        console.log('[Shopify Callback] Session obtained for:', session.shop)

        // Supabase Connection
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.error('[Shopify Callback] No authenticated user found!')
            return NextResponse.redirect(new URL('/login?error=shopify_auth_failed', req.url))
        }

        console.log('[Shopify Callback] User found:', user.id)

        // Save to Database
        const { error: dbError } = await supabase.from('integrations').upsert({
            user_id: user.id,
            platform: 'shopify',
            shop_domain: session.shop,
            access_token: session.accessToken,
            status: 'active',
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, platform, shop_domain' })

        if (dbError) {
            console.error('[Shopify Callback] DB Save Error:', dbError)
        } else {
            console.log('[Shopify Callback] Integration saved successfully')
        }

        // Webhook Registration (optional, can fail silently)
        try {
            await shopify.webhooks.register({ session })
            console.log('[Shopify Callback] Webhooks registered')
        } catch (webhookError) {
            console.warn('[Shopify Callback] Webhook registration failed:', webhookError)
        }

        // SYNC DATA SYNCHRONOUSLY (Vercel serverless kills async jobs after response)
        // This must complete before we redirect
        console.log('[Shopify Callback] Starting history sync...')
        try {
            const syncedCount = await ShopifyHistoryScanner.scanPastShopifyData(
                user.id,
                session.shop,
                session.accessToken,
                60 // Last 60 days
            )
            console.log('[Shopify Callback] Sync completed. Orders synced:', syncedCount)
        } catch (syncError) {
            console.error('[Shopify Callback] Sync Error:', syncError)
            // Don't fail the whole callback, just log and continue
        }

        // Redirect to Dashboard (scanning page was removed)
        return NextResponse.redirect(new URL('/dashboard?shopify=connected', req.url))

    } catch (error: any) {
        console.error('[Shopify Callback] Fatal Error:', error)
        return NextResponse.redirect(new URL('/dashboard/settings?error=shopify_failed', req.url))
    }
}

