import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getToolBySlug, getAllSlugs } from '@/lib/tools/registry'
import CalculatorEngine from '@/components/tools/CalculatorEngine'

interface PageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const tool = getToolBySlug(slug)
    if (!tool) return {}

    // Platform-aware SEO title
    const platformNames: Record<string, string> = {
        amazon: 'Amazon',
        trendyol: 'Trendyol',
        hepsiburada: 'Hepsiburada',
        etsy: 'Etsy',
        shopify: 'Shopify',
    }
    const specificPlatforms = tool.platforms.filter((p) => p !== 'global')
    const platformSuffix = specificPlatforms.length > 0
        ? ` | ${specificPlatforms.map((p) => platformNames[p] || p).join(' & ')}`
        : ''

    return {
        title: `${tool.title}${platformSuffix} | Prificient`,
        description: tool.description,
        openGraph: {
            title: `${tool.title} — Ücretsiz E-Ticaret Hesaplama`,
            description: tool.description,
            type: 'website',
        },
    }
}

export default async function ToolPage({ params }: PageProps) {
    const { slug } = await params
    // Validate slug exists — only pass the slug string to client, not the config
    // (ToolConfig contains functions which can't be serialized to client components)
    const tool = getToolBySlug(slug)
    if (!tool) notFound()
    return <CalculatorEngine slug={slug} />
}
