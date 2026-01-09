import { Loader2 } from 'lucide-react'

export default function GlobalLoader() {
  return (
    // z-index'i 9999 yaptım ki header'ın ve her şeyin üstünde dursun
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-all">
      <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animasyonlu Logo Konteyneri */}
        <div className="relative h-20 w-20">
          
          {/* 1. Dış Halka (Yavaş Dönen Gri) */}
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          
          {/* 2. Orta Halka (Hızlı Dönen Siyah - Kesik) */}
          {/* Tasarım bütünlüğü için maviyi siyah/koyu gri yaptım, istersen blue-600 yapabilirsin */}
          <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
          
          {/* 3. İç Logo (Nefes Alan 'P') */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg animate-pulse">
              P
            </div>
          </div>
        </div>

        {/* Yükleniyor Yazısı */}
        <div className="flex items-center gap-2 text-black font-medium animate-pulse">
          <span className="text-sm tracking-widest uppercase">Yükleniyor</span>
          <span className="flex gap-1">
             <span className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></span>
             <span className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></span>
             <span className="w-1 h-1 bg-black rounded-full animate-bounce"></span>
          </span>
        </div>

      </div>
    </div>
  )
}