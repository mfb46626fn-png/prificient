'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type CurrencyContextType = {
  currency: string
  symbol: string
  rates: Record<string, number>
  convert: (amount: number) => string
  updateCurrency: (newCurrency: string) => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState('TRY')
  const [symbol, setSymbol] = useState('₺')
  const [rates, setRates] = useState<Record<string, number>>({ TRY: 1, USD: 0.030, EUR: 0.028 }) // Varsayılan başlangıç kurları
  const supabase = createClient()

  // 1. Güncel Kurları Çek (API üzerinden)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Ücretsiz bir döviz kuru API'si (TRY bazlı kurları getirir)
        const res = await fetch('https://open.er-api.com/v6/latest/TRY')
        const data = await res.json()
        if (data && data.rates) {
          setRates(data.rates)
        }
      } catch (error) {
        console.error("Kurlar alınamadı:", error)
      }
    }
    fetchRates()
  }, [])

  // 2. Kullanıcının tercihini veritabanından çek
  useEffect(() => {
    const fetchUserPreference = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('user_settings').select('currency').eq('user_id', user.id).single()
        if (data?.currency) applyCurrency(data.currency)
      }
    }
    fetchUserPreference()
  }, [supabase])

  const applyCurrency = (curr: string) => {
    setCurrency(curr)
    if (curr === 'USD') setSymbol('$')
    else if (curr === 'EUR') setSymbol('€')
    else setSymbol('₺')
  }

  // 3. MATEMATİKSEL ÇEVİRİ FONKSİYONU
  // Girdi her zaman veritabanındaki ana para birimi (TRY) kabul edilir.
  const convert = (amount: number) => {
    const rate = rates[currency] || 1
    const converted = amount * rate
    // Virgülden sonra maks 2 hane, binlik ayırıcı ile formatla
    return converted.toLocaleString('tr-TR', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    })
  }

  const updateCurrency = async (newCurrency: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_settings').upsert({ user_id: user.id, currency: newCurrency })
      applyCurrency(newCurrency)
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, symbol, rates, convert, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider')
  return context
}