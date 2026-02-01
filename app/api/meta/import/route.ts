/**
 * Meta Ads CSV Import API
 * POST /api/meta/import
 * 
 * Accepts CSV file upload and imports Meta Ads data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { MetaImportEngine } from '@/lib/engine/meta-import'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get form data with CSV file
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            return NextResponse.json({ error: 'Only CSV files are accepted' }, { status: 400 })
        }

        // Read file content
        const csvText = await file.text()

        // Parse CSV
        const { rows, errors: parseErrors } = MetaImportEngine.parseCSV(csvText)

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No valid data rows found in CSV',
                parseErrors
            }, { status: 400 })
        }

        // Get user's products for matching
        const { data: products } = await supabase
            .from('processed_orders')
            .select('product_id, variant_id, title')
            .eq('user_id', user.id)
            .not('product_id', 'is', null)

        // Deduplicate products
        const uniqueProducts = new Map<string, { id: string; variant_id?: string; title: string }>()
        products?.forEach(p => {
            if (!uniqueProducts.has(p.product_id)) {
                uniqueProducts.set(p.product_id, {
                    id: p.product_id,
                    variant_id: p.variant_id,
                    title: p.title
                })
            }
        })

        // Import data
        const result = await MetaImportEngine.importAdData(
            user.id,
            rows,
            Array.from(uniqueProducts.values())
        )

        // Log usage for beta scoring
        await supabase.from('beta_usage_logs').insert({
            user_id: user.id,
            action_type: 'meta_csv_import',
            points: 10,
            metadata: {
                rowCount: result.importedRows,
                matchedCount: result.matchedRows,
                batchId: result.batchId
            }
        })

        return NextResponse.json({
            success: result.success,
            message: result.success
                ? `${result.importedRows} satır import edildi, ${result.matchedRows} ürünle eşleştirildi`
                : 'Import sırasında hatalar oluştu',
            data: {
                totalRows: result.totalRows,
                importedRows: result.importedRows,
                matchedRows: result.matchedRows,
                unmatchedCampaigns: result.unmatchedCampaigns.slice(0, 10), // Limit to first 10
                batchId: result.batchId
            },
            errors: [...parseErrors, ...result.errors]
        })

    } catch (error) {
        console.error('Meta import error:', error)
        return NextResponse.json({
            success: false,
            error: 'Import failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

/**
 * GET /api/meta/import
 * Get import history
 */
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const history = await MetaImportEngine.getImportHistory(user.id)

        return NextResponse.json({
            success: true,
            imports: history
        })

    } catch (error) {
        console.error('Get import history error:', error)
        return NextResponse.json({ error: 'Failed to get history' }, { status: 500 })
    }
}

/**
 * DELETE /api/meta/import?batchId=xxx
 * Delete an import batch
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const batchId = searchParams.get('batchId')

        if (!batchId) {
            return NextResponse.json({ error: 'batchId required' }, { status: 400 })
        }

        const success = await MetaImportEngine.deleteBatch(user.id, batchId)

        return NextResponse.json({
            success,
            message: success ? 'Import batch deleted' : 'Failed to delete batch'
        })

    } catch (error) {
        console.error('Delete batch error:', error)
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}
