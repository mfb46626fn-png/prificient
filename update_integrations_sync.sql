-- Add sync tracking columns to integrations table
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS sync_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_synced_cursor text,
ADD COLUMN IF NOT EXISTS total_orders_to_sync integer DEFAULT 0;

-- Add constraint for sync_status enum-like behavior
ALTER TABLE integrations 
DROP CONSTRAINT IF EXISTS check_sync_status;

ALTER TABLE integrations 
ADD CONSTRAINT check_sync_status 
CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed'));

-- Create index for faster middleware checks
CREATE INDEX IF NOT EXISTS idx_integrations_sync_status ON integrations(user_id, sync_status);
