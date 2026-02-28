import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { getHelpCategories, getHelpArticle, getHelpArticles, extractHeadings } from '@/lib/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
    const categories = getHelpCategories()
    const params: { category: string; slug: string }[] = []

    for (const cat of categories) {
        for (const article of cat.articles) {
            params.push({ category: cat.id, slug: article.slug })
        }
    }

    return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, slug } = await params
    const article = getHelpArticle(category, slug)
    const categories = getHelpCategories()
    const cat = categories.find(c => c.id === category)

    if (!article) {
        return { title: 'Makale Bulunamadı' }
    }

    return {
        title: `${article.frontmatter.title} | ${cat?.title || 'Yardım'} | Prificient`,
        description: article.frontmatter.description,
    }
}

// JSON-LD TechArticle Schema
function TechArticleSchema({ article, category, slug }: {
    article: NonNullable<ReturnType<typeof getHelpArticle>>,
    category: string,
    slug: string
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: article.frontmatter.title,
        description: article.frontmatter.description,
        dateModified: article.frontmatter.lastUpdated,
        publisher: {
            '@type': 'Organization',
            name: 'Prificient',
            url: 'https://prificient.com',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://prificient.com/help/${category}/${slug}`,
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export default async function HelpArticlePage({ params }: Props) {
    const { category, slug } = await params
    const article = getHelpArticle(category, slug)
    const categories = getHelpCategories()
    const cat = categories.find(c => c.id === category)
    const articles = getHelpArticles(category)

    if (!article || !cat) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <TechArticleSchema article={article} category={category} slug={slug} />
            <LandingHeader />

            <main className="py-16 lg:py-24">
                <div className="container mx-auto px-6">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href="/help" className="hover:text-gray-900 transition-colors">
                            Yardım Merkezi
                        </Link>
                        <ChevronRight size={14} />
                        <Link href={`/help/${category}`} className="hover:text-gray-900 transition-colors">
                            {cat.title}
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-gray-900 font-medium">{article.frontmatter.title}</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* Sidebar - Table of Contents */}
                        <aside className="lg:w-64 shrink-0">
                            <div className="lg:sticky lg:top-24">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Bu Kategoride</h3>
                                <nav className="space-y-2">
                                    {articles.map((art) => (
                                        <Link
                                            key={art.slug}
                                            href={`/help/${category}/${art.slug}`}
                                            className={`block text-sm font-medium py-2 px-3 rounded-lg transition-colors ${art.slug === slug
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {art.frontmatter.title}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Content */}
                        <article className="flex-1 max-w-3xl">

                            {/* Header */}
                            <header className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-black mb-4">
                                    {article.frontmatter.title}
                                </h1>
                                <p className="text-gray-500 font-medium mb-4">
                                    {article.frontmatter.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Calendar size={14} />
                                    Son güncelleme: {article.frontmatter.lastUpdated}
                                </div>
                            </header>

                            {/* Article Content */}
                            <div className="prose prose-lg prose-headings:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-6 prose-p:leading-relaxed prose-a:text-blue-600 prose-ul:my-4 prose-li:my-1 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:not-italic max-w-none">
                                <MDXRemote source={article.content} />
                            </div>

                            {/* Helpful? */}
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <p className="text-gray-500 text-sm mb-4">Bu makale yardımcı oldu mu?</p>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 text-sm font-bold bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                        👍 Evet
                                    </button>
                                    <button className="px-4 py-2 text-sm font-bold bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                        👎 Hayır
                                    </button>
                                </div>
                            </div>

                        </article>

                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}