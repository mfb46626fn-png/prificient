/**
 * Meta Ads Import Engine
 * 
 * Parses Meta Ads CSV exports and matches campaigns to products
 * using intelligent name matching.
 * 
 * CSV Format (Meta Ads Export):
 * Reporting Starts, Reporting Ends, Campaign Name, Ad Set Name, Ad Name,
 * Amount Spent (USD), Impressions, Link Clicks, CPM, CTR, Purchases, Purchases Conversion Value
 */

import { createClient } from '@/utils/supabase/server'
import { randomUUID } from 'crypto'

export interface MetaAdRow {
    reportingStarts: string
    reportingEnds: string
    campaignName: string
    adSetName: string
    adName: string
    amountSpent: number
    currency: string
    impressions: number
    clicks: number
    cpm: number
    ctr: number
    purchases: number
    conversionValue: number
}

export interface ImportResult {
    success: boolean
    totalRows: number
    importedRows: number
    matchedRows: number
    unmatchedCampaigns: string[]
    errors: string[]
    batchId: string
}

export interface ProductMatch {
    productId: string
    variantId?: string
    title: string
    matchScore: number
}

export class MetaImportEngine {

    /**
     * Parse CSV text into structured ad data
     */
    static parseCSV(csvText: string): { rows: MetaAdRow[]; errors: string[] } {
        const lines = csvText.trim().split('\n')
        const errors: string[] = []
        const rows: MetaAdRow[] = []

        if (lines.length < 2) {
            return { rows: [], errors: ['CSV file is empty or has no data rows'] }
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase())

        // Expected column mappings
        const columnMap = {
            reportingStarts: header.findIndex(h => h.includes('reporting starts') || h.includes('start')),
            reportingEnds: header.findIndex(h => h.includes('reporting ends') || h.includes('end')),
            campaignName: header.findIndex(h => h.includes('campaign name') || h === 'campaign'),
            adSetName: header.findIndex(h => h.includes('ad set name') || h === 'ad set'),
            adName: header.findIndex(h => h.includes('ad name') || h === 'ad'),
            amountSpent: header.findIndex(h => h.includes('amount spent') || h.includes('spend')),
            impressions: header.findIndex(h => h.includes('impressions')),
            clicks: header.findIndex(h => h.includes('click')),
            cpm: header.findIndex(h => h.includes('cpm')),
            ctr: header.findIndex(h => h.includes('ctr')),
            purchases: header.findIndex(h => h.includes('purchases') && !h.includes('value')),
            conversionValue: header.findIndex(h => h.includes('conversion value') || h.includes('purchases conversion'))
        }

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = this.parseCSVLine(lines[i])

                if (values.length < 6) {
                    errors.push(`Row ${i + 1}: Not enough columns`)
                    continue
                }

                const row: MetaAdRow = {
                    reportingStarts: columnMap.reportingStarts >= 0 ? values[columnMap.reportingStarts] : '',
                    reportingEnds: columnMap.reportingEnds >= 0 ? values[columnMap.reportingEnds] : '',
                    campaignName: columnMap.campaignName >= 0 ? values[columnMap.campaignName] : '',
                    adSetName: columnMap.adSetName >= 0 ? values[columnMap.adSetName] : '',
                    adName: columnMap.adName >= 0 ? values[columnMap.adName] : '',
                    amountSpent: columnMap.amountSpent >= 0 ? parseFloat(values[columnMap.amountSpent]) || 0 : 0,
                    currency: 'USD', // Default, can be extracted from header if present
                    impressions: columnMap.impressions >= 0 ? parseInt(values[columnMap.impressions]) || 0 : 0,
                    clicks: columnMap.clicks >= 0 ? parseInt(values[columnMap.clicks]) || 0 : 0,
                    cpm: columnMap.cpm >= 0 ? parseFloat(values[columnMap.cpm]) || 0 : 0,
                    ctr: columnMap.ctr >= 0 ? parseFloat(values[columnMap.ctr]) || 0 : 0,
                    purchases: columnMap.purchases >= 0 ? parseInt(values[columnMap.purchases]) || 0 : 0,
                    conversionValue: columnMap.conversionValue >= 0 ? parseFloat(values[columnMap.conversionValue]) || 0 : 0
                }

                if (row.campaignName) {
                    rows.push(row)
                }
            } catch (e) {
                errors.push(`Row ${i + 1}: Parse error - ${e}`)
            }
        }

        return { rows, errors }
    }

    /**
     * Parse a single CSV line handling quoted values
     */
    private static parseCSVLine(line: string): string[] {
        const result: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }

        result.push(current.trim())
        return result
    }

    /**
     * Match campaign name to a product using fuzzy matching
     */
    static matchCampaignToProduct(
        campaignName: string,
        adSetName: string,
        adName: string,
        products: Array<{ id: string; variant_id?: string; title: string }>
    ): ProductMatch | null {
        // Extract potential product name from campaign/ad names
        // Common patterns: "Product Name - TOF - Interests", "Product Name - BOF - Retargeting"
        const fullText = `${campaignName} ${adSetName} ${adName}`.toLowerCase()

        // Remove common suffixes
        const cleanPatterns = [
            /\s*-\s*(tof|bof|mof)\s*-\s*.*/gi,
            /\s*-\s*(retargeting|interests|lookalike|broad).*/gi,
            /\s*(creative|dpa)\s*[a-z]?\s*-?\s*/gi,
            /\s*-\s*website visitors.*/gi
        ]

        let productHint = campaignName
        cleanPatterns.forEach(pattern => {
            productHint = productHint.replace(pattern, '')
        })
        productHint = productHint.trim().toLowerCase()

        // Score each product
        let bestMatch: ProductMatch | null = null
        let bestScore = 0

        for (const product of products) {
            const productTitle = product.title.toLowerCase()

            // Exact match
            if (productTitle === productHint) {
                return {
                    productId: product.id,
                    variantId: product.variant_id,
                    title: product.title,
                    matchScore: 100
                }
            }

            // Calculate similarity score
            const score = this.calculateSimilarity(productHint, productTitle)

            // Also check if product name appears in any of the ad fields
            const containsBonus = fullText.includes(productTitle) ? 30 : 0
            const totalScore = score + containsBonus

            if (totalScore > bestScore && totalScore >= 60) { // Minimum threshold
                bestScore = totalScore
                bestMatch = {
                    productId: product.id,
                    variantId: product.variant_id,
                    title: product.title,
                    matchScore: totalScore
                }
            }
        }

        return bestMatch
    }

    /**
     * Calculate string similarity (Levenshtein-based)
     */
    private static calculateSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2
        const shorter = str1.length > str2.length ? str2 : str1

        if (longer.length === 0) return 100

        const editDistance = this.levenshteinDistance(longer, shorter)
        return Math.round(((longer.length - editDistance) / longer.length) * 100)
    }

    /**
     * Levenshtein distance calculation
     */
    private static levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = []

        for (let i = 0; i <= str1.length; i++) {
            matrix[i] = [i]
        }
        for (let j = 0; j <= str2.length; j++) {
            matrix[0][j] = j
        }

        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                )
            }
        }

        return matrix[str1.length][str2.length]
    }

    /**
     * Import parsed ad data into database
     */
    static async importAdData(
        userId: string,
        rows: MetaAdRow[],
        products: Array<{ id: string; variant_id?: string; title: string }>
    ): Promise<ImportResult> {
        const supabase = await createClient()
        const batchId = randomUUID()
        const errors: string[] = []
        const unmatchedCampaigns = new Set<string>()
        let importedRows = 0
        let matchedRows = 0

        // Prepare insert data
        const insertData = rows.map(row => {
            const match = this.matchCampaignToProduct(
                row.campaignName,
                row.adSetName,
                row.adName,
                products
            )

            if (match) {
                matchedRows++
            } else {
                unmatchedCampaigns.add(row.campaignName)
            }

            return {
                user_id: userId,
                reporting_date: row.reportingStarts,
                campaign_name: row.campaignName,
                ad_set_name: row.adSetName,
                ad_name: row.adName,
                amount_spent: row.amountSpent,
                currency: row.currency,
                impressions: row.impressions,
                clicks: row.clicks,
                cpm: row.cpm,
                ctr: row.ctr,
                purchases: row.purchases,
                conversion_value: row.conversionValue,
                matched_product_id: match?.productId || null,
                matched_product_title: match?.title || null,
                import_batch_id: batchId
            }
        })

        // Batch insert (chunked for large imports)
        const chunkSize = 500
        for (let i = 0; i < insertData.length; i += chunkSize) {
            const chunk = insertData.slice(i, i + chunkSize)
            const { error } = await supabase.from('ad_imports').insert(chunk)

            if (error) {
                errors.push(`Batch ${Math.floor(i / chunkSize) + 1}: ${error.message}`)
            } else {
                importedRows += chunk.length
            }
        }

        return {
            success: errors.length === 0,
            totalRows: rows.length,
            importedRows,
            matchedRows,
            unmatchedCampaigns: Array.from(unmatchedCampaigns),
            errors,
            batchId
        }
    }

    /**
     * Get ad spend by date range
     */
    static async getAdSpendByDateRange(
        userId: string,
        startDate: Date,
        endDate: Date
    ): Promise<{ date: string; spend: number }[]> {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('ad_imports')
            .select('reporting_date, amount_spent')
            .eq('user_id', userId)
            .gte('reporting_date', startDate.toISOString().split('T')[0])
            .lte('reporting_date', endDate.toISOString().split('T')[0])

        if (error) {
            console.error('Failed to fetch ad spend:', error)
            return []
        }

        // Aggregate by date
        const byDate = new Map<string, number>()
        data.forEach(row => {
            const date = row.reporting_date
            const current = byDate.get(date) || 0
            byDate.set(date, current + Number(row.amount_spent))
        })

        return Array.from(byDate.entries())
            .map(([date, spend]) => ({ date, spend }))
            .sort((a, b) => a.date.localeCompare(b.date))
    }

    /**
     * Get ad spend by product
     */
    static async getAdSpendByProduct(
        userId: string,
        days: number = 30
    ): Promise<Map<string, number>> {
        const supabase = await createClient()

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const { data, error } = await supabase
            .from('ad_imports')
            .select('matched_product_id, amount_spent')
            .eq('user_id', userId)
            .gte('reporting_date', startDate.toISOString().split('T')[0])
            .not('matched_product_id', 'is', null)

        if (error) {
            console.error('Failed to fetch ad spend by product:', error)
            return new Map()
        }

        const byProduct = new Map<string, number>()
        data.forEach(row => {
            const productId = row.matched_product_id!
            const current = byProduct.get(productId) || 0
            byProduct.set(productId, current + Number(row.amount_spent))
        })

        return byProduct
    }

    /**
     * Delete an import batch
     */
    static async deleteBatch(userId: string, batchId: string): Promise<boolean> {
        const supabase = await createClient()

        const { error } = await supabase
            .from('ad_imports')
            .delete()
            .eq('user_id', userId)
            .eq('import_batch_id', batchId)

        return !error
    }

    /**
     * Get import history
     */
    static async getImportHistory(userId: string): Promise<Array<{
        batchId: string
        rowCount: number
        matchedCount: number
        totalSpend: number
        dateRange: { start: string; end: string }
        importedAt: string
    }>> {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('ad_imports')
            .select('import_batch_id, reporting_date, amount_spent, matched_product_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error || !data) {
            return []
        }

        // Group by batch
        const batches = new Map<string, {
            rows: typeof data
            matchedCount: number
            totalSpend: number
        }>()

        data.forEach(row => {
            const batchId = row.import_batch_id
            if (!batches.has(batchId)) {
                batches.set(batchId, { rows: [], matchedCount: 0, totalSpend: 0 })
            }
            const batch = batches.get(batchId)!
            batch.rows.push(row)
            batch.totalSpend += Number(row.amount_spent)
            if (row.matched_product_id) batch.matchedCount++
        })

        return Array.from(batches.entries()).map(([batchId, batch]) => {
            const dates = batch.rows.map(r => r.reporting_date).sort()
            return {
                batchId,
                rowCount: batch.rows.length,
                matchedCount: batch.matchedCount,
                totalSpend: batch.totalSpend,
                dateRange: {
                    start: dates[0],
                    end: dates[dates.length - 1]
                },
                importedAt: batch.rows[0].created_at
            }
        })
    }
}

export default MetaImportEngine
