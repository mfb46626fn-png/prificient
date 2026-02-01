import { Metadata } from 'next'
import ProductAnalysisClient from './ProductAnalysisClient'

export const metadata: Metadata = {
    title: 'Ürün Analizi | Prificient',
    description: 'Ürünlerinizin gerçek kârlılığını görün. Kârlı ve Zombi ürünleri ayırt edin.'
}

export default function ProductAnalysisPage() {
    return <ProductAnalysisClient />
}
