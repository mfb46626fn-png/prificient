'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, Save, FileSpreadsheet, ListFilter, TrendingDown, TrendingUp, Target, Search, Edit2, ArrowUpDown, X, Calendar, Filter } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import { DEMO_DATA } from '@/utils/demoData'

export default function DemoTransactionsPage() {
  const { symbol, convert } = useCurrency()

  const [activeTab, setActiveTab] = useState<'add' | 'categories'>('add')
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense')
  
  // Demo Verilerini State'e alıyoruz
  const [transactions, setTransactions] = useState<any[]>(DEMO_DATA.transactions)
  
  // Demo Kategoriler
  const demoCategories = [
    { id: '1', name: 'Pazarlama', type: 'expense', budget_limit: 5000 },
    { id: '2', name: 'Lojistik', type: 'expense', budget_limit: 3000 },
    { id: '3', name: 'Ürün Maliyeti', type: 'expense', budget_limit: 0 },
    { id: '4', name: 'Satış', type: 'income', budget_limit: 0 },
    { id: '5', name: 'Diğer Gelir', type: 'income', budget_limit: 0 },
  ]

  const [newTx, setNewTx] = useState({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' })

  // --- SAHTE İŞLEM EKLEME ---
  const handleAddTransaction = () => {
    if (!newTx.description || !newTx.amount) { alert("Lütfen açıklama ve tutar girin."); return }
    
    const fakeTx = {
        id: Math.random().toString(),
        description: newTx.description,
        amount: parseFloat(newTx.amount),
        category: newTx.category || 'Diğer',
        date: newTx.date,
        type: transactionType // 'income' veya 'expense'
    }

    setTransactions(prev => [fakeTx, ...prev])
    setNewTx({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] })
    alert("Demo modunda işlem geçici olarak listeye eklendi (Sayfa yenilenince kaybolur).")
  }

  // --- SAHTE KATEGORİ KAYDETME ---
  const handleSaveCategory = () => {
    alert("Demo modunda kategori düzenlenemez.")
  }

  // --- SIRALAMA VE FİLTRELEME ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  }

  const sortedAndFilteredTransactions = useMemo(() => {
    let data = [...transactions];
    if (searchTerm) {
      data = data.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    data.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'date') { aValue = new Date(aValue).getTime(); bValue = new Date(bValue).getTime(); }
      if (sortConfig.key === 'amount') { aValue = Number(aValue); bValue = Number(bValue); }
      if (typeof aValue === 'string') { aValue = aValue.toLowerCase(); bValue = bValue.toLowerCase(); }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [transactions, searchTerm, sortConfig]);

  const filteredCategories = demoCategories.filter(c => c.type === transactionType)

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <DashboardHeader isDemo={true} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* ÜST BİLGİ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-2">
               🚀 Örnek Veri Modu
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">İşlemler ve Veri Yönetimi</h1>
            <p className="text-gray-500 font-medium">Gelir ve giderlerinizi tek yerden yönetin.</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
            <button onClick={() => setActiveTab('add')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'add' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Veri Girişi</button>
            <button onClick={() => setActiveTab('categories')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Kategori Yönetimi</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL PANEL (Ekleme / Kategori) */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 flex">
                <button onClick={() => setTransactionType('expense')} className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${transactionType === 'expense' ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-100' : 'text-gray-400 hover:bg-gray-50'}`}><TrendingDown size={18} /> Gider</button>
                <button onClick={() => setTransactionType('income')} className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${transactionType === 'income' ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-100' : 'text-gray-400 hover:bg-gray-50'}`}><TrendingUp size={18} /> Gelir</button>
            </div>
            
            {activeTab === 'add' ? (
              <div className={`bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24 transition-colors duration-500 ${transactionType === 'income' ? 'border-t-4 border-t-emerald-500' : 'border-t-4 border-t-rose-500'}`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${transactionType === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  <Plus size={20} /> {transactionType === 'income' ? 'Gelir Ekle' : 'Gider Ekle'}
                </h2>
                <div className="space-y-4">
                  <div><label className="text-xs font-bold text-gray-400 block mb-2 ml-1">Tarih</label><input type="date" className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-gray-100" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-gray-400 block mb-2 ml-1">Açıklama</label><input type="text" placeholder="Örn: Fatura" className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-gray-100" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-gray-400 block mb-2 ml-1">Tutar</label><input type="number" placeholder="0.00" className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-gray-100" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-400 block mb-2 ml-1">Kategori</label><select className="w-full px-5 py-3 bg-gray-50 rounded-2xl font-bold outline-none appearance-none focus:ring-2 focus:ring-gray-100" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})}><option value="">Seç...</option>{filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
                  </div>
                  <button onClick={handleAddTransaction} className={`w-full py-4 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 mt-2 ${transactionType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}>Kaydet (Demo)</button>
                  <button onClick={() => alert("Excel yükleme demoda devre dışıdır.")} className="w-full py-4 bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"><FileSpreadsheet size={18} /> Excel / CSV Yükle</button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Target size={20} className={transactionType === 'income' ? 'text-emerald-600' : 'text-rose-600'}/> Kategoriler</h2>
                </div>
                <div className={`p-4 rounded-2xl mb-6 space-y-3 border-2 bg-gray-50 border-transparent`}>
                  <input type="text" placeholder="Kategori Adı" className="w-full px-4 py-2 bg-white rounded-xl text-sm font-bold outline-none" disabled />
                  <div className="flex gap-2">
                    {transactionType === 'expense' && <input type="number" placeholder="Limit" className="flex-1 px-4 py-2 bg-white rounded-xl text-sm font-bold outline-none" disabled />}
                    <button onClick={handleSaveCategory} className={`px-4 text-white rounded-xl transition-all bg-black hover:bg-gray-800`}><Plus size={18}/></button>
                  </div>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {filteredCategories.map((cat) => (
                    <div key={cat.id} className={`flex items-center justify-between p-3 border rounded-2xl transition-colors group border-gray-100 hover:bg-gray-50`}>
                      <div><p className="font-bold text-gray-900 text-sm">{cat.name}</p>{cat.budget_limit > 0 && <p className="text-[10px] text-gray-500 font-bold mt-0.5">Limit: {cat.budget_limit} {symbol}</p>}</div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 size={16} /></button><button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SAĞ PANEL: LİSTE VE FİLTRELER */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[600px]">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ListFilter size={20} className="text-gray-400"/> İşlem Geçmişi
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Ara..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-gray-100 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
              </div>

              {/* LİSTE BAŞLIKLARI */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">
                <div onClick={() => handleSort('date')} className="col-span-3 cursor-pointer hover:text-gray-600 flex items-center gap-1 group">Tarih <ArrowUpDown size={12}/></div>
                <div onClick={() => handleSort('description')} className="col-span-4 cursor-pointer hover:text-gray-600 flex items-center gap-1 group">Açıklama <ArrowUpDown size={12}/></div>
                <div onClick={() => handleSort('category')} className="col-span-3 cursor-pointer hover:text-gray-600 flex items-center gap-1 group">Kategori <ArrowUpDown size={12}/></div>
                <div onClick={() => handleSort('amount')} className="col-span-2 text-right cursor-pointer hover:text-gray-600 flex items-center justify-end gap-1 group">Tutar <ArrowUpDown size={12}/></div>
              </div>

              {/* LİSTE İÇERİĞİ */}
              <div className="space-y-2">
                 {sortedAndFilteredTransactions.map((tx) => {
                    // DÜZELTME: Hem 'income' hem 'revenue' tiplerini GELİR olarak kabul ediyoruz.
                    const isIncome = tx.type === 'income' || tx.type === 'revenue'

                    return (
                      <div key={tx.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 border border-gray-50 hover:border-gray-200 hover:bg-gray-50 rounded-2xl transition-all items-center group">
                          <div className="sm:col-span-3 text-xs font-bold text-gray-400 flex items-center gap-2">
                              <Calendar size={14} className="text-gray-300"/>
                              {new Date(tx.date).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="sm:col-span-4 font-bold text-gray-900 truncate">{tx.description}</div>
                          <div className="sm:col-span-3">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${isIncome ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                  {tx.category || 'Diğer'}
                              </span>
                          </div>
                          <div className={`sm:col-span-2 text-right font-black ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isIncome ? '+' : '-'}{symbol}{convert(tx.amount)}
                          </div>
                      </div>
                    )
                 })}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}