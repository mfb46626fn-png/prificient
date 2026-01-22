import ExcelJS from 'exceljs'

interface ExportContext {
    range: string
    type: string
    summary?: {
        totalRevenue?: number
        totalExpense?: number
        netProfit?: number
    }
}

export const exportToExcel = async (
    data: Record<string, any>[],
    fileName: string,
    context: ExportContext
) => {
    // 1. Create a new workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Prificient App'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Rapor')

    // 2. Define Columns
    worksheet.columns = [
        { header: 'Tarih', key: 'date', width: 15 },
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Açıklama', key: 'description', width: 40 },
        { header: 'Tutar', key: 'amount', width: 20 },
        { header: 'Tip', key: 'type', width: 15 },
    ]

    // 3. Add Title Section (Custom Header)
    worksheet.insertRow(1, [fileName.toUpperCase()])
    worksheet.mergeCells('A1:E1')

    // Title Styling
    const titleRow = worksheet.getRow(1)
    titleRow.height = 40
    titleRow.getCell(1).font = {
        name: 'Arial',
        family: 4,
        size: 20,
        bold: true,
        color: { argb: 'FFFFFFFF' }
    }
    titleRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF000000' } // Black background
    }
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // 4. Add Metadata (Date Range, Generated At)
    worksheet.insertRow(2, [`Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`])
    worksheet.mergeCells('A2:E2')
    worksheet.insertRow(3, [`Kapsam: ${context.range === 'custom' ? 'Özel' : context.range.toUpperCase()}`])
    worksheet.mergeCells('A3:E3')

    worksheet.getRow(2).font = { italic: true, size: 10, color: { argb: 'FF555555' } }
    worksheet.getRow(3).font = { italic: true, size: 10, color: { argb: 'FF555555' } }

    // Add spacing
    worksheet.insertRow(4, [''])

    // 5. Add Data Table Headers
    const headerRow = worksheet.getRow(5)
    headerRow.values = ['Tarih', 'Kategori', 'Açıklama', 'Tutar', 'Tip']
    headerRow.height = 25
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' } // Indigo color
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        }
    })

    // 6. Add Data Rows
    // Ensure data matches columns
    data.forEach((item) => {
        const row = worksheet.addRow({
            date: new Date(item.date).toLocaleDateString('tr-TR'),
            category: item.category || '-',
            description: item.description || '-',
            amount: item.amount,
            type: item.type === 'income' ? 'Gelir' : 'Gider' // Adjust mapping if needed
        })

        // Style cells
        row.getCell('amount').numFmt = '#,##0.00 "₺";[Red]-#,##0.00 "₺"'
        row.getCell('amount').font = { bold: true }

        // Conditional formatting for Type column
        if (item.type === 'income') {
            row.getCell('type').font = { color: { argb: 'FF10B981' } } // Green
        } else {
            row.getCell('type').font = { color: { argb: 'FFEF4444' } } // Red
        }

        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        })
    })

    // 7. Add Summary Section at the bottom

    if (context.summary) {
        if (context.summary.totalRevenue !== undefined) {
            const r = worksheet.addRow(['', '', 'TOPLAM GELİR', context.summary.totalRevenue, ''])
            r.getCell(3).font = { bold: true }
            r.getCell(4).numFmt = '#,##0.00 "₺"'
            r.getCell(4).font = { bold: true, color: { argb: 'FF10B981' } }
        }
        if (context.summary.totalExpense !== undefined) {
            const r = worksheet.addRow(['', '', 'TOPLAM GİDER', context.summary.totalExpense, ''])
            r.getCell(3).font = { bold: true }
            r.getCell(4).numFmt = '#,##0.00 "₺"'
            r.getCell(4).font = { bold: true, color: { argb: 'FFEF4444' } }
        }
        if (context.summary.netProfit !== undefined) {
            const r = worksheet.addRow(['', '', 'NET KÂR', context.summary.netProfit, ''])
            r.getCell(3).font = { bold: true, size: 12 }
            r.getCell(4).numFmt = '#,##0.00 "₺"'
            const color = context.summary.netProfit >= 0 ? 'FF10B981' : 'FFEF4444'
            r.getCell(4).font = { bold: true, size: 12, color: { argb: color } }

            // Background highlight for Net Profit
            r.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
            r.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
        }
    }

    // 8. Generate Buffer and Trigger Download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${fileName}.xlsx`
    anchor.click()
    window.URL.revokeObjectURL(url)
}
