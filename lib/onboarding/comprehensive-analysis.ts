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
    cogs: number;
}

export interface CostBreakdown {
    revenue: number;
    cogs: number;
    tax: number;
    shipping: number;
    platform_fees: number;
    refunds: number;
    discounts: number;
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

// Shopify GraphQL query for orders with refunds and discounts
async function fetchShopifyOrders(accessToken: string, shopDomain: string, start?: Date, end?: Date): Promise<{ orders: any[]; currency: string }> {
    const orders: any[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;
    let currency = 'USD';

    // Build Query String (Parentheses crucial for correct AND logic with Date)
    let queryString = "(financial_status:paid OR financial_status:partially_refunded OR financial_status:refunded)";

    // Append Date Filters if provided
    if (start) {
        queryString += ` AND created_at:>=${start.toISOString()}`;
    }
    if (end) {
        queryString += ` AND created_at:<=${end.toISOString()}`;
    }

    while (hasNextPage) {
        const query = `
            query($cursor: String, $query: String) {
                orders(first: 100, after: $cursor, query: $query) {
                    pageInfo { hasNextPage endCursor }
                    edges {
                        node {
                            id
                            name
                            createdAt
                            displayFinancialStatus
                            subtotalPriceSet { shopMoney { amount currencyCode } }
                            totalPriceSet { shopMoney { amount currencyCode } }
                            totalTaxSet { shopMoney { amount } }
                            totalShippingPriceSet { shopMoney { amount } }
                            totalDiscountsSet { shopMoney { amount } }
                            totalRefundedSet { shopMoney { amount } }
                            refunds {
                                totalRefundedSet { shopMoney { amount } }
                            }
                            lineItems(first: 100) {
                                edges {
                                    node {
                                        title
                                        quantity
                                        variant { 
                                            id 
                                            sku 
                                            product { id } 
                                            inventoryItem { 
                                                unitCost { amount } 
                                            }
                                        }
                                        originalTotalSet { shopMoney { amount } }
                                        discountedTotalSet { shopMoney { amount } }
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
            body: JSON.stringify({ query, variables: { cursor, query: queryString } }),
        });

        const json: { data?: { orders?: { edges: any[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } } = await response.json();
        const ordersData = json.data?.orders;

        if (!ordersData) break;

        for (const edge of ordersData.edges) {
            const order = edge.node;
            orders.push(order);
            // Get currency from first order
            if (!currency || currency === 'USD') {
                currency = order.totalPriceSet?.shopMoney?.currencyCode || 'USD';
            }
        }

        hasNextPage = ordersData.pageInfo.hasNextPage;
        cursor = ordersData.pageInfo.endCursor;

        // Safety limit (increased for filtered queries)
        // If specific range, we trust the range.
        // But keep a sanity cap to prevent timeouts (~10k orders is feasible in chunks, but let's stick to 5k-10k)
        if (orders.length >= 10000) break;
    }

    return { orders, currency };
}

// --- Main Analysis Function ---
export async function generateComprehensiveAnalysis(userId: string, dateRangeFilter?: { start: Date, end: Date }): Promise<ComprehensiveAnalysis> {
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

    const storeName = settings?.store_name || 'Mağazanız';

    // Default empty result
    const emptyResult = (curr: string): ComprehensiveAnalysis => ({
        storeName,
        currency: curr,
        dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
        overview: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalProducts: 0, periodDays: 1 },
        realProfit: { grossRevenue: 0, totalCosts: 0, netProfit: 0, profitMargin: 0, gapMessage: 'Veri bulunamadı' },
        costBreakdown: { revenue: 0, cogs: 0, tax: 0, shipping: 0, platform_fees: 0, refunds: 0, discounts: 0, total_costs: 0, net_profit: 0 },
        topProducts: [],
        dangerProducts: [],
        monthlyTrends: [],
        cashFlow: { dailyBurnRate: 0, daysUntilZero: 999, averageDailyRevenue: 0, averageDailyProfit: 0 },
        opportunityCost: { lostProfit: 0, potentialGain: 0, worstProduct: null },
        recommendations: [],
        hasEnoughData: false
    });

    if (!integration?.access_token || !integration?.shop_domain) {
        return emptyResult('USD');
    }

    // Fetch product costs from product_costs table BEFORE processing
    let dbCostMap = new Map<string, number>();
    try {
        const { data: costs } = await supabaseAdmin
            .from('product_costs')
            .select('variant_id, unit_cost')
            .eq('user_id', userId);

        costs?.forEach(pc => {
            dbCostMap.set(String(pc.variant_id), Number(pc.unit_cost) || 0);
        });
    } catch (e) { console.error("Cost fetch failed", e); }

    // Prepare Date Filter for API (Server-Side Filtering)
    // If we have a filter, we pass it to Shopify to get EXACT and COMPLETE data for that range.
    // If no filter (All Time), we pass undefined, which hits the 10k limit (acceptable compromise).
    const fetchStart = dateRangeFilter ? new Date(dateRangeFilter.start) : undefined;
    const fetchEnd = dateRangeFilter ? new Date(dateRangeFilter.end) : undefined;

    // Fetch orders from Shopify
    const { orders, currency } = await fetchShopifyOrders(integration.access_token, integration.shop_domain, fetchStart, fetchEnd);

    if (orders.length === 0) {
        return emptyResult(currency);
    }

    // Aggregate data
    let totalSubtotal = 0; // Revenue before tax/shipping
    let totalGross = 0; // Total including tax/shipping
    let totalTax = 0;
    let totalShipping = 0;
    let totalDiscounts = 0;
    let totalRefunds = 0;
    let totalCogs = 0;
    const platformFeeRate = 0.026; // 2.6% payment processing

    const productMap = new Map<string, ProductMetric>();
    const monthlyMap = new Map<string, MonthlyTrend>();
    const productsToSync = new Map<string, any>(); // Check this for background sync
    const shopifyCostMap = new Map<string, number>();

    // If filter provided, use it. Else default to full range logic.
    let startDate = dateRangeFilter ? new Date(dateRangeFilter.start) : new Date();
    let endDate = dateRangeFilter ? new Date(dateRangeFilter.end) : new Date(0);

    // If NO filter provided, we let the loop expand the range naturally.
    // If filter provided, we stick to it and skip orders outside.
    const isFiltering = !!dateRangeFilter;

    // Reset loop bounds if not filtering, to detect range from data
    if (!isFiltering) {
        startDate = new Date();
        endDate = new Date(0);
    }

    for (const order of orders) {
        const orderDate = new Date(order.createdAt);

        if (isFiltering) {
            // Apply Filter
            if (orderDate < startDate || orderDate > endDate) continue;
        } else {
            // Auto Range Detection
            if (orderDate < startDate) startDate = orderDate;
            if (orderDate > endDate) endDate = orderDate;
        }

        const subtotal = parseFloat(order.subtotalPriceSet?.shopMoney?.amount || '0');
        const gross = parseFloat(order.totalPriceSet?.shopMoney?.amount || '0');
        const orderTax = parseFloat(order.totalTaxSet?.shopMoney?.amount || '0');
        const orderShipping = parseFloat(order.totalShippingPriceSet?.shopMoney?.amount || '0');
        const orderDiscounts = parseFloat(order.totalDiscountsSet?.shopMoney?.amount || '0');

        // Calculate refunds
        let orderRefunds = parseFloat(order.totalRefundedSet?.shopMoney?.amount || '0');
        if (order.refunds && order.refunds.length > 0) {
            for (const refund of order.refunds) {
                const refundAmount = parseFloat(refund.totalRefundedSet?.shopMoney?.amount || '0');
                if (refundAmount > orderRefunds) {
                    orderRefunds = refundAmount;
                }
            }
        }

        totalSubtotal += subtotal;
        totalGross += gross;
        totalTax += orderTax;
        totalShipping += orderShipping;
        totalDiscounts += orderDiscounts;
        totalRefunds += orderRefunds;

        // Monthly tracking
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { month: monthKey, revenue: 0, profit: 0, orders: 0, cogs: 0 });
        }
        const monthly = monthlyMap.get(monthKey)!;
        monthly.revenue += subtotal;
        monthly.orders += 1;

        // Line items
        for (const lineEdge of order.lineItems?.edges || []) {
            const item = lineEdge.node;
            const variantGid = item.variant?.id || '';
            const variantId = variantGid.replace('gid://shopify/ProductVariant/', '');
            const productGid = item.variant?.product?.id || '';
            const productId = productGid.replace('gid://shopify/Product/', '');
            const lineTotal = parseFloat(item.discountedTotalSet?.shopMoney?.amount || item.originalTotalSet?.shopMoney?.amount || '0');
            const qty = item.quantity || 1;

            // Capture Shopify Unit Cost
            const shopifyCost = parseFloat(item.variant?.inventoryItem?.unitCost?.amount || '0');
            if (shopifyCost > 0 && variantId) {
                shopifyCostMap.set(variantId, shopifyCost);
            }

            // Determine Unit Cost (DB > Shopify > 0)
            const unitCost = dbCostMap.get(variantId) || shopifyCost || 0;
            const lineCogs = unitCost * qty;

            totalCogs += lineCogs;
            monthly.cogs += lineCogs;

            if (!variantId) continue;

            if (!productMap.has(variantId)) {
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

            const prod = productMap.get(variantId)!;
            prod.revenue += lineTotal;
            prod.quantity_sold += qty;
            prod.cogs += lineCogs; // Accumulate COGS

            // Collect for Sync
            if (!productsToSync.has(variantId)) {
                productsToSync.set(variantId, {
                    user_id: userId,
                    variant_id: variantId,
                    product_id: productId,
                    title: item.title || 'Unknown',
                    sku: item.variant?.sku || '',
                    price: lineTotal / qty,
                    cost: unitCost,
                    updated_at: new Date().toISOString()
                });
            }

            // Collect for Sync
            if (!productsToSync.has(variantId)) {
                productsToSync.set(variantId, {
                    user_id: userId,
                    variant_id: variantId,
                    product_id: productId,
                    title: item.title || 'Unknown',
                    sku: item.variant?.sku || '',
                    price: lineTotal / qty, // approx
                    cost: unitCost,
                    updated_at: new Date().toISOString()
                });
            }
        }
    }

    // Background Sync (Try/Catch)
    if (productsToSync.size > 0) {
        // We do this async without awaiting? No, Next.js generic functions should await or use waitUntil.
        // We'll await to ensure consistency.
        const productsPayload = Array.from(productsToSync.values());
        try {
            await supabaseAdmin.from('products').upsert(productsPayload, { onConflict: 'variant_id' });
        } catch (e) {
            console.warn("Auto-sync to 'products' table failed (table likely missing)", e);
        }
    }

    // Calculate product metrics (Finalize)
    const products = Array.from(productMap.values()).map(p => {
        // Costs are already accumulated in p.cogs
        // Add proportional fees/shipping?
        // Simple Profit = Revenue - COGS
        // User might want Fees separated. 
        // Let's stick to Net Profit = Revenue - COGS - (Revenue * FeeRate)
        const fees = p.revenue * platformFeeRate;
        p.fees = fees;
        p.profit = p.revenue - p.cogs - fees;
        p.profit_margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
        return p;
    });

    // Platform fees based on subtotal
    const platformFees = totalSubtotal * platformFeeRate;

    // Total costs = COGS + Tax + Shipping + Fees + Refunds
    // Note: Discounts are already subtracted from subtotal
    const totalCosts = totalCogs + totalTax + totalShipping + platformFees + totalRefunds;

    // Net revenue = Subtotal - Refunds
    const netRevenue = totalSubtotal - totalRefunds;

    // Net profit = Net Revenue - Costs (excluding refunds since already subtracted)
    const netProfit = netRevenue - (totalCogs + totalTax + totalShipping + platformFees);
    const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    // Sort products
    const topProducts = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const dangerProducts = [...products]
        .filter(p => p.profit_margin < 10 || p.profit < 0)
        .sort((a, b) => a.profit - b.profit)
        .slice(0, 5);

    // Monthly trends
    const monthlyTrends = Array.from(monthlyMap.values())
        .sort((a, b) => a.month.localeCompare(b.month));
    monthlyTrends.forEach(m => {
        const fees = m.revenue * platformFeeRate;
        m.profit = m.revenue - m.cogs - fees;
    });

    // Period calculation
    const periodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Cash flow
    const dailyBurnRate = netProfit < 0 ? Math.abs(netProfit / periodDays) : 0;
    const averageDailyRevenue = netRevenue / periodDays;
    const averageDailyProfit = netProfit / periodDays;
    const estimatedCash = netRevenue * 0.3;
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

    if (totalRefunds > netRevenue * 0.05) {
        recommendations.push({
            type: 'warning',
            title: 'Yüksek İade Oranı',
            description: `İadeler cirunuzun %${((totalRefunds / totalSubtotal) * 100).toFixed(1)}'ini oluşturuyor.`,
            impact: 'İade nedenlerini analiz edin, kalite veya açıklama sorunları olabilir.'
        });
    }

