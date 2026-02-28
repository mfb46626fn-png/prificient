'use client'

import ReportsClient from '@/components/ReportsClient'

import { ToastProvider } from '@/components/ui/toast'

export default function ReportsPage() {
    return (
        <ToastProvider>
            <ReportsClient />
        </ToastProvider>
    )
}
