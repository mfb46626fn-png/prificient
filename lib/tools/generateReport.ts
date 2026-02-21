import { jsPDF } from 'jspdf'
import type { ToolConfig } from './types'
import type { ToolInsight } from './types'

interface ReportData {
    config: ToolConfig
    inputs: Record<string, string>
    results: Record<string, number | string>
    insight: ToolInsight | null
}

export function generateCFOReport({ config, inputs, results, insight }: ReportData): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let y = margin

    // ─── Header ─────────────────────────────
    doc.setFillColor(88, 28, 255) // violet-600
    doc.rect(0, 0, pageWidth, 36, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text('PRIFICIENT', margin, 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(200, 200, 255)
    doc.text('Akıllı Hesaplama Motoru | CFO Raporu', margin, 24)

    // Date
    const now = new Date()
    const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
    doc.setFontSize(8)
    doc.setTextColor(200, 200, 255)
    doc.text(dateStr, pageWidth - margin, 24, { align: 'right' })

    y = 48

    // ─── Tool Title ─────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(17, 24, 39) // gray-900
    doc.text(config.title, margin, y)
    y += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128) // gray-500
    doc.text(config.description, margin, y, { maxWidth: contentWidth })
    y += 14

    // ─── Divider ────────────────────────────
    doc.setDrawColor(229, 231, 235) // gray-200
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // ─── Inputs Table ───────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(17, 24, 39)
    doc.text('Girdi Parametreleri', margin, y)
    y += 8

    config.inputs.forEach((input) => {
        const value = inputs[input.id] || String(input.defaultValue || '')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(107, 114, 128)
        doc.text(input.label, margin, y)
        doc.setTextColor(17, 24, 39)
        doc.setFont('helvetica', 'bold')
        doc.text(value, pageWidth - margin, y, { align: 'right' })
        y += 6
    })

    y += 8

    // ─── Results Table ──────────────────────
    doc.setDrawColor(229, 231, 235)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(17, 24, 39)
    doc.text('Hesaplama Sonuclari', margin, y)
    y += 8

    config.results.forEach((result) => {
        const value = results[result.id]
        if (value === undefined) return

        let displayValue: string
        if (typeof value === 'string') {
            displayValue = value
        } else {
            switch (result.type) {
                case 'currency': displayValue = `₺${value.toLocaleString('tr-TR')}`; break
                case 'percent': displayValue = `%${value}`; break
                default: displayValue = String(value)
            }
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(107, 114, 128)
        doc.text(result.label, margin, y)

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(17, 24, 39)
        doc.text(displayValue, pageWidth - margin, y, { align: 'right' })
        y += 6

        if (result.description) {
            doc.setFont('helvetica', 'italic')
            doc.setFontSize(7)
            doc.setTextColor(156, 163, 175)
            doc.text(result.description, margin, y)
            y += 5
        }
    })

    y += 8

    // ─── Insight Card ───────────────────────
    if (insight) {
        const levelColors: Record<string, { r: number; g: number; b: number }> = {
            danger: { r: 239, g: 68, b: 68 },
            warning: { r: 245, g: 158, b: 11 },
            success: { r: 16, g: 185, b: 129 },
        }
        const levelLabels: Record<string, string> = {
            danger: 'TEHLIKE',
            warning: 'UYARI',
            success: 'SAGLIKLI',
        }
        const lc = levelColors[insight.level] || levelColors.success

        doc.setDrawColor(229, 231, 235)
        doc.line(margin, y, pageWidth - margin, y)
        y += 10

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(17, 24, 39)
        doc.text('Prificient Analizi', margin, y)
        y += 8

        // Level badge
        doc.setFillColor(lc.r, lc.g, lc.b)
        doc.roundedRect(margin, y - 3, 22, 6, 2, 2, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(6)
        doc.setTextColor(255, 255, 255)
        doc.text(levelLabels[insight.level] || 'ANALIZ', margin + 2, y + 1)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(17, 24, 39)
        doc.text(insight.title, margin + 26, y + 1)
        y += 10

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(75, 85, 99) // gray-600
        const messageLines = doc.splitTextToSize(insight.message, contentWidth)
        doc.text(messageLines, margin, y)
        y += messageLines.length * 5 + 6

        if (insight.recommendation) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(8)
            doc.setTextColor(88, 28, 255) // violet-600
            doc.text('Onerilen Aksiyon:', margin, y)
            y += 5

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8)
            doc.setTextColor(75, 85, 99)
            const recLines = doc.splitTextToSize(insight.recommendation, contentWidth)
            doc.text(recLines, margin, y)
            y += recLines.length * 4 + 10
        }
    }

    // ─── Footer ─────────────────────────────
    const footerY = doc.internal.pageSize.getHeight() - 20

    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.text(
        'Bu analiz Prificient Akilli Hesaplama Motoru ile uretilmistir.',
        pageWidth / 2,
        footerY,
        { align: 'center' }
    )
    doc.text(
        'Siz de kendi magazanizi test etmek icin tools.prificient.com adresini ziyaret edin.',
        pageWidth / 2,
        footerY + 4,
        { align: 'center' }
    )

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(88, 28, 255)
    doc.text('tools.prificient.com', pageWidth / 2, footerY + 10, { align: 'center' })

    // ─── Save ───────────────────────────────
    const filename = `Prificient_${config.slug}_${now.toISOString().slice(0, 10)}.pdf`
    doc.save(filename)
}
