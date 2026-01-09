import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import AIChatInterface from '@/components/AIChatInterface'

export default async function AIAssistantPage() {
  const supabase = await createClient()

  // 1. Kullanıcıyı Sunucuda Doğrula
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 2. Profesyonel Header'ı Buraya Koy */}
      <DashboardHeader userEmail={user.email || ''} />

      {/* 3. Chat Arayüzünü Yükle */}
      <AIChatInterface />
    </div>
  )
}