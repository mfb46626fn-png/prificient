import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

// Content dizinleri
const CONTENT_PATH = path.join(process.cwd(), 'content')
const BLOG_PATH = path.join(CONTENT_PATH, 'blog')
const HELP_PATH = path.join(CONTENT_PATH, 'help')

// --- Types ---
export interface PostFrontmatter {
    title: string
    excerpt: string
    date: string
    author: string
    role?: string
    category: string
    image?: string
    gradientFrom?: string
    gradientTo?: string
}

export interface Post {
    slug: string
    frontmatter: PostFrontmatter
    content: string
    readingTime: string
}

export interface HelpArticle {
    slug: string
    category: string
    frontmatter: {
        title: string
        description: string
        lastUpdated: string
        order?: number
    }
    content: string
}

export interface HelpCategory {
    id: string
    title: string
    description: string
    icon: string
    articles: HelpArticle[]
}

// --- Helper Functions ---

/**
 * Belirtilen dizindeki tüm MDX dosya isimlerini döndürür
 */
export function getPostSlugs(type: 'blog' | 'help', category?: string): string[] {
    const basePath = type === 'blog' ? BLOG_PATH : HELP_PATH
    const targetPath = category ? path.join(basePath, category) : basePath

    if (!fs.existsSync(targetPath)) {
        return []
    }

    return fs.readdirSync(targetPath)
        .filter(file => file.endsWith('.mdx') || file.endsWith('.md'))
        .map(file => file.replace(/\.mdx?$/, ''))
}

/**
 * Tek bir blog yazısını slug'a göre okur
 */
export function getPostBySlug(slug: string): Post | null {
    const filePath = path.join(BLOG_PATH, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
        return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    const stats = readingTime(content)

    return {
        slug,
        frontmatter: data as PostFrontmatter,
        content,
        readingTime: `${Math.ceil(stats.minutes)} dk okuma`
    }
}

/**
 * Tüm blog yazılarını tarihe göre sıralı döndürür
 */
export function getAllPosts(): Post[] {
    const slugs = getPostSlugs('blog')

    const posts = slugs
        .map(slug => getPostBySlug(slug))
        .filter((post): post is Post => post !== null)
        .sort((a, b) => {
            // Tarih karşılaştırması (Türkçe tarih formatı)
            const dateA = parseTurkishDate(a.frontmatter.date)
            const dateB = parseTurkishDate(b.frontmatter.date)
            return dateB.getTime() - dateA.getTime()
        })

    return posts
}

/**
 * Help kategorilerini ve makalelerini okur
 */
export function getHelpCategories(): HelpCategory[] {
    if (!fs.existsSync(HELP_PATH)) {
        return []
    }

    const categoryDirs = fs.readdirSync(HELP_PATH, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

    return categoryDirs.map(categoryId => {
        const categoryPath = path.join(HELP_PATH, categoryId)
        const metaPath = path.join(categoryPath, '_meta.json')

        // Kategori meta bilgisi
        let meta = {
            title: categoryId,
            description: '',
            icon: 'book'
        }

        if (fs.existsSync(metaPath)) {
            meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
        }

        // Kategorideki makaleler
        const articles = getHelpArticles(categoryId)

        return {
            id: categoryId,
            title: meta.title,
            description: meta.description,
            icon: meta.icon,
            articles
        }
    })
}

/**
 * Bir kategorideki tüm help makalelerini okur
 */
export function getHelpArticles(category: string): HelpArticle[] {
    const categoryPath = path.join(HELP_PATH, category)

    if (!fs.existsSync(categoryPath)) {
        return []
    }

    const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.mdx') || file.endsWith('.md'))

    return files.map(file => {
        const slug = file.replace(/\.mdx?$/, '')
        const filePath = path.join(categoryPath, file)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContents)

        return {
            slug,
            category,
            frontmatter: {
                title: data.title || slug,
                description: data.description || '',
                lastUpdated: data.lastUpdated || '',
                order: data.order
            },
            content
        }
    }).sort((a, b) => (a.frontmatter.order || 99) - (b.frontmatter.order || 99))
}

/**
 * Tek bir help makalesini okur
 */
export function getHelpArticle(category: string, slug: string): HelpArticle | null {
    const filePath = path.join(HELP_PATH, category, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
        return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
        slug,
        category,
        frontmatter: {
            title: data.title || slug,
            description: data.description || '',
            lastUpdated: data.lastUpdated || ''
        },
        content
    }
}

/**
 * Türkçe tarih formatını Date objesine çevirir
 * "14 Ocak 2026" -> Date
 */
function parseTurkishDate(dateStr: string): Date {
    const months: Record<string, number> = {
        'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3,
        'Mayıs': 4, 'Haziran': 5, 'Temmuz': 6, 'Ağustos': 7,
        'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
    }

    const parts = dateStr.split(' ')
    if (parts.length === 3) {
        const day = parseInt(parts[0])
        const month = months[parts[1]] ?? 0
        const year = parseInt(parts[2])
        return new Date(year, month, day)
    }

    return new Date(dateStr)
}

/**
 * İçerikten başlıkları (h2, h3) çıkarır - TOC için
 */
export function extractHeadings(content: string): { level: number; text: string; id: string }[] {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm
    const headings: { level: number; text: string; id: string }[] = []

    let match
    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length
        const text = match[2]
        const id = text
            .toLowerCase()
            .replace(/[^a-z0-9ğüşıöçİĞÜŞÖÇ\s-]/gi, '')
            .replace(/\s+/g, '-')

        headings.push({ level, text, id })
    }

    return headings
}
