'use client'

import { useState } from 'react'
import { X, UploadCloud, CheckCircle2, AlertCircle, Loader2, Bot } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  // 'type' prop'u artık n8n tarafında halledildiği için burada sadece görsel amaçlı kalabilir veya kaldırılabilir
  type?: 'income' | 'expense' 
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
  const supabase = createClient()
  
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  // Dosya Seçimi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus('idle')
      setErrorMessage('')
    }
  }

  // n8n'e (Proxy Üzerinden) Gönderim
  const handleUpload = async () => {
    if (!file) return

    setStatus('uploading')
    setErrorMessage('')

    try {
      // 1. Kullanıcı ID'sini al (Supabase Session)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setErrorMessage("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.")
        setStatus('error')
        return
      }

      // 2. Form Verisi Hazırla
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', user.id) // Otomasyonun kime kayıt atacağını bilmesi için

      // 3. Proxy API'ye Gönder (n8n'e köprü)
      const response = await fetch('/api/proxy-upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setStatus('success')
        setTimeout(() => {
            onSuccess() // Ana sayfayı yenile
            handleClose() // Modalı kapat
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Yükleme başarısız oldu.')
      }

    } catch (error: any) {
      console.error('Upload Error:', error)
      setErrorMessage(error.message || "Dosya işlenirken bir hata oluştu.")
      setStatus('error')
    }
  }

  const handleClose = () => {
    setFile(null)
    setStatus('idle')
    setErrorMessage('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Başlık */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Bot size={24} />
              </div>
              AI Destekli İçe Aktarım
            </h2>
            <p className="text-sm font-medium text-gray-400 mt-1 pl-1">
              Dosyanızı yükleyin, gerisini yapay zekaya bırakın.
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* İçerik */}
        <div className="p-8">
          
          {/* DURUM 1: Başarılı */}
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Harika! 🎉</h3>
                <p className="text-gray-500 font-medium">Verileriniz başarıyla analiz edildi ve işlendi.</p>
            </div>
          ) : (
            /* DURUM 2: Yükleme Ekranı */
            <div className="space-y-6">
                
                {/* Sürükle Bırak Alanı */}
                <div className={`relative flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-3xl transition-all duration-300 group ${
                    status === 'error' ? 'border-rose-200 bg-rose-50' : 
                    'border-gray-200 bg-gray-50/50 hover:bg-indigo-50/30 hover:border-indigo-300'
                }`}>
                    
                    <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileChange}
                        disabled={status === 'uploading'}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />

                    {status === 'uploading' ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                            <p className="font-bold text-gray-900">Yapay Zeka Analiz Ediyor...</p>
                            <p className="text-xs text-gray-400 mt-2">Bu işlem dosya boyutuna göre birkaç saniye sürebilir.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                                {status === 'error' ? (
                                    <AlertCircle size={40} className="text-rose-500" />
                                ) : (
                                    <UploadCloud size={40} className="text-indigo-600" />
                                )}
                            </div>
                            
                            {file ? (
                                <div className="text-center px-4">
                                    <p className="text-lg font-bold text-gray-900 truncate max-w-62.5">{file.name}</p>
                                    <p className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-wide">Değiştirmek için tıklayın</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900">Dosyayı buraya bırakın</p>
                                    <p className="text-sm font-medium text-gray-400 mt-1">veya seçmek için tıklayın (.xlsx, .csv)</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Hata Mesajı */}
                {status === 'error' && errorMessage && (
                    <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle size={18} />
                        {errorMessage}
                    </div>
                )}

                {/* Buton */}
                {file && status !== 'uploading' && status !== 'success' && (
                    <button 
                        onClick={handleUpload}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                    >
                        <Bot size={20} />
                        Analizi Başlat
                    </button>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}