import Image from 'next/image'
import type { Metadata } from 'next'
import ToolsUserMenu from '@/components/tools/ToolsUserMenu'
import ToastContainer from '@/components/tools/Toast'
import { LegalSheet } from '@/components/legal/LegalSheet'

export const metadata: Metadata = {
  title: {
    template: '%s | Prificient Araçlar',
    default: 'Ücretsiz E-Ticaret Araçları | Prificient',
  },
  description: 'E-ticaret işletmeniz için ücretsiz finansal hesaplama araçları. ROAS Simülatörü, Başa Baş Hesaplayıcı ve BFCM Kâr Planlayıcı.',
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl transition-all duration-500">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="https://tools.prificient.com" className="hover:opacity-80 transition-opacity shrink-0 flex items-center gap-3 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 shrink-0">
                <Image src="/toolslogo.png" alt="Prificient Araçlar" width={24} height={24} className="object-contain sm:w-7 sm:h-7" />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white/90 whitespace-nowrap">Prificient <span className="text-neutral-500">Tools</span></span>
            </a>
          </div>

          <div className="flex-1 px-8">
            {/* Orta boşluk */}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ToolsUserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>
      <ToastContainer />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <Image src="/toolslogo.png" alt="Prificient Araçlar" width={20} height={20} className="object-contain" />
            </div>
            <span className="text-xs font-medium text-neutral-500">© {new Date().getFullYear()} Prificient</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-neutral-500 font-medium">
            <a href="https://prificient.com" className="hover:text-white transition-colors">Ana Sayfa</a>
            <LegalSheet type="privacy" triggerText="Gizlilik Şartları" />
            <LegalSheet type="terms" triggerText="Kullanım Şartları" />
            <a href="mailto:destek@prificient.com" className="hover:text-white transition-colors">İletişim Kur</a>
          </div>
        </div>
      </footer>
    </div>
  )
}