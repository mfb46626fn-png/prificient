import { MetadataRoute } from 'next'
import { getPostSlugs, getHelpCategories } from '@/lib/mdx'

const BASE_URL = 'https://prificient.com'

export default function sitemap(): MetadataRoute.Sitemap {
    // Statik sayfalar
    const staticPages = [
        '',
        '/about',
        '/contact',
        '/blog',
        '/help',
        '/login',
        '/signup',
        '/legal/privacy',
        '/legal/terms',
        '/legal/kvkk',
        '/legal/cookie',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Blog yazıları
    const blogSlugs = getPostSlugs('blog')
    const blogPages = blogSlugs.map((slug) => ({
        url: `${BASE_URL}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Help makaleleri
    const helpCategories = getHelpCategories()
    const helpPages: MetadataRoute.Sitemap = []

    // Kategori sayfaları
    for (const cat of helpCategories) {
        helpPages.push({
            url: `${BASE_URL}/help/${cat.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        })

        // Makale sayfaları
        for (const article of cat.articles) {
            helpPages.push({
                url: `${BASE_URL}/help/${cat.id}/${article.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            })
        }
    }

    return [...staticPages, ...blogPages, ...helpPages]
}
