import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { getPostBySlug, getPostSlugs, extractHeadings } from '@/lib/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    const slugs = getPostSlugs('blog')
    return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = getPostBySlug(slug)

    if (!post) {
        return { title: 'Yazı Bulunamadı' }
    }

    return {
        title: `${post.frontmatter.title} | Prificient Blog`,
        description: post.frontmatter.excerpt,
        authors: [{ name: post.frontmatter.author }],
        openGraph: {
            title: post.frontmatter.title,
            description: post.frontmatter.excerpt,
            type: 'article',
            publishedTime: post.frontmatter.date,
            authors: [post.frontmatter.author],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.frontmatter.title,
            description: post.frontmatter.excerpt,
        }
    }
}

// JSON-LD Article Schema
function ArticleSchema({ post, slug }: { post: NonNullable<ReturnType<typeof getPostBySlug>>, slug: string }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.frontmatter.title,
        description: post.frontmatter.excerpt,
        author: {
            '@type': 'Person',
            name: post.frontmatter.author,
        },
        datePublished: post.frontmatter.date,
        publisher: {
            '@type': 'Organization',
            name: 'Prificient',
            url: 'https://prificient.com',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://prificient.com/blog/${slug}`,
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const post = getPostBySlug(slug)

    if (!post) {
        notFound()
    }

    const headings = extractHeadings(post.content)

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <ArticleSchema post={post} slug={slug} />
            <LandingHeader />

            <main className="py-16 lg:py-24">
                <div className="container mx-auto px-6">

                    {/* Back Link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-8"
                    >
                        <ArrowLeft size={16} /> Tüm Yazılar
                    </Link>

                    {/* Article Container */}
                    <article className="max-w-3xl mx-auto">

                        {/* Header */}
                        <header className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-lg">
                                    {post.frontmatter.category}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Clock size={14} /> {post.readingTime}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-tight">
                                {post.frontmatter.title}
                            </h1>

                            <p className="text-xl text-gray-500 font-medium leading-relaxed mb-8">
                                {post.frontmatter.excerpt}
                            </p>

                            {/* Author & Date */}
                            <div className="flex items-center justify-between py-6 border-y border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                        {post.frontmatter.author?.[0] || 'P'}
                                    </div>
                                    <div>
                                        <p className="font-bold">{post.frontmatter.author}</p>
                                        <p className="text-sm text-gray-500">{post.frontmatter.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar size={16} />
                                    {post.frontmatter.date}
                                </div>
                            </div>
                        </header>

                        {/* Table of Contents (for longer articles) */}
                        {headings.length > 3 && (
                            <nav className="mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">İçindekiler</h2>
                                <ul className="space-y-2">
                                    {headings.filter(h => h.level === 2).map((heading, idx) => (
                                        <li key={idx}>
                                            <a
                                                href={`#${heading.id}`}
                                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                            >
                                                {heading.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg prose-headings:font-black prose-h2:mt-12 prose-h2:mb-6 prose-h3:mt-8 prose-p:leading-relaxed prose-a:text-blue-600 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:not-italic prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-table:text-sm max-w-none">
                            <MDXRemote source={post.content} />
                        </div>

                        {/* Footer CTA */}
                        <div className="mt-16 p-8 bg-gray-900 rounded-[2rem] text-center">
                            <h3 className="text-2xl font-black text-white mb-3">
                                Net Kârınızı Görün
                            </h3>
                            <p className="text-gray-400 mb-6">
                                ROAS yanılsamasından kurtulun. Gerçek kârlılığınızı keşfedin.
                            </p>
                            <Link
                                href="/signup"
                                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                            >
                                Ücretsiz Başla
                            </Link>
                        </div>

                    </article>

                </div>
            </main>

            <LandingFooter />
        </div>
    )
}