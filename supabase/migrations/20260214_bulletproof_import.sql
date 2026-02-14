-- Reset tables to ensure clean state (Bulletproof Init)
DROP TABLE IF EXISTS ledger_entries;
DROP TABLE IF EXISTS ad_imports;

-- Create ad_imports table to track file uploads and prevent duplicates
CREATE TABLE IF NOT EXISTS ad_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    file_hash TEXT NOT NULL,
    file_name TEXT NOT NULL,
    row_count INTEGER,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Index for duplicate check (user can't upload same file hash twice)
CREATE INDEX IF NOT EXISTS idx_ad_imports_hash ON ad_imports(user_id, file_hash);

-- Create ledger_entries table for double-entry accounting
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    import_id UUID REFERENCES ad_imports(id),
    transaction_date DATE NOT NULL,
    description TEXT,
    debit_code TEXT NOT NULL, -- e.g. '760' (Marketing Expense)
    credit_code TEXT NOT NULL, -- e.g. '320' (Vendor/Meta)
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    metadata JSONB, -- Stores { product_id: "..." } for attribution
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ad_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own imports" ON ad_imports
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ledger" ON ledger_entries
    FOR ALL USING (auth.uid() = user_id);
