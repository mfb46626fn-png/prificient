// ─── Tool Factory Type Definitions ──────────────────────

export type InputType = 'number' | 'currency' | 'percent' | 'text'
export type ResultType = 'currency' | 'percent' | 'number' | 'text'
export type ToolCategory = 'finance' | 'marketing' | 'operations' | 'utility'

// ─── Insight Engine ─────────────────────────────────────

export type InsightLevel = 'success' | 'warning' | 'danger'

export interface ToolInsight {
    value: string           // Hesaplanan değer (Örn: "3.2x", "%15")
    level: InsightLevel     // Kart rengi (yeşil, sarı, kırmızı)
    title: string           // Başlık (Örn: "Nakit Yakıyorsunuz!")
    message: string         // Durum açıklaması
    recommendation: string  // Prificient tavsiyesi
}

// ─── Tool Input / Result ────────────────────────────────

export interface ToolInput {
    id: string
    label: string
    type: InputType
    defaultValue: number | string
    placeholder?: string
    tooltip?: string
}

export interface ToolResult {
    id: string
    label: string
    type: ResultType
    formula: (inputs: Record<string, number>, rawInputs?: Record<string, string>) => number | string
    isLocked?: boolean
    /** Optional description shown below the result */
    description?: string
    /** Optional: positive = good, negative = bad (for color coding) */
    sentiment?: (value: number | string) => 'positive' | 'negative' | 'neutral'
    /** Locked insight analysis — returns a rich intelligence card */
    insight?: (inputs: Record<string, number>) => ToolInsight
}

// ─── Tool Config ────────────────────────────────────────

export interface ToolFAQ {
    question: string
    answer: string
}

export interface ToolConfig {
    slug: string
    title: string
    description: string
    category: ToolCategory
    color: string
    icon: string // SVG path d attribute for hero icon
    inputs: ToolInput[]
    results: ToolResult[]
    content: {
        intro: string
        howItWorks: string // What the tool does and how to use it
        details: string
        faq: ToolFAQ[]
    }
}
