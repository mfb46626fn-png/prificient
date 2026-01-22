'use client'

import { useState, useEffect } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import { Plus, FileText, Trash2, BarChart3, ChevronRight, Loader2, Download } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import ReportBuilder, { ReportConfig } from '@/components/ReportBuilder'
import { useRouter } from 'next/navigation'
import { exportToExcel } from '@/lib/excel-export'
import { getTransactions } from '@/app/actions/transaction'
import { useToast } from '@/components/ui/toast'

export default function ReportsClient() {
    const [isBuilderOpen, setIsBuilderOpen] = useState(false)
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const { showToast } = useToast()
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data } = await supabase
            .from('custom_reports')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setReports(data)
        setLoading(false)
    }

    const handleSaveReport = async (title: string, config: ReportConfig) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('custom_reports').insert({
            user_id: user.id,
            title,
            config
        })

        if (!error) {
            fetchReports()
            setIsBuilderOpen(false)
            showToast({ type: 'success', title: 'Başarılı', message: 'Rapor başarıyla oluşturuldu.' })
        } else {
            console.error('Report Save Error:', error)
            showToast({ type: 'error', title: 'Kaydedilemedi', message: 'Rapor veritabanına kaydedilemedi.' })
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()

        // Custom Confirmation Logic
        if (deleteConfirmId !== id) {
            setDeleteConfirmId(id)
            // Auto reset after 3 seconds
            setTimeout(() => setDeleteConfirmId(null), 3000)
            return
        }

        const { error } = await supabase.from('custom_reports').delete().eq('id', id)
        if (!error) {
            setReports(prev => prev.filter(r => r.id !== id))
            showToast({ type: 'success', message: 'Rapor başarıyla silindi.' })
        } else {
            showToast({ type: 'error', message: 'Silme işlemi sırasında hata oluştu.' })
        }
        setDeleteConfirmId(null)
    }

    const handleExport = async (report: any, e: React.MouseEvent) => {
        e.stopPropagation()

        try {
            const { data, error } = await getTransactions(report.config)

            if (error) {
                showToast({ type: 'error', title: 'Veri Hatası', message: error })
                return
            }

            if (!data || data.length === 0) {
                showToast({ type: 'warning', title: 'Veri Bulunamadı', message: 'Rapor kriterlerine uygun finansal kayıt bulunamadı.' })
                return
            }

            // Calculate Summaries
            const totalRevenue = data
                .filter((t: any) => t.type === 'income')
                .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

            const totalExpense = data
                .filter((t: any) => t.type === 'expense')
                .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

            const summary = {
                totalRevenue: report.config.type !== 'expense' ? totalRevenue : undefined,
                totalExpense: report.config.type !== 'revenue' ? totalExpense : undefined,
                netProfit: report.config.type === 'profit' ? (totalRevenue - totalExpense) : undefined
            }

            await exportToExcel(data, report.title, {
                range: report.config.range,
                type: report.config.type,
                summary
            })

            showToast({ type: 'info', title: 'İndiriliyor', message: 'Excel dosyanız hazırlanıyor...' })

        } catch (error) {
            console.error('Export Failed:', error)
            showToast({ type: 'error', title: 'Sistem Hatası', message: 'Rapor oluşturulurken beklenmedik bir hata oluştu.' })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <DashboardHeader />

            <main className="max-w-5xl mx-auto px-4 pt-10">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Rapor Merkezi</h1>
                        <p className="text-gray-500 font-medium">Finansal verilerinizi özelleştirin ve takip edin.</p>
                    </div>
                    {!isBuilderOpen && (
                        <button
                            onClick={() => setIsBuilderOpen(true)}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
                        >
                            <Plus size={20} /> Yeni Rapor
                        </button>
                    )}
                </div>

                {isBuilderOpen ? (
                    <ReportBuilder onSave={handleSaveReport} onCancel={() => setIsBuilderOpen(false)} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            <div className="col-span-2 text-center py-20 text-gray-400">
                                <Loader2 className="animate-spin mx-auto mb-2" />
                                Raporlar yükleniyor...
                            </div>
                        ) : reports.length > 0 ? (
                            reports.map((report) => (
                                <div key={report.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors"></div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-gray-100 rounded-2xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                <BarChart3 size={24} />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => handleExport(report, e)} className="p-2 text-gray-300 hover:text-emerald-600 transition-colors" title="Excel Olarak İndir"><Download size={18} /></button>
                                                <button
                                                    onClick={(e) => handleDelete(report.id, e)}
                                                    className={`p-2 transition-all duration-300 ${deleteConfirmId === report.id ? 'text-white bg-rose-500 rounded-xl shadow-lg shadow-rose-200' : 'text-gray-300 hover:text-rose-500'}`}
                                                    title={deleteConfirmId === report.id ? "Silmek için tekrar tıkla" : "Sil"}
                                                >
                                                    {deleteConfirmId === report.id ? <Trash2 size={18} className="fill-current animate-pulse" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{report.title}</h3>
                                        <div className="flex gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                            <span>{report.config.type === 'revenue' ? 'Gelir' : 'Gider'}</span>
                                            <span>•</span>
                                            <span>{report.config.range}</span>
                                        </div>

                                        <div className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            Raporu Görüntüle <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 border-dashed">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz Rapor Yok</h3>
                                <p className="text-gray-500 font-medium mb-6">İlk özel raporunu oluşturarak verilerini analiz etmeye başla.</p>
                                <button
                                    onClick={() => setIsBuilderOpen(true)}
                                    className="text-black font-bold hover:underline"
                                >
                                    Rapor Oluştur
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
