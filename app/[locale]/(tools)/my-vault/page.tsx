import { Metadata } from 'next'
import VaultClient from '@/components/tools/VaultClient'

export const metadata: Metadata = {
    title: 'Finansal Kasam | Prificient',
    description: 'Geçmiş finansal analizlerinizi, profil özetinizi ve işletme sağlık geçmişinizi güvenle görüntüleyin.',
}

export default function MyVaultPage() {
    return <VaultClient />
}
