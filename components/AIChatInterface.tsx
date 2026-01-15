'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Bot, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import ReactMarkdown from 'react-markdown'

type Message = {
  role: 'user' | 'ai'
  content: string
}

export default function AIChatInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Merhaba. Finansal durumunu analiz etmek için hazırım. "Durumum ne?" veya "Plan yap" diyebilirsin.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0) 

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || cooldown > 0) return

    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    setCooldown(3) 

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı oturumu yok')

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, user_id: user.id })
      })
      
      const data = await res.json()
      
      if (data.output) {
        setMessages(prev => [...prev, { role: 'ai', content: data.output }])
      } else {
        throw new Error('Yanıt alınamadı')
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'ai', content: 'Bağlantı hatası. Tekrar dene.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 1. TETİKLEYİCİ BUTON - YUKARI TAŞINDI & SİYAH OLDU */}
      {/* 'bottom-32' ile Bug Report butonunun üzerine çıkardık */}
      {!isOpen && (
        <div className="fixed bottom-32 right-6 z-[9990] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 bg-black hover:bg-zinc-800 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 border border-zinc-800"
          >
            <Sparkles size={24} className="text-white animate-pulse" />
            
            {/* Tooltip */}
            <span className="absolute right-full mr-4 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-800">
              AI Asistan
            </span>
          </button>
        </div>
      )}

      {/* 2. MODAL EKRAN - SİYAH TEMA */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-300 border border-zinc-200">
            
            {/* HEADER - Siyah */}
            <div className="bg-black text-white p-5 flex justify-between items-center absolute top-0 w-full z-10 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Prificient AI</h3>
                  <p className="text-xs text-zinc-400 font-medium">Finansal Strateji</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* MESAJ ALANI */}
            <div className="flex-1 overflow-y-auto p-6 pt-24 pb-28 space-y-6 bg-gray-50 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'ai' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'}`}>
                    {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
                  </div>

                  {/* Baloncuk */}
                  <div className={`max-w-[75%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-zinc-200 text-gray-900 rounded-tr-none' // User: Gri
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none' // AI: Beyaz/Klasik
                  }`}>
                    <ReactMarkdown
                       components={{
                         p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                         ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                         li: ({node, ...props}) => <li className="mb-1" {...props} />,
                         strong: ({node, ...props}) => <span className="font-semibold text-black" {...props} />
                       }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {loading && (
                 <div className="flex gap-4 animate-pulse">
                    <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center"><Bot size={18} /></div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                       <span className="text-sm font-medium text-gray-500">Analiz ediliyor...</span>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT ALANI */}
            <div className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-100">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center gap-3">
                
                <input
                  type="text"
                  placeholder={cooldown > 0 ? `${cooldown}sn bekle...` : "Bir soru sor..."}
                  className="w-full bg-gray-100 text-gray-900 placeholder:text-gray-400 px-5 py-4 pr-14 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all border border-transparent focus:border-gray-200"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading || cooldown > 0} 
                />
                
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading || cooldown > 0}
                  className={`absolute right-2 p-2.5 rounded-lg transition-all duration-300 flex items-center justify-center ${
                    (!input.trim() || loading || cooldown > 0)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-zinc-800 hover:scale-105 shadow-lg'
                  }`}
                >
                  {cooldown > 0 ? (
                    <span className="font-bold text-xs w-5 h-5 flex items-center justify-center">{cooldown}</span>
                  ) : (
                    <Send size={18} />
                  )}
                </button>

              </form>
            </div>

          </div>
        </div>
      )}
    </>
  )
}