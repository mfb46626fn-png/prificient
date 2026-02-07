import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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

        if (file.name.endsWith('.csv')) {
            return this.parseCSV(file);
        } else if (file.name.match(/\.(xlsx|xls)$/i)) {
            return this.parseExcel(file);
        } else {
            throw new Error("Desteklenmeyen dosya formatı. Lütfen .csv veya .xlsx yükleyin.");
        }
    }

    private parseCSV(file: File): Promise<ParsedCampaign[]> {
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

    private async parseExcel(file: File): Promise<ParsedCampaign[]> {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as CSVRow[];
        return this.processRows(json);
    }

    private processRows(rows: CSVRow[]): ParsedCampaign[] {
        const campaigns: ParsedCampaign[] = [];
        const fuse = new Fuse(this.products, {
            keys: ['title', 'sku'],
            includeScore: true,
            threshold: 0.4
        });

        // Helper to find key case-insensitive
        const findKey = (row: any, keywords: string[]): string | undefined => {
            const keys = Object.keys(row);
            for (const k of keywords) {
                const match = keys.find(key => key.toLowerCase().includes(k.toLowerCase()));
                if (match) return match;
            }
            return undefined;
        };

        rows.forEach(row => {
            // Dynamic Column Detection
            const nameKey = findKey(row, ['Campaign Name', 'Campaign', 'Kampanya']);
            const dateKey = findKey(row, ['Reporting Starts', 'Date', 'Tarih', 'Starts']);
            const amountKey = findKey(row, ['Amount Spent', 'Tutar', 'Harcama', 'Cost', 'Spent']);

            const name = nameKey ? row[nameKey] : '';

            // Amount Parsing
            let amount = 0;
            if (amountKey) {
                const rawVal = row[amountKey];
                if (typeof rawVal === 'number') {
                    amount = rawVal;
                } else if (typeof rawVal === 'string') {
                    // Handle "1.234,56" (TR) or "1,234.56" (US)
                    // Heuristic: If comma exists and is after the last dot, or no dot?
                    // Safe bet: Remove all non-numeric chars except last punctuation?
                    // Actually, simpler: replace ',' with '.' if it looks like decimal separator?
                    // Replace 'TL', spaces.
                    let clean = rawVal.replace(/[^0-9.,-]/g, '');
                    // Check if it has comma as decimal
                    if (clean.includes(',') && !clean.includes('.')) {
                        clean = clean.replace(',', '.');
                    } else if (clean.includes('.') && clean.includes(',')) {
                        // "1.234,56" -> remove dot, replace comma
                        if (clean.indexOf('.') < clean.indexOf(',')) {
                            clean = clean.replace(/\./g, '').replace(',', '.');
                        } else {
                            // "1,234.56" -> remove comma
                            clean = clean.replace(/,/g, '');
                        }
                    }
                    amount = parseFloat(clean);
                }
            }

            // Date Parsing
            let dateStr = new Date().toISOString();
            if (dateKey) {
                const rawDate = row[dateKey];
                if (rawDate) {
                    // Handle DD.MM.YYYY
                    if (typeof rawDate === 'string' && rawDate.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                        const [d, m, y] = rawDate.split('.');
                        dateStr = `${y}-${m}-${d}`;
                    } else {
                        // Fallback to standard
                        const d = new Date(rawDate);
                        if (!isNaN(d.getTime())) dateStr = d.toISOString();
                    }
                }
            }

            if (!name || isNaN(amount) || amount === 0) return;

            let matchStatus: ParsedCampaign['matchStatus'] = 'unmatched';
            let matchedProduct: ParsedCampaign['matchedProduct'] = undefined;
            let confidence = 0;

            // 1. Memory Check (Exact)
            if (this.mappings.has(name)) {
                const pid = this.mappings.get(name);
                if (pid === 'GENERAL') {
                    matchStatus = 'matched';
                } else if (pid) {
                    const product = this.products.find(p => p.id === pid);
                    if (product) {
                        matchStatus = 'matched';
                        matchedProduct = product;
                    }
                }
            } else {
                // 2. Fuzzy Match
                const skuMatch = this.products.find(p => p.sku && name.includes(p.sku));
                if (skuMatch) {
                    matchStatus = 'auto-match';
                    matchedProduct = skuMatch;
                    confidence = 1.0;
                } else {
                    const result = fuse.search(name);
                    if (result.length > 0) {
                        const topMatch = result[0];
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
