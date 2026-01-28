/**
 * Shopify Product Cost Updater
 * Updates all product variants with a random cost (30-60% of price)
 */

const SHOPIFY_STORE = 'mdydh23nd.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || 'your_token_here';
const API_VERSION = '2024-01';

const BASE_URL = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}`;

const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
};

async function shopifyRequest(endpoint: string, method: string, body?: any) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw { status: response.status, message: errorText };
    }

    return response.json();
}

async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateCosts() {
    console.log('📦 Fetching all products...');
    const result = await shopifyRequest('/products.json?limit=250', 'GET');
    const products = result.products;
    console.log(`   Found ${products.length} products to update.`);

    let updatedCount = 0;

    for (const product of products) {
        console.log(`🔹 Updating: ${product.title}`);

        for (const variant of product.variants) {
            const price = parseFloat(variant.price);
            // Cost is randomly between 30% and 60% of price
            const margin = 0.3 + (Math.random() * 0.3);
            const cost = (price * (1 - margin)).toFixed(2);

            try {
                // Update variant inventory_item (Cost is stored in inventory item usually in newer APIs, but usually accessible via variant too)
                // Actually cost is on InventoryItem resource for newer APIs but variant.inventory_item_id is needed.
                // Or simply updating variant endpoint might accept 'cost' if deprecated field still works, 
                // BUT correct way is InventoryItem endpoint.

                const inventoryItemId = variant.inventory_item_id;

                await shopifyRequest(`/inventory_items/${inventoryItemId}.json`, 'PUT', {
                    inventory_item: {
                        id: inventoryItemId,
                        cost: cost
                    }
                });

                console.log(`   ✅ Variant ${variant.title}: Price $${price} -> Cost $${cost}`);
                await delay(500); // Rate limit buffer

            } catch (error: any) {
                console.error(`   ❌ Failed to update variant ${variant.id}:`, error.message);
                if (error.status === 429) {
                    console.log('   ⏳ Waiting 10s...');
                    await delay(10000);
                }
            }
        }
        updatedCount++;
    }

    console.log(`\n🎉 Updated ${updatedCount} products.\n`);
}

updateCosts();
export { };
