'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, Mail, Trash2, Loader2 } from 'lucide-react'
import { usePreferences } from '@/app/contexts/PreferencesContext'
import { createClient } from '@/utils/supabase/client'

export default function ProfileClient({ user }: { user: any }) {
    const router = useRouter()
    const { t } = usePreferences() // Çeviri desteği
    const [deleting, setDeleting] = useState(false)

    const handleDeleteAccount = async () => {
        if (!confirm(t.delete_confirm)) return

        setDeleting(true)
        const supabase = createClient()

        // Verileri sil ve çıkış yap
        await supabase.from('transactions').delete().eq('user_id', user.id)
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{t.profile}</h1>
                <p className="text-gray-500">Hesap bilgilerinizi yönetin.</p>
            </div>

            {/* Kişisel Bilgiler */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <UserIcon size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Kişisel Bilgiler</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                            <Mail size={16} />
                            <span>{user.email}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı ID</label>
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-xs font-mono truncate">
                            {user.id}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tehlikeli Bölge */}
            <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
                    <Trash2 size={18} className="text-red-600" />
                    <h3 className="font-semibold text-red-700">Tehlikeli Bölge</h3>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="font-medium text-gray-900">{t.delete_account}</h4>
                        <p className="text-sm text-red-600/80">
                            Bu işlem geri alınamaz.
                        </p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        {deleting && <Loader2 className="animate-spin" size={16} />}
                        {t.delete_account}
                    </button>
                </div>
            </div>
        </div>
    )
}