import type { Metadata } from 'next'
import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { Target, Heart, ShieldCheck, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hakkımızda - Prificient',
  description: 'E-ticaretin görünmeyen yüzünü aydınlatmak için yola çıktık.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <LandingHeader />

      <main>
        {/* HERO */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
            <div className="container mx-auto px-6 text-center relative z-10">
                <h1 className="text-4xl font-black tracking-tight sm:text-6xl mb-6">
                    Şeffaflık Bizim <span className="text-blue-600">DNA'mızda Var.</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
                    E-ticaret girişimcilerinin "Ciro çok ama para nerede?" sorusunu sonsuza dek ortadan kaldırmak için buradayız.
                </p>
            </div>
            
            {/* Arkaplan Süsü */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10"></div>
        </section>

        {/* HİKAYEMİZ */}
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">Hikayemiz</h2>
                    <div className="space-y-6 text-gray-600 font-medium leading-relaxed">
                        <p>
                            Her şey basit bir gözlemle başladı: Binlerce e-ticaret satıcısı harika satış rakamlarına ulaşıyor ancak günün sonunda banka hesaplarında bekledikleri artışı göremiyordu.
                        </p>
                        <p>
                            Sorun satış yapmak değil, <strong>kârı yönetmekti.</strong> Gizli platform komisyonları, gözden kaçan iade maliyetleri ve verimsiz reklam harcamaları, kârı sessizce eritiyordu.
                        </p>
                        <p>
                            Prificient, bu görünmeyen giderleri görünür kılmak için doğdu. Biz sadece bir muhasebe yazılımı değiliz; biz sizin dijital CFO'nuz (Finans Direktörü) olmayı hedefleyen bir veri analiz platformuyuz.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* DEĞERLERİMİZ */}
        <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black mb-4">Değerlerimiz</h2>
                    <p className="text-gray-500">Bizi biz yapan prensipler.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100 hover:border-blue-200 transition-colors">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                            <Target size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Gerçekçilik</h3>
                        <p className="text-gray-600 text-sm font-medium">
                            Sizi mutlu edecek yalanlar yerine, işletmenizi büyütecek acı gerçekleri (net kârı) gösteririz.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition-colors">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Güvenlik</h3>
                        <p className="text-gray-600 text-sm font-medium">
                            Finansal verileriniz bizim için kutsaldır. En üst düzey şifreleme ile korunur ve asla satılmaz.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-purple-50/50 border border-purple-100 hover:border-purple-200 transition-colors">
                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                            <Heart size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Satıcı Dostu</h3>
                        <p className="text-gray-600 text-sm font-medium">
                            Karmaşık finansal terimlerden arındırılmış, herkesin anlayabileceği sade bir dil kullanırız.
                        </p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}