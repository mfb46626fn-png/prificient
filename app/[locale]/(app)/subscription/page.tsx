export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import PricingTable from '@/components/PricingTable'
import { Clock, AlertTriangle, CalendarDays } from 'lucide-react'

export default async function SubscriptionPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const now = new Date()
  const endDate = subscription ? new Date(subscription.trial_end_date) : new Date()
  const diffTime = endDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const isExpired = daysLeft <= 0 || subscription?.status === 'expired'

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12">
        
        {/* --- DÜZELTİLMİŞ TRIAL BANNER'I (LIGHT THEME) --- */}
        <div className={`relative overflow-hidden rounded-3xl border shadow-sm transition-all ${
          isExpired 
            ? 'bg-white border-red-100' 
            : 'bg-white border-gray-200'
        }`}>
          
          {/* Arkaplan Süslemesi (Çok hafif gri) */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gray-50 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* SOL: Metin Alanı */}
            <div className="flex-1 text-center md:text-left space-y-4">
              {/* Etiket */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isExpired 
                  ? 'bg-red-50 text-red-600 border border-red-100' 
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              }`}>
                {isExpired ? <AlertTriangle size={14} /> : <Clock size={14} />}
                {isExpired ? 'SÜRE DOLDU' : 'PRİFİCİENT DENEME SÜRÜMÜ'}
              </div>
              
              <div>
                {/* Başlık - KOYU RENK */}
                <h1 className="text-3xl sm:text-4xl font-black leading-tight text-gray-900">
                  {isExpired ? 'Deneme Süreniz Sona Erdi' : 'Prificient\'ı Ücretsiz Deniyorsunuz'}
                </h1>
                {/* Alt Metin - KOYU GRİ */}
                <p className="text-gray-500 mt-2 font-medium text-lg">
                  {isExpired 
                    ? 'Verilerinize erişmeye devam etmek için lütfen bir plan seçin.' 
                    : 'Tüm özelliklere tam erişiminiz var. Keyfini çıkarın!'}
                </p>
              </div>
            </div>

            {/* SAĞ: Sayaç Kutusu */}
            <div className={`flex items-center gap-6 p-5 rounded-2xl border ${
                isExpired ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
            }`}>
              {/* Gün Sayacı */}
              {!isExpired && (
                <div className="text-center px-4 border-r border-gray-200 pr-6">
                  <span className="block text-4xl font-black text-gray-900">{daysLeft}</span>
                  <span className="text-xs uppercase font-bold text-gray-400">Gün Kaldı</span>
                </div>
              )}
              
              {/* İkon */}
              <div className="hidden sm:block">
                 {isExpired 
                    ? <AlertTriangle size={32} className="text-red-500"/> 
                    : <CalendarDays size={32} className="text-blue-500"/>
                 }
              </div>
            </div>

          </div>
        </div>
        {/* --- BANNER SONU --- */}


        {/* --- BAŞLIK ALANI --- */}
        <div className="text-center max-w-2xl mx-auto pt-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">
            İşletmenizin İhtiyacına Uygun Planı Seçin
          </h2>
          <p className="text-gray-500 font-medium text-lg">
            İster yeni başlıyor olun, ister büyüyor olun; Prificient'ta size uygun bir yer var.
            İstediğiniz planı 14 gün ücretsiz denemeye hemen başlayın.
          </p>
        </div>

        {/* --- FİYATLANDIRMA TABLOSU --- */}
        <PricingTable />
        
      </main>
    </div>
  )
}