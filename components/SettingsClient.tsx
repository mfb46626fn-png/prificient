'use client'

import { Settings as SettingsIcon, Globe, Coins, Bell, Loader2 } from 'lucide-react'
import { usePreferences } from '@/app/contexts/PreferencesContext'
import { useCurrency } from '@/app/contexts/CurrencyContext' // Yeni Context eklendi
import { useState } from 'react'

export default function SettingsClient() {
  const { language, setLanguage, t } = usePreferences()
  const { currency, updateCurrency } = useCurrency() // Context'ten gelen değerler
  const [isUpdating, setIsUpdating] = useState(false)

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsUpdating(true)
    const newCurrency = e.target.value
    try {
      await updateCurrency(newCurrency) // Hem DB'yi hem global state'i günceller
    } catch (error) {
      console.error("Para birimi güncellenemedi:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.settings}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Uygulama tercihlerinizi kişiselleştirin.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/50 flex items-center gap-2">
              <SettingsIcon size={18} className="text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Genel Tercihler</h3>
          </div>
          
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
              
              {/* Para Birimi */}
              <div className="p-8 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <Coins size={22} />
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{t.currency}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t.currency_desc}</p>
                      </div>
                  </div>
                  <div className="relative">
                    <select 
                      disabled={isUpdating}
                      value={currency}
                      onChange={handleCurrencyChange}
                      className="bg-gray-50 dark:bg-gray-700 border-0 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all appearance-none pr-10 disabled:opacity-50"
                    >
                        <option value="TRY">₺ Türk Lirası (TRY)</option>
                        <option value="USD">$ Amerikan Doları (USD)</option>
                        <option value="EUR">€ Euro (EUR)</option>
                    </select>
                    {isUpdating ? (
                      <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                    ) : (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        {/* Custom arrow icon here if needed */}
                      </div>
                    )}
                  </div>
              </div>

              {/* Dil */}
              <div className="p-8 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <Globe size={22} />
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{t.language}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t.lang_desc}</p>
                      </div>
                  </div>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-gray-50 dark:bg-gray-700 border-0 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all appearance-none"
                  >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                  </select>
              </div>
          </div>
      </div>
      
      {/* Bildirimler */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/50 flex items-center gap-2">
              <Bell size={18} className="text-gray-400" />
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Bildirimler</h3>
          </div>
          <div className="p-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                  <label className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer" htmlFor="weekly-report">Haftalık Rapor E-postaları</label>
                  <input 
                    id="weekly-report"
                    type="checkbox" 
                    className="w-6 h-6 text-black bg-gray-200 border-0 rounded-lg focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                    defaultChecked 
                  />
              </div>
          </div>
      </div>
    </div>
  )
}