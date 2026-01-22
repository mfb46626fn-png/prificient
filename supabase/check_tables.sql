SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name IN ('decision_log', 'financial_event_log', 'ledger_entries');
