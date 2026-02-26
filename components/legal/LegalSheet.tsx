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
                        <SheetDescription className="text-neutral-500">
                            Prificient yasal aydınlatma metni.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="prose prose-invert prose-neutral max-w-none 
                                  prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-6 prose-h1:text-white
                                  prose-h3:text-lg prose-h3:font-semibold prose-h3:text-white prose-h3:mt-8 prose-h3:mb-3
                                  prose-p:text-neutral-400 prose-p:leading-relaxed prose-p:mb-5
                                  prose-ul:text-neutral-400 prose-li:mb-2 prose-li:leading-relaxed
                                  prose-strong:text-white prose-strong:font-semibold
                                  prose-a:text-white hover:prose-a:text-neutral-300">
                        <ReactMarkdown>{getContent()}</ReactMarkdown>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
