
export interface SimulationInput {
    current_revenue: number;
    current_profit: number;
    current_return_rate: number; // percentage (e.g., 5 for 5%)
    avg_order_value: number;
    total_orders: number;
}

export interface SimulationScenario {
    // Variables (Sliders)
    target_return_rate: number; // e.g. reduce to 3%
    shipping_cost_reduction: number; // e.g. save 5 TL per order
    ad_spend_efficiency: number; // e.g. improve ROAS by 10%
}

export interface SimulationResult {
    projected_profit: number;
    profit_increase: number;
    saved_from_returns: number;
    saved_from_shipping: number;
}

export const CFOSimulator = {
    run(input: SimulationInput, scenario: SimulationScenario): SimulationResult {
        // 1. Return Rate Impact
        // If we reduce return rate from 5% to 3%, we save:
        // (Current Returns - New Returns) * (Avg Profit Loss per Return)
        // Avg Profit Loss per Return approx = (Shipping Cost * 2) + Processing Fee + Damaged Goods?
        // Let's assume a "Cost of Return" constant or derive it.
        // Simple Model: Refunded Revenue is gained back? No.
        // If Return Rate drops, we keep more Revenue.
        // Gained Revenue = Total Revenue * (Current Rate - Target Rate) / 100
        // And we save Shipping (One way or two ways).

        // Let's simplified: 
        // Money Saved from Returns = (Delta Rate / 100) * Input.current_revenue
        // *But* usually returns wipe out profit and cost shipping. 
        // Let's assume "Saved Revenue" is net gain.

        const deltaReturnRate = Math.max(0, input.current_return_rate - scenario.target_return_rate);
        const revenueGained = input.current_revenue * (deltaReturnRate / 100);

        // 2. Shipping Cost Impact
        // Saving X TL per order
        const shippingSaved = input.total_orders * scenario.shipping_cost_reduction;

        // 3. Ad Efficiency (Not implemented widely yet, assume pure profit add if ads budget same but more sales?)
        // Or assume Ad Spend decreases?
        // Let's ignore for now or treat as simple add.

        const totalIncrease = revenueGained + shippingSaved;

        return {
            projected_profit: input.current_profit + totalIncrease,
            profit_increase: totalIncrease,
            saved_from_returns: revenueGained,
            saved_from_shipping: shippingSaved
        };
    }
};
