'use client'

import { useState, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ToolCalculation } from '@/lib/tools/calculations'
import { getCalculationHistory } from '@/lib/tools/calculations'

interface HistoryPanelProps {
    supabase: SupabaseClient
    toolName: string
    onLoad: (inputs: Record<string, string>, results: Record<string, number>) => void
    refreshKey: number // increment to refresh after new calculation
    formatSummary: (results: Record<string, number>) => string
}

export default function CalculationHistory({ supabase, toolName, onLoad, refreshKey, formatSummary }: HistoryPanelProps) {
    const [history, setHistory] = useState<ToolCalculation[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const data = await getCalculationHistory(supabase, toolName)
            setHistory(data)
            setLoading(false)
        }
        load()
    }, [supabase, toolName, refreshKey])

    if (history.length === 0 && !loading) return null

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors focus:outline-none"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">Geçmiş Hesaplamalarınız</span>
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">{history.length}</span>
                </div>
                <svg className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="border-t border-white/5 divide-y divide-white/5">
                    {loading ? (
                        <div className="px-6 py-4 text-center"><p className="text-sm text-slate-500 animate-pulse">Yükleniyor...</p></div>
                    ) : history.map((calc) => (
                        <button
                            key={calc.id}
                            onClick={() => onLoad(calc.inputs, calc.results)}
                            className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors group focus:outline-none"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-slate-500 mb-0.5">{formatDate(calc.created_at)}</p>
                                <p className="text-sm text-slate-400 truncate group-hover:text-white transition-colors">
                                    {formatSummary(calc.results)}
                                </p>
                            </div>
                            <svg className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
