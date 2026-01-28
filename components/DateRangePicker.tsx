'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const RANGES = [
    { label: 'Son 7 Gün', value: '7d' },
    { label: 'Son 30 Gün', value: '30d' },
    { label: 'Bu Ay', value: 'this_month' },
    { label: 'Geçen Ay', value: 'last_month' },
    { label: 'Tüm Zamanlar', value: 'all' },
]

export default function DateRangePicker() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentRange = searchParams.get('range') || '30d'
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (range: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('range', range)

        // Calculate dates locally if needed, but easier to pass "range" to server
        // and let server handle date logic.
        // OR calculate here:
        // For MVP, passing 'range' param is cleaner URL.

        router.push(`?${params.toString()}`, { scroll: false })
        setIsOpen(false)
    }

    const currentLabel = RANGES.find(r => r.value === currentRange)?.label || 'Özel Tarih'

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
                <CalendarIcon size={16} className="text-gray-400" />
                <span>{currentLabel}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                        {RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => handleSelect(range.value)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${currentRange === range.value ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
