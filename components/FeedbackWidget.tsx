'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageSquarePlus, X, Send, Loader2, Bug, Lightbulb, MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function FeedbackWidget() {
  const supabase = createClient()
  const pathname = usePathname() 

  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<'bug' | 'feature' | 'other'>('bug')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        type,
        message,
        page_url: pathname
      })

      if (!error) {
        setSent(true)
        setTimeout(() => {
          setSent(false)
          setIsOpen(false)
          setMessage('')
          setType('bug')
        }, 2500)
      } else {
        alert('Bir hata oluştu.')
      }
    }
    setSending(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* FORM PENCERESİ */}
      {isOpen && (
        <div className="mb-4 w-[340px] bg-white rounded-[1.5rem] shadow-2xl shadow-black/20 border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 origin-bottom-right">
          
          {/* Header - TEMİZ TASARIM */}
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center select-none">
            <div>
                <h3 className="text-gray-900 font-black text-lg tracking-tight flex items-center gap-2">
                Geri Bildirim
                </h3>
                <p className="text-gray-400 text-xs font-medium mt-0.5">Fikriniz bizim için değerli.</p>
            </div>
            <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <X size={18}/>
            </button>
          </div>

          {sent ? (
            <div className="p-10 text-center select-none">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <Send size={28}/>
              </div>
              <h4 className="font-black text-gray-900 text-lg">İletildi!</h4>
              <p className="text-sm text-gray-500 mt-1">Geri bildiriminiz için teşekkürler.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Tip Seçici - SEGMENTED CONTROL */}
              <div className="flex bg-gray-100 p-1.5 rounded-2xl select-none">
                <button type="button" onClick={() => setType('bug')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${type === 'bug' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Bug size={14}/> Hata
                </button>
                <button type="button" onClick={() => setType('feature')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${type === 'feature' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Lightbulb size={14}/> Öneri
                </button>
                <button type="button" onClick={() => setType('other')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${type === 'other' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}>
                  <MessageCircle size={14}/> Diğer
                </button>
              </div>

              {/* Mesaj Alanı */}
              <div className="relative">
                <textarea 
                    className="w-full h-32 bg-gray-50 border-2 border-transparent rounded-2xl p-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-black/10 resize-none transition-all placeholder:text-gray-400"
                    placeholder={type === 'bug' ? 'Hangi sayfada, nasıl bir hata aldınız?' : 'Aklınızdaki harika fikir nedir?'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              {/* Gönder Butonu */}
              <button 
                type="submit" 
                disabled={!message.trim() || sending}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-black/10"
              >
                {sending ? <Loader2 className="animate-spin" size={18}/> : <>Gönder <Send size={16}/></>}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TETİKLEYİCİ BUTON (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 border-4 border-white ${isOpen ? 'bg-gray-100 text-black rotate-90' : 'bg-black text-white'}`}
      >
        {isOpen ? <X size={24}/> : <MessageSquarePlus size={24}/>}
      </button>

    </div>
  )
}