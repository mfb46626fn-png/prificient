'use client'

import React, { useState } from 'react'
import { Upload, CheckCircle2, Loader2, AlertCircle, FileType } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function FileUpload() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [fileName, setFileName] = useState<string>('')
  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStatus('uploading')
    
    const { data: { user } } = await supabase.auth.getUser()

    const formData = new FormData()
    formData.append('data', file)
    formData.append('user_id', user?.id || '')

    try {
      // CORS hatasını aşmak için kendi proxy API'mize istek atıyoruz
      const response = await fetch('/api/n8n-proxy', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setStatus('success')
        setTimeout(() => {
            setStatus('idle')
            setFileName('')
            // Sayfayı yenileyerek yeni verileri göster
            window.location.reload()
        }, 3000)
      } else {
        // Hata detayını konsolda görebilirsin
        console.error("Yükleme başarısız:", await response.text())
        setStatus('error')
      }
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  return (
    <div className="relative group">
      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-all border shadow-sm ${
        status === 'error' ? 'bg-rose-50 border-rose-200 text-rose-600' : 
        status === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
        'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-300'
      }`}>
        {status === 'uploading' ? <Loader2 size={18} className="animate-spin text-blue-600" /> : 
         status === 'success' ? <CheckCircle2 size={18} /> :
         status === 'error' ? <AlertCircle size={18} /> : <FileType size={18} className="text-blue-500"/>}
        
        <span className="text-sm truncate max-w-37.5">
          {status === 'uploading' ? 'AI Analiz Ediyor...' : 
           status === 'success' ? 'Başarılı!' : 
           status === 'error' ? 'Hata' : 
           fileName || 'Excel / CSV Yükle'}
        </span>

        {/* Excel, CSV ve Word dosyalarına izin veriyoruz */}
        <input 
          type="file" 
          className="hidden" 
          accept=".csv, .xlsx, .xls, .doc, .docx" 
          onChange={handleFileUpload} 
          disabled={status === 'uploading'} 
        />
      </label>
      
      {/* Tooltip: Kullanıcıya bilgi verelim */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Excel veya CSV önerilir
      </div>
    </div>
  )
}