import { createAdminClient } from '@/lib/supabase-admin';
import {
    Users,
    CreditCard,
    Activity,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// --- Components ---
const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
            </div>
            {change && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change}
                </div>
            )}
        </div>
        <div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">{value}</p>
        </div>
    </div>
);

const SectionHeader = ({ title, action }: any) => (
    <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {action}
    </div>
);

export default async function AdminDashboard() {
    const supabaseAdmin = createAdminClient();

    // 1. Fetch Key Metrics
    // User Count
    // const { count: userCount } = await supabaseAdmin.from('auth.users').select('*', { count: 'exact', head: true });
    // Use listUsers for reliability with Admin API
    const { data: { users: recentUsers } } = await supabaseAdmin.auth.admin.listUsers();

    // Support Tickets
    const { count: pendingTickets } = await supabaseAdmin.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open');

    // 2. Fetch Real Activity Feed
    // A. New Users
    const latestUsers = recentUsers.slice(0, 5).map(u => ({
        type: 'user',
        id: u.id,
        message: `Yeni üyelik: ${u.email}`,
        created_at: u.created_at
    }));

    // B. New Tickets (Mixed with users)
    const { data: recentTickets } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    const ticketActivities = (recentTickets || []).map(t => ({
        type: 'ticket',
        id: t.id,
        message: `Yeni Destek Talebi: ${t.subject}`,
        created_at: t.created_at
    }));

    // Merge and Sort
    const activities = [...latestUsers, ...ticketActivities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    // Dynamic MRR (Estimate)
    const estimatedMRR = (recentUsers.length * 1500).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Genel Bakış</h1>
                    <p className="text-slate-500">Sistem durumu ve kritik metrikler.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                        Sistem Operasyonel
                    </span>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tahmini Ciro (MRR)"
                    value={estimatedMRR}
                    change="Otomatik"
                    trend="up"
                    icon={CreditCard}
                    color="bg-indigo-600 text-indigo-600"
                />
                <StatCard
                    title="Aktif Kullanıcı"
                    value={recentUsers.length || 0}
                    change="Canlı"
                    trend="up"
                    icon={Users}
                    color="bg-blue-500 text-blue-600"
                />
                <StatCard
                    title="Bekleyen Talepler"
                    value={pendingTickets || 0}
                    change={pendingTickets && pendingTickets > 0 ? "İşlem Bekliyor" : "Temiz"}
                    trend={pendingTickets && pendingTickets > 0 ? "down" : "up"}
                    icon={AlertCircle}
                    color={pendingTickets && pendingTickets > 0 ? "bg-rose-500 text-rose-600" : "bg-emerald-500 text-emerald-600"}
                />
                <StatCard
                    title="Sunucu Durumu"
                    value="Normal"
                    trend="up"
                    icon={Activity}
                    color="bg-emerald-500 text-emerald-600"
                />
            </div>

            {/* Middle Section: Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto">

                {/* Son Kullanıcılar (2/3 Width) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <Users size={18} className="text-gray-400" />
                            Son Katılanlar
                        </h2>
                        <Link href="/admin/users" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Tümünü Gör</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Kullanıcı</th>
                                    <th className="px-6 py-3 font-medium">Tarih</th>
                                    <th className="px-6 py-3 font-medium text-right">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentUsers.slice(0, 5).map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                    {(u.email || 'U')[0].toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Aktif
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Son Aktiviteler (1/3 Width) */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full lg:h-auto">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <Activity size={18} className="text-gray-400" />
                            Canlı Akış
                        </h2>
                    </div>
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[400px]">
                        {activities.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center">Henüz aktivite yok.</p>
                        ) : (
                            activities.map((act, i) => (
                                <div key={act.id + i} className="flex gap-4 relative">
                                    {/* Timeline Line */}
                                    {i !== activities.length - 1 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gray-100"></div>}

                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${act.type === 'ticket' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                                        <div className={`w-2 h-2 rounded-full ${act.type === 'ticket' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-900 font-medium">{act.message}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(act.created_at).toLocaleString('tr-TR')}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
