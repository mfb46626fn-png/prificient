'use client'

import Image from 'next/image'

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-all">
      <div className="relative flex flex-col items-center justify-center">

        {/* Glow Effect Behind Logo */}
        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse"></div>

        {/* Logo Container with Breathing Animation */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 animate-[pulse_3s_ease-in-out_infinite]">
          <Image
            src="/logo.png"
            alt="Prificient Logo"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Loading Bar */}
        <div className="mt-8 w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
          <div className="h-full bg-white animate-[loading_1.5s_ease-in-out_infinite_alternate] w-full origin-left"></div>
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