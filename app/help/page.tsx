'use client'

import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { Search, Rocket, FileText, CreditCard, Shield, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { HELP_CATEGORIES } from '../lib/help-content'
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react'

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Basit Arama Motoru
  const filteredArticles = searchTerm 
    ? HELP_CATEGORIES.flatMap((cat: { articles: any[]; id: any; title: any }) => 
        cat.articles
          .filter(art => art.title.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(art => ({ ...art, categoryId: cat.id, categoryTitle: cat.title }))
      )
    : []

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'rocket': return <Rocket size={24}/>
      case 'file': return <FileText size={24}/>
      case 'credit-card': return <CreditCard size={24}/>
      case 'shield': return <Shield size={24}/>
      default: return <BookOpen size={24}/>
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <LandingHeader />

      <main>
        {/* HERO & SEARCH */}
        <section className="bg-gray-50 pt-24 pb-20 border-b border-gray-100">
            <div className="container mx-auto px-6 text-center max-w-2xl">
                <h1 className="text-3xl font-black mb-6">Nasıl yardımcı olabiliriz?</h1>
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Bir konu arayın (örn: Excel, Şifre, İade)" 
                        className="w-full pl-14 pr-6 py-5 rounded-2xl border border-gray-200 shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all font-medium text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    {/* ARAMA SONUÇLARI DROPDOWN */}
                    {searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left">
                            {filteredArticles.length > 0 ? (
                                filteredArticles.map((result: { categoryId: any; slug: any; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; categoryTitle: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }, idx: Key | null | undefined) => (
                                    <Link 
                                        key={idx} 
                                        href={`/help/${result.categoryId}/${result.slug}`}
                                        className="block px-6 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                                    >
                                        <div className="text-sm font-bold text-gray-900">{result.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{result.categoryTitle}</div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500 font-medium">Sonuç bulunamadı.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* KATEGORİLER */}
        <section className="py-20">
            <div className="container mx-auto px-6 max-w-5xl">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Kategorilere Göz Atın</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HELP_CATEGORIES.map((cat: { id: Key | null | undefined; icon: string; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; articles: string | any[] }) => (
                        <Link 
                            key={cat.id} 
                            href={`/help/${cat.id}`}
                            className="group p-6 rounded-[2rem] border border-gray-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                {getIcon(cat.icon)}
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                                {cat.title}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                                {cat.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                                {cat.articles.length} Makale <ArrowRight size={14}/>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

        {/* FOOTER CTA */}
        <section className="py-16 bg-white border-t border-gray-50">
            <div className="container mx-auto px-6 text-center">
                <p className="text-gray-600 font-medium mb-4">Aradığınız cevabı bulamadınız mı?</p>
                <Link href="/contact" className="inline-flex items-center gap-2 text-black font-bold border-b-2 border-black pb-0.5 hover:text-blue-600 hover:border-blue-600 transition-all">
                    Destek Ekibine Yazın
                </Link>
            </div>
        </section>

      </main>
      <LandingFooter />
    </div>
  )
}