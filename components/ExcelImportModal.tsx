'use client'

import { useState } from 'react'
import { X, UploadCloud, Check, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { createClient } from '@/utils/supabase/client'

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'income' | 'expense'
  onSuccess: () => void
}

export default function ExcelImportModal({ isOpen, onClose, type, onSuccess }: ExcelImportModalProps) {
  const supabase = createClient()
  
  const [step, setStep] = useState(1) // 1: Upload, 2: Map, 3: Uploading
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fileName, setFileName] = useState('')
  
  // Eşleştirme State'i (Bizim DB alanları -> Excel Başlıkları)
  const [mapping, setMapping] = useState({
    date: '',
    description: '',
    amount: '',
    category: '' // Opsiyonel
  })

  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // 1. DOSYAYI OKU VE JSON'A ÇEVİR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0] // İlk sayfayı al
      const ws = wb.Sheets[wsname]
      
      // Veriyi JSON'a çevir
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" })
      
      if (data.length > 0) {
        setFileData(data)
        setHeaders(Object.keys(data[0] as object)) // Başlıkları al
        setStep(2) // Eşleştirme ekranına geç
      } else {
        alert("Dosya boş veya okunamadı.")
      }
    }
    reader.readAsBinaryString(file)
  }

  // 2. VERİLERİ FORMATLA VE KAYDET
  const handleImport = async () => {
    if (!mapping.date || !mapping.description || !mapping.amount) {
      alert("Lütfen zorunlu alanları (Tarih, Açıklama, Tutar) eşleştirin.")
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Excel verisini Supabase formatına çevir
    const formattedData = fileData.map((row: any) => {
      let dateVal = row[mapping.date]
      
      // Excel tarih formatı bazen sorunlu olabilir, basit bir kontrol:
      try {
         // Eğer tarih excel serial number (örn: 45678) değilse ve string ise:
         if (dateVal && typeof dateVal === 'string' && !dateVal.includes('-')) {
             // Basit string tarihleri yakalamaya çalış (Geliştirilebilir)
         }
      } catch (e) {}

      return {
        user_id: user.id,
        date: dateVal || new Date().toISOString().split('T')[0], // Tarih parse edilemezse bugünü atar (MVP için)
        description: row[mapping.description] || 'İçe Aktarılan İşlem',
        amount: parseFloat(row[mapping.amount]) || 0,
        category: mapping.category ? row[mapping.category] : (type === 'income' ? 'Diğer Gelir' : 'Genel Gider')
      }
    })

    // Hangi tabloya yazacağız?
    const tableName = type === 'income' ? 'revenues' : 'expenses'
    
    // Supabase'e Toplu Ekle (Batch Insert)
    const { error } = await supabase.from(tableName).insert(formattedData)

    if (error) {
      alert("Hata oluştu: " + error.message)
    } else {
      onSuccess() // Listeyi yenilet
      handleClose()
    }
    setLoading(false)
  }

  const handleClose = () => {
    setStep(1)
    setFileData([])
    setHeaders([])
    setMapping({ date: '', description: '', amount: '', category: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className={type === 'income' ? 'text-emerald-600' : 'text-rose-600'} />
              Excel / CSV İçe Aktar
            </h2>
            <p className="text-sm font-bold text-gray-400 mt-1">
              {type === 'income' ? 'Toplu Gelir Girişi' : 'Toplu Gider Girişi'}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8">
          
          {/* STEP 1: UPLOAD EKRANI */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative group">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud size={40} className="text-blue-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">Dosyayı buraya sürükleyin</p>
              <p className="text-sm font-medium text-gray-400 mt-1">veya seçmek için tıklayın (.xlsx, .csv)</p>
            </div>
          )}

          {/* STEP 2: EŞLEŞTİRME (MAPPING) EKRANI */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
                <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-blue-900">Sütunları Eşleştirin</p>
                  <p className="text-xs text-blue-700 mt-1">Excel dosyanızdaki başlıkları, sistemdeki karşılıklarıyla eşleştirin.</p>
                  <p className="text-xs font-black text-blue-400 mt-2 uppercase">{fileData.length} Satır Veri</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tarih Seçimi */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Tarih Sütunu</label>
                  <select className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold outline-none border border-transparent focus:border-black transition-all" value={mapping.date} onChange={(e) => setMapping({...mapping, date: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Tutar Seçimi */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Tutar Sütunu</label>
                  <select className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold outline-none border border-transparent focus:border-black transition-all" value={mapping.amount} onChange={(e) => setMapping({...mapping, amount: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Açıklama Seçimi */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Açıklama Sütunu</label>
                  <select className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold outline-none border border-transparent focus:border-black transition-all" value={mapping.description} onChange={(e) => setMapping({...mapping, description: e.target.value})}>
                    <option value="">Seçiniz...</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                 {/* Kategori Seçimi (Opsiyonel) */}
                 <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Kategori Sütunu (Opsiyonel)</label>
                  <select className="w-full px-4 py-3 bg-gray-50 rounded-xl font-bold outline-none border border-transparent focus:border-black transition-all" value={mapping.category} onChange={(e) => setMapping({...mapping, category: e.target.value})}>
                    <option value="">Otomatik (Varsayılan)</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t border-gray-100 flex justify-between bg-gray-50/50">
           {step === 2 && (
             <button onClick={() => setStep(1)} className="text-gray-500 font-bold text-sm hover:text-black transition-colors">
               Geri Dön
             </button>
           )}
           
           <div className="ml-auto">
             {step === 2 && (
               <button 
                onClick={handleImport} 
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg ${loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}
               >
                 {loading ? <Loader2 className="animate-spin" /> : <><Check size={18} /> İçe Aktarımı Başlat</>}
               </button>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}