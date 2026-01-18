'use client'

import { X, ShoppingBag, Globe, ShoppingCart, Truck } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface IntegrationModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function IntegrationModal({ isOpen, onClose }: IntegrationModalProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (isOpen) setShow(true)
        else setTimeout(() => setShow(false), 300)
    }, [isOpen])

    if (!show) return null

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl transform transition-all duration-500 border border-gray-100 overflow-hidden ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>

                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -z-10 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -z-10 opacity-60"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Entegrasyon Ekosistemi</h2>
                    <p className="text-gray-500 font-medium text-lg">
                        Tek bir merkezden tüm e-ticaret operasyonunuzu yönetin.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

                    {/* Shopify (Active) */}
                    <div className="group relative bg-white p-6 rounded-3xl border-2 border-[#95BF47] shadow-lg shadow-[#95BF47]/10 flex flex-col items-center gap-4 hover:-translate-y-1 transition-transform">
                        <div className="absolute top-3 right-3 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#95BF47] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#95BF47]"></span>
                        </div>
                        <div className="w-16 h-16 bg-[#95BF47]/10 rounded-2xl flex items-center justify-center text-[#95BF47]">
                            <ShoppingBag size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-gray-900">Shopify</p>
                            <p className="text-xs font-bold text-[#95BF47] uppercase tracking-wider mt-1">Aktif & Hazır</p>
                        </div>
                    </div>

                    {/* Trendyol (Coming Soon) */}
                    <div className="group relative bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                            <ShoppingBag size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900">Trendyol</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Çok Yakında</p>
                        </div>
                    </div>

                    {/* Hepsiburada (Coming Soon) */}
                    <div className="group relative bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                            <ShoppingBag size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900">Hepsiburada</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Çok Yakında</p>
                        </div>
                    </div>

                    {/* Amazon (Coming Soon) */}
                    <div className="group relative bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500">
                            <Globe size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900">Amazon</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Q3 2026</p>
                        </div>
                    </div>

                    {/* Woo (Coming Soon) */}
                    <div className="group relative bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                            <ShoppingCart size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900">WooCommerce</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Q3 2026</p>
                        </div>
                    </div>

                    {/* Kargo (Coming Soon) */}
                    <div className="group relative bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center gap-4 opacity-70 hover:opacity-100 transition-opacity text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                            <Truck size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900">Kargo Firmaları</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Planlanıyor</p>
                        </div>
                    </div>

                </div>

                <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                    <p className="text-blue-800 font-bold text-sm">
                        💡 İstediğiniz bir entegrasyon mu var? Bize yazın, önceliklendirelim.
                    </p>
                </div>

            </div>
        </div>
    )
}
