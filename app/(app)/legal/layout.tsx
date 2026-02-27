import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <LandingHeader />
      
      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-gray-100">
           {children}
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}