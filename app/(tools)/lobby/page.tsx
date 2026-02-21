import type { Metadata } from 'next'
import LobbyClient from '@/components/tools/LobbyClient'

export const metadata: Metadata = {
    title: 'Lobim — Prificient Erken Erişim',
    description: 'Prificient Erken Erişim listenizi takip edin, araç geçmişinizi görüntüleyin ve sıranızı yükseltin.',
}

export default function DashboardPage() {
    return <LobbyClient />
}
