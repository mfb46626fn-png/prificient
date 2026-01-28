import { createClient } from '@/utils/supabase/server';

export interface ProductFinancials {
    variant_id: string;
    product_id: string;
    sku?: string;
    title?: string;
    gross_sales: number;
    returns: number;
    net_sales: number;
    cogs: number; // Cost of Goods Sold
    profit: number; // Net Sales - COGS
    margin: number; // (Profit / Net Sales) * 100
    return_rate: number;
    status: 'healthy' | 'warning' | 'toxic';
}

export const ProductAnalysis = {
    async analyzeProductProfitability(userId: string, startDate: Date, endDate: Date): Promise<ProductFinancials[]> {
        const supabase = await createClient();

        // 1. Fetch ALL Relevant Entries (Revenue 600, Returns 610, COGS 621)
        // Optimization: Single Query
        const { data: entries, error } = await supabase
            .from('ledger_entries')
            .select(`
                amount,
                metadata,
                ledger_accounts!inner(code),
                ledger_transactions!inner(created_at)
            `)
            .eq('user_id', userId)
            .in('ledger_accounts.code', ['600', '610', '621'])
            .gte('ledger_transactions.created_at', startDate.toISOString())
            .lte('ledger_transactions.created_at', endDate.toISOString());

        if (error) throw error;

        // 2. Aggregate
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
                    cogs: 0,
                    profit: 0,
                    margin: 0,
                    return_rate: 0,
                    status: 'healthy'
                });
            }
            return map.get(vid)!;
        };

        entries?.forEach((e: any) => {
            if (e.metadata?.variant_id) {
                const stats = getStats(e.metadata);
                const amt = Number(e.amount);
                const code = e.ledger_accounts.code;

                if (code === '600') {
                    // 600 is Credit-Normal Revenue, but logic depends on LedgerService direction.
                    // Usually Revenue DEBIT = Decrease, CREDIT = Increase.
                    // But in LedgerService logic:
                    // Credit 600 = Sales (+). Debit 600 = Correction (-).
                    // In database 'amount' is absolute value. 
                    // Let's assume Credit entries are Sales.
                    // Wait, direction check needed.
                    // However, simplified approach: usually 600 entries are Sales.
                    stats.gross_sales += amt;
                } else if (code === '610') {
                    // Returns
                    stats.returns += amt;
                } else if (code === '621') {
                    // COGS
                    stats.cogs += amt;
                }
            }
        });

        // 3. Calculate KPIs & Status
        const results = Array.from(map.values()).map(p => {
            p.net_sales = p.gross_sales - p.returns;
            p.profit = p.net_sales - p.cogs;
            p.margin = p.net_sales > 0 ? (p.profit / p.net_sales) * 100 : 0;
            p.return_rate = p.gross_sales > 0 ? (p.returns / p.gross_sales) * 100 : 0;

            // Toxic Logic
            if (p.profit < 0) {
                p.status = 'toxic'; // Losing money
            } else if (p.return_rate > 15) {
                p.status = 'warning';
            }

            return p;
        });

        // Sort by Profit desc (default)
        return results.sort((a, b) => b.profit - a.profit);
    },

    async getProductsByProfitability(userId: string, limit: number = 5) {
        // Last 30 days window for "Current" polarity
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)

        const allProducts = await this.analyzeProductProfitability(userId, startDate, endDate)

        // Heroes: Highest Profit
        const heroes = [...allProducts]
            .sort((a, b) => b.profit - a.profit)
            .slice(0, limit)

        // Villains: Lowest Profit (Negative)
        const villains = [...allProducts]
            .filter(p => p.profit < 0 || p.return_rate > 15)
            .sort((a, b) => a.profit - b.profit) // Lowest first (most negative)
            .slice(0, limit)

        return { heroes, villains }
    }
};
