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
    return {
        title: `${tool.title} | Prificient Araçlar`,
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
    const tool = getToolBySlug(slug)
    if (!tool) notFound()
    return <CalculatorEngine config={tool} />
}
