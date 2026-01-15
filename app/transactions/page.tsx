'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Plus, FileSpreadsheet, ListFilter, TrendingDown, TrendingUp, 
  Search, Trash2, ShoppingBag, Truck, Megaphone, CreditCard, Landmark, Tag, Globe, RotateCcw, AlertTriangle, Wand2,
  Building2, Package, Calendar, ArrowRight
} from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import ExcelImportModal from '@/components/ExcelImportModal'
import UnifiedExpenseModal from '@/components/UnifiedExpenseModal'
import AdDistributorModal from '@/components/AdDistributorModal'

// --- SABİTLER ---

type TransactionMainType = 'income' | 'expense'

const TRANSACTION_TYPES = {
    income: [
        { id: 'sales', label: 'Ürün Satışı', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'other_income', label: 'Diğer Gelir', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50' },
    ],
    expense: [
        { id: 'commission', label: 'Komisyon', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'marketing', label: 'Reklam (Ads)', icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'logistics', label: 'Kargo', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'cogs', label: 'Ürün Maliyeti', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'fixed', label: 'Sabit Gider', icon: Building2, color: 'text-gray-700', bg: 'bg-gray-100' },
        { id: 'software', label: 'Yazılım', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    ]
}

const PLATFORMS = ['Shopify', 'Amazon', 'Trendyol', 'Hepsiburada', 'Etsy', 'Woocommerce', 'Manuel']

const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function TransactionsPage() {
  const supabase = createClient()
  const { symbol, convert } = useCurrency()

  // --- STATE ---
  const [mainType, setMainType] = useState<TransactionMainType>('expense') 
  const [selectedTxType, setSelectedTxType] = useState<string>('') 
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false)
  const [isAdModalOpen, setIsAdModalOpen] = useState(false)
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null, table: string | null }>({
      isOpen: false, id: null, table: null
  })

  const [formData, setFormData] = useState({
      date: formatLocalDate(new Date()), 
      amount: '',
      description: '', 
      platform: 'Manuel', 
  })

  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [dateFilter, setDateFilter] = useState<'this-month' | 'last-month' | 'all' | 'custom'>('this-month')
  const [customRange, setCustomRange] = useState({
      start: formatLocalDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), 
      end: formatLocalDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)) 
  })
  const [searchTerm, setSearchTerm] = useState('')

  // 1. TARİH ARALIĞINI AYARLA
  useEffect(() => {
    const now = new Date()
    let startStr = customRange.start
    let endStr = customRange.end

    if (dateFilter === 'this-month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      startStr = formatLocalDate(start)
      endStr = formatLocalDate(end)
      setCustomRange({ start: startStr, end: endStr })
    } else if (dateFilter === 'last-month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      startStr = formatLocalDate(start)
      endStr = formatLocalDate(end)
      setCustomRange({ start: startStr, end: endStr })
    }
  }, [dateFilter])


  // --- VERİ ÇEKME ---
  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { start: startStr, end: endStr } = customRange

    const buildQuery = (table: string, select = '*') => {
        let q = supabase.from(table).select(select).eq('user_id', user.id)
        
        if (dateFilter !== 'all') {
            const dateCol = table === 'orders' ? 'order_date' : 'date'; 
            q = q.gte(dateCol, startStr).lte(dateCol, endStr)
        } else {
            q = q.limit(100) 
        }
        return q
    }

    const [ordersRes, revRes, expRes, fixedRes, adsRes] = await Promise.all([
        buildQuery('orders', '*, products(name)'), 
        buildQuery('revenues'),       
        buildQuery('expenses'),       
        buildQuery('fixed_expenses'), 
        buildQuery('ad_spends')       
    ])

    let combined: any[] = []

    // 1. SİPARİŞLER (Orders)
    if (ordersRes.data) {
        combined = [...combined, ...ordersRes.data.map((o: any) => ({
            id: o.id,
            date: o.order_date,
            amount: o.total_revenue || (o.sale_price * o.quantity),
            description: o.products?.name ? `${o.products.name} (${o.quantity} Adet)` : 'Ürün Satışı',
            mainType: 'income',
            displayCategory: 'sales',
            sourceTable: 'orders',
            platform: o.platform
        }))]
    }

    // 2. DİĞER GELİRLER
    if (revRes.data) {
        combined = [...combined, ...revRes.data
            .map((r: any) => ({ ...r, mainType: 'income', displayCategory: r.category || 'other_income', sourceTable: 'revenues' }))
        ]
    }
    
    // 3. GİDERLER
    if (expRes.data) combined = [...combined, ...expRes.data.map((e: any) => ({ ...e, mainType: 'expense', displayCategory: e.category || 'cogs', sourceTable: 'expenses' }))]

    // 4. SABİT GİDERLER
    if (fixedRes.data) combined = [...combined, ...fixedRes.data.map((f: any) => ({ ...f, mainType: 'expense', displayCategory: 'fixed', description: f.description || 'Sabit Gider', sourceTable: 'fixed_expenses' }))]

    // 5. REKLAMLAR
    if (adsRes.data) combined = [...combined, ...adsRes.data.map((a: any) => ({ 
        ...a, 
        mainType: 'expense', 
        displayCategory: 'marketing', 
        description: `${a.platform || 'Reklam'} - ${a.campaign_name || 'Kampanya'}`, 
        sourceTable: 'ad_spends' 
    }))]

    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setTransactions(combined)
    setLoading(false)
  }, [supabase, dateFilter, customRange]) 

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- SİLME ---
  const askDelete = (id: string, table: string) => {
      setDeleteModal({ isOpen: true, id, table })
  }

  const confirmDelete = async () => {
      if (!deleteModal.id || !deleteModal.table) return;
      
      const { error } = await supabase.from(deleteModal.table).delete().eq('id', deleteModal.id);
      
      if (error) {
          alert('Silme başarısız: ' + error.message);
      } else {
          fetchData(); 
          setDeleteModal({ isOpen: false, id: null, table: null }); 
      }
  }

  // --- KAYDETME (YENİ SİSTEM) ---
  const handleSaveIncome = async () => {
      if (!formData.amount || !selectedTxType) return alert('Lütfen tutar ve işlem tipini seçin.')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      try {
          if (selectedTxType === 'sales') {
              const productName = formData.description || 'İsimsiz Ürün';
              let productId = null;

              // A. Ürün İşlemleri
              const { data: existingProduct } = await supabase
                  .from('products')
                  .select('id')
                  .eq('name', productName)
                  .eq('user_id', user.id)
                  .maybeSingle();
              
              if (existingProduct) {
                  productId = existingProduct.id;
              } else {
                  const { data: newProduct, error: prodError } = await supabase
                      .from('products')
                      .insert({ 
                          user_id: user.id, 
                          name: productName,
                          product_key: productName.toLowerCase().replace(/\s/g, '_') 
                      })
                      .select('id')
                      .single();
                  
                  if (prodError) throw new Error('Ürün oluşturulamadı: ' + prodError.message);
                  productId = newProduct.id;
              }

              // B. Order Oluştur
              const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
                  user_id: user.id,
                  product_id: productId,
                  platform: formData.platform,
                  order_date: formData.date,
                  quantity: 1, 
                  sale_price: parseFloat(formData.amount),
              }).select('id').single();

              if (orderError) throw new Error('Sipariş kaydedilemedi: ' + orderError.message);

              // C. Event Oluştur
              if (newOrder) {
                  await supabase.from('events').insert({
                      user_id: user.id,
                      event_type: 'order_created',
                      related_order_id: newOrder.id,
                      related_product_id: productId,
                      event_date: formData.date,
                      description: `Manuel Satış: ${productName}`
                  });
              }

          } else {
              await supabase.from('revenues').insert({
                  user_id: user.id,
                  amount: parseFloat(formData.amount),
                  date: formData.date,
                  description: formData.description || 'Diğer Gelir',
                  category: selectedTxType, 
              })
          }

          setFormData({ ...formData, amount: '', description: '', platform: 'Manuel' })
          fetchData()
          alert("Kayıt Başarılı!");

      } catch (error: any) {
          console.error(error);
          alert("Hata: " + error.message);
      }
  }

  const getTypeIcon = (categoryKey: string, main: TransactionMainType) => {
      // @ts-ignore
      const typeDef = TRANSACTION_TYPES[main]?.find(t => t.id === categoryKey) 
      return typeDef || { icon: Tag, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Diğer' }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <DashboardHeader />
      
      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-black text-black tracking-tight">Veri Katmanı</h1>
            <p className="text-gray-600 font-bold mt-1 text-sm">Tüm finansal hareketlerin kontrol merkezi.</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={() => setIsImportModalOpen(true)} className="px-6 py-3 bg-black text-white rounded-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-gray-300">
                <FileSpreadsheet size={18} /> 
                <span className="hidden sm:inline">Excel Yükle</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* --- SOL: VERİ GİRİŞİ --- */}
          <div className="xl:col-span-4 space-y-6">
             
             {/* Switch */}
             <div className="bg-gray-100 p-1.5 rounded-[1.5rem] flex relative">
                <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-2xl shadow-sm transition-all duration-300 ease-out z-0 ${mainType === 'income' ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}></div>
                <button onClick={() => setMainType('expense')} className={`flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 relative z-10 transition-colors duration-200 ${mainType === 'expense' ? 'text-black' : 'text-gray-500 hover:text-black'}`}>
                    <TrendingDown size={18} className={mainType === 'expense' ? 'text-rose-500' : ''}/> Gider
                </button>
                <button onClick={() => setMainType('income')} className={`flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 relative z-10 transition-colors duration-200 ${mainType === 'income' ? 'text-black' : 'text-gray-500 hover:text-black'}`}>
                    <TrendingUp size={18} className={mainType === 'income' ? 'text-emerald-500' : ''}/> Gelir
                </button>
            </div>

            {/* Form */}
            <div className={`bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border-2 transition-all duration-500 relative overflow-hidden ${mainType === 'income' ? 'border-emerald-100 shadow-emerald-50' : 'border-rose-100 shadow-rose-50'}`}>
                
                {mainType === 'expense' ? (
                    // GİDER MODU (Detaylı Butonlar)
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
                        {/* GENEL GİDER BUTONU */}
                        <div className="w-full">
                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-3">
                                <Wand2 size={28} />
                            </div>
                            <h3 className="text-lg font-black text-black mb-1">Genel Gider</h3>
                            <button 
                                onClick={() => setIsUnifiedModalOpen(true)}
                                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                Gider Ekle <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* REKLAM DAĞITIM BUTONU (YENİ) */}
                        <div className="w-full pt-4 border-t border-gray-100">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-3">
                                <Megaphone size={28} />
                            </div>
                            <h3 className="text-lg font-black text-black mb-1">Reklam Dağıt</h3>
                            <p className="text-xs text-gray-400 font-medium mb-3 px-2">Harcamayı siparişlere böl.</p>
                            <button 
                                onClick={() => setIsAdModalOpen(true)}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                Dağıt <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    // GELİR FORMU
                    <div className="relative z-10 space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Tip Seçin</label>
                            <div className="grid grid-cols-2 gap-3">
                                {TRANSACTION_TYPES.income.map((type) => (
                                    <button 
                                        key={type.id}
                                        onClick={() => setSelectedTxType(type.id)}
                                        className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all group ${
                                            selectedTxType === type.id 
                                            ? 'bg-emerald-50 border-emerald-500'
                                            : 'bg-white border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        <type.icon size={20} className={selectedTxType === type.id ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                        <span className={`text-xs font-bold ${selectedTxType === type.id ? 'text-black' : 'text-gray-500'}`}>{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Tutar</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">{symbol}</span>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        className="w-full pl-8 pr-4 py-4 bg-gray-50 rounded-2xl font-black text-black outline-none focus:ring-4 focus:ring-emerald-100 transition-all text-lg border-2 border-transparent focus:border-emerald-200"
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Tarih</label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-4 bg-gray-50 rounded-2xl font-bold text-black outline-none focus:ring-4 focus:ring-emerald-100 transition-all border-2 border-transparent focus:border-emerald-200"
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                {selectedTxType === 'sales' ? 'Ürün Adı' : 'Açıklama'}
                            </label>
                            <input 
                                type="text" 
                                placeholder={selectedTxType === 'sales' ? "Örn: Akıllı Matara" : "Örn: Kira İadesi"}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-sm text-black outline-none focus:ring-4 focus:ring-emerald-100 transition-all border-2 border-transparent focus:border-emerald-200"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        {selectedTxType === 'sales' && (
                            <div className="pt-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Platform</label>
                                <div className="flex flex-wrap gap-2">
                                    {PLATFORMS.map(p => (
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
                        )}

                        <button onClick={handleSaveIncome} className="w-full py-5 rounded-2xl font-black text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 mt-2">
                            <Plus size={20} strokeWidth={3} />
                            KAYDET
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* --- SAĞ: LİSTE --- */}
          <div className="xl:col-span-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[800px] flex flex-col">
              
              {/* Filtreler */}
              <div className="flex flex-col mb-8 gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-black text-black flex items-center gap-2">
                    <ListFilter size={24} className="text-gray-400"/> Hareketler
                    </h2>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                            {['this-month', 'last-month', 'all', 'custom'].map((filter) => (
                                <button 
                                    key={filter}
                                    onClick={() => setDateFilter(filter as any)}
                                    className={`flex-1 sm:flex-none whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all ${dateFilter === filter ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                                >
                                    {filter === 'this-month' ? 'Bu Ay' : filter === 'last-month' ? 'Geçen Ay' : filter === 'custom' ? 'Özel' : 'Tümü'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Custom Date Inputs */}
                {dateFilter === 'custom' && (
                    <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Başlangıç</label>
                            <input 
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-black text-sm outline-none focus:border-black"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Bitiş</label>
                            <input 
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-black text-sm outline-none focus:border-black"
                            />
                        </div>
                    </div>
                )}
              </div>

              {/* Arama */}
              <div className="relative mb-6">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="İşlem, ürün veya platform ara..." 
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl font-bold text-black outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder:text-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>

              {/* Liste */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                 {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Veriler Yükleniyor...</p>
                    </div>
                 ) : transactions.length > 0 ? (
                    transactions
                        .filter(tx => 
                            tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.displayCategory?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((tx) => {
                            const isIncome = tx.mainType === 'income'
                            // @ts-ignore
                            const typeMeta = getTypeIcon(tx.displayCategory, tx.mainType) 

                            return (
                              <div key={`${tx.sourceTable}-${tx.id}`} className="group relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[1.5rem] hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                                  
                                  <div className="flex items-center gap-5">
                                      <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100">
                                          <span className="text-sm font-black text-black">{new Date(tx.date).getDate()}</span>
                                          <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(tx.date).toLocaleString('tr-TR', { month: 'short' })}</span>
                                      </div>

                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${typeMeta.bg}`}>
                                          <typeMeta.icon size={22} className={typeMeta.color} />
                                      </div>

                                      <div>
                                          <h4 className="font-bold text-black text-sm group-hover:text-indigo-900 transition-colors">{tx.description}</h4>
                                          <div className="flex items-center gap-2 mt-1.5">
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200`}>
                                                  {typeMeta.label}
                                              </span>
                                              {tx.platform && <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">{tx.platform}</span>}
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex items-center gap-6">
                                      <div className="text-right">
                                          <div className={`text-lg font-black tracking-tight ${isIncome ? 'text-emerald-600' : 'text-black'}`}>
                                              {isIncome ? '+' : '-'}{symbol}{convert(tx.amount)}
                                          </div>
                                      </div>
                                      
                                      <button onClick={() => askDelete(tx.id, tx.sourceTable)} className="p-3 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="Sil">
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
                        <h3 className="text-lg font-bold text-gray-900">Kayıt Bulunamadı</h3>
                        <p className="text-sm text-gray-400 mt-1">Seçili dönemde işlem yok.</p>
                    </div>
                 )}
              </div>

            </div>
          </div>
        </div>

        {/* MODALLAR */}
        {deleteModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 text-rose-500"><AlertTriangle size={32} /></div>
                        <h3 className="text-xl font-black text-black mb-2">Emin misiniz?</h3>
                        <p className="text-gray-500 font-bold text-xs mb-8 leading-relaxed">Bu işlemi silmek istediğinize emin misiniz?<br/>Bu işlem geri alınamaz.</p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button onClick={() => setDeleteModal({ isOpen: false, id: null, table: null })} className="py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">İptal</button>
                            <button onClick={confirmDelete} className="py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors">Evet, Sil</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <ExcelImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={() => { fetchData(); alert("Veriler başarıyla eklendi!") }} />
        <UnifiedExpenseModal isOpen={isUnifiedModalOpen} onClose={() => { setIsUnifiedModalOpen(false); fetchData(); }} />
        <AdDistributorModal isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} onSuccess={() => { fetchData(); alert("Reklam maliyeti dağıtıldı!") }} />

      </main>
    </div>
  )
}