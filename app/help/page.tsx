import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { getHelpCategories } from '@/lib/mdx'
import { Rocket, FileText, CreditCard, Shield, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import HelpSearchClient from './HelpSearchClient'

export const metadata: Metadata = {
    title: 'Yardım Merkezi | Prificient',
    description: 'Prificient kullanım rehberleri, sık sorulan sorular ve teknik dokümanlar.',
    openGraph: {
        title: 'Yardım Merkezi | Prificient',
        description: 'Hesap kurulumu, veri yönetimi ve entegrasyonlar hakkında her şey.',
    }
}

// Icon mapper
const iconMap: Record<string, React.ReactNode> = {
    'rocket': <Rocket size={24} />,
    'file': <FileText size={24} />,
    'credit-card': <CreditCard size={24} />,
    'shield': <Shield size={24} />,
    'book': <BookOpen size={24} />,
}

export default function HelpCenterPage() {
    const categories = getHelpCategories()

    // Flatten articles for search
    const allArticles = categories.flatMap(cat =>
        cat.articles.map(art => ({
            ...art,
            categoryId: cat.id,
            categoryTitle: cat.title
        }))
    )

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <LandingHeader />

            <main>
                {/* HERO & SEARCH */}
                <section className="bg-gray-50 pt-24 pb-20 border-b border-gray-100">
                    <div className="container mx-auto px-6 text-center max-w-2xl">
                        <h1 className="text-3xl font-black mb-6">Nasıl yardımcı olabiliriz?</h1>
                        <HelpSearchClient articles={allArticles} />
                    </div>
                </section>

                {/* KATEGORİLER */}
                <section className="py-20">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Kategorilere Göz Atın</h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/help/${cat.id}`}
                                    className="group p-6 rounded-[2rem] border border-gray-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                        {iconMap[cat.icon] || <BookOpen size={24} />}
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {cat.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                                        {cat.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                                        {cat.articles.length} Makale <ArrowRight size={14} />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {categories.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-gray-500">Henüz yardım makalesi yok.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* FOOTER CTA */}
                <section className="py-16 bg-white border-t border-gray-50">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-gray-600 font-medium mb-4">Aradığınız cevabı bulamadınız mı?</p>
                        <Link href="/support" className="inline-flex items-center gap-2 text-black font-bold border-b-2 border-black pb-0.5 hover:text-blue-600 hover:border-blue-600 transition-all">
                            Destek Ekibine Yazın
                        </Link>
                    </div>
                </section>

            </main>
            <LandingFooter />
        </div>
    )
}