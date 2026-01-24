import { createClient } from '@/utils/supabase/server';

export interface ProductFinancials {
    variant_id: string;
    product_id: string;
    sku?: string;
    title?: string;
    gross_sales: number;
    returns: number;
    net_sales: number;
    return_rate: number;
    status: 'healthy' | 'warning' | 'toxic';
}

export const ProductAnalysis = {
    async analyzeProductProfitability(userId: string, startDate: Date, endDate: Date): Promise<ProductFinancials[]> {
        const supabase = await createClient();

        // 1. Fetch Revenue Entries (Account 600) with Metadata
        // We rely on the GIN index on metadata
        const { data: revenueEntries, error: revError } = await supabase
            .from('ledger_entries')
            .select(`
                amount,
                metadata,
                ledger_accounts!inner(code),
                ledger_transactions!inner(created_at)
            `)
            .eq('user_id', userId)
            .eq('ledger_accounts.code', '600') // Revenue
            .gte('ledger_transactions.created_at', startDate.toISOString())
            .lte('ledger_transactions.created_at', endDate.toISOString());

        if (revError) throw revError;

        // 2. Fetch Return Entries (Account 610) with Metadata
        const { data: returnEntries, error: retError } = await supabase
            .from('ledger_entries')
            .select(`
                amount,
                metadata,
                ledger_accounts!inner(code),
                ledger_transactions!inner(created_at)
            `)
            .eq('user_id', userId)
            .eq('ledger_accounts.code', '610') // Returns
            .gte('ledger_transactions.created_at', startDate.toISOString())
            .lte('ledger_transactions.created_at', endDate.toISOString());

        if (retError) throw retError;

        // 3. Aggregate
        const map = new Map<string, ProductFinancials>();

        // Helper to get or init
        const getStats = (meta: any) => {
            const vid = meta?.variant_id || 'unknown';
            if (!map.has(vid)) {
                map.set(vid, {
                    variant_id: vid,
                    product_id: meta?.product_id || '',
                    sku: meta?.sku || '',
                    title: meta?.title || 'Bilinmeyen Ürün',
                    gross_sales: 0,
                    returns: 0,
                    net_sales: 0,
                    return_rate: 0,
                    status: 'healthy'
                });
            }
            return map.get(vid)!;
        };

        // Process Revenue
        revenueEntries?.forEach((e: any) => {
            if (e.metadata?.variant_id) {
                const stats = getStats(e.metadata);
                stats.gross_sales += Number(e.amount);
            }
        });

        // Process Returns
        returnEntries?.forEach((e: any) => {
            if (e.metadata?.variant_id) {
                const stats = getStats(e.metadata);
                stats.returns += Number(e.amount);
            }
        });

        // 4. Calculate KPIs & Status
        const results = Array.from(map.values()).map(p => {
            p.net_sales = p.gross_sales - p.returns;
            p.return_rate = p.gross_sales > 0 ? (p.returns / p.gross_sales) * 100 : 0;

            // Toxic Logic
            if (p.return_rate > 15 || p.net_sales < 0) {
                p.status = 'toxic';
            } else if (p.return_rate > 8) {
                p.status = 'warning';
            }

            return p;
        });

        // Sort by Net Sales desc
        return results.sort((a, b) => b.net_sales - a.net_sales);
    },

    async getProductsByProfitability(userId: string, limit: number = 5) {
        // Last 30 days window for "Current" polarity
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)

        const allProducts = await this.analyzeProductProfitability(userId, startDate, endDate)

        // Heroes: Highest Net Sales (Profit proxy for now)
        const heroes = [...allProducts]
            .sort((a, b) => b.net_sales - a.net_sales)
            .slice(0, limit)

        // Villains: Lowest Net Sales (Negative or low) OR High Refund Rate
        // We want "Cash Burners" -> specifically negative net sales or highest returns
        const villains = [...allProducts]
            .filter(p => p.net_sales < 0 || p.return_rate > 15) // Filter mainly bad ones
            .sort((a, b) => a.net_sales - b.net_sales) // Lowest (most negative) first
            .slice(0, limit)

        return { heroes, villains }
    }
};
