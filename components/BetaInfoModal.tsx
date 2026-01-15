'use client'

import { X, Zap, CheckCircle2, Calendar, PartyPopper, ArrowRight } from 'lucide-react'

interface BetaInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

// BURASI SİZİN KONTROL PANELİNİZ
// Yeni bir özellik eklediğinizde bu listeye en üste eklemeniz yeterli.
const UPDATES = [
    {
        date: 'Bugün',
        title: 'Yapay Zeka Asistanı (Prificient AI)',
        description: 'Artık verilerinizle sohbet edebilirsiniz. "Neden kârım düştü?" diye sorun, AI cevaplasın.',
        type: 'new' // 'new' | 'fix' | 'update'
    },
    {
        date: 'Dün',
        title: 'Akıllı Platform Hafızası',
        description: 'Excel yüklerken platform komisyonlarını (Shopify, Trendyol) otomatik hesaplayan modül eklendi.',
        type: 'update'
    },
    {
        date: '12 Oca',
        title: 'Reklam Maliyet Dağıtımı',
        description: 'Tek bir tuşla toplam reklam harcamanızı o günün siparişlerine adil şekilde dağıtabilirsiniz.',
        type: 'new'
    }
]

export default function BetaInfoModal({ isOpen, onClose }: BetaInfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
        
        {/* HEADER & DEKORASYON */}
        <div className="relative bg-black text-white p-8 overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all z-20 text-white/70 hover:text-white"
            >
                <X size={20} />
            </button>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                    v1.0 Beta Sürümü
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Yenilikler & Güncellemeler</h2>
                <p className="text-gray-400 text-sm font-medium max-w-md leading-relaxed">
                    Prificient her gün gelişiyor. Beta süreci boyunca eklenen özellikleri buradan takip edebilirsiniz.
                </p>
            </div>
        </div>

        {/* İÇERİK: GÜNCELLEME LİSTESİ (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* AVANTAJ KARTI */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-3xl flex items-start gap-4 mb-8">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600 shrink-0">
                    <PartyPopper size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Sınırsız Erişim Hakkı</h3>
                    <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                        Beta kullanıcılarına özel olarak tüm Pro özellikler (AI, Sınırsız Veri, Excel Analizi) şu an tamamen ücretsiz ve kısıtlamasızdır.
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
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 ${
                            update.type === 'new' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                            {update.type === 'new' ? <Zap size={24} className="fill-yellow-400 text-yellow-400" /> : <CheckCircle2 size={24} />}
                        </div>

                        {/* İçerik */}
                        <div className="pt-2 pb-4 border-b border-gray-50 w-full group-last:border-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                    update.type === 'new' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {update.type === 'new' ? 'YENİ ÖZELLİK' : 'GÜNCELLEME'}
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
            <p className="text-xs text-gray-400 font-bold">
                Son Güncelleme: {UPDATES[0].date}
            </p>
            <button 
                onClick={onClose}
                className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-900 transition-all flex items-center gap-2 hover:gap-3"
            >
                Panele Dön <ArrowRight size={16} />
            </button>
        </div>

      </div>
    </div>
  )
}