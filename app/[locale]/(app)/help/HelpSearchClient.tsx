'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface Article {
    slug: string
    category: string
    categoryId: string
    categoryTitle: string
    frontmatter: {
        title: string
        description: string
    }
}

interface Props {
    articles: Article[]
}

export default function HelpSearchClient({ articles }: Props) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredArticles = searchTerm
        ? articles.filter(art =>
            art.frontmatter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            art.frontmatter.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : []

    return (
        <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
                type="text"
                placeholder="Bir konu arayın (örn: Shopify, Bağlantı, Dashboard)"
                className="w-full pl-14 pr-6 py-5 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all font-medium text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* ARAMA SONUÇLARI DROPDOWN */}
            {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left">
                    {filteredArticles.length > 0 ? (
                        filteredArticles.slice(0, 5).map((result, idx) => (
                            <Link
                                key={idx}
                                href={`/help/${result.categoryId}/${result.slug}`}
                                className="block px-6 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                            >
                                <div className="text-sm font-bold text-gray-900">{result.frontmatter.title}</div>
                                <div className="text-xs text-gray-500 mt-1">{result.categoryTitle}</div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-6 text-center text-gray-500 font-medium">Sonuç bulunamadı.</div>
                    )}
                </div>
            )}
        </div>
    )
}
