'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import ToolsUserMenu from '@/components/tools/ToolsUserMenu'
import LanguageSwitcher from '@/components/marketing/LanguageSwitcher'

export default function ToolsHeader() {
    const { scrollY } = useScroll()
    const [scrolled, setScrolled] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) setScrolled(true)
        else setScrolled(false)
    })

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled
                ? 'border-white/5 bg-[#050505]/80 backdrop-blur-xl h-16'
                : 'border-transparent bg-transparent h-20'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <a href="https://tools.prificient.com" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                        <Image
                            src="/toolslogo.png"
                            alt="Prificient Araçlar"
                            width={28}
                            height={28}
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Prificient <span className="text-neutral-500">Tools</span>
                    </span>
                </a>

                {/* Right Side - User Menu */}
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ToolsUserMenu />
                </div>
            </div>
        </header>
    )
}
