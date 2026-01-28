import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { getHelpCategories, getHelpArticles } from '@/lib/mdx'
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface Props {
    params: Promise<{ category: string }>
}

export async function generateStaticParams() {
    const categories = getHelpCategories()
    return categories.map((cat) => ({ category: cat.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params
    const categories = getHelpCategories()
    const cat = categories.find(c => c.id === category)

    if (!cat) {
        return { title: 'Kategori Bulunamadı' }
    }

    return {
        title: `${cat.title} | Yardım Merkezi | Prificient`,
        description: cat.description,
    }
}

export default async function HelpCategoryPage({ params }: Props) {
    const { category } = await params
    const categories = getHelpCategories()
    const cat = categories.find(c => c.id === category)

    if (!cat) {
        notFound()
    }

    const articles = getHelpArticles(category)

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <LandingHeader />

            <main className="py-16 lg:py-24">
                <div className="container mx-auto px-6 max-w-4xl">

                    {/* Back Link */}
                    <Link
                        href="/help"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-8"
                    >
                        <ArrowLeft size={16} /> Tüm Kategoriler
                    </Link>

                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-3xl font-black mb-4">{cat.title}</h1>
                        <p className="text-gray-500 font-medium">{cat.description}</p>
                    </div>

                    {/* Article List */}
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/help/${category}/${article.slug}`}
                                className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {article.frontmatter.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                            {article.frontmatter.description}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                            </Link>
                        ))}
                    </div>

                    {articles.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-gray-500">Bu kategoride henüz makale yok.</p>
                        </div>
                    )}

                </div>
            </main>

            <LandingFooter />
        </div>
    )
}