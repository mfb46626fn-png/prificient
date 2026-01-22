'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Clock, Filter } from 'lucide-react';

type Ticket = {
    id: string;
    subject: string;
    status: string;
    updated_at: string;
    user_id: string;
    // profiles?: { full_name: string, email: string } // If we fix the join
};

export default function AdminTicketList({ initialTickets }: { initialTickets: Ticket[] }) {
    const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all');

    // Custom sort: Open > Answered > Closed, then by date desc
    const sortedTickets = [...initialTickets].sort((a, b) => {
        const score = (status: string) => {
            if (status === 'open') return 3;
            if (status === 'answered') return 2;
            return 1;
        };
        const scoreA = score(a.status);
        const scoreB = score(b.status);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    const filteredTickets = sortedTickets.filter(t => filter === 'all' || t.status === filter);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Filter Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-2">
                {['all', 'open', 'answered', 'closed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filter === f
                                ? 'bg-white text-black shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        {f === 'all' ? 'Tümü' : f === 'open' ? 'Bekleyenler' : f === 'answered' ? 'Yanıtlananlar' : 'Kapalı'}
                        {f !== 'all' && <span className="ml-1 opacity-60">({initialTickets.filter(t => t.status === f).length})</span>}
                    </button>
                ))}
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-400 font-bold uppercase tracking-wider bg-gray-50">
                        <th className="px-6 py-4">Durum</th>
                        <th className="px-6 py-4">Konu</th>
                        <th className="px-6 py-4">Kullanıcı (ID)</th>
                        <th className="px-6 py-4">Son İşlem</th>
                        <th className="px-6 py-4 text-right">Eylem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                    {filteredTickets.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase tracking-wide rounded-full 
                                        ${ticket.status === 'open' ? 'bg-rose-100 text-rose-700' :
                                            ticket.status === 'answered' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-gray-100 text-gray-600'}`}>
                                        {ticket.status === 'open' ? 'Açık' : ticket.status === 'answered' ? 'Yanıtlandı' : 'Kapalı'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900">{ticket.subject}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">
                                    {ticket.user_id.slice(0, 8)}...
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400 flex items-center gap-1.5">
                                    <Clock size={14} /> {new Date(ticket.updated_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/admin/support/${ticket.id}`} className="inline-block bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-black px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                                        Yönet
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
