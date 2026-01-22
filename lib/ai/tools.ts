import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { METRIC_DEFINITIONS, MetricKey } from './semantic-layer';

/**
 * AI TOOLS DEFINITION
 * 
 * This file contains the tool definitions and execution logic for the AI assistant.
 * We use Zod for strict schema validation to ensure the AI calls these tools with correct parameters.
 */

// Tool 1: Query Financial Ledger
export const queryFinancialLedgerSchema = z.object({
    startDate: z.string().describe('ISO date string (YYYY-MM-DD) for the start of the period'),
    endDate: z.string().describe('ISO date string (YYYY-MM-DD) for the end of the period'),
    metric: z.string().optional().describe('High-level metric to calculate (e.g., NET_REVENUE, DOLLAR_KEEP_RATE). If provided, account codes are inferred.'),
    accountCodes: z.array(z.string()).optional().describe('Specific account codes to filter by (e.g., ["600", "601"]). Overrides metric if provided.'),
    groupBy: z.enum(['day', 'month', 'total']).default('total').describe('How to group the results. "total" returns a single sum, others return time series.')
});

export async function queryFinancialLedger(input: z.infer<typeof queryFinancialLedgerSchema>) {
    const supabase = await createClient();
    const { startDate, endDate, metric, accountCodes, groupBy } = input;

    // 1. Determine Account Filter
    let prefixes: string[] = [];
    let balanceType: 'debit' | 'credit' | 'net' = 'net';

    if (accountCodes && accountCodes.length > 0) {
        prefixes = accountCodes;
    } else if (metric) {
        const def = METRIC_DEFINITIONS[metric as MetricKey];
        if ('account_filter' in def) {
            prefixes = [def.account_filter.code_prefix];
            balanceType = def.balance_type as any;
        }
        // Note: Complex formulas like Net Profit are handled by the AI combining multiple tool calls or simpler logic
        // For now, we support direct account mapping.
    }

    // 2. Build Query
    let query = supabase
        .from('ledger_entries')
        .select('amount, type, transaction_date, account_code')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

    // Apply Account Code Filter
    if (prefixes.length > 0) {
        // Logic: account_code LIKE '600%' OR ...
        // Supabase specific syntax for OR-ing like filters is tricky.
        // Simpler approach: Fetch data and filter in memory if volume allows, OR use a custom RPC.
        // For MVP, capturing broad classes.
        // A better approach for exact prefixes:
        // .or(`account_code.like.${prefixes[0]}%, ...`)
        const orFilter = prefixes.map(p => `account_code.like.${p}%`).join(',');
        query = query.or(orFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Database error: ${error.message}`);
    if (!data) return { result: 0, grouped: [] };

    // 3. Process Data
    // Aggregation Logic (Client-side for flexibility, assuming specific AI use case volume isn't massive yet)

    const processedData = data.map(entry => {
        // Adjust sign based on expected balance type
        // Revenue (Credit) -> should be positive for display?
        // Convention: Credit is negative in DB usually? Depends on implementation.
        // Let's assume standard DB: Debit +, Credit -.
        // If metric expects Credit Balance (Revenue), we flip the sign of Credit entries to be positive for the user.
        let val = entry.amount; // Assuming amount is always positive and type determines sign
        if (entry.type === 'DEBIT') val = val;
        if (entry.type === 'CREDIT') val = -val;

        // Correction for "Credit Balance" metrics (like Revenue)
        // If we want Revenue to show as Positive, and it's stored as Credit (neg), we multiply by -1.
        if (balanceType === 'credit') val = -val;

        return { ...entry, val };
    });

    if (groupBy === 'total') {
        const total = processedData.reduce((sum, item) => sum + item.val, 0);
        return {
            metric: metric || 'CUSTOM',
            total,
            period: { startDate, endDate },
            currency: 'TRY' // Default
        };
    } else {
        // Group by Day or Month
        // ... Implementation for time series
        // Simplification for MVP: Return raw aggregated list
        return {
            metric: metric || 'CUSTOM',
            data: processedData, // AI can summarize this or UI can chart it
            groupBy
        };
    }
}

// Tool 2: Analyze Decisions
export const analyzeDecisionsSchema = z.object({
    limit: z.number().default(5).describe('Number of recent decisions to fetch'),
    category: z.string().optional().describe('Filter by category (e.g., pricing, marketing)')
});

export async function analyzeDecisions(input: z.infer<typeof analyzeDecisionsSchema>) {
    const supabase = await createClient();
    let query = supabase.from('decision_log').select('*').order('created_at', { ascending: false }).limit(input.limit);

    if (input.category) {
        query = query.eq('category', input.category);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

// Tool 3: Detect Anomalies (Simple Rule-based)
export const detectAnomaliesSchema = z.object({
    threshold: z.number().optional().describe('Minimum amount to consider as anomaly detection baseline'),
    accountCode: z.string().optional().describe('Specific account to check')
});

export async function detectAnomalies(input: z.infer<typeof detectAnomaliesSchema>) {
    // Mock implementation for MVP: scans for single large transactions
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let query = supabase
        .from('ledger_entries')
        .select('*')
        .gt('amount', input.threshold || 50000) // Default 50k threshold
        .gte('transaction_date', last30);

    if (input.accountCode) {
        query = query.like('account_code', `${input.accountCode}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return {
        anomalies: data,
        count: data?.length || 0,
        message: data?.length ? `Found ${data.length} large transactions.` : "No anomalies detected."
    };
}
