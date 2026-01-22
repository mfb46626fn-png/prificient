import { createAdminClient } from '@/lib/supabase-admin';
import Link from 'next/link';
import {
    Eye,
    Shield,
    ShieldAlert,
    User,
    Search,
    MoreHorizontal,
    Filter,
    ArrowUpDown
} from 'lucide-react';
import ImpersonateButton from './ImpersonateButton';
import Image from 'next/image';

// Server Component with Search Params
export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: { q?: string; status?: string; sort?: string }
}) {
    const supabaseAdmin = createAdminClient();
    const query = searchParams.q?.toLowerCase() || '';

    // List users (Pagination TODO for v2, listing all for MVP)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        return <div className="p-8 text-red-600">Error loading users: {error.message}</div>;
    }

    // Filter Logic
    let filteredUsers = users.filter(user => {
        const email = user.email?.toLowerCase() || '';
        const id = user.id.toLowerCase();
        // naive search
        return email.includes(query) || id.includes(query);
    });

    // Sort Logic
    // Default: Created At Desc
    filteredUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kullanıcı Yönetimi</h1>
                    <p className="text-slate-500 text-sm">Toplam {filteredUsers.length} kullanıcı (Filtrelenen)</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
                        <ArrowUpDown size={16} />
                        Sırala
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
                        + Kullanıcı Ekle
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <form>
                        <input
                            name="q"
                            defaultValue={searchParams.q}
                            placeholder="İsim, e-posta veya ID ile ara..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        />
                    </form>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                        <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-8 cursor-pointer hover:bg-gray-100 transition-colors">
                            <option>Tüm Durumlar</option>
                            <option>Aktif</option>
                            <option>Yasaklı</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Kullanıcı</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Son Görülme</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => {
                                const role = user.app_metadata?.role || user.user_metadata?.role || 'user';
                                const isAdmin = role === 'prificient_admin' || role === 'admin';
                                const isBanned = !!user.banned_until;

                                return (
                                    <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm border ${isAdmin ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                                                    {isAdmin ? <Shield size={18} /> : (user.email?.[0].toUpperCase() || 'U')}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-900 truncate">{user.email}</div>
                                                    <div className="text-xs text-gray-400 font-mono truncate max-w-[150px]">{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isBanned ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                    Yasaklı
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                    Aktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-1 rounded border ${isAdmin ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                {role === 'prificient_admin' ? 'Admin' : 'Kullanıcı'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isAdmin && (
                                                    <ImpersonateButton userId={user.id} userEmail={user.email} />
                                                )}
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                                    title="Detayları Yönet"
                                                >
                                                    <MoreHorizontal size={20} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search size={48} className="text-gray-200 mb-4" />
                                            <p className="text-lg font-medium text-gray-900">Sonuç Bulunamadı</p>
                                            <p className="text-sm text-gray-400">"{query}" araması için kayıt yok.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simple Pagination Footer (Static for now) */}
            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                <p>1 - {filteredUsers.length} arası gösteriliyor</p>
                <div className="flex gap-2">
                    <button disabled className="px-3 py-1 border rounded bg-gray-50 text-gray-300">Önceki</button>
                    <button disabled className="px-3 py-1 border rounded bg-gray-50 text-gray-300">Sonraki</button>
                </div>
            </div>
        </div>
    );
}
