'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ConnectShopifyClient from '@/components/ConnectShopifyClient'

export default function ConnectShopifyPage() {
    const [shopUrl, setShopUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(false) // Normally verify with backend
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) router.push('/login')
        }
        checkAuth()
    }, [])

    const handleConnect = async () => {
        setLoading(true)
        try {
            // 1. URL Temizle (https:// veya /admin kısımlarını at)
            let cleanUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')

            // .myshopify.com yoksa ekle (opsiyonel, kullanıcıya bırakılabilir ama UX için iyi)
            if (!cleanUrl.includes('.myshopify.com')) {
                cleanUrl += '.myshopify.com'
            }

            // 2. Auth Başlat (API Route'a yönlendir)
            const response = await fetch(`/api/shopify/auth?shop=${cleanUrl}`)
            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                alert('Bağlantı hatası: ' + (data.error || 'Bilinmeyen hata'))
                setLoading(false)
            }

        } catch (error) {
            console.error(error)
            alert('Bir hata oluştu.')
            setLoading(false)
        }
    }

    return (
        <ConnectShopifyClient
            shopUrl={shopUrl}
            setShopUrl={setShopUrl}
            loading={loading}
            handleConnect={handleConnect}
            isConnected={isConnected}
        />
    )
}
