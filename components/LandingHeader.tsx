'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import BetaInfoModal from '@/components/BetaInfoModal'

export default function LandingHeader() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false)

  // Menü açıkken sayfanın kaydırılmasını engelle
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  // Beta aksiyonu (Modaldaki butona basılınca çalışır)
  const handleJoinBeta = () => {
    router.push('/login')
  }

  // Modalı açan yardımcı fonksiyon (Mobil menüyü de kapatır)
  const openBetaModal = () => {
    setIsMobileMenuOpen(false)
    setIsBetaModalOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* LOGO */}
          <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 font-black text-xl tracking-tight text-gray-900 z-50 relative"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">P</span>
            Prificient
          </Link>

          {/* --- MASAÜSTÜ MENÜ --- */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#ozellikler" className="hover:text-black transition-colors">Özellikler</Link>
            <Link href="#nasil" className="hover:text-black transition-colors">Nasıl Çalışır?</Link>
            {/* YENİ EKLENEN FİYATLAR LİNKİ */}
            <Link href="#pricing" className="hover:text-black transition-colors">Fiyatlar</Link>
            <Link href="#vision" className="hover:text-black transition-colors">Vizyonumuz</Link>
          </nav>

          {/* --- MASAÜSTÜ BUTONLAR --- */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Giriş Yap
            </Link>
            
            {/* Bu buton artık Modalı açıyor */}
            <button 
              onClick={() => setIsBetaModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-black/20 active:scale-95"
            >
              Beta'ya Katıl
              <ArrowRight size={16} />
            </button>
          </div>

          {/* --- MOBİL HAMBURGER BUTONU --- */}
          <button 
            className="md:hidden p-2 text-gray-900 z-50 relative rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* --- MOBİL MENÜ ÇEKMECESİ --- */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-white md:hidden flex flex-col pt-24 px-6 animate-in slide-in-from-top-10 fade-in duration-200">
              
              {/* Navigasyon Linkleri */}
              <div className="flex flex-col space-y-2">
                <Link 
                  href="#ozellikler" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-2xl font-bold text-gray-900 py-4 border-b border-gray-100"
                >
                  Özellikler
                </Link>
                <Link 
                  href="#nasil" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-2xl font-bold text-gray-900 py-4 border-b border-gray-100"
                >
                  Nasıl Çalışır?
                </Link>
                {/* YENİ EKLENEN MOBİL FİYATLAR LİNKİ */}
                <Link 
                  href="#pricing" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-2xl font-bold text-gray-900 py-4 border-b border-gray-100"
                >
                  Fiyatlar
                </Link>
                <Link 
                  href="#vision" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-2xl font-bold text-gray-900 py-4 border-b border-gray-100"
                >
                  Vizyonumuz
                </Link>
              </div>

              {/* Alt Kısım Butonları */}
              <div className="mt-auto mb-10 space-y-4">
                <Link 
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-4 rounded-xl border-2 border-gray-200 text-gray-900 font-bold text-lg hover:bg-gray-50"
                >
                  Giriş Yap
                </Link>
                
                {/* Mobil Beta Butonu */}
                <button 
                  onClick={openBetaModal}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  Beta'ya Katıl
                  <ArrowRight size={20} />
                </button>
              </div>
              
            </div>
          )}

        </div>
      </header>

      {/* Beta Modalı - Landing Page Konfigürasyonu */}
      <BetaInfoModal 
        isOpen={isBetaModalOpen} 
        onClose={() => setIsBetaModalOpen(false)}
        actionLabel="Hesap Oluştur & Başla"
        onAction={handleJoinBeta}
      />
    </>
  )
}