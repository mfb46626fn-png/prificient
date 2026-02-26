import type { Metadata } from 'next'
import GlobalHeader from '@/components/marketing/GlobalHeader'
import GlobalFooter from '@/components/marketing/GlobalFooter'

export const metadata: Metadata = {
  title: 'Prificient — E-Ticarette Gerçek Kâr Devrimi',
  description: 'Ciro değil, gerçek kâr. Prificient, e-ticaret işletmenizin finansal gerçeklerini gözler önüne seriyor. Satış yapıp para kaybedenler için değil, büyümek isteyenler için.',
  keywords: ['e-ticaret', 'kâr analizi', 'shopify', 'roas', 'finansal yönetim', 'prificient'],
  openGraph: {
    title: 'Prificient — Gerçek Kâr Devri Başlıyor',
    description: 'E-ticarette ciro yanılgısını bitiren finansal işletim sistemi.',
    type: 'website',
    url: 'https://prificient.com',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased flex flex-col selection:bg-red-500/30 selection:text-white">
      <GlobalHeader />
      <main className="flex-1">
        {children}
      </main>
      <GlobalFooter />
    </div>
  )
}