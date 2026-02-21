import Image from 'next/image'
import type { Metadata } from 'next'
import ToolsUserMenu from '@/components/tools/ToolsUserMenu'

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
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="https://tools.prificient.com" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <Image src="/toolslogo.png" alt="Prificient Araçlar" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-600 transition-colors">
              Prificient Araçlar
            </span>
          </a>
          <ToolsUserMenu />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center overflow-hidden">
              <Image src="/toolslogo.png" alt="Prificient Araçlar" width={20} height={20} className="object-contain" />
            </div>
            <span className="text-xs text-gray-400">© {new Date().getFullYear()} Prificient</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <a href="https://prificient.com" className="hover:text-gray-600 transition-colors">Ana Sayfa</a>
            <a href="https://app.prificient.com/legal/privacy" className="hover:text-gray-600 transition-colors">Gizlilik</a>
            <a href="mailto:destek@prificient.com" className="hover:text-gray-600 transition-colors">İletişim</a>
          </div>
        </div>
      </footer>
    </div>
  )
}