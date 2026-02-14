'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '@/utils/translations'

type Language = 'tr' | 'en'
type Currency = 'TRY' | 'USD' | 'EUR'

interface PreferencesContextType {
  language: Language
  setLanguage: (lang: Language) => void
  currency: Currency
  setCurrency: (curr: Currency) => void
  t: typeof translations['tr']
  convertAmount: (amountTRY: number) => string
  // Grafikler hata vermesin diye bu objeyi buraya ekliyoruz
  chartColors: { text: string; grid: string; tooltipBg: string }
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('tr')
  const [currency, setCurrency] = useState<Currency>('TRY')
  const [rates, setRates] = useState<Record<Currency, number>>({ TRY: 1, USD: 0.033, EUR: 0.030 })

  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Language
    const savedCurr = localStorage.getItem('app-curr') as Currency
    if (savedLang) setLanguage(savedLang)
    if (savedCurr) setCurrency(savedCurr)
    
    // Uygulamada kalan tüm dark mode kalıntılarını siliyoruz
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('app-theme')
  }, [])

  const convertAmount = (amountTRY: number) => {
    const converted = amountTRY * rates[currency]
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency', currency: currency
    }).format(converted)
  }

  // GRAFİK HATASINI ÇÖZEN KISIM: Sabit aydınlık mod renkleri
  const chartColors = {
    text: '#6b7280',    // Slate/Gray 500
    grid: '#f3f4f6',    // Gray 100
    tooltipBg: '#ffffff'
  }

  return (
    <PreferencesContext.Provider value={{
      language, 
      setLanguage: (l) => { setLanguage(l); localStorage.setItem('app-lang', l) },
      currency, 
      setCurrency: (c) => { setCurrency(c); localStorage.setItem('app-curr', c) },
      t: translations[language],
      convertAmount,
      chartColors // <-- Grafiğe giden renkleri buraya ekledik
    }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider')
  return context
}