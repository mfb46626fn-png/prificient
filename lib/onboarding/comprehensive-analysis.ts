import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';

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
    profit_margin: number;
}

export interface MonthlyTrend {
    month: string;
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
    storeName: string;
    currency: string;
    dateRange: { start: string; end: string };
    overview: {
        totalRevenue: number;
        totalOrders: number;
        avgOrderValue: number;
        totalProducts: number;
        periodDays: number;
    };
    realProfit: {
        grossRevenue: number;
        totalCosts: number;
        netProfit: number;
        profitMargin: number;
        gapMessage: string;
    };
    costBreakdown: CostBreakdown;
    topProducts: ProductMetric[];
    dangerProducts: ProductMetric[];
    monthlyTrends: MonthlyTrend[];
    cashFlow: {
        dailyBurnRate: number;
        daysUntilZero: number;
        averageDailyRevenue: number;
        averageDailyProfit: number;
    };
    opportunityCost: {
        lostProfit: number;
        potentialGain: number;
        worstProduct: ProductMetric | null;
    };
    recommendations: Recommendation[];
    hasEnoughData: boolean;
}

// Helper: Shopify GraphQL query for orders
async function fetchShopifyOrders(accessToken: string, shopDomain: string): Promise<any[]> {
    const orders: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
        const query = `
            query($cursor: String) {
                orders(first: 100, after: $cursor) {
                    pageInfo { hasNextPage endCursor }
                    edges {
                        node {
                            id
                            name
                            createdAt
                            totalPriceSet { shopMoney { amount currencyCode } }
                            totalTaxSet { shopMoney { amount } }
                            totalShippingPriceSet { shopMoney { amount } }
                            lineItems(first: 50) {
                                edges {
                                    node {
                                        title
                                        quantity
                                        variant { id sku product { id } }
                                        originalTotalSet { shopMoney { amount } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const response: Response = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({ query, variables: { cursor } }),
        });

        const json: { data?: { orders?: { edges: any[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } } = await response.json();
        const ordersData: { edges: any[]; pageInfo: { hasNextPage: boolean; endCursor: string } } | undefined = json.data?.orders;

        if (!ordersData) break;

        for (const edge of ordersData.edges) {
            orders.push(edge.node);
        }

        hasNextPage = ordersData.pageInfo.hasNextPage;
        cursor = ordersData.pageInfo.endCursor;

        // Safety limit: max 5000 orders
        if (orders.length >= 5000) break;
    }

    return orders;
}

// --- Main Analysis Function ---
export async function generateComprehensiveAnalysis(userId: string): Promise<ComprehensiveAnalysis> {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Fetch store settings
    const { data: settings } = await supabaseAdmin
        .from('store_settings')
        .select('currency, store_name')
        .eq('user_id', userId)
        .maybeSingle();

    // Fetch integration for Shopify credentials
    const { data: integration } = await supabaseAdmin
        .from('integrations')
        .select('shop_domain, access_token')
        .eq('user_id', userId)
        .eq('platform', 'shopify')
        .single();

    const currency = settings?.currency || 'TRY';
    const storeName = settings?.store_name || 'Mağazanız';

    // Default empty result
    const emptyResult: ComprehensiveAnalysis = {
        storeName,
        currency,
        dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
        overview: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalProducts: 0, periodDays: 1 },
        realProfit: { grossRevenue: 0, totalCosts: 0, netProfit: 0, profitMargin: 0, gapMessage: 'Veri bulunamadı' },
        costBreakdown: { revenue: 0, cogs: 0, tax: 0, shipping: 0, platform_fees: 0, total_costs: 0, net_profit: 0 },
        topProducts: [],
        dangerProducts: [],
        monthlyTrends: [],
        cashFlow: { dailyBurnRate: 0, daysUntilZero: 999, averageDailyRevenue: 0, averageDailyProfit: 0 },
        opportunityCost: { lostProfit: 0, potentialGain: 0, worstProduct: null },
        recommendations: [],
        hasEnoughData: false
    };

    if (!integration?.access_token || !integration?.shop_domain) {
        return emptyResult;
    }

    // Fetch all orders from Shopify
    const orders = await fetchShopifyOrders(integration.access_token, integration.shop_domain);

    if (orders.length === 0) {
        return emptyResult;
    }

    // Aggregate data
    let totalRevenue = 0;
    let totalTax = 0;
    let totalShipping = 0;
    let totalCogs = 0;
    const platformFeeRate = 0.025; // Estimated 2.5% payment fee

    const productMap = new Map<string, ProductMetric>();
    const monthlyMap = new Map<string, MonthlyTrend>();

    let startDate = new Date();
    let endDate = new Date(0);

    for (const order of orders) {
        const orderDate = new Date(order.createdAt);
        if (orderDate < startDate) startDate = orderDate;
        if (orderDate > endDate) endDate = orderDate;

        const orderTotal = parseFloat(order.totalPriceSet?.shopMoney?.amount || '0');
        const orderTax = parseFloat(order.totalTaxSet?.shopMoney?.amount || '0');
        const orderShipping = parseFloat(order.totalShippingPriceSet?.shopMoney?.amount || '0');

        totalRevenue += orderTotal;
        totalTax += orderTax;
        totalShipping += orderShipping;

        // Monthly tracking
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { month: monthKey, revenue: 0, profit: 0, orders: 0 });
        }
        const monthly = monthlyMap.get(monthKey)!;
        monthly.revenue += orderTotal;
        monthly.orders += 1;

        // Line items
        for (const lineEdge of order.lineItems?.edges || []) {
            const item = lineEdge.node;
            const variantGid = item.variant?.id || '';
            const variantId = variantGid.replace('gid://shopify/ProductVariant/', '');
            const productGid = item.variant?.product?.id || '';
            const productId = productGid.replace('gid://shopify/Product/', '');
            const lineTotal = parseFloat(item.originalTotalSet?.shopMoney?.amount || '0');
            const qty = item.quantity || 1;

            if (!productMap.has(variantId) && variantId) {
                productMap.set(variantId, {
                    variant_id: variantId,
                    product_id: productId,
                    title: item.title || 'Unknown',
                    sku: item.variant?.sku || '',
                    quantity_sold: 0,
                    revenue: 0,
                    cogs: 0,
                    fees: 0,
                    shipping: 0,
                    profit: 0,
                    profit_margin: 0
                });
            }

            if (variantId && productMap.has(variantId)) {
                const prod = productMap.get(variantId)!;
                prod.revenue += lineTotal;
                prod.quantity_sold += qty;
            }
        }
    }

    // Fetch product costs from product_costs table
    const { data: productCosts } = await supabaseAdmin
        .from('product_costs')
        .select('variant_id, unit_cost')
        .eq('user_id', userId);

    const costMap = new Map<string, number>();
    productCosts?.forEach(pc => {
        costMap.set(String(pc.variant_id), Number(pc.unit_cost) || 0);
    });

    // Calculate product metrics
    const products = Array.from(productMap.values()).map(p => {
        const unitCost = costMap.get(p.variant_id) || 0;
        p.cogs = unitCost * p.quantity_sold;
        p.fees = p.revenue * platformFeeRate;
        p.shipping = 0; // Per-product shipping not tracked
        p.profit = p.revenue - p.cogs - p.fees;
        p.profit_margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
        totalCogs += p.cogs;
        return p;
    });

    // Calculate platform fees
    const platformFees = totalRevenue * platformFeeRate;

    // Total costs
    const totalCosts = totalCogs + totalTax + totalShipping + platformFees;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Sort products
    const topProducts = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const dangerProducts = [...products]
        .filter(p => p.profit_margin < 10)
        .sort((a, b) => a.profit - b.profit)
        .slice(0, 5);

    // Monthly trends
    const monthlyTrends = Array.from(monthlyMap.values())
        .sort((a, b) => a.month.localeCompare(b.month));
    monthlyTrends.forEach(m => {
        m.profit = profitMargin > 0 ? m.revenue * (profitMargin / 100) : m.revenue * 0.1;
    });

    // Period calculation
    const periodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Cash flow
    const dailyBurnRate = netProfit < 0 ? Math.abs(netProfit / periodDays) : 0;
    const averageDailyRevenue = totalRevenue / periodDays;
    const averageDailyProfit = netProfit / periodDays;
    const estimatedCash = totalRevenue * 0.3;
    const daysUntilZero = dailyBurnRate > 0 ? Math.round(estimatedCash / dailyBurnRate) : 999;

    // Opportunity cost
    const worstProduct = dangerProducts.length > 0 ? dangerProducts[0] : null;
    const lostProfit = dangerProducts.reduce((sum, p) => sum + (p.profit < 0 ? Math.abs(p.profit) : 0), 0);

    // Gap message
    let gapMessage = '';
    if (netProfit < 0) {
        gapMessage = 'Cironuz yüksek ama zarar ediyorsunuz. Her satış sizi batırıyor.';
    } else if (profitMargin < 5) {
        gapMessage = 'Kâr marjınız tehlikeli derecede düşük.';
    } else if (profitMargin < 15) {
        gapMessage = 'Kârlısınız ama marjınız sektör ortalamasının altında.';
    } else {
        gapMessage = 'Sağlıklı bir kâr marjınız var.';
    }

    // Recommendations
    const recommendations: Recommendation[] = [];

    if (dangerProducts.length > 0 && dangerProducts[0].profit < 0) {
        recommendations.push({
            type: 'warning',
            title: 'Zarar Eden Ürünü Değerlendirin',
            description: `"${dangerProducts[0].title}" ürünü zarar ettiriyor.`,
            impact: `Bu ürünü optimize etmek ${Math.abs(dangerProducts[0].profit).toFixed(0)} ${currency} kazandırabilir.`
        });
    }

    if (topProducts.length > 0 && topProducts[0].profit_margin > 20) {
        recommendations.push({
            type: 'action',
            title: 'En Kârlı Ürüne Odaklanın',
            description: `"${topProducts[0].title}" yüksek marjlı.`,
            impact: 'Reklam bütçesini bu ürüne kaydırın.'
        });
    }

    recommendations.push({
        type: 'action',
        title: 'Ürün Maliyetlerini Güncelleyin',
        description: 'Daha doğru analiz için tüm ürünlerin maliyetlerini girin.',
        impact: 'Gerçek kârlılığınızı görün.'
    });

    return {
        storeName,
        currency,
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
        overview: {
            totalRevenue,
            totalOrders: orders.length,
            avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
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
            platform_fees: platformFees,
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
        hasEnoughData: orders.length >= 5 && totalRevenue > 0
    };
}
