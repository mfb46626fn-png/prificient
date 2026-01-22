import { createAdminClient } from '@/lib/supabase-admin';
import Link from 'next/link';
import {
    ChevronLeft,
    Mail,
    Calendar,
    DollarSign,
    Shield,
    History,
    FileText,
    MessageSquare,
    RefreshCw
} from 'lucide-react';
import ImpersonateButton from '../ImpersonateButton';

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
    const supabaseAdmin = createAdminClient();
    const { id } = params;

    // Fetch User Profile & Metadata
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(id);

    if (error || !user) {
        return <div>User not found</div>;
    }

    // Fetch Financial Logs (Mocked DB call for now until table confirmed)
    // const { data: events } = await supabaseAdmin.from('financial_event_log').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(50);
    const events: any[] = []; // Placeholder

    // Fetch Tickets
    const { data: tickets } = await supabaseAdmin.from('support_tickets').select('*').eq('user_id', id).order('created_at', { ascending: false });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb & Header */}
            <div>
                <Link href="/admin/users" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
                    <ChevronLeft size={16} />
                    Kullanıcı Listesine Dön
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold shadow-inner">
                            {(user.email?.[0].toUpperCase() || 'U')}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.email}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1.5"><Shield size={14} /> ID: {user.id}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> Kayıt: {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded text-xs font-bold uppercase border border-indigo-100">Pro Plan</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded text-xs font-bold uppercase border border-emerald-100">Aktif</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <ImpersonateButton userId={user.id} userEmail={user.email} />
                        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
                            Şifre Sıfırla
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Financial Events Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <History size={20} className="text-indigo-500" />
                                Finansal Event Geçmişi (Ledger)
                            </h2>
                            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                                <RefreshCw size={14} /> Yenile
                            </button>
                        </div>
                        <div className="p-0">
                            {events && events.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Event ID</th>
                                            <th className="px-6 py-3 text-left">Tarih</th>
                                            <th className="px-6 py-3 text-left">İşlem</th>
                                        </tr>
                                    </thead>
                                    {/* Map events here */}
                                </table>
                            ) : (
                                <div className="p-12 text-center text-gray-400">
                                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>Henüz finansal işlem kaydı yok.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support Tickets Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare size={20} className="text-orange-500" />
                                Destek Talepleri
                            </h2>
                        </div>
                        <div className="p-0">
                            {tickets && tickets.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {tickets.map((t: any) => (
                                        <Link key={t.id} href={`/admin/support/${t.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-900">{t.subject}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${t.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{t.status}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleDateString()}</div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400">Talebi yok.</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar Column (1/3) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Shopify Bağlantısı</h3>
                        <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg border border-green-100">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-bold text-sm">Bağlı</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 space-y-2">
                            <p><strong>Store:</strong> prificient-demo.myshopify.com</p>
                            <p><strong>Token:</strong> shpat_********</p>
                            <p><strong>Scope:</strong> read_orders, read_products</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Risk Analizi</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Risk Skoru:</span>
                            <span className="font-bold text-gray-900">Düşük</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full w-[10%]"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
