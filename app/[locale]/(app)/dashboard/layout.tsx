import DashboardHeader from '@/components/DashboardHeader'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section className="min-h-screen bg-gray-50">
            <DashboardHeader />
            <main className="max-w-[1600px] mx-auto px-4 md:px-8 pt-4 md:pt-8 w-full">
                {children}
            </main>
        </section>
    )
}
