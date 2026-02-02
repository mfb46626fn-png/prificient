import { createClient } from '@/utils/supabase/server';
import { ProductAnalysis, ProductFinancials } from '@/lib/analysis/product-profitability';

// --- Types ---
export interface DiagnosisReport {
    // 1. The Illusion Gap
    illusion: {
        revenue: number;
        realProfit: number;
        gapMessage: string;
        salesCount: number;
    };

    // 2. Toxic Champion (Best Seller That Loses Money)
    toxicChampion: {
        productName: string;
        productImage?: string;
        salesVolume: number;
        grossRevenue: number;
        netLoss: number;
        variantId: string;
    } | null;

    // 3. Loss Anatomy (For Toxic Product)
    lossAnatomy: {
        grossRevenue: number;
        adSpend: number;
        refundCost: number;
        platformFees: number;
        shippingGap: number;
        cogs: number;
        netResult: number;
    } | null;

    // 4. Opportunity Cost
    opportunityCost: {
        currentProfit: number;
        profitWithoutToxic: number;
        percentageGain: number;
    } | null;

    // 5. Cash Burn Projection
    burnProjection: {
        dailyBurnRate: number;
        daysUntilZero: number;
    };

    // Meta
    hasEnoughData: boolean;
    dateRange: { start: string; end: string };
    currency: string; // Dynamic currency from Shopify
}

// --- Main Function ---
export async function generateDiagnosisReport(userId: string): Promise<DiagnosisReport> {
    const supabase = await createClient();

    // Date Range: Last 1 Year (365 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Fetch user's currency from store_settings
    const { data: settings } = await supabase
        .from('store_settings')
        .select('currency')
        .eq('user_id', userId)
        .maybeSingle();

    const currency = settings?.currency || 'TRY';

    // --- 1. Fetch Aggregate Financials ---
    const { data: entries } = await supabase
        .from('ledger_entries')
        .select(`
            amount,
            direction,
            metadata,
            account:ledger_accounts!inner(code, type),
            transaction:ledger_transactions!inner(transaction_date)
        `)
        .eq('user_id', userId)
        .gte('transaction.transaction_date', startDate.toISOString())
        .lte('transaction.transaction_date', endDate.toISOString());

    // Aggregate totals
    let totalRevenue = 0;
    let totalCogs = 0;
    let totalFees = 0;
    let totalAds = 0;
    let totalShipping = 0;
    let totalReturns = 0;
    let salesCount = 0;

    // Track per-product ad spend (via metadata.variant_id if available)
    const productAdSpend = new Map<string, number>();
    const productRefunds = new Map<string, number>();
    const productFees = new Map<string, number>();
    const productShipping = new Map<string, number>();

    entries?.forEach((e: any) => {
        const amt = Number(e.amount);
        const code = e.account?.code;
        const variantId = e.metadata?.variant_id;

        switch (code) {
            case '600': // Revenue
                totalRevenue += amt;
                salesCount++;
                break;
            case '610': // Returns
                totalReturns += amt;
                if (variantId) {
                    productRefunds.set(variantId, (productRefunds.get(variantId) || 0) + amt);
                }
                break;
            case '621': // COGS
                totalCogs += amt;
                break;
            case '740': // Platform Fees
                totalFees += amt;
                if (variantId) {
                    productFees.set(variantId, (productFees.get(variantId) || 0) + amt);
                }
                break;
            case '750': // Shipping
                totalShipping += amt;
                if (variantId) {
                    productShipping.set(variantId, (productShipping.get(variantId) || 0) + amt);
                }
                break;
            case '760': // Ads/Marketing
                totalAds += amt;
                if (variantId) {
                    productAdSpend.set(variantId, (productAdSpend.get(variantId) || 0) + amt);
                }
                break;
        }
    });

    const realProfit = totalRevenue - totalCogs - totalFees - totalAds - totalShipping - totalReturns;

    // --- 2. Find Toxic Champion ---
    // Use ProductAnalysis to get per-product breakdown
    const allProducts = await ProductAnalysis.analyzeProductProfitability(userId, startDate, endDate);

    // Find high-sales but negative profit products
    // Sort by sales volume DESC, then filter for negative profit
    const toxicCandidates = [...allProducts]
        .filter(p => p.profit < 0)
        .sort((a, b) => b.gross_sales - a.gross_sales);

    let toxicChampion: DiagnosisReport['toxicChampion'] = null;
    let lossAnatomy: DiagnosisReport['lossAnatomy'] = null;
    let opportunityCost: DiagnosisReport['opportunityCost'] = null;

    if (toxicCandidates.length > 0) {
        const toxic = toxicCandidates[0];

        // Calculate detailed breakdown for this product
        const adSpend = productAdSpend.get(toxic.variant_id) || 0;
        const refundCost = productRefunds.get(toxic.variant_id) || toxic.returns;
        const platformFees = productFees.get(toxic.variant_id) || 0;
        const shippingGap = productShipping.get(toxic.variant_id) || 0;

        toxicChampion = {
            productName: toxic.title || 'Bilinmeyen Ürün',
            salesVolume: Math.round(toxic.gross_sales / (toxic.gross_sales / salesCount || 1)), // Estimate units
            grossRevenue: toxic.gross_sales,
            netLoss: toxic.profit,
            variantId: toxic.variant_id
        };

        lossAnatomy = {
            grossRevenue: toxic.gross_sales,
            adSpend: adSpend,
            refundCost: refundCost,
            platformFees: platformFees,
            shippingGap: shippingGap,
            cogs: toxic.cogs,
            netResult: toxic.profit
        };

        // Opportunity Cost Calculation
        const profitWithoutToxic = realProfit - toxic.profit; // Removing negative = adding
        const percentageGain = realProfit !== 0
            ? Math.abs(((profitWithoutToxic - realProfit) / Math.abs(realProfit)) * 100)
            : 0;

        opportunityCost = {
            currentProfit: realProfit,
            profitWithoutToxic: profitWithoutToxic,
            percentageGain: Math.round(percentageGain)
        };
    }

    // --- 3. Burn Rate Projection ---
    const days = 30;
    const dailyBurnRate = realProfit < 0 ? Math.abs(realProfit / days) : 0;
    // Assume starting cash = 30 days of revenue (rough estimate)
    const estimatedCash = totalRevenue / 2; // Rough guess
    const daysUntilZero = dailyBurnRate > 0 ? Math.round(estimatedCash / dailyBurnRate) : 999;

    // --- 4. Gap Message ---
    let gapMessage = '';
    if (realProfit < 0) {
        gapMessage = 'Cironuz yüksek ama cebiniz delik. Her satış sizi batırıyor.';
    } else if (realProfit < totalRevenue * 0.05) {
        gapMessage = 'Ciroya göre kârınız çok düşük. Bir şeyler yanlış gidiyor.';
    } else {
        gapMessage = 'İşler idare eder görünüyor, ama gizli tehlikeler var.';
    }

    // --- 5. Check Data Sufficiency ---
    const hasEnoughData = salesCount >= 5 && totalRevenue > 0;

    return {
        illusion: {
            revenue: totalRevenue,
            realProfit: realProfit,
            gapMessage: gapMessage,
            salesCount: salesCount
        },
        toxicChampion,
        lossAnatomy,
        opportunityCost,
        burnProjection: {
            dailyBurnRate: Math.round(dailyBurnRate),
            daysUntilZero: daysUntilZero
        },
        hasEnoughData,
        dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        },
        currency
    };
}