    if (dangerProducts.length > 0 && dangerProducts[0].profit < 0) {
        recommendations.push({
            type: 'warning',
            title: 'Zarar Eden Ürünü Değerlendirin',
            description: `"${dangerProducts[0].title}" ürünü zarar ettiriyor.`,
            impact: `Bu ürünü optimize etmek ${Math.abs(dangerProducts[0].profit).toFixed(0)} ${currency} kazandırabilir.`
        });
    }

    if (totalCogs === 0) {
        recommendations.push({
            type: 'action',
            title: 'Ürün Maliyetlerini Ekleyin',
            description: 'Henüz ürün maliyeti tanımlanmamış. Gerçek kârlılık için maliyetleri girin.',
            impact: 'Dashboard > Ürünler bölümünden maliyetleri ekleyin.'
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
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
        overview: {
            totalRevenue: netRevenue,
            totalOrders: orders.length,
            avgOrderValue: orders.length > 0 ? netRevenue / orders.length : 0,
            totalProducts: products.length,
            periodDays
        },
        realProfit: {
            grossRevenue: totalSubtotal,
            totalCosts,
            netProfit,
            profitMargin,
            gapMessage
        },
        costBreakdown: {
            revenue: totalSubtotal,
            cogs: totalCogs,
            tax: totalTax,
            shipping: totalShipping,
            platform_fees: platformFees,
            refunds: totalRefunds,
            discounts: totalDiscounts,
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
        hasEnoughData: orders.length >= 5 && totalSubtotal > 0
    };
}
