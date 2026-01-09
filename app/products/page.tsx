'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Edit2, Trash2, Package, Tag, ArrowUpDown, Upload } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader'
import { useCurrency } from '@/app/contexts/CurrencyContext'
import Image from 'next/image'
import ProductImportModal from '@/components/ProductImportModal'
import ProductModal from '@/components/ProductModal' // YENİ IMPORT

export default function ProductsPage() {
  const supabase = createClient()
  const { symbol, convert } = useCurrency()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Sıralama State'i
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' })

  // Modal State'leri
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)

  // VERİLERİ ÇEK
  const fetchProducts = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) console.error(error)
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  // Silme
  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  // --- SORTING (SIRALAMA) ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  }

  const sortedProducts = useMemo(() => {
    let data = [...products];
    if (searchTerm) {
        data = data.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    data.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'selling_price' || sortConfig.key === 'cost_price') {
         aValue = Number(aValue); bValue = Number(bValue);
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [products, searchTerm, sortConfig]);

  // Modal İşlemleri
  const openAddModal = () => {
    setEditingProduct(null)
    setIsProductModalOpen(true)
  }

  const openEditModal = (p: any) => {
    setEditingProduct(p)
    setIsProductModalOpen(true)
  }

  const handleModalSuccess = () => {
    setIsProductModalOpen(false)
    setEditingProduct(null)
    fetchProducts() // Listeyi yenile
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20 font-sans">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* BAŞLIK */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ürün Kataloğu</h1>
            <p className="text-gray-500 font-medium">Ürünlerinizi ve maliyet detaylarını buradan yönetin.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setIsImportModalOpen(true)} className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all">
                <Upload size={18} /> Excel Yükle
             </button>
             <button onClick={openAddModal} className="px-6 py-3 bg-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95">
                <Plus size={20} /> Yeni Ürün
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
          
          {/* SEARCH */}
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
             <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Ürün adı, SKU veya pazaryeri ara..." className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-gray-100 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
             </div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Toplam {sortedProducts.length} Ürün</div>
          </div>

          {/* BAŞLIKLAR */}
          <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-gray-50/50 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wider border-b border-gray-50 select-none">
            <div onClick={() => handleSort('name')} className="col-span-4 cursor-pointer hover:text-black flex items-center gap-1 group">Ürün Bilgisi <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100"/></div>
            <div onClick={() => handleSort('marketplace')} className="col-span-2 cursor-pointer hover:text-black flex items-center gap-1 group">Pazaryeri <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100"/></div>
            <div onClick={() => handleSort('cost_price')} className="col-span-2 text-right cursor-pointer hover:text-black flex items-center justify-end gap-1 group">Maliyet <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100"/></div>
            <div onClick={() => handleSort('selling_price')} className="col-span-2 text-right cursor-pointer hover:text-black flex items-center justify-end gap-1 group">Satış Fiyatı <ArrowUpDown size={12} className="opacity-50 group-hover:opacity-100"/></div>
            <div className="col-span-2 text-center">İşlem</div>
          </div>

          {/* LİSTE */}
          <div className="divide-y divide-gray-50">
            {loading ? <div className="p-12 text-center text-gray-400">Yükleniyor...</div> : sortedProducts.length === 0 ? <div className="p-12 text-center text-gray-400">Ürün bulunamadı.</div> : (
               sortedProducts.map((p) => {
                 const isMissingInfo = p.cost_price === 0;
                 return (
                 <div key={p.id} className={`grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-gray-50 transition-colors group ${isMissingInfo ? 'bg-orange-50/30' : ''}`}>
                    <div className="col-span-4 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs shrink-0 overflow-hidden">
                          {p.image_url ? <Image src={p.image_url} alt={p.name} width={40} height={40} className="w-full h-full object-cover" /> : <Package size={18}/>}
                       </div>
                       <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                            {p.name}
                            {isMissingInfo && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="Maliyet bilgisi eksik"></span>}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate flex items-center gap-1"><Tag size={10} /> {p.sku}</p>
                       </div>
                    </div>
                    <div className="col-span-2"><span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide border border-blue-100">{p.marketplace}</span></div>
                    <div className="col-span-2 text-right">
                       <p className="text-sm font-medium text-gray-500">{symbol}{convert(p.cost_price)}</p>
                       {p.shipping_cost > 0 && <p className="text-[9px] text-gray-400">+ {symbol}{convert(p.shipping_cost)} Kargo</p>}
                    </div>
                    <div className="col-span-2 text-right">
                       <p className="text-sm font-black text-gray-900">{symbol}{convert(p.selling_price)}</p>
                    </div>
                    <div className="col-span-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => openEditModal(p)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl"><Edit2 size={16} /></button>
                       <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></button>
                    </div>
                 </div>
                 )})
            )}
          </div>
        </div>
      </main>

      {/* YENİ AKILLI MODAL */}
      <ProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={handleModalSuccess}
        productToEdit={editingProduct}
      />

      {/* EXCEL IMPORT MODAL */}
      <ProductImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => { fetchProducts(); alert("Ürünler başarıyla yüklendi. Lütfen maliyet bilgilerini kontrol edin."); }}
      />
    </div>
  )
}