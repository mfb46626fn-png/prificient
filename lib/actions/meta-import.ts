'use server'

import { createClient } from '@/utils/supabase/server';
import { NormalizedAdRow } from '@/lib/import/meta-parser-core';

interface ImportState {
    fileHash: string;
    mappedRows: {
        row: NormalizedAdRow;
        product_id: string | 'GENERAL' | 'IGNORE';
    }[];
}

export async function processImport(state: ImportState) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Double check Hash to prevent race condition/duplicate
    const { data: existing } = await supabase.from('ad_imports').select('id').eq('file_hash', state.fileHash).single();
    if (existing) throw new Error("File already imported!");

    // Start Transaction (Manual via Supabase RPC or logical blocks)
    // For now, sequential inserts. Ideally use RPC. 

    // 2. Create Import Record
    const { data: importRec, error: importErr } = await supabase.from('ad_imports').insert({
        user_id: user.id,
        file_hash: state.fileHash,
        file_name: 'Manual Import', // Passed from client?
        row_count: state.mappedRows.length,
        status: 'completed'
    }).select().single();

    if (importErr) throw importErr;

    // 3. Update Mappings (Memory)
    const newMappings = new Map<string, string>();
    state.mappedRows.forEach(item => {
        // Only learn if not ignored
        if (item.product_id !== 'IGNORE') {
            newMappings.set(item.row.campaign_name, item.product_id);
        }
    });

    const mappingPayload = Array.from(newMappings.entries()).map(([name, pid]) => ({
        user_id: user.id,
        campaign_name_pattern: name,
        target_product_id: pid
    }));

    if (mappingPayload.length > 0) {
        await supabase.from('ad_campaign_mappings').upsert(mappingPayload, { onConflict: 'user_id,campaign_name_pattern' });
    }

    // 4. Create Ledger Entries
    const ledgerEntries = state.mappedRows.filter(r => r.product_id !== 'IGNORE').map(r => ({
        user_id: user.id,
        import_id: importRec.id,
        transaction_date: r.row.date,
        description: `Meta Ads: ${r.row.campaign_name}`,
        debit_code: '760',
        credit_code: '320',
        amount: r.row.amount,
        metadata: r.product_id === 'GENERAL' ? {} : { product_id: r.product_id }
    }));

    if (ledgerEntries.length > 0) {
        const { error: ledgerErr } = await supabase.from('ledger_entries').insert(ledgerEntries);
        if (ledgerErr) throw ledgerErr;
    }

    return { success: true, imported: ledgerEntries.length };
}
