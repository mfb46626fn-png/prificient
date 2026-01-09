'use client'

import { X, Rocket, Gift, MessageSquare, ShieldAlert, Layers } from 'lucide-react'

interface BetaInfoModalProps {
  isOpen: boolean
  onClose: () => void
  // YENİ PROPS: Buton metni ve aksiyonu özelleştirilebilir
  actionLabel?: string 
  onAction?: () => void
}

export default function BetaInfoModal({ isOpen, onClose, actionLabel, onAction }: BetaInfoModalProps) {
  if (!isOpen) return null

  const handleButtonClick = () => {
    if (onAction) {
      onAction() // Eğer özel bir aksiyon varsa (örn: Login sayfasına git) onu çalıştır
    } else {
      onClose() // Yoksa sadece kapat (Dashboard davranışı)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Dekoratif Arkaplan */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>

        {/* Kapatma Butonu */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-md z-10"
        >
          <X size={20} />
        </button>

        {/* İçerik */}
        <div className="relative pt-10 px-8 pb-8">
            
            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 relative z-10">
                <Rocket size={40} className="text-blue-600" />
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Erken Erişim Programı</h2>
                <p className="text-gray-500 font-medium mt-2">Prificient'ı ilk deneyimleyenlerden olduğunuz için teşekkürler.</p>
            </div>

            {/* Bilgi Kartları */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Gift className="text-blue-600" size={18} />
                        <h3 className="font-bold text-gray-900 text-sm">Tamamen Ücretsiz</h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        Beta süreci boyunca tüm özellikler (%100) ücretsizdir. Kredi kartı gerekmez, sürpriz fatura çıkmaz.
                    </p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="text-emerald-600" size={18} />
                        <h3 className="font-bold text-gray-900 text-sm">Geri Bildiriminiz Değerli</h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        Hata mı buldunuz? Veya bir özellik mi istiyorsunuz? Bize yazın, öncelikli olarak geliştirelim.
                    </p>
                </div>
            </div>

            {/* Yol Haritası */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Layers size={16}/> Sırada Ne Var?
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 opacity-50">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                        <span className="text-sm font-bold text-gray-900 line-through">Temel Finans Takibi</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">Excel / CSV Entegrasyonu</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        <span className="text-sm font-medium text-gray-500">Pazaryeri API Bağlantıları (Trendyol, Amazon)</span>
                    </div>
                </div>
            </div>

            {/* Footer Uyarısı */}
            <div className="flex items-start gap-3 bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                <ShieldAlert className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                    Beta sürümünde olduğumuz için arayüzde değişiklikler olabilir. Verileriniz her zaman güvendedir.
                </p>
            </div>

            <div className="mt-6 text-center">
                <button 
                    onClick={handleButtonClick} 
                    className="bg-black text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95 text-lg"
                >
                    {actionLabel || "Anlaşıldı, Devam Et"}
                </button>
            </div>

        </div>
      </div>
    </div>
  )
}