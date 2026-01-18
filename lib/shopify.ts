import '@shopify/shopify-api/adapters/web-api'
import { shopifyApi, ApiVersion } from '@shopify/shopify-api'

if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET || !process.env.HOST) {
    throw new Error('Shopify Environment Variables Missing (SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST)')
}

// Parse HOST to get scheme and hostname dynamically
const url = new URL(process.env.HOST)
const hostName = url.host // e.g., "localhost:3000" or "ngrok-id.ngrok.io"
const hostScheme = url.protocol.replace(':', '') as 'http' | 'https' // "http" or "https"

const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: ['read_products', 'read_orders', 'read_analytics'],
    hostName,
    hostScheme, // Explicitly set scheme based on HOST variable
    apiVersion: ApiVersion.October24,
    isEmbeddedApp: false,
})

export default shopify
