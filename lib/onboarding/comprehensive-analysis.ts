import { createClient } from '@/utils/supabase/server';

// --- Types ---
export interface ProductMetric {
    variant_id: string;
    product_id: string;
    title: string;
    sku: string;
    quantity_sold: number;
    revenue: number;
    cogs: number;
    fees: number;
    shipping: number;
    profit: number;
    profit_margin: number; // percentage
}

export interface MonthlyTrend {
    month: string; // "2024-01" format
    revenue: number;
    profit: number;
    orders: number;
}

export interface CostBreakdown {
    revenue: number;
    cogs: number;
    tax: number;
    shipping: number;
    platform_fees: number;
    total_costs: number;
    net_profit: number;
}

export interface Recommendation {
    type: 'warning' | 'opportunity' | 'action';
    title: string;
    description: string;
    impact: string;
}

export interface ComprehensiveAnalysis {
    // Store Info
    storeName: string;
    currency: string;
    dateRange: { start: string; end: string };

    // Big Picture
    overview: {
        totalRevenue: number;
        totalOrders: number;
        avgOrderValue: number;
        totalProducts: number;
        periodDays: number;
    };

    // Real Profit
    realProfit: {
        grossRevenue: number;
        totalCosts: number;
        netProfit: number;
        profitMargin: number;
        gapMessage: string;
    };

    // Cost Breakdown (for pie chart)
    costBreakdown: CostBreakdown;

    // Top Products by Revenue
    topProducts: ProductMetric[];

    // Danger Products (negative or low margin)
    dangerProducts: ProductMetric[];

    // Monthly Trends
    monthlyTrends: MonthlyTrend[];

    // Cash Flow
    cashFlow: {
        dailyBurnRate: number;
        daysUntilZero: number;
        averageDailyRevenue: number;
        averageDailyProfit: number;
    };

    // Opportunity Cost
    opportunityCost: {
        lostProfit: number;
        potentialGain: number;
        worstProduct: ProductMetric | null;
    };

    // Actionable Recommendations
    recommendations: Recommendation[];

    // Meta
    hasEnoughData: boolean;
}

