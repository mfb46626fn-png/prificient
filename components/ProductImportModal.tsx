'use client'

import { useState } from 'react'
import { X, UploadCloud, Check, AlertCircle, Loader2, Package } from 'lucide-react'
import * as XLSX from 'xlsx'
import { createClient } from '@/utils/supabase/client'

interface ProductImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ProductImportModal({ isOpen, onClose, onSuccess }: ProductImportModalProps) {
  const supabase = createClient()
  
  const [step, setStep] = useState(1) 
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Eşleştirme (Excel Başlıkları -> DB Sütunları)
  const [mapping, setMapping] = useState({
    name: '',
    sku: '',
    selling_price: '',
    marketplace: ''
  })

  if (!isOpen) return null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = XLSX.utils.sheet_to_json(ws, { defval: "" })
      
      if (data.length > 0) {
        setFileData(data)
        setHeaders(Object.keys(data[0] as object))
        setStep(2)
      } else {
        alert("Dosya boş.")
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (!mapping.name || !mapping.selling_price) {
      alert("Ürün Adı ve Satış Fiyatı zorunludur.")
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const formattedData = fileData.map((row: any) => {
      // Otomatik SKU Mantığı: Excel'de yoksa PRD-{Rastgele} üret
      const generatedSku = `PRD-${Math.floor(1000 + Math.random() * 9000)}`
      
      return {
        user_id: user.id,
        name: row[mapping.name],
        sku: mapping.sku ? row[mapping.sku] : generatedSku,
        selling_price: parseFloat(row[mapping.selling_price]) || 0,
        marketplace: mapping.marketplace ? row[mapping.marketplace] : 'Diğer',
        cost_price: 0, // Varsayılan 0, kullanıcı sonra düzenleyecek
        shipping_cost: 0,
        stock_quantity: 0
      }
    })

    const { error } = await supabase.from('products').insert(formattedData)

    if (error) {
      alert("Hata: " + error.message)
    } else {
      onSuccess()
      handleClose()
    }
    setLoading(false)
  }

  const handleClose = () => {
    setStep(1)
    setFileData([])
    setHeaders([])
    setMapping({ name: '', sku: '', selling_price: '', marketplace: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><Package className="text-blue-600"/> Toplu Ürün Yükle</h2>
          <button onClick={handleClose}><X size={20} className="text-gray-400 hover:text-black"/></button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative">
              <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <UploadCloud size={48} className="mx-auto text-blue-500 mb-4" />
              <p className="font-bold text-gray-900">Excel Dosyasını Sürükleyin</p>
              <p className="text-sm text-gray-400">veya tıklayıp seçin</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 text-blue-800 text-sm font-medium">
                <AlertCircle size={20}/>
                <p>Excel başlıklarını sistemle eşleştirin. SKU seçmezseniz otomatik atanır.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-400 mb-1 ml-1">Ürün Adı (Zorunlu)</label><select className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none" onChange={e => setMapping({...mapping, name: e.target.value})}><option value="">Seçiniz...</option>{headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-gray-400 mb-1 ml-1">Satış Fiyatı (Zorunlu)</label><select className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none" onChange={e => setMapping({...mapping, selling_price: e.target.value})}><option value="">Seçiniz...</option>{headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-gray-400 mb-1 ml-1">SKU (Opsiyonel)</label><select className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none" onChange={e => setMapping({...mapping, sku: e.target.value})}><option value="">Otomatik Üret</option>{headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-gray-400 mb-1 ml-1">Pazaryeri (Opsiyonel)</label><select className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none" onChange={e => setMapping({...mapping, marketplace: e.target.value})}><option value="">Varsayılan (Diğer)</option>{headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-gray-100 flex justify-end bg-gray-50">
           {step === 2 && (
             <button onClick={handleImport} disabled={loading} className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all">
               {loading ? <Loader2 className="animate-spin"/> : <Check size={18}/>} Kaydet
             </button>
           )}
        </div>
      </div>
    </div>
  )
}