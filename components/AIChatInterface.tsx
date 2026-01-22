'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Bot, User, Loader2, BrainCircuit, ArrowRight } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import ReactMarkdown from 'react-markdown'
import FinancialChart from '@/components/ai/FinancialChart'

export default function AIChatInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Vercel AI SDK Hook - Cast to any to bypass version mismatch type errors
  const { messages, setMessages, regenerate, status } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Merhaba! Ben Prificient AI. Mağazanla ilgili finansal verileri, kararlarını ve ürün performanslarını inceledim. "Bu ayki kârım ne kadar?" gibi sorular sorabilirsin.'
      }
    ],
    onError: (error: any) => {
      console.error('AI Error:', error)
    }
  } as any) as any

  // Derived loading state
  const isLoading = status === 'streaming' || status === 'submitted'

  // Manual Input State Management
  const [input, setInput] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  // 1. Load History on Mount
  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('prificient-chat-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initial welcome message or replace? 
          // Replacing is better to restore exact state.
          // But if history is empty/corrupt, we keep default.
          setMessages(parsed)
        }
      } catch (e) {
        console.error("Chat history parse error:", e)
      }
    }
  }, [setMessages])

  // 2. Save History on Change
  useEffect(() => {
    if (isMounted && messages.length > 0) {
      localStorage.setItem('prificient-chat-history', JSON.stringify(messages))
    }
  }, [messages, isMounted])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const newMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }

    // Update local state immediately
    const newMessages = [...messages, newMessage]
    setMessages(newMessages)
    setInput('')

    try {
      await regenerate()
    } catch (err) {
      console.error("Regenerate failed", err)
    }
  }

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <>
      {/* 1. TETİKLEYİCİ BUTON - Fixed Bottom Right */}
      {!isOpen && (
        <div className="fixed bottom-28 right-8 z-[9990] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/20"
          >
            <BrainCircuit size={32} className="text-white animate-pulse" />

            {/* Tooltip */}
            <span className="absolute right-full mr-4 bg-indigo-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              Finansal Asistan
            </span>
          </button>
        </div>
      )}

      {/* 2. MODAL EKRAN */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">

          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-300 border border-indigo-50">

            {/* HEADER */}
            <div className="bg-white/95 backdrop-blur-sm p-6 flex justify-between items-center absolute top-0 w-full z-10 border-b border-indigo-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">Finansal Asistan</h1>
                  <p className="text-gray-500 font-medium text-xs">Verilere dayalı stratejik yorumcu</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-red-50 rounded-xl transition-colors text-gray-400 hover:text-red-500 group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* MESAJ ALANI */}
            <div className="flex-1 overflow-y-auto p-8 pt-32 pb-32 space-y-8 bg-gray-50/50 scroll-smooth">
              {messages.map((msg: any) => {
                // Fallback content logic for robust rendering
                const displayContent = msg.content
                  || (msg.parts && msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(''))
                  || '';

                return (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${msg.role === 'assistant'
                      ? 'bg-indigo-600 text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-200'
                      }`}>
                      {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                    </div>

                    {/* Baloncuk Content Container */}
                    <div className={`max-w-[80%] space-y-3`}>
                      {/* Text Bubble */}
                      {displayContent && (
                        <div className={`p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                          ? 'bg-black text-white rounded-tr-none'
                          : 'bg-white border border-indigo-50 text-gray-800 rounded-tl-none'
                          }`}>
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              strong: ({ node, ...props }) => <span className="font-bold text-indigo-600" {...props} />,
                              a: ({ node, href, children, ...props }) => {
                                // Check for both absolute and relative path versions
                                if (href === '../connect/shopify' || href === '/connect/shopify') {
                                  return (
                                    <a href={href} className="block mt-4 mb-2 group text-decoration-none" {...props}>
                                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-between text-white border border-white/10">
                                        <span className="flex items-center gap-3">
                                          <span className="bg-white/20 p-2 rounded-lg flex items-center justify-center">
                                            <Sparkles size={20} className="text-white animate-pulse" />
                                          </span>
                                          <span className="flex flex-col">
                                            <span className="font-bold text-sm">Mağazanızı Bağlayın</span>
                                            <span className="text-xs text-indigo-100 opacity-90">Verileri görmek için kurulumu tamamlayın</span>
                                          </span>
                                        </span>
                                        <span className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 group-hover:bg-indigo-50 transition-colors">
                                          Bağla <ArrowRight size={12} />
                                        </span>
                                      </span>
                                    </a>
                                  )
                                }
                                return <a href={href} className="text-blue-600 underline hover:text-blue-800" {...props}>{children}</a>
                              }
                            }}
                          >
                            {displayContent}
                          </ReactMarkdown>

                          {/* Timestamp Mock */}
                          <div className={`text-[10px] mt-3 font-bold opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      )}

                      {/* Generative UI (Tool Results) */}
                      {msg.toolInvocations?.map((toolInvocation: any) => {
                        const { toolName, toolCallId, state } = toolInvocation;

                        if (state === 'result') {
                          const { result } = toolInvocation;

                          // Case: Financial Query with Chart Data
                          if (toolName === 'query_financial_ledger') {
                            if (result.groupBy && (result.groupBy === 'day' || result.groupBy === 'month') && result.data && result.data.length > 0) {
                              return (
                                <div key={toolCallId} className="bg-white p-4 rounded-xl shadow-lg border border-indigo-50">
                                  <FinancialChart
                                    data={result.data}
                                    title={`${result.metric} Trendi (${result.groupBy === 'day' ? 'Günlük' : 'Aylık'})`}
                                    type="area"
                                    currency="TRY"
                                  />
                                </div>
                              );
                            }
                            return null;
                          }

                          // Case: Anomalies
                          if (toolName === 'detect_anomalies' && result.count > 0) {
                            return (
                              <div key={toolCallId} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-sm text-rose-700 font-bold mb-2 flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                  {result.count} Anomali Tespit Edildi
                                </div>
                              </div>
                            )
                          }
                        }

                        // Loading State for Tools
                        if (state === 'call') {
                          return (
                            <div key={toolCallId} className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-xs text-indigo-600 font-bold animate-pulse flex items-center gap-2 w-fit">
                              <Loader2 size={14} className="animate-spin" /> Veriler analiz ediliyor...
                            </div>
                          )
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center"><Bot size={20} /></div>
                  <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-indigo-50 shadow-sm flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-indigo-600" />
                    <span className="text-sm font-bold text-gray-500">Yanıt yazılıyor...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT ALANI */}
            <div className="absolute bottom-0 w-full bg-white p-6 border-t border-indigo-50/50 backdrop-blur-xl">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-3">

                <input
                  type="text"
                  placeholder="Mağazan hakkında bir soru sor..."
                  className="w-full bg-gray-50 pl-6 pr-16 py-5 rounded-2xl text-base font-medium text-gray-900 outline-none focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all border-2 border-transparent focus:border-indigo-100 placeholder:text-gray-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-3 p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${(!input.trim() || isLoading)
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-md active:scale-95'
                    }`}
                >
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                </button>

              </form>
              <div className="text-center mt-3">
                <p className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">
                  AI, finansal verilerinize dayanarak cevap verir.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}