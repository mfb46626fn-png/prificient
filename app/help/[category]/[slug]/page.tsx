'use client'

import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { HELP_CATEGORIES } from '../../../lib/help-content'
import { ArrowLeft, ChevronRight, Clock, ThumbsUp, ThumbsDown } from 'lucide-react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useState } from 'react'

export default function ArticlePage() {
  const params = useParams()
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null)

  const category = HELP_CATEGORIES.find(c => c.id === params.category)
  const article = category?.articles.find(a => a.slug === params.slug)

  if (!category || !article) return notFound()

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <LandingHeader />

      <main className="py-24 lg:py-32">
        <div className="container mx-auto px-6 max-w-3xl">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 overflow-x-auto whitespace-nowrap">
                <Link href="/help" className="hover:text-black">Yardım Merkezi</Link>
                <ChevronRight size={12}/>
                <Link href={`/help/${category.id}`} className="hover:text-black">{category.title}</Link>
                <ChevronRight size={12}/>
                <span className="text-black truncate">{article.title}</span>
            </div>

            <Link href={`/help/${category.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8 transition-colors">
                <ArrowLeft size={16}/> {category.title}
            </Link>

            <article>
                <h1 className="text-3xl md:text-4xl font-black mb-6 leading-tight">{article.title}</h1>
                
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-10 pb-10 border-b border-gray-100">
                    <Clock size={14}/>
                    Son güncelleme: {article.lastUpdated}
                </div>

                {/* İçerik Alanı (HTML Render) */}
                <div 
                    className="prose prose-lg prose-blue max-w-none prose-headings:font-black prose-p:text-gray-600 prose-p:font-medium prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-600"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </article>

            {/* Geri Bildirim */}
            <div className="mt-16 pt-10 border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-1">Bu makale yardımcı oldu mu?</h4>
                        <p className="text-xs text-gray-500 font-medium">Geri bildiriminiz içeriğimizi iyileştirmemize yardımcı olur.</p>
                    </div>
                    
                    {!feedback ? (
                        <div className="flex gap-3">
                            <button onClick={() => setFeedback('yes')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-all">
                                <ThumbsUp size={16}/> Evet
                            </button>
                            <button onClick={() => setFeedback('no')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-rose-500 hover:text-rose-600 transition-all">
                                <ThumbsDown size={16}/> Hayır
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm font-bold text-blue-600 animate-in fade-in">
                            Teşekkürler! Geri bildiriminiz alındı.
                        </div>
                    )}
                </div>
            </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  )
}