'use client'

import { useLocale } from 'next-intl'
import { useTransition } from 'react'

export default function LanguageSwitcher() {
    const locale = useLocale()
    const [isPending, startTransition] = useTransition()

    const switchLocale = () => {
        const nextLocale = locale === 'tr' ? 'en' : 'tr'
        startTransition(() => {
            const currentPath = window.location.pathname
            const search = window.location.search

            let newPath = currentPath;
            if (currentPath.startsWith('/en/') || currentPath === '/en') {
                newPath = currentPath.replace(/^\/en/, '') || '/'
            }
            if (currentPath.startsWith('/tr/') || currentPath === '/tr') {
                newPath = currentPath.replace(/^\/tr/, '') || '/'
            }

            if (nextLocale === 'en') {
                newPath = `/en${newPath === '/' ? '' : newPath}`
            }

            window.location.href = `${newPath}${search}`
        })
    }

    return (
        <button
            onClick={switchLocale}
            disabled={isPending}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest disabled:opacity-50 flex-shrink-0"
            title={locale === 'tr' ? 'Switch to English' : 'Türkçeye Geç'}
        >
            {locale === 'tr' ? 'EN' : 'TR'}
        </button>
    )
}
