import Papa from 'papaparse';
import Fuse from 'fuse.js';
import { createClient } from '@/utils/supabase/client';

export interface CSVRow {
    'Campaign Name': string;
    'Reporting Starts': string;
    'Amount Spent (TRY)': string; // Adjust currency as needed or make generic
    [key: string]: string;
}

export interface ParsedCampaign {
    campaignName: string;
    date: string;
    amount: number;
    matchStatus: 'matched' | 'auto-match' | 'unmatched';
    matchedProduct?: {
        id: string; // product_id (our ID? or Variant ID?) -> Let's use Shopify Product ID/Variant ID from products table
        title: string;
    };
    confidenceScore?: number;
}

export interface ProductReference {
    id: string; // variant_id or product_id
    title: string;
    sku?: string;
}

export class SmartParser {
    private products: ProductReference[] = [];
    private mappings: Map<string, string> = new Map(); // CampaignName -> ProductID
    private supabase = createClient();

    constructor(products: ProductReference[]) {
        this.products = products;
    }

    async loadMemory() {
        // Load existing mappings from DB
        const { data } = await this.supabase
            .from('ad_campaign_mappings')
            .select('campaign_name_pattern, target_product_id');

        if (data) {
            data.forEach(m => {
                this.mappings.set(m.campaign_name_pattern, m.target_product_id || 'GENERAL');
            });
        }
    }

    async parseAndMatch(file: File): Promise<ParsedCampaign[]> {
        await this.loadMemory();

        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data as CSVRow[];
                    const parsed = this.processRows(rows);
                    resolve(parsed);
                },
                error: (error) => reject(error)
            });
        });
    }

    private processRows(rows: CSVRow[]): ParsedCampaign[] {
        const campaigns: ParsedCampaign[] = [];
        const fuse = new Fuse(this.products, {
            keys: ['title', 'sku'],
            includeScore: true,
            threshold: 0.4 // 0.0 is perfect match, 1.0 is no match
        });

        // Group by Campaign Name first? Or treat each day row?
        // Usually Meta export has daily rows.
        // We probably want to group distinct Campaign Names for the "Wizard" review step
        // But for "Financial Distribution", we need the daily data.
        // The Wizard usually asks user to map "Campaign Names" not "Rows".
        // SO: We process rows to extract Unique Campaigns?
        // NO, the requirement says "Smart Parser... CSV'den... verilerini al".
        // But UI Wizard says: "Otomatik Eşleşen: 12 Kampanya".
        // So we should return a list of Unique Campaigns with their total spend, and let user map them.
        // THEN we apply that mapping to all rows.

        // Wait, `processRows` currently returns parsed campaigns row by row?
        // Let's make it return row-by-row but with match info attached.
        // The UI will aggregate them.

        rows.forEach(row => {
            const name = row['Campaign Name'] || row['Campaign name'] || '';
            const dateStr = row['Reporting Starts'] || row['Reporting starts'] || row['Date'] || new Date().toISOString();
            const amountStr = row['Amount Spent (TRY)'] || row['Amount spent (TRY)'] || row['Amount Spent'] || '0';
            const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ''));

            if (!name || amount === 0) return;

            let matchStatus: ParsedCampaign['matchStatus'] = 'unmatched';
            let matchedProduct: ParsedCampaign['matchedProduct'] = undefined;
            let confidence = 0;

            // 1. Memory Check (Exact)
            if (this.mappings.has(name)) {
                const pid = this.mappings.get(name);
                if (pid === 'GENERAL') {
                    matchStatus = 'matched';
                    // matchedProduct undefined means General
                } else if (pid) {
                    const product = this.products.find(p => p.id === pid);
                    if (product) {
                        matchStatus = 'matched';
                        matchedProduct = product;
                    }
                }
            } else {
                // 2. Fuzzy Match
                // Check if SKU is in name (Strong signal)
                const skuMatch = this.products.find(p => p.sku && name.includes(p.sku));
                if (skuMatch) {
                    matchStatus = 'auto-match';
                    matchedProduct = skuMatch;
                    confidence = 1.0;
                } else {
                    // Fuse.js search
                    const result = fuse.search(name);
                    if (result.length > 0) {
                        const topMatch = result[0];
                        // Fuse score: lower is better. < 0.2 is very good.
                        // User said > 80% similarity. Fuse score 0.2 ~= 80% similarity.
                        if (topMatch.score !== undefined && topMatch.score < 0.3) {
                            matchStatus = 'auto-match';
                            matchedProduct = topMatch.item;
                            confidence = 1 - topMatch.score;
                        }
                    }
                }
            }

            campaigns.push({
                campaignName: name,
                date: dateStr,
                amount,
                matchStatus,
                matchedProduct,
                confidenceScore: confidence
            });
        });

        return campaigns;
    }
}
