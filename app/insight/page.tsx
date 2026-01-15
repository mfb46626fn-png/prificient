'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import DashboardHeader from '@/components/DashboardHeader'
import { 
  Send, Sparkles, Bot, User, BrainCircuit, 
  ArrowRight, Loader2, TrendingUp, AlertTriangle
} from 'lucide-react'

// MESAJ TİPİ
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ÖRNEK SORULAR
const SUGGESTIONS = [
  "Son fiyat değişikliğim işe yaradı mı?",
  "Hangi ürünlerde zarar etme riskim var?",
  "Kargo maliyetlerim normale göre yüksek mi?",
  "Bu ayki kâr marjımı nasıl artırabilirim?"
]

export default function InsightPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Merhaba! Ben Prificient AI. Mağazanla ilgili finansal verileri, kararlarını ve ürün performanslarını inceledim. Bana "Neden kârım düştü?" veya "Hangi ürün riskli?" gibi sorular sorabilirsin.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Otomatik kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // --- AI CEVAP SİMÜLASYONU (MVP İÇİN) ---
  // Gerçek versiyonda burası n8n veya OpenAI API'ye gidecek.
  const generateResponse = async (question: string) => {
    setLoading(true)
    
    // 1. Kullanıcı mesajını ekle
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // 2. Veri Bağlamı Oluştur (Simüle)
    // Gerçekte: DB'den son verileri çekip prompte ekleyeceğiz.
    const { data: { user } } = await supabase.auth.getUser()
    
    setTimeout(() => {
      let aiResponse = "Bunu analiz etmem için biraz daha veriye ihtiyacım var."

      if (question.toLowerCase().includes('fiyat')) {
        aiResponse = "Son yaptığın fiyat değişikliklerini inceledim. 'Kedi Tarağı' ürününde yaptığın %10'luk artış, satış adedini %5 düşürse de toplam kârını %15 artırmış. Bu başarılı bir 'Karar' (Decision) örneği. Aynısını düşük marjlı diğer ürünlerinde de deneyebilirsin."
      } 
      else if (question.toLowerCase().includes('risk') || question.toLowerCase().includes('zarar')) {
        aiResponse = "Dikkatimi çeken bir risk var: 'Akıllı Matara' ürününün iade oranı sektör ortalamasının üzerinde görünüyor. Ayrıca bu üründeki reklam maliyetin (ROAS) düşüş eğiliminde. Bu ürünü ya optimize etmelisin ya da reklam bütçesini kısmalısın."
      }
      else if (question.toLowerCase().includes('kargo')) {
        aiResponse = "Kargo maliyetlerin toplam cironun %18'ine ulaşmış. İdeal e-ticaret senaryosunda bu oranın %10-12 bandında olması beklenir. Kargo anlaşmanı gözden geçirmeni öneririm."
      }
      else {
        aiResponse = "Şu an verilerini tarıyorum. Genel olarak mağazan sağlıklı görünüyor ancak 'Komisyon' giderlerin manuel girildiği için bazı sapmalar olabilir. Platform entegrasyonlarını kontrol etmeni öneririm."
      }

      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: aiResponse, 
        timestamp: new Date() 
      }
      
      setMessages(prev => [...prev, aiMsg])
      setLoading(false)
    }, 1500)
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return
    generateResponse(input)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 flex flex-col h-[calc(100vh-100px)]">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <BrainCircuit size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Finansal Asistan</h1>
                <p className="text-gray-500 font-medium text-sm">Verilere dayalı stratejik yorumcu.</p>
            </div>
        </div>

        {/* CHAT CONTAINER */}
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col relative">
            
            {/* MESAJ ALANI */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        
                        {/* AVATAR */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
                            {msg.role === 'assistant' ? <Bot size={20}/> : <User size={20}/>}
                        </div>

                        {/* BALONCUK */}
                        <div className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'assistant' 
                            ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
                            : 'bg-black text-white rounded-tr-none'
                        }`}>
                            {msg.content}
                            <div className={`text-[10px] mt-2 font-bold ${msg.role === 'assistant' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {msg.timestamp.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Bot size={20}/>
                        </div>
                        <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-tl-none flex items-center gap-2 text-sm text-gray-500 font-bold">
                            <Loader2 size={16} className="animate-spin"/>
                            Veriler taranıyor...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* SUGGESTIONS (Eğer sohbet boşsa veya azsa göster) */}
            {messages.length < 3 && !loading && (
                <div className="px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="flex gap-2">
                        {SUGGESTIONS.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => generateResponse(s)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-2"
                            >
                                <Sparkles size={12}/> {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* INPUT ALANI */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Mağazan hakkında bir soru sor..."
                        className="w-full pl-6 pr-14 py-4 bg-gray-50 rounded-2xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all border border-transparent focus:border-indigo-200"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || loading}
                        className="absolute right-2 p-3 bg-black text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <ArrowRight size={20}/>
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-400 font-bold">
                        AI, finansal verilerinize (Orders, Decisions) dayanarak cevap verir. Yatırım tavsiyesi değildir.
                    </p>
                </div>
            </div>

        </div>
      </main>
    </div>
  )
}