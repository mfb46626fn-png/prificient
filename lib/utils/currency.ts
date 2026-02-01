/**
 * Currency Utility
 * 
 * Multi-currency support for formatting and symbol mapping.
 * Uses the store's default currency from Shopify.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    MXN: 'MX$',
    PLN: 'zł',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    CHF: 'CHF',
    NZD: 'NZ$',
    SGD: 'S$',
    HKD: 'HK$',
    KRW: '₩',
    ZAR: 'R',
    AED: 'د.إ',
    SAR: '﷼'
}

export const CURRENCY_LOCALES: Record<string, string> = {
    TRY: 'tr-TR',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    AUD: 'en-AU',
    CAD: 'en-CA',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
    INR: 'en-IN',
    BRL: 'pt-BR',
    MXN: 'es-MX',
    PLN: 'pl-PL',
    SEK: 'sv-SE',
    NOK: 'nb-NO',
    DKK: 'da-DK',
    CHF: 'de-CH',
    NZD: 'en-NZ',
    SGD: 'en-SG',
    HKD: 'en-HK',
    KRW: 'ko-KR',
    ZAR: 'en-ZA'
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
    return CURRENCY_SYMBOLS[currencyCode?.toUpperCase()] || currencyCode || '₺'
}

/**
 * Format a number as currency
 */
export function formatCurrency(
    amount: number,
    currencyCode: string = 'TRY',
    options: {
        showSign?: boolean
        compact?: boolean
        minimumFractionDigits?: number
        maximumFractionDigits?: number
    } = {}
): string {
    const {
        showSign = false,
        compact = false,
        minimumFractionDigits = 0,
        maximumFractionDigits = 0
    } = options

    const symbol = getCurrencySymbol(currencyCode)
    const locale = CURRENCY_LOCALES[currencyCode?.toUpperCase()] || 'tr-TR'

    const isNegative = amount < 0
    const absAmount = Math.abs(amount)

    let formattedAmount: string

    if (compact && absAmount >= 1000000) {
        formattedAmount = (absAmount / 1000000).toLocaleString(locale, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) + 'M'
    } else if (compact && absAmount >= 1000) {
        formattedAmount = (absAmount / 1000).toLocaleString(locale, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) + 'K'
    } else {
        formattedAmount = absAmount.toLocaleString(locale, {
            minimumFractionDigits,
            maximumFractionDigits
        })
    }

    const sign = isNegative ? '-' : (showSign ? '+' : '')

    return `${sign}${symbol}${formattedAmount}`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value >= 0 ? '' : '-'}%${Math.abs(value).toFixed(decimals)}`
}

/**
 * Format number with locale
 */
export function formatNumber(
    value: number,
    currencyCode: string = 'TRY',
    options: {
        compact?: boolean
    } = {}
): string {
    const locale = CURRENCY_LOCALES[currencyCode?.toUpperCase()] || 'tr-TR'
    const { compact = false } = options

    if (compact && Math.abs(value) >= 1000000) {
        return (value / 1000000).toLocaleString(locale, { maximumFractionDigits: 1 }) + 'M'
    } else if (compact && Math.abs(value) >= 1000) {
        return (value / 1000).toLocaleString(locale, { maximumFractionDigits: 1 }) + 'K'
    }

    return value.toLocaleString(locale)
}

export default {
    getCurrencySymbol,
    formatCurrency,
    formatPercentage,
    formatNumber
}
