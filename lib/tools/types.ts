// ─── Tool Factory Type Definitions ──────────────────────

export type InputType = 'number' | 'currency' | 'percent' | 'text'
export type ResultType = 'currency' | 'percent' | 'number' | 'text'
export type ToolCategory = 'finance' | 'marketing' | 'operations' | 'utility'

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
}

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
