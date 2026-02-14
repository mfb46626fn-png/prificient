'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    ticket_id: string;
    user_id: string | null;
    message: string;
    created_at: string;
    is_internal: boolean;
}

export default function AdminChatInterface({ ticketId, initialMessages, adminId, userEmail, status: initialStatus, ticketOwnerId }: { ticketId: string, initialMessages: Message[], adminId: string, userEmail?: string, status: string, ticketOwnerId: string }) {
    const [status, setStatus] = useState(initialStatus);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempId = Math.random().toString();
        // Optimistic UI for Admin
        const optimisticMessage: Message = {
            id: tempId,
            ticket_id: ticketId,
            user_id: adminId, // Using admin ID
            message: newMessage,
            created_at: new Date().toISOString(),
            is_internal: false
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setSending(true);

        try {
            // Reusing the same API route, but we need to ensure the backend treats this as an admin reply.
            // Since we are likely calling this from a context where we might be authenticated as a user who IS an admin,
            // OR if this represents a separate Admin Panel App, we'd need a separate route.
            // However, to keep it simple and consistent with the "Single App" approach:
            // We'll call the SAME API route. The API route checks `user.app_metadata.role === 'prificient_admin'`.
            // So if you are logged in as admin in the browser, this works.

            const res = await fetch(`/api/support/${ticketId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: optimisticMessage.message }),
            });

            if (!res.ok) {
                console.error("Failed", res.status);
                alert('Mesaj gönderilemedi. Admin yetkiniz olduğundan emin olun.');
                setMessages(prev => prev.filter(m => m.id !== tempId));
            } else {
                router.refresh();
            }
        } catch (error) {
            alert('Bir hata oluştu');
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => {
                    // Logic: 
                    // If msg.user_id === ticketOwnerId -> It is the Customer -> LEFT (Gray)
                    // Else (Admin, System, etc.) -> It is Us -> RIGHT (Blue)

                    const isCustomer = msg.user_id === ticketOwnerId;
                    const isMe = !isCustomer; // "Me" as in "Admin/Support View"

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                <div className={`text-[10px] mb-1 font-bold opacity-80 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {isMe ? (msg.is_internal ? 'Gizli Not' : 'Destek Ekibi') : 'Kullanıcı'}
                                </div>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            {status !== 'closed' && (
                <div className="p-4 bg-white border-t flex justify-between items-center bg-gray-50/50">
                    <button
                        onClick={async () => {
                            if (!confirm('Talebi kapatmak istediğinize emin misiniz? Kullanıcı bilgilendirilecektir.')) return;
                            try {
                                const res = await fetch(`/api/support/${ticketId}/close`, { method: 'POST' });
                                if (res.ok) {
                                    setStatus('closed');
                                    router.refresh();
                                }
                            } catch (e) { alert('Hata oluştu'); }
                        }}
                        className="text-rose-600 text-xs font-bold hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors border border-rose-100"
                    >
                        Talebi Kapat
                    </button>
                    {/* Placeholder to push form to right if we wanted, but form is below */}
                </div>
            )}
            <div className="p-4 bg-white border-t">
                {status === 'closed' ? (
                    <div className="text-center text-gray-500 text-sm font-medium py-2 bg-gray-50 rounded-lg border border-gray-100">
                        Bu talep kapatılmıştır.
                    </div>
                ) : (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Yanıtınızı yazın (Kullanıcıya e-posta gider)..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            Gönder & E-Posta At
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
