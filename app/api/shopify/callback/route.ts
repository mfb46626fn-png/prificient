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

        // Fetch Shop Currency & Update Settings
        try {
            const client = new shopify.clients.Rest({ session: session as any })
            const shopInfo: any = await client.get({ path: 'shop' })
            const currency = shopInfo.body?.shop?.currency

            if (currency) {
                // Try to update existing settings first
                const { error: settingsUpdateError } = await supabase
                    .from('store_settings')
                    .update({ currency: currency })
                    .eq('user_id', user.id)

                if (settingsUpdateError) {
                    console.warn('[Shopify Callback] Currency update failed, trying upsert...', settingsUpdateError)
                    // Fallback: Create settings if not exists (with dummy defaults)
                    await supabase.from('store_settings').upsert({
                        user_id: user.id,
                        currency: currency,
                        company_type: 'other', // Default
                        active_channels: {},
                        payment_gateways: {},
                        avg_shipping_cost: 0,
                        avg_packaging_cost: 0
                    }, { onConflict: 'user_id' })
                }
                console.log(`[Shopify Callback] Currency updated: ${currency}`)
            }
        } catch (currencyError) {
            console.error('[Shopify Callback] Failed to fetch/save currency:', currencyError)
        }

        // Webhook Registration (optional, can fail silently)
        try {
            await shopify.webhooks.register({ session })
            console.log('[Shopify Callback] Webhooks registered')
        } catch (webhookError) {
            console.warn('[Shopify Callback] Webhook registration failed:', webhookError)
        }

        // NOT: Sync işlemini callback içinde yapmıyoruz çünkü Vercel timeout sınırına takılıyor (çok veri varsa).
        // Bunun yerine Dashboard'a yönlendirip orada tetikleyeceğiz.
        console.log('[Shopify Callback] Skipping sync in callback to prevent timeout. Redirecting...')

        // Redirect to Dashboard with sync flag
        return NextResponse.redirect(new URL('/dashboard?shopify=connected&sync_start=true', req.url))

    } catch (error: any) {
        console.error('[Shopify Callback] Fatal Error:', error)
        return NextResponse.redirect(new URL('/dashboard/settings?error=shopify_failed', req.url))
    }
}

