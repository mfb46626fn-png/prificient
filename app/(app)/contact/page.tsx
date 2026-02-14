'use client'

import LandingHeader from '@/components/LandingHeader'
import LandingFooter from '@/components/LandingFooter'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Buraya ileride API eklenebilir. Şimdilik simülasyon.
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <LandingHeader />

      <main className="py-24 lg:py-32">
        <div className="container mx-auto px-6">
            
            <div className="grid lg:grid-cols-2 gap-16 items-start">
                
                {/* SOL: BİLGİLER */}
                <div>
                    <h1 className="text-4xl font-black mb-6">İletişime Geçin</h1>
                    <p className="text-lg text-gray-600 mb-10 font-medium">
                        Sorularınız, önerileriniz veya sadece merhaba demek için bize ulaşın. Ekibimiz en geç 24 saat içinde dönüş yapar.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                                <Mail className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">E-Posta</h3>
                                <p className="text-gray-500 font-medium">destek@prificient.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                                <MapPin className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Ofis</h3>
                                <p className="text-gray-500 font-medium">Kolektif House, Levent<br/>İstanbul, Türkiye</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAĞ: FORM */}
                <div className="bg-gray-50 p-8 md:p-10 rounded-[2.5rem] border border-gray-100">
                    {submitted ? (
                        <div className="text-center py-20 animate-in fade-in zoom-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Mesajınız Alındı!</h3>
                            <p className="text-gray-600 font-medium">En kısa sürede size dönüş yapacağız.</p>
                            <button onClick={() => setSubmitted(false)} className="mt-8 text-sm font-bold text-blue-600 hover:underline">Yeni mesaj gönder</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Adınız Soyadınız</label>
                                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium" placeholder="Örn: Ahmet Yılmaz" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">E-Posta Adresi</label>
                                <input type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium" placeholder="ahmet@sirket.com" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Mesajınız</label>
                                <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium resize-none" placeholder="Size nasıl yardımcı olabiliriz?"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-95">
                                Gönder <Send size={18} />
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}