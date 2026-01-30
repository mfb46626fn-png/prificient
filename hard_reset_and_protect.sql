-- 1. HARD RESET (Wipe all financial data)
TRUNCATE TABLE ledger_entries CASCADE;
TRUNCATE TABLE ledger_transactions CASCADE;
TRUNCATE TABLE financial_event_log CASCADE;

-- 2. Reset Sync Status
UPDATE integrations 
SET 
    sync_status = 'pending',
    last_synced_cursor = NULL, 
    sync_progress = 0,
    updated_at = NOW()
WHERE platform = 'shopify';

-- 3. ADD UNIQUE CONSTRAINT (Prevent Duplicates)
-- We add a 'source_id' column to track the external ID (e.g., Shopify Order ID)
-- This enforces that we NEVER process the same order twice.

ALTER TABLE financial_event_log ADD COLUMN IF NOT EXISTS source_id TEXT;

-- Create Unique Index: User + EventType + SourceID
-- Example: User1 + 'OrderCreated' + 'ShopifyOrder#123' must be unique.
DROP INDEX IF EXISTS idx_financial_event_log_unique_source;
CREATE UNIQUE INDEX idx_financial_event_log_unique_source 
ON financial_event_log (user_id, event_type, source_id);

-- 4. Re-Apply RLS (Just in case)
ALTER TABLE financial_event_log ENABLE ROW LEVEL SECURITY;
