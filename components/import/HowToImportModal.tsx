'use client'

import { X, HelpCircle, FileDown, Calendar, List, BarChart3, ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface HowToImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HowToImportModal({ isOpen, onClose }: HowToImportModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Meta'dan Doğru Veriyi Almak</h2>
                            <p className="text-sm text-gray-500">Prificient'ın analiz yapabilmesi için "Günlük Kırılım" şart.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-8">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Raporlar (Reports)</h3>
                            <p className="text-gray-600 text-sm">
                                Meta Ads Manager'da sağ üstteki <span className="font-medium bg-gray-100 px-1 rounded">Reports</span> butonuna tıklayın ve
                                <span className="font-medium bg-gray-100 px-1 rounded ml-1">Create Custom Report</span> seçeneğini seçin.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 (CRITICAL) */}
                    <div className="flex gap-4 relative">
                        <div className="absolute left-4 top-8 bottom-[-20px] w-0.5 bg-blue-100"></div>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shadow-md ring-4 ring-red-50">2</div>
                        <div>
                            <h3 className="font-semibold text-red-600 mb-1 flex items-center gap-2">
                                <Calendar size={16} /> En Önemli Adım: Günlük Kırılım
                            </h3>
                            <p className="text-gray-700 text-sm mb-3">
                                Sağ taraftaki menüden <strong>Breakdowns (Kırılımlar)</strong> kısmını açın.
                            </p>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-800 font-medium">
                                <span className="flex items-center gap-2">
                                    👉 Time (Zaman) <ArrowRight size={14} /> Day (Gün)
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-2">Bunu seçmezseniz Prificient tarihleri ayrıştıramaz.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Sütunlar (Metrics)</h3>
                            <p className="text-gray-600 text-sm">
                                Şu sütunların raporda olduğundan emin olun:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border">Campaign Name</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border">Amount Spent</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border">Impressions</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border">Clicks</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">4</div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">İndir (Export)</h3>
                            <p className="text-gray-600 text-sm">
                                Sağ üstten Export butonuna basın ve <span className="font-bold">.csv</span> formatını seçerek indirin.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                        Anladım, Yüklüyorum
                    </button>
                </div>
            </div>
        </div>
    )
}
