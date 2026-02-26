'use client'

import { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import { privacyPolicy } from '@/content/legal/privacy-policy'
import { termsOfService } from '@/content/legal/terms-of-service'
import { cookiePolicy } from '@/content/legal/cookie-policy'
import ReactMarkdown from 'react-markdown'

type LegalType = 'privacy' | 'terms' | 'cookie'

interface LegalSheetProps {
    type: LegalType
    triggerText: string
    triggerClassName?: string
}

export function LegalSheet({ type, triggerText, triggerClassName }: LegalSheetProps) {
    const [open, setOpen] = useState(false)

    const getContent = () => {
        switch (type) {
            case 'privacy': return privacyPolicy
            case 'terms': return termsOfService
            case 'cookie': return cookiePolicy
            default: return ''
        }
    }

    const getTitle = () => {
        switch (type) {
            case 'privacy': return 'Gizlilik Politikası'
            case 'terms': return 'Kullanım Şartları'
            case 'cookie': return 'Çerez Politikası'
            default: return 'Yasal Metin'
        }
    }

    // prevent default navigation
    const handleTriggerClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setOpen(true)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    onClick={handleTriggerClick}
                    className={triggerClassName || "text-neutral-500 hover:text-white transition-colors cursor-pointer"}
                >
                    {triggerText}
                </button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="dark w-full sm:max-w-xl md:max-w-2xl bg-[#050505] border-l border-white/10 p-0 flex flex-col h-full"
            >
                <div className="p-6 border-b border-white/10 shrink-0 bg-[#0A0A0A]">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-white tracking-tight">{getTitle()}</SheetTitle>
                        <SheetDescription className="text-neutral-400">
                            Prificient yasal aydınlatma metni.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="text-base text-neutral-300
                                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-6
                                  [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3
                                  [&_p]:text-neutral-400 [&_p]:leading-relaxed [&_p]:mb-5
                                  [&_ul]:text-neutral-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-5 [&_li]:mb-2 [&_li]:leading-relaxed
                                  [&_strong]:text-white [&_strong]:font-semibold
                                  [&_a]:text-white [&_a]:underline hover:[&_a]:text-neutral-300">
                        <ReactMarkdown>{getContent()}</ReactMarkdown>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
