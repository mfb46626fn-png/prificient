'use client'

import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { BLOG_POSTS } from '../lib/blog-content'
import { ArrowRight, Calendar, User, Clock } from 'lucide-react'
import Link from 'next/link'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <LandingHeader />

      <main className="py-24 lg:py-32">
        <div className="container mx-auto px-6">
            
            {/* HERO */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                    Prificient Blog
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Finansal Okuryazarlık & Strateji</h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed">
                    E-ticaret finansını yönetmek, kârlılığı artırmak ve vergi süreçlerini anlamak için rehberler.
                </p>
            </div>

            {/* BLOG GRID */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {BLOG_POSTS.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 h-full">
                        
                        {/* Görsel Alanı (Gradient) */}
                        <div className={`h-56 bg-gradient-to-br ${post.imageGradient} relative overflow-hidden p-6 flex flex-col justify-end`}>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg mb-2 border border-white/20">
                                    {post.category}
                                </span>
                                <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">
                                    {post.title}
                                </h2>
                            </div>
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4 border-b border-gray-50 pb-4">
                                <span className="flex items-center gap-1.5"><Calendar size={14}/> {post.date}</span>
                                <span className="flex items-center gap-1.5"><Clock size={14}/> {post.readTime}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6 flex-1 line-clamp-3">
                                {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                                        {post.author[0]}
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-bold text-gray-900">{post.author}</p>
                                        <p className="text-gray-400">{post.role}</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
                                    Oku <ArrowRight size={16}/>
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
      </main>

      <LandingFooter />
    </div>
  )
}