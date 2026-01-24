import { NextRequest, NextResponse } from 'next/server'
import shopify from '@/lib/shopify'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const shop = url.searchParams.get('shop')

    try {
        const callbackResponse = await shopify.auth.callback({
            rawRequest: req,
        })

        const { session } = callbackResponse

        if (!session || !session.shop || !session.accessToken) {
            throw new Error("Session creation failed")
        }

        // Supabase Connection
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Not: Callback sırasında kullanıcı session'ı olmayabilir (Shopify iframe içinde veya redirect ile geldiğinde).
        // Bu yüzden genellikle OAuth başlarken state parametresi ile user_id taşınır veya cookie kullanılır.
        // Ancak MVP için şimdilik kullanıcının tarayıcı cookie'sinin korunduğunu varsayıyoruz.

        if (!user) {
            // Eğer user yoksa, bu bir sorun olabilir.
            // Alternatif: Shopify session'ından shop'u bulup, geçici olarak kaydetmek
            // Ama biz 'integrations' tablosuna user_id ile yazıyoruz.
            console.warn("User not found in callback. Ensure SameSite cookies are handled.")
            // return NextResponse.json({ error: "User not authenticated." }, { status: 401 })
        }

        // Save to Database (User ID varsa)
        if (user) {
            const { error } = await supabase.from('integrations').upsert({
                user_id: user.id,
                platform: 'shopify',
                shop_domain: session.shop,
                access_token: session.accessToken,
                status: 'active',
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, platform, shop_domain' })

            if (error) {
                console.error("Supabase Save Error:", error)
            }
        }

        // Webhook Registration
        await shopify.webhooks.register({
            session,
        })

        // TRIGGER BACKGROUND SYNC (Fire and Forget)
        // In a serverless environment (Vercel), correct way is to use `waitUntil` or a queue.
        // For MVP on standard Node/VPS, not awaiting works but is risky if process dies.
        // We will just call the internal library function if possible, but we don't have direct access here easily without importing logic.
        // Plan: Let's import the library function if we can, or just let the Onboarding page trigger it via client-side fetch if preferred.
        // But the request said "Trigger sync in background".
        // Let's assume we can import `scanPastShopifyData` from `lib/sync/shopify-history`.

        // Ensure user is defined before using it
        if (user) {
            import('@/lib/sync/shopify-history').then(({ ShopifyHistoryScanner }) => {
                // Trigger full scan for last 60 days
                const startDate = new Date()
                startDate.setDate(startDate.getDate() - 60)
                if (session.accessToken) {
                    ShopifyHistoryScanner.scanPastShopifyData(user.id, session.shop, session.accessToken, 60)
                        .catch(e => console.error("Background Sync Error:", e))
                }
            }).catch(e => console.error("Import Error:", e))
        }

        // Redirect to Cinematic Scanning Page
        return NextResponse.redirect(new URL('/onboarding/scanning', req.url))

    } catch (error: any) {
        console.error("Shopify Callback Error:", error)
        return NextResponse.json({ error: error.toString() }, { status: 500 })
    }
}
