'use client'

import Image from 'next/image'

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-all">
      <div className="relative flex flex-col items-center justify-center">

        {/* Logo Container with Breathing Animation */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 animate-[pulse_3s_ease-in-out_infinite]">
          <Image
            src="/logo.png"
            alt="Prificient Logo"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* Loading Bar */}
        <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black animate-[loading_1.5s_ease-in-out_infinite_alternate] w-full origin-left"></div>
        </div>

        <p className="mt-4 text-xs font-bold text-gray-500 tracking-[0.2em] uppercase animate-pulse">
          Yükleniyor
        </p>

        <style jsx>{`
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0%); }
            }
        `}</style>
      </div>
    </div>
  )
}