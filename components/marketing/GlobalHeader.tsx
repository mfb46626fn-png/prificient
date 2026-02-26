'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

export default function GlobalHeader() {
    const { scrollY } = useScroll()
    const [scrolled, setScrolled] = useState(false)

    const pathname = usePathname()
    const router = useRouter()

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) setScrolled(true)
        else setScrolled(false)
    })

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        if (pathname === '/marketing-home') {
            e.preventDefault()
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const scrollToBeta = (e: React.MouseEvent) => {
        e.preventDefault()
        if (pathname === '/marketing-home') {
            document.getElementById('beta-application-form')?.scrollIntoView({ behavior: 'smooth' })
        } else {
            router.push('/marketing-home#beta-application-form')
        }
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled
                ? 'border-white/5 bg-[#050505]/80 backdrop-blur-xl h-16'
                : 'border-transparent bg-transparent h-20'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/marketing-home" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                        <Image
                            src="/logo.png"
                            alt="Prificient"
                            width={28}
                            height={28}
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Prificient
                    </span>
                </Link>

                {/* Middle Links (Hidden on small screens) */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/marketing-home#vision" onClick={(e) => handleNavClick(e, 'vision')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">Vizyonumuz</Link>
                    <Link href="/marketing-home#illusion" onClick={(e) => handleNavClick(e, 'illusion')} className="text-sm font-medium text-white/60 hover:text-white transition-colors">Neler Çözüyoruz?</Link>
                    <a href="https://tools.prificient.com" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Ücretsiz Araçlar</a>
                </nav>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={scrollToBeta}
                        className="text-sm font-bold text-black bg-white hover:bg-gray-200 px-5 py-2.5 rounded-full transition-all"
                    >
                        Kapalı Beta Başvurusu
                    </button>
                </div>
            </div>
        </header>
    )
}
