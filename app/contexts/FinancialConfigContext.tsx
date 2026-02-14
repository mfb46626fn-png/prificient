'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

// Sabit Gider Kalemi Tipi
export type FixedExpense = {
    id: string
    title: string // Örn: Ofis Kirası
    amount: number // Tutar
    paymentDay: number // Ödeme Günü (1-31)
}

export type FinancialConfig = {
    // 1. Hedefler & Giderler
    profitTargetPercent: number
    minMargin: number
    monthlyFixedCost: number // Liste toplamından otomatik hesaplanacak
    fixedExpenses: FixedExpense[] 

    // 2. Platform & Maliyet
    selectedPlatform: string 
    platformCommission: number 
    paymentProcessorFee: number 
    fixedPerOrderFee: number 
    logisticsCost: number
    taxRate: number // Vergi Oranı (KDV)
    vatIncluded: boolean // <--- DÜZELTME: KDV Dahil/Hariç Ayarı Eklendi

    // 3. Reklam Modeli
    adSpendModel: 'fixed_monthly' | 'per_order' | 'per_product'
    adSpendAmount: number 

    // 4. Öngörü
    stockWarningDays: number
    riskAppetite: 'conservative' | 'moderate' | 'aggressive'
}

// Varsayılan Değerler
const DEFAULT_CONFIG: FinancialConfig = {
    profitTargetPercent: 25,
    minMargin: 10,
    monthlyFixedCost: 0,
    fixedExpenses: [], 

    selectedPlatform: 'Shopify',
    platformCommission: 2.0, 
    paymentProcessorFee: 2.9, 
    fixedPerOrderFee: 0.30, 
    logisticsCost: 0,
    taxRate: 20, 
    vatIncluded: true, // <--- DÜZELTME: Varsayılan olarak KDV Dahil (True)

    // Reklam Varsayılanları
    adSpendModel: 'fixed_monthly', 
    adSpendAmount: 0, 

    stockWarningDays: 14,
    riskAppetite: 'moderate'
}

interface FinancialConfigContextType {
    config: FinancialConfig
    loading: boolean
    refreshConfig: () => Promise<void>
}

const FinancialConfigContext = createContext<FinancialConfigContextType | undefined>(undefined)

export function FinancialConfigProvider({ children }: { children: ReactNode }) {
    const supabase = createClient()
    const [config, setConfig] = useState<FinancialConfig>(DEFAULT_CONFIG)
    const [loading, setLoading] = useState(true)

    const fetchConfig = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('profiles')
                .select('financial_config')
                .eq('id', user.id)
                .single()

            if (data?.financial_config) {
                // Mevcut verilerle varsayılanları birleştir
                setConfig(prev => ({ 
                    ...DEFAULT_CONFIG, 
                    ...data.financial_config,
                    // Eğer veritabanında henüz fixedExpenses yoksa boş array ata
                    fixedExpenses: data.financial_config.fixedExpenses || []
                }))
            }
        } catch (error) {
            console.error("Finansal ayarlar çekilemedi:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    return (
        <FinancialConfigContext.Provider value={{ config, loading, refreshConfig: fetchConfig }}>
            {children}
        </FinancialConfigContext.Provider>
    )
}

export const useFinancialConfig = () => {
    const context = useContext(FinancialConfigContext)
    if (context === undefined) {
        throw new Error('useFinancialConfig must be used within a FinancialConfigProvider')
    }
    return context
}