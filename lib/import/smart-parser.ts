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

        if (rows.length === 0) return [];

        // Dynamic Header matching
        const headers = Object.keys(rows[0]);
        const campaignKey = headers.find(h => h.match(/campaign\s*name/i) || h.match(/kampanya/i));
        const dateKey = headers.find(h => h.match(/reporting\s*starts/i) || h.match(/date/i) || h.match(/tarih/i));
        // Amount key: Look for "Amount Spent" or "Harcanan Tutar", ignoring currency in parens
        const amountKey = headers.find(h => h.match(/amount\s*spent/i) || h.match(/harcanan/i));

        rows.forEach(row => {
            const name = campaignKey ? String(row[campaignKey] || '').trim() : '';

            // Date parsing
            let dateStr = new Date().toISOString();
            if (dateKey && row[dateKey]) {
                const val = row[dateKey];
                // Handle Excel Serial Date (numbers like 45321)
                if (typeof val === 'number') {
                    // Excel base date: Dec 30 1899
                    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
                    dateStr = d.toISOString();
                } else {
                    // Handle "3.02.2026" or "2026-02-03"
                    const s = String(val).trim();
                    if (s.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
                        // DD.MM.YYYY
                        const parts = s.split('.');
                        dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    } else {
                        dateStr = s;
                    }
                }
            }

            // Amount parsing
            let amount = 0;
            if (amountKey && row[amountKey] !== undefined && row[amountKey] !== null) {
                const val = row[amountKey];
                if (typeof val === 'number') {
                    amount = val;
                } else {
                    // String: "1.234,56" (TR) or "1,234.56" (US)
                    // We need to guess format or assume standard dot decimal if from API?
                    // Meta CSV usually standard "123.45". 
                    // But if local Excel saved formatted...
                    // Let's assume dot decimal for now as per CSV example "13.03"
                    const clean = String(val).replace(/[^0-9.,-]+/g, '');
                    // Verify if comma is decimal separator? 
                    // If "13.03" -> 13.03. If "13,03" -> 13.03?
                    // Simple approach: replace comma with dot if dot doesn't exist?
                    // Or standard parseFloat.
                    amount = parseFloat(clean.replace(',', '.')); // Risk for 1,000.00 -> 1.000.00
                    // Better:
                    // If it matches 123.45 -> parseFloat
                    amount = parseFloat(String(val).replace(/,/g, '')); // Remove thousands separator? 
                    // Wait, if it is "13,42" (TR decimal), removing comma makes it 1342.
                    // Let's use a safer approach.
                    // If the original CSV has "13.03", generic replacement might break.

                    // Revert to simple parse float if dot present.
                    const s = String(val);
                    if (s.includes('.') && !s.includes(',')) {
                        amount = parseFloat(s);
                    } else if (s.includes(',') && !s.includes('.')) {
                        // Likely "13,42"
                        amount = parseFloat(s.replace(',', '.'));
                    } else {
                        // Mixed? "1,234.56" -> 1234.56
                        amount = parseFloat(s.replace(/,/g, ''));
                    }
                }
            }

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
