'use client'

import { useState } from 'react'
import { X, Store, Calendar, AlertTriangle, Loader2, Trash2 } from 'lucide-react'

interface ShopifySettingsModalProps {
    isOpen: boolean
    onClose: () => void
    shopDomain: string
    onDisconnect: () => Promise<void>
}

export default function ShopifySettingsModal({
    isOpen,
    onClose,
    shopDomain,
    onDisconnect
}: ShopifySettingsModalProps) {
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isDisconnecting, setIsDisconnecting] = useState(false)

    const handleDisconnect = async () => {
        setIsDisconnecting(true)
        try {
            await onDisconnect()
            onClose()
        } catch (error) {
            console.error('Disconnect error:', error)
            alert('Bağlantı iptal edilirken bir hata oluştu.')
        } finally {
            setIsDisconnecting(false)
            setShowConfirmation(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                >
                    <X size={20} />
                </button>

                {!showConfirmation ? (
                    <>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#95BF47]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Store size={32} className="text-[#95BF47]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Shopify Ayarları</h2>
                            <p className="text-gray-500 text-sm">Mağaza bağlantınızı yönetin</p>
                        </div>

                        {/* Store Info */}
                        <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Store size={18} className="text-[#95BF47]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Mağaza</p>
                                    <p className="text-sm font-bold text-gray-900">{shopDomain}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <Calendar size={18} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Durum</p>
                                    <p className="text-sm font-bold text-emerald-600">Aktif</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={() => setShowConfirmation(true)}
                            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-4 rounded-xl transition-colors"
                        >
                            <Trash2 size={18} />
                            Bağlantıyı İptal Et
                        </button>
                    </>
                ) : (
                    <>
                        {/* Confirmation View */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} className="text-rose-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Emin misiniz?</h2>
                            <p className="text-gray-500 text-sm">Bu işlem geri alınamaz</p>
                        </div>

                        {/* Warning Box */}
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-6">
                            <div className="flex gap-3">
                                <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-rose-800 mb-1">
                                        Tüm verileriniz silinecek!
                                    </p>
                                    <p className="text-xs text-rose-600 leading-relaxed">
                                        Shopify bağlantısı iptal edildiğinde, bu mağazadan senkronize edilen tüm sipariş verileri, finansal kayıtlar ve analizler kalıcı olarak silinecektir.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleDisconnect}
                                disabled={isDisconnecting}
                                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
                            >
                                {isDisconnecting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        İptal Ediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Evet, Bağlantıyı İptal Et
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowConfirmation(false)}
                                disabled={isDisconnecting}
                                className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold py-4 rounded-xl transition-colors"
                            >
                                Vazgeç
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
