'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ConnectShopifyClient from '@/components/ConnectShopifyClient'
import ShopifySettingsModal from '@/components/ShopifySettingsModal'

export default function ConnectShopifyPage() {
    const [shopUrl, setShopUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkConnection = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('integrations')
                .select('shop_domain')
                .eq('user_id', user.id)
                .eq('platform', 'shopify')
                .maybeSingle()

            if (data) {
                setIsConnected(true)
                setShopUrl(data.shop_domain)
            }
        }
        checkConnection()
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

            // 2. Auth Başlat - Redirect kullan (CORS için window.location.href ile)
            // Fetch kullanmak yerine doğrudan yönlendirme yapılmalı
            // Aksi halde fetch redirect'i takip eder ve CORS hatası alınır
            window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(cleanUrl)}`

        } catch (error) {
            console.error(error)
            alert('Bir hata oluştu.')
            setLoading(false)
        }
    }

    const handleDisconnect = async () => {
        const response = await fetch('/api/shopify/disconnect', {
            method: 'POST'
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Bağlantı iptal edilemedi')
        }

        // Reset state
        setIsConnected(false)
        setShopUrl('')
        setIsSettingsOpen(false)
    }

    return (
        <>
            <ConnectShopifyClient
                shopUrl={shopUrl}
                setShopUrl={setShopUrl}
                loading={loading}
                handleConnect={handleConnect}
                isConnected={isConnected}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />

            <ShopifySettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                shopDomain={shopUrl}
                onDisconnect={handleDisconnect}
            />
        </>
    )
}
