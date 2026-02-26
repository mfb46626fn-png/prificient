'use client'

import Image from 'next/image'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

export default function GlobalHeader() {
    const { scrollY } = useScroll()
    const [scrolled, setScrolled] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) setScrolled(true)
        else setScrolled(false)
    })

    const scrollToBeta = (e: React.MouseEvent) => {
        e.preventDefault()
        document.getElementById('beta-application-form')?.scrollIntoView({ behavior: 'smooth' })
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
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                            src="/logo.png"
                            alt="Prificient"
                            width={28}
                            height={28}
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white flex gap-2 items-center">
                        WeCahan
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-white/50 text-sm font-medium">Prificient</span>
                    </span>
                </div>

                {/* Middle Links (Hidden on small screens) */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#vision" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Vizyonumuz</a>
                    <a href="#illusion" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Neler Çözüyoruz?</a>
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
