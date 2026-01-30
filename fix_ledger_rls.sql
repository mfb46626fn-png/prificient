-- 1. Temizlik (Eski politikaları temizle)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own data" ON ledger_accounts;
    DROP POLICY IF EXISTS "Users can view own accounts" ON ledger_accounts;
    DROP POLICY IF EXISTS "Users can insert own accounts" ON ledger_accounts;
    DROP POLICY IF EXISTS "Users can update own accounts" ON ledger_accounts;
    DROP POLICY IF EXISTS "Users can view own transactions" ON ledger_transactions;
    DROP POLICY IF EXISTS "Users can insert own transactions" ON ledger_transactions;
    DROP POLICY IF EXISTS "Users can view own entries" ON ledger_entries;
    DROP POLICY IF EXISTS "Users can insert own entries" ON ledger_entries;
    DROP POLICY IF EXISTS "Users can view own logs" ON financial_event_log;
    DROP POLICY IF EXISTS "Users can insert own logs" ON financial_event_log;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 2. Eksik Kolonları Ekle (CRITICAL FIX)
ALTER TABLE ledger_transactions ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Veri Onarımı
UPDATE ledger_transactions SET transaction_date = created_at WHERE transaction_date IS NULL;

-- 4. RLS Aktifleştir
ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_event_log ENABLE ROW LEVEL SECURITY;

-- 5. Yeni Politikaları Oluştur
CREATE POLICY "Users can view own accounts" ON ledger_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON ledger_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON ledger_accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON ledger_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON ledger_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own entries" ON ledger_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON ledger_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own logs" ON financial_event_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON financial_event_log FOR INSERT WITH CHECK (auth.uid() = user_id);
