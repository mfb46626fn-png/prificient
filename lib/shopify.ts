import '@shopify/shopify-api/adapters/web-api'
import { shopifyApi, ApiVersion } from '@shopify/shopify-api'

if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET || !process.env.HOST) {
    console.warn('Shopify Env Vars Missing - Using dummy values for build. App will fail at runtime if not fixed.')
}

const apiKey = process.env.SHOPIFY_API_KEY || 'dummy_key'
const apiSecretKey = process.env.SHOPIFY_API_SECRET || 'dummy_secret'
const hostVal = process.env.HOST || 'http://localhost:3000'

// Parse HOST to get scheme and hostname dynamically
const url = new URL(hostVal)
const hostName = url.host // e.g., "localhost:3000" or "ngrok-id.ngrok.io"
const hostScheme = url.protocol.replace(':', '') as 'http' | 'https' // "http" or "https"

const shopify = shopifyApi({
    apiKey,
    apiSecretKey,
    scopes: ['read_products', 'read_orders', 'read_analytics'],
    hostName,
    hostScheme, // Explicitly set scheme based on HOST variable
    apiVersion: ApiVersion.October24,
    isEmbeddedApp: false,
})

export default shopify
