'use client'

import { useState } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { getAIResponse } from '@/app/actions/chat'

export default function AIChatInterface() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: 'Merhaba! Ben finansal asistanın. Gelir giderlerini, kâr oranını analiz edebilirim. Ne sormak istersin?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setLoading(true)

    try {
      const aiReply = await getAIResponse(userMsg)
      setMessages((prev) => [...prev, { role: 'bot', content: aiReply }])
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', content: 'Bir hata oluştu.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    // Ana arka plan dark:bg-gray-900 olacak (Body'den geliyor ama garanti olsun)
    <div className="flex flex-col h-[calc(100vh-64px)]">
      
      {/* Mesaj Alanı */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-3xl gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-600 text-white'
                    }`}>
                        {msg.role === 'user' ? <User size={16} className="text-gray-600 dark:text-gray-300" /> : <Bot size={16} />}
                    </div>

                    <div className={`p-4 rounded-2xl text-base leading-7 ${
                        msg.role === 'user' 
                        ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm' 
                        : 'bg-transparent text-gray-900 dark:text-gray-100'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            </div>
        ))}
        {loading && (
             <div className="flex w-full justify-start">
                 <div className="flex max-w-3xl gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Bot size={16} />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 p-4">
                        <Loader2 className="animate-spin" size={20} /> Düşünüyor...
                    </div>
                 </div>
             </div>
        )}
      </div>

      {/* Input Alanı */}
      <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto relative">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Prificient AI'a bir soru sor..."
                className="w-full bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl px-6 py-4 pr-14 text-base text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none shadow-inner transition-colors"
            />
            <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
                <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  )
}