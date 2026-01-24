'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

// Since we are missing @radix-ui/react-tooltip, we implement a simple custom version.

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false)

    // Clone children to pass props if needed, but Context is better.
    // For simplicity in this drop-in replacement without context:
    // We expect children to be Trigger and Content.
    // We'll use a simple CSS-based or State-based approach wrapping them.

    // Actually, to mimic the Radix API structure (Provider -> Root -> Trigger/Content) without complex Context:
    // We can just rely on the fact that standard use case is <Tooltip><Trigger>...</Trigger><Content>...</Content></Tooltip>
    // We will need to implement a Context to share state between Trigger and Content.

    return (
        <TooltipContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block group">
                {children}
            </div>
        </TooltipContext.Provider>
    )
}

const TooltipContext = React.createContext<{
    open: boolean;
    setOpen: (v: boolean) => void;
}>({ open: false, setOpen: () => { } });


export const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    const { setOpen } = React.useContext(TooltipContext)

    return (
        <span
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="inline-block" // Wrapper to capture events
        >
            {children}
        </span>
    )
}

export const TooltipContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const { open } = React.useContext(TooltipContext)

    if (!open) return null

    return (
        <div className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 overflow-hidden rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs text-gray-50 shadow-md animate-in fade-in-0 zoom-in-95",
            className
        )}>
            {children}
        </div>
    )
}
