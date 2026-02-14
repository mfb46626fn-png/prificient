import Papa from 'papaparse';

export interface NormalizedAdRow {
    campaign_name: string;
    date: string; // YYYY-MM-DD
    amount: number;
    raw_data: Record<string, string>;
}

export class MetaParserCore {
    private fileContent: string;

    constructor(fileContent: string) {
        this.fileContent = fileContent;
    }

    // 1. Clean BOM and standardise newlines
    private cleanContent(content: string): string {
        return content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // 2. Normalize Headers (e.g. "Amount Spent (USD)" -> "amount")
    private normalizeHeader(header: string): string {
        const h = header.toLowerCase().trim();
        if (h.includes('amount spent') || h.includes('harcanan') || h.includes('cost')) return 'amount';
        if (h.includes('campaign name') || h.includes('kampanya')) return 'campaign_name';
        if (h.includes('reporting starts') || h.includes('date') || h.includes('tarih')) return 'date';
        return h;
    }

    // 3. Smart Date Parser
    private parseDate(rawDate: string): string {
        const clean = rawDate.trim();
        // Try YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

        // Try DD.MM.YYYY (Common in TR/EU)
        const dmy = clean.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
        if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;

        // Try MM/DD/YYYY (US) - Hard to distinguish from DD/MM/YYYY without context
        // We assume DD/MM/YYYY if first part > 12. If both <= 12, ambiguous.
        // For now, let's assume ISO or DD.MM.YYYY or MM/DD/YYYY based on locale?
        // Let's rely on standard formats.
        // If it fails, return today's date or throw? 
        // Return custom error string to bubble up.
        return clean;
    }

    public parse(): Promise<{ data: NormalizedAdRow[]; errors: string[] }> {
        const cleaned = this.cleanContent(this.fileContent);
        const errors: string[] = [];
        const data: NormalizedAdRow[] = [];

        return new Promise((resolve) => {
            Papa.parse(cleaned, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (h) => this.normalizeHeader(h),
                complete: (results) => {
                    results.data.forEach((row: any, index) => {
                        // Validate and Parse Row
                        const amountStr = row['amount'];
                        const campaign = row['campaign_name'];
                        const dateStr = row['date'];

                        if (!campaign || !amountStr) {
                            // Skip empty rows silently or log?
                            return;
                        }

                        // Parse Amount
                        let amount = 0;
                        if (typeof amountStr === 'number') amount = amountStr;
                        else amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ''));

                        // Parse Date
                        const parsedDate = this.parseDate(dateStr || new Date().toISOString().split('T')[0]);

                        if (isNaN(amount)) {
                            errors.push(`Row ${index + 2}: Invalid Amount: ${amountStr}`);
                            return;
                        }

                        data.push({
                            campaign_name: campaign,
                            date: parsedDate,
                            amount,
                            raw_data: row
                        });
                    });

                    if (results.errors.length > 0) {
                        results.errors.forEach(e => errors.push(`CSV Error line ${e.row}: ${e.message}`));
                    }

                    resolve({ data, errors });
                }
            });
        });
    }
}
