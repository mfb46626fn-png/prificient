import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Ücretsiz E-Ticaret Hesaplama Araçları',
    description: 'E-ticaret işletmeniz için ücretsiz ROAS Simülatörü, Başa Baş Hesaplayıcı ve BFCM Kâr Planlayıcı. Hemen kullanmaya başlayın.',
}

const tools = [
    {
        title: 'E-Ticaret Kâr Simülatörü',
        description: 'Hedef cironuzun gerçekte ne kadar kâr getireceğini, tüm gizli maliyetler dahil simüle edin.',
        href: '/profit-simulator',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
        ),
        color: 'emerald',
        badge: 'Yeni',
    },
    {
        title: 'ROAS Simülatörü',
        description: 'Reklam harcamalarınızın gerçek geri dönüşünü hesaplayın. Gizli maliyetler dahil.',
        href: '/roas-calculator',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
        color: 'violet',
        badge: 'Popüler',
    },
    {
        title: 'Başa Baş Hesaplayıcı',
        description: 'Ürününüzün başa baş noktasını bulun. Kaç adet satmalısınız?',
        href: '/breakeven-calculator',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
            </svg>
        ),
        color: 'blue',
        badge: null,
    },
    {
        title: 'BFCM Kâr Planlayıcı',
        description: 'Black Friday ve Cyber Monday kampanyalarınızın kârlılığını önceden simüle edin.',
        href: '/bfcm-planner',
        icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
        ),
        color: 'amber',
        badge: 'Yeni',
    },
]

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200/60', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200/60', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200/60', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200/60', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
}

export default function ToolsHomePage() {
    return (
        <div className="py-16 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-violet-600 mb-3">
                        Ücretsiz Araçlar
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        E-Ticaret Hesaplama Araçları
                    </h1>
                    <p className="text-base text-gray-500 max-w-xl mx-auto">
                        İşletmenizin finansal kararlarını daha bilinçli almanıza yardımcı olacak
                        ücretsiz araçları hemen kullanmaya başlayın.
                    </p>
                </div>

                {/* Tool Cards */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {tools.map((tool) => {
                        const c = colorMap[tool.color]
                        return (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group relative rounded-2xl border border-gray-200/80 bg-white p-7 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                {/* Badge */}
                                {tool.badge && (
                                    <span className={`absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                                        {tool.badge}
                                    </span>
                                )}

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} mb-5`}>
                                    {tool.icon}
                                </div>

                                {/* Content */}
                                <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-700 transition-colors">
                                    {tool.title}
                                </h2>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    {tool.description}
                                </p>

                                {/* Arrow */}
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-violet-600 transition-colors">
                                    Kullanmaya Başla
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* CTA Banner */}
                <div className="mt-16 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-10 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Daha Fazlasını mı İstiyorsun?</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Prificient Dashboard ile tüm e-ticaret finansal verilerini tek panelden yönet.
                    </p>
                    <a
                        href="https://prificient.com"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Erken Erişim Talep Et
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    )
}
