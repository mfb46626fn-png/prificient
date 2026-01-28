/**
 * Shopify Dense Historical Data Generator
 * Creates 3-5 orders PER DAY for the last 60 days
 */

const SHOPIFY_STORE = 'mdydh23nd.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || 'your_token_here';
const API_VERSION = '2024-01';

const BASE_URL = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}`;

const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
};

// ============ CONFIG ============
const START_DAY = 10; // Resume from this day
const DAYS_HISTORY = 60; // How many days back to generate
const MIN_ORDERS_PER_DAY = 3;
const MAX_ORDERS_PER_DAY = 5;
const DELAY_MS = 1500; // Delay between orders to respect rate limits

// ============ HELPERS ============
async function shopifyRequest(endpoint: string, method: string, body?: any) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        // Return error status for handling
        throw { status: response.status, message: errorText };
    }

    return response.json();
}

async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============ FETCH EXISTING DATA ============
async function fetchProducts(): Promise<any[]> {
    console.log('📦 Fetching existing products...');
    const result = await shopifyRequest('/products.json?limit=50', 'GET');
    console.log(`   Found ${result.products.length} products`);
    return result.products;
}

async function fetchCustomers(): Promise<any[]> {
    console.log('👥 Fetching existing customers...');
    const result = await shopifyRequest('/customers.json?limit=50', 'GET');
    console.log(`   Found ${result.customers.length} customers`);
    return result.customers;
}

// ============ CREATE ORDERS ============
async function createHistoricalOrders(products: any[], customers: any[]) {
    console.log(`\n🛒 Generating orders for last ${DAYS_HISTORY} days (${MIN_ORDERS_PER_DAY}-${MAX_ORDERS_PER_DAY} per day)...\n`);

    let totalCreated = 0;

    // Iterate backwards from yesterday
    const today = new Date();

    for (let d = START_DAY; d <= DAYS_HISTORY; d++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - d);

        // Random number of orders for this day
        const dailyOrderCount = Math.floor(Math.random() * (MAX_ORDERS_PER_DAY - MIN_ORDERS_PER_DAY + 1)) + MIN_ORDERS_PER_DAY;

        console.log(`📅 [Day ${d}/${DAYS_HISTORY}] ${targetDate.toLocaleDateString('tr-TR')} -> Creating ${dailyOrderCount} orders...`);

        for (let i = 0; i < dailyOrderCount; i++) {
            try {
                // Random hour (9 AM - 11 PM)
                targetDate.setHours(Math.floor(Math.random() * 14) + 9);
                targetDate.setMinutes(Math.floor(Math.random() * 60));

                // Random customer & product
                const customer = customers[Math.floor(Math.random() * customers.length)];

                // 1-3 Line Items
                const itemCount = Math.floor(Math.random() * 3) + 1;
                const lineItems = [];

                for (let k = 0; k < itemCount; k++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    const variant = product.variants[0];
                    lineItems.push({
                        variant_id: variant.id,
                        quantity: Math.floor(Math.random() * 2) + 1,
                        price: variant.price
                    });
                }

                const order = {
                    customer: { id: customer.id },
                    line_items: lineItems,
                    financial_status: 'paid',
                    fulfillment_status: 'fulfilled', // Historical orders are fulfilled
                    created_at: targetDate.toISOString(),
                    processed_at: targetDate.toISOString(),
                    shipping_address: {
                        first_name: customer.first_name,
                        last_name: customer.last_name,
                        address1: '123 Fake St',
                        city: 'Istanbul',
                        country: 'TR'
                    }
                };

                await shopifyRequest('/orders.json', 'POST', { order });
                totalCreated++;
                process.stdout.write('.'); // Progress dot

                await delay(DELAY_MS);

            } catch (error: any) {
                if (error.status === 429) {
                    console.log('\n⏳ Rate Limit! Waiting 20s...');
                    await delay(20000);
                    i--; // Retry
                } else {
                    console.error('❌ Error:', error.message);
                }
            }
        }
        console.log(''); // New line
    }

    console.log(`\n✅ Finished! Total orders created: ${totalCreated}\n`);
}

// ============ MAIN ============
async function main() {
    try {
        const products = await fetchProducts();
        const customers = await fetchCustomers();

        if (products.length === 0 || customers.length === 0) {
            console.error('❌ Need products and customers first!');
            return;
        }

        await createHistoricalOrders(products, customers);

    } catch (e) {
        console.error('Fatal:', e);
    }
}

main();
