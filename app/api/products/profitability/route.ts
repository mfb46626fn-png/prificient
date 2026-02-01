/**
 * Product Profitability API
 * GET /api/products/profitability
 * 
 * Returns product-level profitability analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { FinancialEngine } from '@/lib/engine/financial'
import { PainEngine } from '@/lib/scoring/pain-engine'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get query params
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        // Get product profitability
        const products = await FinancialEngine.getProductProfitability(user.id, days)

        // Get user's currency
        const { data: userData } = await supabase
            .from('users')
            .select('store_currency')
            .eq('id', user.id)
            .single()

        // Log usage for beta scoring
        await PainEngine.logUsage(user.id, 'product_analysis', 3, { days })

        return NextResponse.json({
            success: true,
            products,
            currency: userData?.store_currency === 'TRY' ? '₺' :
                userData?.store_currency === 'USD' ? '$' :
                    userData?.store_currency === 'EUR' ? '€' : '₺',
            totalProducts: products.length,
            zombieCount: products.filter(p => p.isZombie).length,
            toxicCount: products.filter(p => p.isToxic).length
        })

    } catch (error) {
        console.error('Product profitability error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to analyze products',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
