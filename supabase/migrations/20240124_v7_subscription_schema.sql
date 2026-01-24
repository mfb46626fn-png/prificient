-- Prificient V7.0 Subscription Schema Update

-- 1. Add new columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS risk_band TEXT CHECK (risk_band IN ('safe', 'risk', 'danger', 'critical')),
ADD COLUMN IF NOT EXISTS assigned_plan_id TEXT,
ADD COLUMN IF NOT EXISTS is_blind_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS churn_reason TEXT,
ADD COLUMN IF NOT EXISTS upgrade_needed BOOLEAN DEFAULT FALSE;

-- 2. Index for faster assignment queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_risk_band ON subscriptions(risk_band);
CREATE INDEX IF NOT EXISTS idx_subscriptions_assigned_plan ON subscriptions(assigned_plan_id);

-- 3. Comment explaining the philosophy
COMMENT ON COLUMN subscriptions.is_blind_mode IS 'If true, user sees blurred dashboard metrics until payment.';
COMMENT ON COLUMN subscriptions.assigned_plan_id IS 'The plan algorithmically determined via lib/billing/assignment.ts';
