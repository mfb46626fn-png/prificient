'use client'

import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { BLOG_POSTS } from '../../lib/blog-content'
import { ArrowLeft, Calendar, Clock, Share2, Linkedin, Twitter, Facebook } from 'lucide-react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'

export default function BlogPostPage() {
  const params = useParams()
  
  const post = BLOG_POSTS.find(p => p.slug === params.slug)

  if (!post) return notFound()

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <LandingHeader />

      <main>
        {/* HEADER SECTION (YENİLENDİ: Clean & Soft Glow) */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
            
            {/* Arkaplan Glow Efekti (Çok hafif) */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b ${post.gradientFrom} to-transparent opacity-10 blur-[100px] -z-10`}></div>

            <div className="container mx-auto px-6 max-w-3xl relative z-10 text-center">
                
                {/* Geri Dön & Kategori */}
                <div className="flex justify-center items-center gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Link href="/blog" className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover:border-gray-300">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Blog'a Dön
                    </Link>
                    <span className={`px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${post.accentColor}`}>
                        {post.category}
                    </span>
                </div>
                
                {/* Başlık */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tight text-gray-900 leading-[1.1] text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    {post.title}
                </h1>

                {/* Yazar & Meta */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-600 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                            {post.author[0]}
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-black leading-none">{post.author}</p>
                            <p className="text-[10px] text-gray-400 leading-none mt-1">{post.role}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar size={16}/> {post.date}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><Clock size={16}/> {post.readTime}</span>
                    </div>
                </div>
            </div>
        </section>

        {/* İÇERİK ALANI */}
        <section className="container mx-auto px-6 max-w-3xl pb-24">
            <article className="prose prose-lg prose-gray max-w-none 
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 
                prose-p:text-gray-600 prose-p:font-medium prose-p:leading-relaxed 
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline 
                prose-li:text-gray-600 prose-li:font-medium
                prose-strong:font-black prose-strong:text-gray-900
                prose-lead:text-xl prose-lead:text-gray-800 prose-lead:font-medium prose-lead:leading-relaxed
                prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:border prose-img:border-gray-100
                first-letter:text-5xl first-letter:font-black first-letter:text-black first-letter:mr-3 first-letter:float-left">
                
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            
            </article>

            {/* SHARE FOOTER */}
            <div className="mt-16 pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="font-bold text-gray-900">Bu yazıyı paylaş:</p>
                <div className="flex gap-3">
                    <button className="p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Twitter size={20}/></button>
                    <button className="p-3 rounded-full bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"><Linkedin size={20}/></button>
                    <button className="p-3 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"><Facebook size={20}/></button>
                    <button className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"><Share2 size={20}/></button>
                </div>
            </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}