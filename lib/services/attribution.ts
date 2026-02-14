import stringSimilarity from 'string-similarity';
import { createClient } from '@/utils/supabase/server';

interface AttributionResult {
    campaign_name: string;
    product_id: string | null; // null = Auto-match failed
    method: 'cache' | 'regex' | 'fuzzy' | 'manual';
    confidence: number;
    product_title?: string;
}

export class AttributionService {
    private products: { id: string; title: string; handle: string; sku: string }[] = [];
    private mappings: Record<string, string> = {}; // Cache

    constructor(products: any[], mappings: any[]) {
        this.products = products;
        mappings.forEach(m => this.mappings[m.campaign_name_pattern] = m.target_product_id);
    }

    public attribute(campaignName: string): AttributionResult {
        // 1. Cache Check
        if (this.mappings[campaignName]) {
            // If mapped to GENERAL/IGNORE?
            return {
                campaign_name: campaignName,
                product_id: this.mappings[campaignName],
                method: 'cache',
                confidence: 1.0
            };
        }

        // 2. Regex Check (SKU/Handle)
        // iterate products
        for (const p of this.products) {
            // Check SKU if exists
            if (p.sku && p.sku.length > 3 && campaignName.includes(p.sku)) {
                return { campaign_name: campaignName, product_id: p.id, method: 'regex', confidence: 1.0, product_title: p.title };
            }
            // Check Handle (e.g. "black-tshirt")
            if (campaignName.toLowerCase().includes(p.handle.toLowerCase())) {
                return { campaign_name: campaignName, product_id: p.id, method: 'regex', confidence: 0.9, product_title: p.title };
            }
        }

        // 3. Fuzzy Logic
        // Only if no regex match
        const productTitles = this.products.map(p => p.title);
        const matches = stringSimilarity.findBestMatch(campaignName, productTitles);
        const best = matches.bestMatch;

        if (best.rating > 0.85) {
            const matchedProduct = this.products[matches.bestMatchIndex];
            return {
                campaign_name: campaignName,
                product_id: matchedProduct.id,
                method: 'fuzzy',
                confidence: best.rating,
                product_title: matchedProduct.title
            };
        }

        // Fallback
        return {
            campaign_name: campaignName,
            product_id: null,
            method: 'manual',
            confidence: 0
        };
    }
}
