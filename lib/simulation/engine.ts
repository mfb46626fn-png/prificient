export interface ProductSimData {
    variant_id: string;
    title: string;
    gross_sales: number;
    returns_amount: number;
    net_sales: number;
    cogs: number;      // Estimated from margin or global ratio if unknown
    ad_spend: number;  // Estimated attribution
    shipping_cost: number;
    quantity: number;
    return_rate: number; // 0-1
}

export interface HybridSimulationInput {
    products: ProductSimData[]; // Top 100
    rest_of_store: ProductSimData; // Aggregated rest
    global_ad_spend: number;
    global_shipping_cost: number;
    global_cogs: number;
}

export interface SimulationScenario {
    scope: 'portfolio' | 'product';
    target_variant_id?: string | null; // If scope is product

    // Modifiers
    price_change_percent: number;
    ad_budget_change_percent: number;
    return_improvement_percent: number;
    cogs_increase_percent: number;

    // Kill Switch (Micro Only)
    is_killed?: boolean;
}

export interface SimulationResult {
    old_net_profit: number;
    new_net_profit: number;
    delta_profit: number;

    // Breakdown
    new_revenue: number;
    new_gross_sales: number;
    new_orders: number;

    // For specific product focus
    focused_product_delta?: number;
}

// COEFFICIENTS
const PRICE_ELASTICITY = 0.8;
const ROAS_DECAY = 0.9;

export const SimulationEngine = {
    simulateHybrid(input: HybridSimulationInput, scenario: SimulationScenario): SimulationResult {
        let total_new_profit = 0;
        let total_old_profit = 0;

        let total_new_gross = 0;
        let total_new_returns = 0;
        let total_new_orders = 0;

        // Helper to simulate one product line
        const simulateProduct = (p: ProductSimData): number => {
            // OLD PROFIT
            const old_profit = p.net_sales - p.cogs - p.ad_spend - p.shipping_cost;
            total_old_profit += old_profit;

            // IF KILLED (Micro Mode)
            if (scenario.scope === 'product' && scenario.target_variant_id === p.variant_id && scenario.is_killed) {
                // Returns 0 profit (actually might save losses, so it adds to delta)
                return 0;
            }

            // DETERMINE MODIFIERS
            // If Scope is Portfolio -> Apply to ALL
            // If Scope is Product -> Apply ONLY to target

            let mod_price = 0;
            let mod_ad = 0;
            let mod_return = 0;
            let mod_cogs = 0;

            if (scenario.scope === 'portfolio') {
                mod_price = scenario.price_change_percent;
                mod_ad = scenario.ad_budget_change_percent;
                mod_return = scenario.return_improvement_percent;
                mod_cogs = scenario.cogs_increase_percent;
            } else if (scenario.scope === 'product' && scenario.target_variant_id === p.variant_id) {
                mod_price = scenario.price_change_percent;
                mod_ad = scenario.ad_budget_change_percent;
                mod_return = scenario.return_improvement_percent;
                mod_cogs = scenario.cogs_increase_percent;
            }
            // Else: Leave as 0 (No change for other products in Micro mode)

            // CALCULATION (Same as before but per product)

            // 1. Volume Impact (Price Elasticity)
            // If Price +10% -> Volume -8%
            const volume_factor_price = 1 - ((mod_price / 100) * PRICE_ELASTICITY);

            // 2. Ad Impact (Global Decay applied locally?)
            // We assume linear attribution: Local Ad Spend increases by X%, drives Local Volume by Y%
            // Since we don't have perfect per-product ad spend, we assume allocated.
            const traffic_multiplier = 1 + ((mod_ad / 100) * ROAS_DECAY);

            const total_vol_mult = Math.max(0, volume_factor_price * traffic_multiplier);

            // New Metrics
            const new_orders = p.quantity * total_vol_mult;

            // Gross Sales
            // Old Price = Gross / Qty
            const old_price = p.quantity > 0 ? p.gross_sales / p.quantity : 0;
            const new_price = old_price * (1 + (mod_price / 100));
            const new_gross = new_orders * new_price;

            // Returns
            // New Rate = Old Rate * (1 + improvement)
            const new_rate = p.return_rate * (1 + (mod_return / 100));
            const new_returns = new_gross * new_rate;

            // COGS
            // Unit Cost = Old COGS / Qty
            const old_unit_cost = p.quantity > 0 ? p.cogs / p.quantity : 0;
            const new_unit_cost = old_unit_cost * (1 + (mod_cogs / 100));
            const new_cogs_total = new_orders * new_unit_cost;

            // Ad Spend
            // Simply scales with budget
            const new_ad_spend = p.ad_spend * (1 + (mod_ad / 100));

            // Shipping
            // Scales with orders
            const old_shipping_unit = p.quantity > 0 ? p.shipping_cost / p.quantity : 0;
            const new_shipping = new_orders * old_shipping_unit;

            // RESULTS
            const new_net = (new_gross - new_returns) - new_cogs_total - new_ad_spend - new_shipping;

            // Aggregates
            total_new_gross += new_gross;
            total_new_returns += new_returns;
            total_new_orders += new_orders;

            return new_net;
        };

        // 1. Iterate Top Products
        input.products.forEach(p => {
            const result = simulateProduct(p);
            total_new_profit += result;
        });

        // 2. Iterate Rest of Store (As one big product)
        const restResult = simulateProduct(input.rest_of_store);
        total_new_profit += restResult;

        return {
            old_net_profit: total_old_profit,
            new_net_profit: total_new_profit,
            delta_profit: total_new_profit - total_old_profit,
            new_revenue: total_new_gross - total_new_returns,
            new_gross_sales: total_new_gross,
            new_orders: total_new_orders
        };
    }
}
