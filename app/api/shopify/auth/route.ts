import { NextRequest, NextResponse } from 'next/server'
import shopify from '@/lib/shopify'

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const shop = searchParams.get('shop')

    if (!shop) {
        return NextResponse.json({ error: 'Missing "shop" parameter' }, { status: 400 })
    }

    // Sanitize shop (basic check)
    const sanitizedShop = shopify.utils.sanitizeShop(shop)
    if (!sanitizedShop) {
        return NextResponse.json({ error: 'Invalid "shop" parameter' }, { status: 400 })
    }

    // Begin Auth
    return await shopify.auth.begin({
        shop: sanitizedShop,
        callbackPath: '/api/shopify/callback',
        isOnline: false, // Offline token for background jobs
        rawRequest: req,
    })
}
