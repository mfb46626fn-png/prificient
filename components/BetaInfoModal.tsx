'use client'

import { X, Zap, CheckCircle2, Calendar, PartyPopper, ArrowRight, Sparkles } from 'lucide-react'

interface BetaInfoModalProps {
    isOpen: boolean,
    onClose: () => void,
    actionLabel: string,
    onAction: () => void,
}

// BURASI SİZİN KONTROL PANELİNİZ
// Yeni bir özellik eklediğinizde bu listeye en üste eklemeniz yeterli.
const UPDATES = [
    {
        date: 'Bugün',
        title: 'Yapay Zeka Asistanı',
        description: 'Verilerinizle sohbet edin. "Satışlarım neden düştü?" veya "En çok ne iade ediliyor?" diye sorun, anında yanıt alın.',
        type: 'new' // 'new' | 'fix' | 'update'
    },
    {
        date: 'Dün',
        title: 'Otomatik Komisyon Hesabı',
        description: 'Trendyol veya Shopify fark etmez; Excel yüklediğiniz an tüm kesintileri biz hesaplarız, size net kârı gösteririz.',
        type: 'update'
    },
    {
        date: '12 Oca',
        title: 'Reklam Gider Dağıtımı',
        description: 'Günlük reklam harcamanızı tek tuşla siparişlere dağıtın, ürün başına gerçek maliyeti görün.',
        type: 'new'
    }
]

export default function BetaInfoModal({ isOpen, onClose, actionLabel, onAction }: BetaInfoModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">

                {/* HEADER & DEKORASYON */}
                <div className="relative bg-[#0F172A] text-white p-8 overflow-hidden shrink-0">
                    {/* Blue-centric gradients */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/40 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all z-20 text-white/70 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Sparkles size={12} className="text-blue-300 fill-blue-300" />
                            v1.0 Beta Sürümü
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Yenilikler & Güncellemeler</h2>
                        <p className="text-blue-100/80 text-sm font-medium max-w-md leading-relaxed">
                            Prificient her gün gelişiyor. Beta süreci boyunca eklenen özellikleri buradan takip edebilirsiniz.
                        </p>
                    </div>
                </div>

                {/* İÇERİK: GÜNCELLEME LİSTESİ (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* AVANTAJ KARTI */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-3xl flex items-start gap-4 mb-8">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600 shrink-0">
                            <PartyPopper size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 text-sm">Beta Özel Sınırsız Erişim</h3>
                            <p className="text-xs text-blue-700/80 mt-1 leading-relaxed font-medium">
                                Tüm Pro özellikler (AI, Sınırsız Veri, Detaylı Analiz) beta kullanıcılarına özel <span className="underline decoration-blue-400 decoration-2 font-bold">tamamen ücretsizdir.</span>
                            </p>
                        </div>
                    </div>

                    {/* ZAMAN TÜNELİ */}
                    <div className="space-y-8 relative pl-2">
                        {/* Dikey Çizgi */}
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-100"></div>

                        {UPDATES.map((update, index) => (
                            <div key={index} className="relative flex gap-5 group">
                                {/* İkon */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 ${update.type === 'new' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {update.type === 'new' ? <Zap size={24} className="fill-white" /> : <CheckCircle2 size={24} />}
                                </div>

                                {/* İçerik */}
                                <div className="pt-2 pb-4 border-b border-gray-50 w-full group-last:border-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${update.type === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {update.type === 'new' ? 'YENİ' : 'GÜNCELLEME'}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                                            <Calendar size={12} /> {update.date}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 mb-1">{update.title}</h4>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        {update.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                    <p className="text-xs text-gray-400 font-bold hidden sm:block">
                        Son Güncelleme: {UPDATES[0].date}
                    </p>
                    <button
                        onClick={onAction}
                        className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        {actionLabel} <ArrowRight size={16} />
                    </button>
                </div>

            </div>
        </div>
    )
}