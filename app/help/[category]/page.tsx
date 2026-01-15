'use client'

import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { HELP_CATEGORIES } from '../../lib/help-content'
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'

export default function CategoryPage() {
  const params = useParams()
  // URL'den kategori ID'sini alıp eşleşen veriyi buluyoruz
  const category = HELP_CATEGORIES.find(c => c.id === params.category)

  if (!category) return notFound()

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <LandingHeader />

      <main className="py-24 lg:py-32">
        <div className="container mx-auto px-6 max-w-3xl">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8">
                <Link href="/help" className="hover:text-black">Yardım Merkezi</Link>
                <ChevronRight size={12}/>
                <span className="text-black">{category.title}</span>
            </div>

            <div className="mb-12">
                <Link href="/help" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-6 transition-colors">
                    <ArrowLeft size={16}/> Geri Dön
                </Link>
                <h1 className="text-4xl font-black mb-4">{category.title}</h1>
                <p className="text-lg text-gray-600 font-medium">{category.description}</p>
            </div>

            <div className="space-y-4">
                {category.articles.map((article) => (
                    <Link 
                        key={article.slug} 
                        href={`/help/${category.id}/${article.slug}`}
                        className="group flex items-center justify-between p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 bg-white transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText size={20}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{article.title}</h3>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors"/>
                    </Link>
                ))}
            </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  )
}