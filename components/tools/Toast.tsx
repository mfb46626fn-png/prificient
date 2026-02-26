'use client'

import { useState, useEffect, useCallback } from 'react'

interface ToastData {
    message: string
    subtext?: string
    action?: { label: string; href: string }
}

let showToastFn: ((data: ToastData) => void) | null = null

/** Call from anywhere to show a toast */
export function triggerToast(data: ToastData) {
    showToastFn?.(data)
}

export default function ToastContainer() {
    const [toast, setToast] = useState<ToastData | null>(null)
    const [visible, setVisible] = useState(false)

    const show = useCallback((data: ToastData) => {
        setToast(data)
        setVisible(true)
        setTimeout(() => setVisible(false), 5000)
        setTimeout(() => setToast(null), 5400)
    }, [])

    useEffect(() => {
        showToastFn = show
        return () => { showToastFn = null }
    }, [show])

    if (!toast) return null

    return (
        <div
            className={`fixed top-4 right-4 z-[100] max-w-sm w-full transition-all duration-400 ${visible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
                }`}
        >
            <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] backdrop-blur-xl shadow-xl shadow-black/50 p-5">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-bold text-white leading-snug">
                            {toast.message}
                        </p>
                        {toast.subtext && (
                            <p className="text-xs text-neutral-400 mt-1">{toast.subtext}</p>
                        )}
                        {toast.action && (
                            <a
                                href={toast.action.href}
                                className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-wider"
                            >
                                {toast.action.label}
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                        )}
                    </div>

                    {/* Close */}
                    <button
                        onClick={() => { setVisible(false); setTimeout(() => setToast(null), 400) }}
                        className="text-neutral-500 hover:text-white transition-colors flex-shrink-0 p-1"
                    >
                        <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
