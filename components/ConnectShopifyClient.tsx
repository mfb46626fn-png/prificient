'use client'

import DashboardHeader from '@/components/DashboardHeader'
import { ShoppingBag, ArrowRight, CheckCircle2, AlertCircle, Loader2, Settings } from 'lucide-react'
import Image from 'next/image'

interface ConnectShopifyClientProps {
    shopUrl: string
    setShopUrl: (url: string) => void
    loading: boolean
    handleConnect: () => void
    isConnected: boolean
    isDemo?: boolean
    onOpenSettings?: () => void
}

export default function ConnectShopifyClient({
    shopUrl,
    setShopUrl,
    loading,
    handleConnect,
    isConnected,
    isDemo = false,
    onOpenSettings
}: ConnectShopifyClientProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <DashboardHeader isDemo={isDemo} />

            <main className="max-w-3xl mx-auto px-4 pt-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Shopify Mağazanızı Bağlayın</h1>
                    <p className="text-gray-500 font-medium">Verilerinizi senkronize etmek için mağaza adresinizi girin.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#95BF47]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#95BF47]/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                            <ShoppingBag size={40} className="text-[#95BF47]" />
                        </div>

                        {isConnected ? (
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold mb-4">
                                    <CheckCircle2 size={20} />
                                    Bağlantı Aktif
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Tebrikler!</h3>
                                <p className="text-gray-500 mb-2">{shopUrl}</p>
                                <p className="text-gray-400 text-sm mb-8">Mağazanız başarıyla bağlandı. Analizler hazırlanıyor.</p>
                                <button
                                    onClick={onOpenSettings}
                                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    <Settings size={20} />
                                    Ayarları Yönet
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Mağaza Adresi</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="magazam.myshopify.com"
                                            value={shopUrl}
                                            onChange={(e) => setShopUrl(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-[#95BF47] focus:border-transparent transition-all placeholder:text-gray-300"
                                        />
                                        <div className="absolute inset-y-0 right-4 flex items-center">
                                            {shopUrl && <CheckCircle2 size={20} className="text-[#95BF47]" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold mt-2 ml-1 flex items-center gap-1">
                                        <AlertCircle size={10} />
                                        .myshopify.com uzantılı adresi giriniz
                                    </p>
                                </div>

                                <button
                                    onClick={handleConnect}
                                    disabled={loading || !shopUrl}
                                    className="w-full bg-[#95BF47] hover:bg-[#85AB3E] disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#95BF47]/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={24} className="animate-spin" />
                                            Bağlanıyor...
                                        </>
                                    ) : (
                                        <>
                                            Bağlantıyı Kur <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 font-bold">14 Gün Ücretsiz Deneme • Kredi Kartı Gerekmez</p>
                </div>
            </main>
        </div>
    )
}