// --- Main Analysis Function ---
export async function generateComprehensiveAnalysis(userId: string): Promise<ComprehensiveAnalysis> {
    const supabase = await createClient();

    // Fetch store settings
    const { data: settings } = await supabase
        .from('store_settings')
        .select('currency, store_name')
        .eq('user_id', userId)
        .maybeSingle();

    const currency = settings?.currency || 'USD';
    const storeName = settings?.store_name || 'Mağazanız';

    // Fetch ALL ledger entries
    const { data: entries } = await supabase
        .from('ledger_entries')
        .select(`
            amount,
            direction,
            metadata,
            account:ledger_accounts!inner(code, name),
            transaction:ledger_transactions!inner(transaction_date)
        `)
        .eq('user_id', userId);

    // Determine date range from data
    let startDate = new Date();
    let endDate = new Date();

    if (entries && entries.length > 0) {
        const dates = entries
            .map((e: any) => new Date(e.transaction?.transaction_date))
            .filter((d: Date) => !isNaN(d.getTime()));

        if (dates.length > 0) {
            startDate = new Date(Math.min(...dates.map(d => d.getTime())));
            endDate = new Date(Math.max(...dates.map(d => d.getTime())));
        }
    }

    // Aggregate by account code
    let totalRevenue = 0;
    let totalCogs = 0;
    let totalTax = 0;
    let totalShipping = 0;
    let totalFees = 0;
    let orderCount = 0;

    // Product-level tracking
    const productMap = new Map<string, ProductMetric>();

    // Monthly tracking
    const monthlyMap = new Map<string, MonthlyTrend>();

    // Order IDs for counting (from 100 account metadata)
    const orderIds = new Set<string>();

    entries?.forEach((e: any) => {
        const amt = Number(e.amount) || 0;
        const code = e.account?.code;
        const meta = e.metadata || {};
        const txDate = new Date(e.transaction?.transaction_date);
        const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

        // Track unique orders
        if (code === '100' && meta.order_id) {
            orderIds.add(meta.order_id);
        }

        // Initialize monthly if needed
        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { month: monthKey, revenue: 0, profit: 0, orders: 0 });
        }
        const monthly = monthlyMap.get(monthKey)!;

        switch (code) {
            case '600': // Revenue
                totalRevenue += amt;
                monthly.revenue += amt;

                // Track per-product
                if (meta.variant_id) {
                    const variantId = String(meta.variant_id);
                    if (!productMap.has(variantId)) {
                        productMap.set(variantId, {
                            variant_id: variantId,
                            product_id: String(meta.product_id || ''),
                            title: meta.title || 'Unknown',
                            sku: meta.sku || '',
                            quantity_sold: 0,
                            revenue: 0,
                            cogs: 0,
                            fees: 0,
                            shipping: 0,
                            profit: 0,
                            profit_margin: 0
                        });
                    }
                    const prod = productMap.get(variantId)!;
                    prod.revenue += amt;
                    prod.quantity_sold += Number(meta.qty) || 1;
                }
                break;

            case '200': // Tax
                totalTax += amt;
                break;

            case '621': // COGS
                totalCogs += amt;

                if (meta.variant_id && productMap.has(String(meta.variant_id))) {
                    productMap.get(String(meta.variant_id))!.cogs += amt;
                }
                break;

            case '740': // Platform Fees
                totalFees += amt;

                if (meta.variant_id && productMap.has(String(meta.variant_id))) {
                    productMap.get(String(meta.variant_id))!.fees += amt;
                }
                break;

            case '750': // Shipping
                totalShipping += amt;

                if (meta.variant_id && productMap.has(String(meta.variant_id))) {
                    productMap.get(String(meta.variant_id))!.shipping += amt;
                }
                break;
        }
    });

    orderCount = orderIds.size;

    // Calculate totals and profits
    const totalCosts = totalCogs + totalTax + totalShipping + totalFees;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate product profits
    const products = Array.from(productMap.values()).map(p => {
        p.profit = p.revenue - p.cogs - p.fees - p.shipping;
        p.profit_margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
        return p;
    });

    // Sort and take top/danger products
    const topProducts = [...products]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const dangerProducts = [...products]
        .filter(p => p.profit_margin < 10) // Less than 10% margin is dangerous
        .sort((a, b) => a.profit - b.profit) // Worst first
        .slice(0, 5);

    // Monthly trends sorted
    const monthlyTrends = Array.from(monthlyMap.values())
        .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate monthly profits
    monthlyTrends.forEach(m => {
        // Estimate profit as same ratio as overall
        m.profit = profitMargin > 0 ? m.revenue * (profitMargin / 100) : m.revenue - (m.revenue * 0.3);
    });

    // Period calculation
    const periodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Cash flow
    const dailyBurnRate = netProfit < 0 ? Math.abs(netProfit / periodDays) : 0;
    const averageDailyRevenue = totalRevenue / periodDays;
    const averageDailyProfit = netProfit / periodDays;
    const estimatedCash = totalRevenue * 0.3; // Rough estimate
    const daysUntilZero = dailyBurnRate > 0 ? Math.round(estimatedCash / dailyBurnRate) : 999;

    // Opportunity cost
    const worstProduct = dangerProducts.length > 0 ? dangerProducts[0] : null;
    const lostProfit = dangerProducts.reduce((sum, p) => sum + (p.profit < 0 ? Math.abs(p.profit) : 0), 0);

    // Gap message
    let gapMessage = '';
    if (netProfit < 0) {
        gapMessage = 'Cironuz yüksek ama zarar ediyorsunuz. Her satış sizi batırıyor.';
    } else if (profitMargin < 5) {
        gapMessage = 'Kâr marjınız tehlikeli derecede düşük. Küçük bir aksilik sizi zarara sokar.';
    } else if (profitMargin < 15) {
        gapMessage = 'Kârlısınız ama marjınız sektör ortalamasının altında.';
    } else {
        gapMessage = 'Sağlıklı bir kâr marjınız var. Ama hep daha iyisi mümkün.';
    }

    // Generate recommendations
    const recommendations: Recommendation[] = [];

    if (dangerProducts.length > 0 && dangerProducts[0].profit < 0) {
        recommendations.push({
            type: 'warning',
            title: 'Zarar Eden Ürünü Değerlendirin',
            description: `"${dangerProducts[0].title}" ürünü satış başına zarar ettiriyor.`,
            impact: `Bu ürünü durdurmak ${Math.abs(dangerProducts[0].profit).toFixed(0)} ${currency} kazandırabilir.`
        });
    }

    if (totalFees > totalRevenue * 0.05) {
        recommendations.push({
            type: 'opportunity',
            title: 'Platform Komisyonlarını Azaltın',
            description: 'Komisyonlar cirunuzun %5\'inden fazla. Alternatif ödeme yöntemleri düşünün.',
            impact: `Yıllık ${(totalFees * 0.3).toFixed(0)} ${currency} tasarruf potansiyeli.`
        });
    }

    if (topProducts.length > 0 && topProducts[0].profit_margin > 20) {
        recommendations.push({
            type: 'action',
            title: 'En Kârlı Ürüne Odaklanın',
            description: `"${topProducts[0].title}" yüksek marjlı. Reklam bütçesini buraya kaydırın.`,
            impact: 'Potansiyel olarak genel kârınızı %20+ artırabilir.'
        });
    }

    if (recommendations.length < 3) {
        recommendations.push({
            type: 'action',
            title: 'Fiyatlandırmayı Gözden Geçirin',
            description: 'Tüm gizli maliyetleri hesaba katarak fiyatlarınızı güncelleyin.',
            impact: 'Doğru fiyatlandırma kârlılığın temelidir.'
        });
    }

    return {
        storeName,
        currency,
        dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        },
        overview: {
            totalRevenue,
            totalOrders: orderCount,
            avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
            totalProducts: products.length,
            periodDays
        },
        realProfit: {
            grossRevenue: totalRevenue,
            totalCosts,
            netProfit,
            profitMargin,
            gapMessage
        },
        costBreakdown: {
            revenue: totalRevenue,
            cogs: totalCogs,
            tax: totalTax,
            shipping: totalShipping,
            platform_fees: totalFees,
            total_costs: totalCosts,
            net_profit: netProfit
        },
        topProducts,
        dangerProducts,
        monthlyTrends,
        cashFlow: {
            dailyBurnRate,
            daysUntilZero,
            averageDailyRevenue,
            averageDailyProfit
        },
        opportunityCost: {
            lostProfit,
            potentialGain: lostProfit,
            worstProduct
        },
        recommendations,
        hasEnoughData: orderCount >= 5 && totalRevenue > 0
    };
}
