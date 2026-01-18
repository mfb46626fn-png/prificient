'use client'

import { useState } from 'react'
import ConnectShopifyClient from '@/components/ConnectShopifyClient'
import { DEMO_DATA } from '@/lib/demo-data'

export default function DemoConnectShopifyPage() {
    const [shopUrl, setShopUrl] = useState(DEMO_DATA.integration.shop_url)
    const [loading, setLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(true) // Demo'da her zaman bağlı gib göster veya toggle et

    const handleConnect = () => {
        setLoading(true)
        setTimeout(() => {
            alert('Demo modunda bağlantı simülasyonu başarılı!')
            setIsConnected(true)
            setLoading(false)
        }, 1500)
    }

    return (
        <ConnectShopifyClient
            shopUrl={shopUrl}
            setShopUrl={setShopUrl}
            loading={loading}
            handleConnect={handleConnect}
            isConnected={isConnected}
            isDemo={true}
        />
    )
}
