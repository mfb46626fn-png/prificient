'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Plus, FileSpreadsheet, ListFilter, TrendingDown, TrendingUp, 
  Search, Trash2, ShoppingBag, Truck, Megaphone, CreditCard, Landmark, Tag, Globe, RotateCcw, AlertTriangle, Wand2
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import ExcelImportModal from '@/components/ExcelImportModal'

// --- TİP TANIMLARI VE SABİTLER ---

type TransactionMainType = 'income' | 'expense'

const TRANSACTION_TYPES = {
    income: [
        { id: 'sales', label: 'Ürün Satışı', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'refund_in', label: 'İade Alımı (Gelir)', icon: RotateCcw, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'other_income', label: 'Diğer Gelir', icon: Landmark, color: 'text-gray-600', bg: 'bg-gray-50' },
    ],
    expense: [
        { id: 'commission', label: 'Platform Komisyonu', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'marketing', label: 'Reklam & Pazarlama', icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'logistics', label: 'Kargo & Lojistik', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'cogs', label: 'Ürün Maliyeti', icon: ShoppingBag, color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: 'software', label: 'Yazılım & Altyapı', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'fixed', label: 'Sabit Gider (Kira/Maaş)', icon: Landmark, color: 'text-gray-600', bg: 'bg-gray-50' },
        { id: 'tax', label: 'Vergi Ödemesi', icon: FileSpreadsheet, color: 'text-red-700', bg: 'bg-red-50' },
    ]
}

const PLATFORMS = ['Shopify', 'Amazon', 'Trendyol', 'Hepsiburada', 'Etsy', 'Woocommerce', 'Manuel']
const AD_PLATFORMS = ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Influencer', 'Diğer']

// --- AKILLI ETİKETLEME KURALLARI (Rule Engine) ---
const AUTO_TAG_RULES = [
    { keywords: ['kargo', 'yurtiçi', 'aras', 'mng', 'ups', 'dhl', 'ptt', 'gönderi'], type: 'logistics', main: 'expense' },
    { keywords: ['ads', 'reklam', 'meta', 'facebook', 'instagram', 'google', 'tiktok', 'tanıtım'], type: 'marketing', main: 'expense' },
    { keywords: ['komisyon', 'kesinti', 'hizmet bedeli', 'fee'], type: 'commission', main: 'expense' },
    { keywords: ['iade', 'refund', 'geri ödeme'], type: 'refund_in', main: 'income' }, // Bağlama göre değişebilir ama varsayılan
    { keywords: ['satış', 'sipariş', 'order', 'tahsilat'], type: 'sales', main: 'income' },
    { keywords: ['aws', 'digitalocean', 'vercel', 'supabase', 'hosting', 'domain', 'yazılım', 'app', 'abonelik'], type: 'software', main: 'expense' },
    { keywords: ['vergi', 'kdv', 'stopaj', 'sgk', 'muhasebe'], type: 'tax', main: 'expense' },
    { keywords: ['kira', 'aidat', 'elektrik', 'su', 'internet', 'maaş', 'avans'], type: 'fixed', main: 'expense' },
]

