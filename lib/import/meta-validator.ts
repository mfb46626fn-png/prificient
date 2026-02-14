import { NormalizedAdRow } from './meta-parser-core';

export class MetaValidator {
    static validateDailyBreakdown(rows: NormalizedAdRow[]): string[] {
        const errors: string[] = [];
        if (rows.length === 0) return errors;

        // Check if date column exists (MetaParserCore ensures 'date' key, but value might be default)
        // Check variety of dates
        const uniqueDates = new Set(rows.map(r => r.date));

        // Logic: If we have > 10 rows but only 1 unique date, it's suspicious for a "Bulk" import meant for analysis.
        // Unless it's really just 1 day's data. But usually "Export" gives summary row + daily rows? 
        // Or if it's "Summary" report, it has 1 row per campaign, all same date range (start date usually).

        if (rows.length > 5 && uniqueDates.size < 2) {
            errors.push("UYARI: Dosyada sadece 1 günlük veri (veya tarih kırılımı olmayan özet) tespit edildi. Prificient analizi için 'Günlük Kırılım' (Day Breakdown) önerilir.");
        }

        return errors;
    }
}
