import Link from 'next/link'
import { Calculator, Truck, FileSpreadsheet } from 'lucide-react'

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                            <span>T</span>
                        </div>
                        Prificient Tools
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="https://prificient.com" className="text-sm font-medium text-gray-600 hover:text-black">Ana Sayfa</Link>
                        <Link href="https://app.prificient.com" className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
                            Dashboard'a Git
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Ücretsiz E-Ticaret Araçları</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Kârlılığınızı hesaplamak, kargo maliyetlerini optimize etmek ve rakiplerinizi analiz etmek için geliştirdiğimiz ücretsiz araç setleri.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Tool Card 1 */}
                    <div className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow group cursor-pointer">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Calculator size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">ROAS / Break-Even Hesaplayıcı</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Ürün maliyeti ve hedef kâr marjınıza göre kampanya bazında ulaşmanız gereken minimum ROAS değerini hesaplayın.
                        </p>
                        <span className="text-blue-600 text-sm font-medium">Hesapla &rarr;</span>
                    </div>

                    {/* Tool Card 2 */}
                    <div className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow group cursor-pointer">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Truck size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Desi & Kargo Maliyeti</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Ürün ebatlarına göre desi hesaplayın ve anlaşmalı kargo firmalarınızın (Yurtiçi, Aras, MNG) fiyatları ile karşılaştırın.
                        </p>
                        <span className="text-green-600 text-sm font-medium">Karşılaştır &rarr;</span>
                    </div>

                    {/* Tool Card 3 */}
                    <div className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow group cursor-pointer">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileSpreadsheet size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Excel Veri Temizleyici</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Shopify veya pazaryerlerinden indirdiğiniz bozuk CSV dosyalarını tek tıkla analiz formatına uygun hale getirin.
                        </p>
                        <span className="text-purple-600 text-sm font-medium">Temizle &rarr;</span>
                    </div>
                </div>

                <div className="mt-20 p-8 bg-gray-900 rounded-2xl text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Daha Fazlasına mı İhtiyacınız Var?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Prificient Dashboard ile tüm bu araçları mağazanıza entegre edin ve otomatikleştirin.
                    </p>
                    <Link href="https://app.prificient.com/signup" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        Ücretsiz Dene
                    </Link>
                </div>
            </main>
        </div>
    )
}
