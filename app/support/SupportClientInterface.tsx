'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Send, MessageCircle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Ticket = {
    id: string;
    subject: string;
    status: string;
    created_at: string;
    updated_at: string;
    user_id: string;
};

type Message = {
    id: string;
    message: string;
    created_at: string;
    is_internal: boolean;
    user_id: string | null; // For admin messages it might only handle is_internal check? Need to verify schema usage.
};

export default function SupportClientInterface({ initialTickets, userId, userEmail }: { initialTickets: Ticket[], userId: string, userEmail?: string }) {
    const supabase = createClient();
    const router = useRouter();

    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTickets[0]?.id || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [isCreating, setIsCreating] = useState(false); // New ticket mode

    // New Ticket Form State
    const [newSubject, setNewSubject] = useState('');
    const [newTicketMessage, setNewTicketMessage] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages when ticket selected
    useEffect(() => {
        if (!selectedTicketId) return;
        setIsCreating(false);

        const fetchMessages = async () => {
            setLoadingMessages(true);
            const { data } = await supabase
                .from('support_messages')
                .select('*')
                .eq('ticket_id', selectedTicketId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
            setLoadingMessages(false);
            scrollToBottom();
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`ticket-${selectedTicketId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${selectedTicketId}` }, (payload) => {
                setMessages(current => [...current, payload.new as Message]);
                scrollToBottom();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [selectedTicketId, supabase]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicketId) return;

        setSending(true);
        try {
            const res = await fetch(`/api/support/${selectedTicketId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            });

            if (res.ok) {
                setNewMessage('');
                // Optimistic update handled by Subscription or refetch? Subscription handles it.
                // But for faster UI:
                const optimisticMsg: Message = {
                    id: Math.random().toString(),
                    message: newMessage,
                    created_at: new Date().toISOString(),
                    is_internal: false,
                    user_id: userId
                };
                setMessages(prev => [...prev, optimisticMsg]);
                scrollToBottom();
            } else {
                alert('Mesaj gönderilemedi');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubject.trim() || !newTicketMessage.trim()) return;

        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: newSubject,
                    message: newTicketMessage,
                    userEmail: userEmail // Pass explicitly just in case API needs it for email logic
                })
            });

            if (res.ok) {
                const { ticketId } = await res.json();
                setNewSubject('');
                setNewTicketMessage('');
                setIsCreating(false);
                // Refresh list
                const { data } = await supabase.from('support_tickets').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
                if (data) {
                    setTickets(data);
                    setSelectedTicketId(ticketId); // Switch to new ticket
                }
            } else {
                alert("Talep oluşturulamadı");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* LEFT SIDEBAR: LIST */}
            <div className="w-1/3 border-r border-gray-100 bg-gray-50/50 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="font-bold text-gray-900">Taleplerim</h2>
                    <button
                        onClick={() => { setIsCreating(true); setSelectedTicketId(null); }}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {tickets.length === 0 && !isCreating && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Henüz destek talebiniz yok.
                        </div>
                    )}
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors 
                                ${selectedTicketId === ticket.id ? 'bg-white border-l-4 border-l-black shadow-sm' : 'border-l-4 border-l-transparent'}
                            `}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full 
                                    ${ticket.status === 'open' ? 'bg-amber-100 text-amber-700' :
                                        ticket.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {ticket.status === 'open' ? 'Bekliyor' : ticket.status === 'answered' ? 'Yanıtlandı' : 'Kapalı'}
                                </span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {new Date(ticket.updated_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className={`font-semibold text-sm truncate ${selectedTicketId === ticket.id ? 'text-black' : 'text-gray-600'}`}>
                                {ticket.subject}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1 truncate">ID: #{ticket.id.slice(0, 8)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT MAIN: CHAT OR FORM */}
            <div className="flex-1 flex flex-col bg-white">
                {isCreating ? (
                    <div className="flex-1 p-8 flex flex-col items-center justify-center">
                        <div className="w-full max-w-md space-y-4">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold">Yeni Destek Talebi</h2>
                                <p className="text-sm text-gray-500">Sorununuzu detaylı bir şekilde anlatın.</p>
                            </div>
                            <form onSubmit={handleCreateTicket} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                                    <input
                                        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                                        placeholder="Örn: Ödeme sorunu"
                                        value={newSubject}
                                        onChange={e => setNewSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
                                    <textarea
                                        className="w-full border rounded-xl px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-black/5"
                                        placeholder="Detaylar..."
                                        value={newTicketMessage}
                                        onChange={e => setNewTicketMessage(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setIsCreating(false); setSelectedTicketId(tickets[0]?.id || null); }}
                                        className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                                    >
                                        Talebi Gönder
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : selectedTicketId ? (
                    <>
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white shadow-sm z-10">
                            <div>
                                <h2 className="font-bold text-lg">{tickets.find(t => t.id === selectedTicketId)?.subject}</h2>
                                <p className="text-xs text-gray-400">Ticket ID: {selectedTicketId}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            {loadingMessages ? (
                                <div className="flex justify-center py-10"><div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full"></div></div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.user_id === userId; // User messages have user_id = current user (usually)
                                    // Wait, admin replies usually have user_id as admin's UUID or NULL?
                                    // In `lib/support.ts`, replyToTicket (Admin) uses `params.userId` (which is Admin ID).
                                    // So `msg.user_id` will be Admin ID, which is != Current User ID.
                                    // So `isMe` logic: msg.user_id === userId.

                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe
                                                ? 'bg-black text-white rounded-br-none shadow-sm'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                                                }`}>
                                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                                <div className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-gray-300' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {!isMe && ' • Prificient Destek'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-50">
                            {tickets.find(t => t.id === selectedTicketId)?.status === 'closed' ? (
                                <div className="p-3 bg-gray-50 text-gray-500 text-sm text-center rounded-xl border border-gray-100">
                                    Bu destek talebi kapatılmıştır. Yeni bir talep oluşturabilirsiniz.
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="relative">
                                    <input
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                                        placeholder="Yanıtınızı yazın..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        className="absolute right-2 top-2 p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle size={48} className="mb-4 opacity-20" />
                        <p>Görüntülemek için bir talep seçin</p>
                    </div>
                )}
            </div>
        </div>
    );
}
