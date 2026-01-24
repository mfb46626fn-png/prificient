-- 1. Ensure metadata column exists and create index
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ledger_entries' AND column_name = 'metadata') THEN 
        ALTER TABLE ledger_entries ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb; 
    END IF; 
END $$;

CREATE INDEX IF NOT EXISTS idx_ledger_entries_metadata ON ledger_entries USING GIN (metadata);

-- 2. Add 'outcome_metrics' to decision_log if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'decision_log' AND column_name = 'outcome_metrics') THEN 
        ALTER TABLE decision_log ADD COLUMN outcome_metrics JSONB; 
    END IF; 
END $$;

-- 3. We cannot insert DEFAULT accounts here directly because 'ledger_accounts' table depends on 'user_id'.
-- Instead, we will rely on 'LedgerService.initializeAccounts' in the application code to Upsert these new defaults when the user logs in or a sync happens.
-- However, we can ensure the table constraint / enum types support the new account types if any.
-- Accounts to be added by Application Logic:
-- 200: Ödenecek Vergiler (LIABILITY)
-- 610: Satış İadeleri (REVENUE CONTRA -> Treated as REVENUE with DEBIT normal? Or separate type? System supports ASSET/LIABILITY/REVENUE/EXPENSE/EQUITY. 'Revenue Contra' usually is a Debit balance in Revenue section or just Expense. Let's use EXPENSE or REVENUE with Debit normal. 
-- Best practice: REVENUE group, but DEBIT normal balance.
-- 740: Hizmet Üretim Giderleri / Komisyonlar (EXPENSE)
-- 750: Kargo Giderleri (EXPENSE)
-- 780: Finansman Giderleri / Kur Farkı (EXPENSE)

-- 4. Check types
-- Our 'AccountType' enum in LedgerService ts file maps to strings in DB.
-- Ensure we don't have a DB enum constraint blocking us. (Usually text).

-- 5. Force update 'ledger_accounts' unique constraint if needed? 
-- Current upsert relies on (user_id, code). This should be fine.

SELECT 'Financial Structure Updated. Run LedgerService.initializeAccounts() to populate new accounts.' as status;
