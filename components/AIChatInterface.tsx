'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Bot, User } from 'lucide-react'

type Message = {
  role: 'user' | 'ai'
  content: string
}

export default function AIChatInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Merhaba! Ben Prificient Asistan. Finansal durumunla ilgili ne bilmek istersin?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Otomatik kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })
      
      const data = await res.json()
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response }])
      } else {
        throw new Error('Yanıt alınamadı')
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen sonra tekrar dene.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-[9990] flex flex-col items-end pointer-events-none select-none">
      
      {/* CHAT PENCERESİ */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-auto">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Finansal Asistan</h3>
                <p className="text-[10px] text-indigo-100 opacity-80">GPT-4o tarafından desteklenmektedir</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Mesaj Alanı */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'}`}>
                  {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-black text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0"><Bot size={16} /></div>
                 <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Alanı */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Bir soru sor..."
                className="w-full bg-gray-100 text-gray-900 placeholder:text-gray-400 px-4 py-3.5 pr-12 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-300 transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </form>

        </div>
      )}

      {/* TETİKLEYİCİ BUTON (Feedback'in üzerinde duracak) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto group relative flex items-center justify-center"
      >
        <span className="absolute right-full mr-4 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          AI Asistan
        </span>
        <div className={`w-14 h-14 rounded-full shadow-[0_10px_30px_-5px_rgba(79,70,229,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 border-4 border-white ${isOpen ? 'bg-indigo-700 rotate-90' : 'bg-gradient-to-tr from-indigo-600 to-violet-600'}`}>
            {isOpen ? <X size={24} className="text-white"/> : <Sparkles size={24} className="text-white animate-pulse"/>}
        </div>
      </button>

    </div>
  )
}