import type { Metadata } from 'next'

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
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      {children}
    </div>
  )
}