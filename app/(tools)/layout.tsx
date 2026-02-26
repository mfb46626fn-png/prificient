import Image from 'next/image'
import type { Metadata } from 'next'
import ToolsUserMenu from '@/components/tools/ToolsUserMenu'
import ToastContainer from '@/components/tools/Toast'

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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="https://tools.prificient.com" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <Image src="/toolslogo.png" alt="Prificient Araçlar" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white/90">Prificient <span className="text-neutral-500">Tools</span></span>
          </a>
          <ToolsUserMenu />
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
            <a href="https://prificient.com/legal/privacy" className="hover:text-white transition-colors">Gizlilik Şartları</a>
            <a href="https://prificient.com/legal/terms" className="hover:text-white transition-colors">Kullanım Şartları</a>
            <a href="mailto:destek@prificient.com" className="hover:text-white transition-colors">İletişim Kur</a>
          </div>
        </div>
      </footer>
    </div>
  )
}