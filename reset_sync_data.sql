-- WARNING: This will delete all synced financial data to allow a clean re-sync with the new fixes.
-- It does NOT delete your account or connection, just the synced orders/ledger.

-- 1. Truncate Financial Data
TRUNCATE TABLE ledger_entries CASCADE;
TRUNCATE TABLE ledger_transactions CASCADE;
TRUNCATE TABLE financial_event_log CASCADE;

-- 2. Reset Integration Status
-- This forces the system to start sync from scratch (fetching all dates & costs correctly)
UPDATE integrations 
SET 
    sync_status = 'pending',
    last_synced_cursor = NULL, 
    sync_progress = 0,
    updated_at = NOW()
WHERE platform = 'shopify';

-- 3. Ensure Store Settings Logic
-- If you are using USD, we want to make sure the dashboard knows.
-- We can't know for sure here, but we can ensure the table exists.
-- The next sync/auth usually updates this. 

-- 4. Verify RLS (Safety Check)
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions ENABLE ROW LEVEL SECURITY;