// YARDIMCI: Yerel Tarih Formatlayıcı
const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function TransactionsPage() {
  const supabase = createClient()
  const { symbol, convert } = useCurrency()

  // --- STATE YÖNETİMİ ---
  const [mainType, setMainType] = useState<TransactionMainType>('expense') 
  const [selectedTxType, setSelectedTxType] = useState<string>('') 
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isAutoTagged, setIsAutoTagged] = useState(false) // Otomatik etiketlendi mi?

  // SİLME MODALI STATE'İ
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null, type: TransactionMainType | null }>({
      isOpen: false, id: null, type: null
  })

  // Form State
  const [formData, setFormData] = useState({
      date: formatLocalDate(new Date()), 
      amount: '',
      description: '',
      category: '', 
      platform: '', 
      vatIncluded: true,
  })

  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<'this-month' | 'last-month' | 'all'>('this-month')
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<any[]>([]) 

  // --- TARİH FİLTRESİ ---
  const getDateRange = useCallback(() => {
    const now = new Date()
    let startStr = '', endStr = ''

    if (dateFilter === 'this-month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      startStr = formatLocalDate(start)
      endStr = formatLocalDate(end)
    } else if (dateFilter === 'last-month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      startStr = formatLocalDate(start)
      endStr = formatLocalDate(end)
    }
    return { startStr, endStr }
  }, [dateFilter])

  // --- VERİ ÇEKME ---
  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: catData } = await supabase.from('categories').select('*').eq('user_id', user.id).eq('type', mainType)
    if (catData) setCategories(catData)

    const { startStr, endStr } = getDateRange()

    // Giderleri Çek
    let expQuery = supabase.from('expenses').select('*').eq('user_id', user.id)
    if (dateFilter !== 'all') {
        expQuery = expQuery.gte('date', startStr).lte('date', endStr)
    } else {
        expQuery = expQuery.limit(500)
    }

    // Gelirleri Çek
    let revQuery = supabase.from('revenues').select('*').eq('user_id', user.id)
    if (dateFilter !== 'all') {
        revQuery = revQuery.gte('date', startStr).lte('date', endStr)
    } else {
        revQuery = revQuery.limit(500)
    }

    const [expRes, revRes] = await Promise.all([expQuery, revQuery])

    let combined: any[] = []
    if (expRes.data) combined = [...combined, ...expRes.data.map(e => ({ ...e, mainType: 'expense' }))]
    if (revRes.data) combined = [...combined, ...revRes.data.map(r => ({ ...r, mainType: 'income' }))]

    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setTransactions(combined)
    setLoading(false)
  }, [supabase, dateFilter, getDateRange, mainType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- AKILLI ETİKETLEME SİSTEMİ (AUTO-TAGGING) ---
  useEffect(() => {
      const desc = formData.description.toLowerCase()
      if (!desc) {
          setIsAutoTagged(false)
          return
      }

      // Kuralları kontrol et
      for (const rule of AUTO_TAG_RULES) {
          if (rule.keywords.some(k => desc.includes(k))) {
              // Sadece tür değişiyorsa güncelle (döngüyü engellemek için)
              if (selectedTxType !== rule.type || mainType !== rule.main) {
                  setMainType(rule.main as TransactionMainType)
                  setSelectedTxType(rule.type)
                  setIsAutoTagged(true)
                  
                  // 2 saniye sonra "otomatik" etiketini kaldır
                  setTimeout(() => setIsAutoTagged(false), 2000)
              }
              break // İlk eşleşmede dur
          }
      }
  }, [formData.description])

  // --- İŞLEM SİLME ---
  const askDelete = (id: string, type: TransactionMainType) => {
      setDeleteModal({ isOpen: true, id, type })
  }

  const confirmDelete = async () => {
      if (!deleteModal.id || !deleteModal.type) return;
      const table = deleteModal.type === 'income' ? 'revenues' : 'expenses';
      const { error } = await supabase.from(table).delete().eq('id', deleteModal.id);
      if (error) alert('Silme işlemi başarısız: ' + error.message);
      else {
          fetchData(); 
          setDeleteModal({ isOpen: false, id: null, type: null }); 
      }
  }

  // --- İŞLEM KAYDETME ---
  const handleSave = async () => {
      if (!formData.amount || !selectedTxType) return alert('Lütfen tutar ve işlem tipini seçin.')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let finalDesc = formData.description
      if (!finalDesc) {
          const typeLabel = TRANSACTION_TYPES[mainType].find(t => t.id === selectedTxType)?.label
          finalDesc = `${formData.platform ? formData.platform + ' - ' : ''}${typeLabel}`
      }

      const payload = {
          user_id: user.id,
          amount: parseFloat(formData.amount),
          date: formData.date,
          description: finalDesc,
          category: selectedTxType, 
      }

      if (mainType === 'expense') await supabase.from('expenses').insert(payload)
      else await supabase.from('revenues').insert(payload)

      setFormData({ ...formData, amount: '', description: '', platform: '' })
      fetchData()
  }

  const getTypeIcon = (typeId: string, main: TransactionMainType) => {
      // @ts-ignore
      const typeDef = TRANSACTION_TYPES[main]?.find(t => t.id === typeId) 
      // @ts-ignore
      const defaultDef = TRANSACTION_TYPES[main]?.[0]
      return typeDef || defaultDef || { icon: Tag, color: 'text-gray-500', bg: 'bg-gray-50', label: typeId }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                İşlemler ve Veri
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] rounded-full uppercase tracking-widest font-bold border border-indigo-100">Data Layer</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2 max-w-2xl">
                Sistemin beynini besleyen tek doğruluk kaynağı.
            </p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={() => setIsImportModalOpen(true)} className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                <FileSpreadsheet size={18} /> 
                <span className="hidden sm:inline">Toplu Yükle (Excel/CSV)</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* --- KATMAN 1: VERİ GİRİŞİ --- */}
          <div className="xl:col-span-4 space-y-6">
             
             {/* 1.1 YENİLENMİŞ TOGGLE SWITCH */}
             <div className="bg-gray-100 p-1.5 rounded-[1.5rem] flex relative">
                <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-2xl shadow-sm transition-all duration-300 ease-out z-0 ${mainType === 'income' ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}></div>
                <button onClick={() => setMainType('expense')} className={`flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 relative z-10 transition-colors duration-200 ${mainType === 'expense' ? 'text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <TrendingDown size={18} /> <span>Gider Girişi</span>
                </button>
                <button onClick={() => setMainType('income')} className={`flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 relative z-10 transition-colors duration-200 ${mainType === 'income' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <TrendingUp size={18} /> <span>Gelir Girişi</span>
                </button>
            </div>

            {/* 1.2 Akıllı Form */}
            <div className={`bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border-2 transition-all duration-500 relative overflow-hidden ${mainType === 'income' ? 'border-emerald-100 shadow-emerald-500/5' : 'border-rose-100 shadow-rose-500/5'}`}>
                
                <div className="relative z-10 space-y-6">
                    
                    {/* İşlem Tipi Seçici */}
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">İşlem Tipi (Zorunlu)</label>
                            {/* Auto Tagging Uyarısı */}
                            {isAutoTagged && (
                                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 animate-pulse">
                                    <Wand2 size={12} /> Otomatik Seçildi
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {/* @ts-ignore */}
                            {TRANSACTION_TYPES[mainType].map((type) => (
                                <button 
                                    key={type.id}
                                    onClick={() => setSelectedTxType(type.id)}
                                    className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all group ${
                                        selectedTxType === type.id 
                                        ? (mainType === 'income' ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-300' : 'bg-rose-50 border-rose-200 ring-1 ring-rose-300')
                                        : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <type.icon size={20} className={selectedTxType === type.id ? (mainType === 'income' ? 'text-emerald-600' : 'text-rose-600') : 'text-gray-400 group-hover:text-gray-600'} />
                                    <span className={`text-xs font-bold ${selectedTxType === type.id ? 'text-gray-900' : 'text-gray-500'}`}>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tutar ve Tarih */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Tutar</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">{symbol}</span>
                                <input 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="w-full pl-8 pr-4 py-4 bg-gray-50 rounded-2xl font-black text-gray-900 outline-none focus:ring-2 focus:ring-black/5 transition-all text-lg"
                                    value={formData.amount}
                                    onChange={e => setFormData({...formData, amount: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Tarih</label>
                            <input 
                                type="date" 
                                className="w-full px-4 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Açıklama */}
                    <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">Açıklama / Not</label>
                        <input 
                            type="text" 
                            placeholder={formData.platform ? `${formData.platform} için detay...` : "Örn: Kargo ödemesi, Satış geliri..."}
                            className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    {/* Akıllı Alanlar */}
                    {selectedTxType && (selectedTxType === 'sales' || selectedTxType === 'marketing' || selectedTxType === 'commission') && (
                        <div className="animate-in slide-in-from-top-2 fade-in space-y-4 pt-4 border-t border-gray-100">
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2 block">
                                    {selectedTxType === 'marketing' ? 'Reklam Platformu' : 'Satış Platformu'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedTxType === 'marketing' ? AD_PLATFORMS : PLATFORMS).map(p => (
                                        <button 
                                            key={p}
                                            onClick={() => setFormData({...formData, platform: p})}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                formData.platform === p 
                                                ? 'bg-black text-white border-black' 
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <button onClick={handleSave} className={`w-full py-5 rounded-2xl font-black text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${mainType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}>
                        <Plus size={20} strokeWidth={3} />
                        {mainType === 'income' ? 'GELİRİ KAYDET' : 'GİDERİ KAYDET'}
                    </button>

                </div>
            </div>
          </div>

          {/* --- KATMAN 3: VERİ TÜKETİMİ --- */}
          <div className="xl:col-span-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[800px] flex flex-col">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <ListFilter size={24} className="text-gray-300"/> Finansal Akış
                </h2>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                        {['this-month', 'last-month', 'all'].map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => setDateFilter(filter as any)}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${dateFilter === filter ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                            >
                                {filter === 'this-month' ? 'Bu Ay' : filter === 'last-month' ? 'Geçen Ay' : 'Tümü'}
                            </button>
                        ))}
                    </div>
                </div>
              </div>

              <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="İşlem, kategori veya platform ara..." 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-gray-100 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                 {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Veriler Yükleniyor</p>
                    </div>
                 ) : transactions.length > 0 ? (
                    transactions
                        .filter(tx => 
                            tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.category?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((tx) => {
                            const isIncome = tx.mainType === 'income'
                            // @ts-ignore
                            const typeMeta = getTypeIcon(tx.category, tx.mainType) 

                            return (
                              <div key={tx.id} className="group relative flex items-center justify-between p-5 bg-white border border-gray-50 rounded-[1.5rem] hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
                                  
                                  <div className="flex items-center gap-5">
                                      <div className="hidden sm:flex flex-col items-center justify-center w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100">
                                          <span className="text-xs font-black text-gray-900">{new Date(tx.date).getDate()}</span>
                                          <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(tx.date).toLocaleString('tr-TR', { month: 'short' })}</span>
                                      </div>

                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${typeMeta.bg}`}>
                                          <typeMeta.icon size={20} className={typeMeta.color} />
                                      </div>

                                      <div>
                                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-indigo-900 transition-colors">{tx.description}</h4>
                                          <div className="flex items-center gap-2 mt-1">
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500`}>
                                                  {typeMeta.label || tx.category}
                                              </span>
                                              <span className="sm:hidden text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString('tr-TR')}</span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                      <div className="text-right">
                                          <div className={`text-lg font-black tracking-tight ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
                                              {isIncome ? '+' : '-'}{symbol}{convert(tx.amount)}
                                          </div>
                                          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mt-0.5">
                                              {isIncome ? 'TAHSİLAT' : 'ÖDEME'}
                                          </div>
                                      </div>
                                      
                                      <button onClick={() => askDelete(tx.id, tx.mainType)} className="p-3 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Sil">
                                          <Trash2 size={18} />
                                      </button>
                                  </div>
                              </div>
                            )
                        })
                 ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-300">
                            <ListFilter size={32}/>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">İşlem Bulunamadı</h3>
                        <p className="text-sm text-gray-400 max-w-xs mt-1">Seçilen tarih aralığında veya kriterlerde herhangi bir veri girişi yok.</p>
                    </div>
                 )}
              </div>

            </div>
          </div>
        </div>

        {deleteModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-500"><AlertTriangle size={32} /></div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Emin misiniz?</h3>
                        <p className="text-gray-500 font-medium text-sm mb-8">Bu işlemi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button onClick={() => setDeleteModal({ isOpen: false, id: null, type: null })} className="py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">İptal Et</button>
                            <button onClick={confirmDelete} className="py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors">Evet, Sil</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <ExcelImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} type={mainType} onSuccess={() => { fetchData(); alert("Veriler başarıyla eklendi!") }} />
      </main>
    </div>
  )
}