'use client'

/**
 * Beta Badge Component
 * 
 * Shows "Beta (Sınırsız)" badge for beta users.
 * Used in header/sidebar to indicate beta status.
 */

import { Sparkles } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface BetaBadgeProps {
    variant?: 'default' | 'compact' | 'pill'
    className?: string
}

export default function BetaBadge({ variant = 'default', className = '' }: BetaBadgeProps) {
    if (variant === 'compact') {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span className={`
              inline-flex items-center justify-center w-5 h-5 
              bg-gradient-to-r from-purple-600 to-blue-600 
              rounded-full text-white text-[10px] font-bold
              ${className}
            `}>
                            β
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 text-white text-xs p-2">
                        <p>Beta Kullanıcısı - Tüm özellikler ücretsiz</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    if (variant === 'pill') {
        return (
            <span className={`
        inline-flex items-center gap-1 px-2 py-0.5
        bg-gradient-to-r from-purple-600 to-blue-600 
        rounded-full text-white text-[10px] font-bold uppercase tracking-wider
        ${className}
      `}>
                <Sparkles size={10} />
                Beta
            </span>
        )
    }

    // Default variant
    return (
        <div className={`
      inline-flex items-center gap-2 px-3 py-1.5
      bg-gradient-to-r from-purple-600 to-blue-600 
      rounded-lg text-white shadow-lg shadow-purple-500/20
      ${className}
    `}>
            <Sparkles size={14} />
            <div>
                <span className="text-xs font-bold">BETA</span>
                <span className="text-[10px] opacity-80 ml-1">(Sınırsız)</span>
            </div>
        </div>
    )
}

/**
 * Demo Badge Component
 * Shows when user is in demo mode with sample data
 */
export function DemoBadge({ className = '' }: { className?: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <span className={`
            inline-flex items-center gap-1 px-2 py-0.5
            bg-amber-100 text-amber-800
            rounded-full text-[10px] font-bold uppercase tracking-wider
            border border-amber-200
            ${className}
          `}>
                        Demo
                    </span>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white text-xs p-2 max-w-xs">
                    <p>Demo modu aktif. Gerçek veri için Shopify mağazanızı bağlayın.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

/**
 * Package Badge Component
 * Shows current package (Clear/Control/Vision)
 */
export function PackageBadge({
    package: pkg,
    className = ''
}: {
    package: 'clear' | 'control' | 'vision'
    className?: string
}) {
    const config = {
        clear: {
            label: 'Clear',
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            border: 'border-gray-200'
        },
        control: {
            label: 'Control',
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            border: 'border-blue-200'
        },
        vision: {
            label: 'Vision',
            bg: 'bg-purple-100',
            text: 'text-purple-700',
            border: 'border-purple-200'
        }
    }

    const cfg = config[pkg]

    return (
        <span className={`
      inline-flex items-center px-2 py-0.5
      ${cfg.bg} ${cfg.text}
      rounded-full text-[10px] font-bold uppercase tracking-wider
      border ${cfg.border}
      ${className}
    `}>
            {cfg.label}
        </span>
    )
}
