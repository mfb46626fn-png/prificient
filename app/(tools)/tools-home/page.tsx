import type { Metadata } from 'next'
import ToolsHomeClient from '@/components/tools/ToolsHomeClient'

export const metadata: Metadata = {
    title: 'Ücretsiz E-Ticaret Hesaplama Araçları | Prificient',
    description: 'Amazon, Trendyol, Hepsiburada, Etsy ve Shopify satıcıları için ücretsiz ROAS, kâr, komisyon ve kargo hesaplama araçları.',
}

export default function ToolsHomePage() {
    return <ToolsHomeClient />
}
