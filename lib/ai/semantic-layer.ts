/**
 * Semantic Layer for Deterministic AI Financial Assistant
 * 
 * This file serves as the "dictionary" that maps human-readable financial concepts
 * to specific database queries and account codes. The AI uses this to understand
 * what "Revenue" or "Cost" actually means in the context of the Supabase ledger schema.
 */

export const METRIC_DEFINITIONS = {
    NET_REVENUE: {
        term: "Net Revenue (Net Satışlar)",
        description: "Income generated from normal business operations. In Turkish Uniform Chart of Accounts, this corresponds to Account Code 600 (Domestic Sales).",
        // Logic: Credit sum of 600
        account_filter: { code_prefix: "600" },
        balance_type: "credit",
        sql_hint: "SUM(credit) WHERE account_code LIKE '600%'"
    },

    COST_OF_GOODS_SOLD: {
        term: "Cost of Goods Sold (Satışların Maliyeti - SMM)",
        description: "Direct costs of producing the goods sold. Corresponds to Account Code 621 (Cost of Sold Commercial Goods).",
        // Logic: Debit sum of 621
        account_filter: { code_prefix: "621" },
        balance_type: "debit",
        sql_hint: "SUM(debit) WHERE account_code LIKE '621%'"
    },

    OPERATING_EXPENSES: {
        term: "Operating Expenses (Faaliyet Giderleri)",
        description: "Expenses incurred from normal business operations. Includes Marketing (760) and General Admin (770).",
        // Logic: Debit sum of 7xx accounts
        account_filter: { code_prefix: "7" },
        balance_type: "debit",
        sql_hint: "SUM(debit) WHERE account_code LIKE '7%'"
    },

    MARKETING_EXPENSES: {
        term: "Marketing Expenses (Pazarlama Satış Dağıtım Giderleri)",
        description: "Expenses related to marketing and selling. Account Code 760.",
        account_filter: { code_prefix: "760" },
        balance_type: "debit",
        sql_hint: "SUM(debit) WHERE account_code LIKE '760%'"
    },

    GENERAL_ADMIN_EXPENSES: {
        term: "General Admin Expenses (Genel Yönetim Giderleri)",
        description: "Overhead and administrative costs. Account Code 770.",
        account_filter: { code_prefix: "770" },
        balance_type: "debit",
        sql_hint: "SUM(debit) WHERE account_code LIKE '770%'"
    },

    GROSS_PROFIT: {
        term: "Gross Profit (Brüt Kâr)",
        description: "Net Revenue minus Cost of Goods Sold.",
        formula: "NET_REVENUE - COST_OF_GOODS_SOLD"
    },

    NET_PROFIT: {
        term: "Net Profit (Net Faaliyet Kârı)",
        description: "Gross Profit minus Operating Expenses.",
        formula: "GROSS_PROFIT - OPERATING_EXPENSES"
    }
} as const;

export type MetricKey = keyof typeof METRIC_DEFINITIONS;

export function getMetricDefinitionPrompt() {
    return Object.entries(METRIC_DEFINITIONS).map(([key, def]) => {
        let line = `- ${key}: ${def.description}`;
        if ('sql_hint' in def) line += ` (SQL Hint: ${def.sql_hint})`;
        if ('formula' in def) line += ` (Formula: ${def.formula})`;
        return line;
    }).join('\n');
}
