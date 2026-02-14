import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Prificient',
    description: 'E-Ticaretin Finansal İşletim Sistemi',
    icons: {
        icon: '/favicon.ico',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="tr" suppressHydrationWarning>
            <body suppressHydrationWarning>{children}</body>
        </html>
    )
}
