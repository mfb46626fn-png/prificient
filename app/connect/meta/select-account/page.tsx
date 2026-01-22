'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, CheckCircle, AlertCircle, LayoutDashboard } from 'lucide-react'
import { saveAccountSelection, getIntegrationAndAccounts } from './actions'

interface AdAccount {
    id: string
    name: string
    currency: string
    status: number // 1=ACTIVE, 2=DISABLED, etc.
}

export default function MetaAccountSelectionPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [accounts, setAccounts] = useState<AdAccount[]>([])
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push('/login')

            try {
                // Fetch accounts via Server Action
                const res = await getIntegrationAndAccounts()
                if (res.error) throw new Error(res.error)

                setAccounts(res.accounts || [])
            } catch (err: any) {
                setError(err.message || 'Hesaplar yüklenirken hata oluştu.')
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    const handleSelect = async (accountId: string) => {
        setSaving(true)
        try {
            const res = await saveAccountSelection(accountId)
            if (res.error) throw new Error(res.error)

            router.push('/dashboard?success=meta_connected')
        } catch (err: any) {
            setError(err.message)
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-500 font-medium">Reklam hesaplarınız getiriliyor...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <LayoutDashboard className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Hangi Hesabı İzleyelim?</h1>
                    <p className="text-gray-500">Prificient'e bağlamak istediğiniz Meta Reklam Hesabını seçin.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p className="font-medium text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {accounts.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">Yönettiğiniz bir reklam hesabı bulunamadı.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {accounts.map((acc) => (
                                <button
                                    key={acc.id}
                                    onClick={() => handleSelect(acc.id)}
                                    disabled={saving}
                                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group disabled:opacity-50"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{acc.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{acc.id}</span>
                                            <span className="text-xs font-medium text-gray-400">{acc.currency}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all">
                                        <CheckCircle size={16} className="opacity-0 group-hover:opacity-100" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
