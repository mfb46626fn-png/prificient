'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react'

// --- Types ---
export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    title?: string
    message: string
}

interface ToastContextType {
    showToast: (args: { type: ToastType; title?: string; message: string; duration?: number }) => void
}

// --- Context ---
const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// --- Provider & Component ---
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = ({ type, title, message, duration = 3000 }: { type: ToastType; title?: string; message: string; duration?: number }) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, type, title, message }])

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300
                            ${toast.type === 'success' ? 'bg-black text-white border-gray-800' :
                                toast.type === 'error' ? 'bg-white text-rose-600 border-rose-100' :
                                    toast.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        'bg-white text-gray-900 border-gray-100'
                            }
                        `}
                    >
                        {/* Icon */}
                        <div className="mt-0.5">
                            {toast.type === 'success' && <Check size={18} className="text-emerald-400" />}
                            {toast.type === 'error' && <AlertCircle size={18} />}
                            {toast.type === 'warning' && <AlertTriangle size={18} />}
                            {toast.type === 'info' && <Info size={18} className="text-blue-500" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            {toast.title && <h4 className="font-bold text-sm mb-0.5">{toast.title}</h4>}
                            <p className="text-sm font-medium opacity-90">{toast.message}</p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-current opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
