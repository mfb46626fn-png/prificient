
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import shopify from '../lib/shopify';
import { Session } from '@shopify/shopify-api';

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...rest] = line.split('=');
            if (key && rest.length > 0) {
                const val = rest.join('='); // Handle values with =
                process.env[key.trim()] = val.trim().replace(/^["']|["']$/g, ''); // Remove quotes
            }
        });
    } catch (e) {
        console.error("Could not load .env.local", e);
    }
}

loadEnv();

async function diagnose() {
    console.log("🔍 Starting System Diagnosis...");

    // 1. Check ENV
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!sbUrl || !sbKey) {
        console.error("❌ Missing Supabase Credentials in .env.local");
        return;
    }
    console.log("✅ Env Variables Found");

    // 2. Supabase Connection
    const supabase = createClient(sbUrl, sbKey);
    const { data: users, error: userError } = await supabase.from('integrations').select('user_id, shop_domain, access_token').limit(1);

    if (userError) {
        console.error("❌ Supabase Connection Failed:", userError.message);
        return;
    }

    if (!users || users.length === 0) {
        console.error("❌ No Integrations Found in DB");
        return;
    }

    const target = users[0];
    console.log(`✅ Found Integration for Shop: ${target.shop_domain} (User: ${target.user_id})`);

    // 3. Test Shopify Token
    try {
        console.log("Testing Shopify Token...");
        const session = new Session({
            id: `offline_${target.shop_domain}`,
            shop: target.shop_domain,
            state: 'state',
            isOnline: false,
            accessToken: target.access_token
        });

        const client = new shopify.clients.Rest({ session });
        const shopInfo: any = await client.get({ path: 'shop' });

        console.log(`✅ Shopify Connection Successful: ${shopInfo.body?.shop?.name}`);
        console.log(`   Currency: ${shopInfo.body?.shop?.currency}`);

    } catch (e: any) {
        console.error("❌ Shopify API Failed:", e.message);
        if (e.response) {
            console.error("   Response:", JSON.stringify(e.response));
        }
    }

    // 4. Check Data Counts
    const { count: ledgerCount } = await supabase.from('ledger_entries').select('*', { count: 'exact', head: true }).eq('user_id', target.user_id);
    const { count: logCount } = await supabase.from('financial_event_log').select('*', { count: 'exact', head: true }).eq('user_id', target.user_id);

    console.log(`📊 Data Status:`);
    console.log(`   - Ledger Entries: ${ledgerCount}`);
    console.log(`   - Event Logs: ${logCount}`);

    if (ledgerCount === 0) {
        console.warn("⚠️ Ledger is EMPTY. Sync failed or didn't run.");
    } else {
        console.log("✅ Ledger has data.");
    }
}

diagnose().catch(console.error);
