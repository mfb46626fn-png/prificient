'use client'

/**
 * Meta Ads Import Component
 * 
 * CSV upload interface for Meta Ads data with smart product matching.
 * Shows import history and allows batch deletion.
 */

import { useState, useCallback } from 'react'
import { Upload, FileText, Check, X, AlertTriangle, Trash2, RefreshCw } from 'lucide-react'

interface ImportResult {
    success: boolean
    message?: string
    data?: {
        totalRows: number
        importedRows: number
        matchedRows: number
        unmatchedCampaigns: string[]
        batchId: string
    }
    errors?: string[]
}

interface ImportHistory {
    batchId: string
    rowCount: number
    matchedCount: number
    totalSpend: number
    dateRange: { start: string; end: string }
    importedAt: string
}

export default function MetaAdsImport() {
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)
    const [history, setHistory] = useState<ImportHistory[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Load import history
    const loadHistory = useCallback(async () => {
        setLoadingHistory(true)
        try {
            const res = await fetch('/api/meta/import')
            const data = await res.json()
            if (data.success) {
                setHistory(data.imports || [])
            }
        } catch (e) {
            console.error('Failed to load history:', e)
        } finally {
            setLoadingHistory(false)
        }
    }, [])

    // Handle file selection
    const handleFile = (selectedFile: File) => {
        if (!selectedFile.name.endsWith('.csv')) {
            setResult({ success: false, errors: ['Sadece CSV dosyaları kabul edilir'] })
            return
        }
        setFile(selectedFile)
        setResult(null)
    }

    // Drag and drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true)
        } else if (e.type === 'dragleave') {
            setIsDragging(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    // Upload file
    const uploadFile = async () => {
        if (!file) return

        setUploading(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/meta/import', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            setResult(data)

            if (data.success) {
                setFile(null)
                loadHistory()
            }
        } catch (e) {
            setResult({
                success: false,
                errors: ['Upload başarısız: ' + (e instanceof Error ? e.message : 'Bilinmeyen hata')]
            })
        } finally {
            setUploading(false)
        }
    }

    // Delete a batch
    const deleteBatch = async (batchId: string) => {
        if (!confirm('Bu import\'u silmek istediğinize emin misiniz?')) return

        try {
            const res = await fetch(`/api/meta/import?batchId=${batchId}`, {
                method: 'DELETE'
            })
            const data = await res.json()

            if (data.success) {
                loadHistory()
            }
        } catch (e) {
            console.error('Delete failed:', e)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Meta Ads Import</h2>
                    <p className="text-sm text-gray-500">Meta Ads Manager'dan CSV export'unu yükleyin</p>
                </div>
                <button
                    onClick={loadHistory}
                    disabled={loadingHistory}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <RefreshCw size={18} className={loadingHistory ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${file ? 'bg-gray-50' : ''}
        `}
            >
                {file ? (
                    <div className="flex items-center justify-center gap-3">
                        <FileText className="text-blue-600" size={24} />
                        <div className="text-left">
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="ml-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload className="mx-auto mb-4 text-gray-400" size={40} />
                        <p className="text-gray-600 mb-2">CSV dosyanızı sürükleyip bırakın</p>
                        <p className="text-gray-400 text-sm mb-4">veya</p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                            <span className="text-sm font-medium text-gray-700">Dosya Seç</span>
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            />
                        </label>
                    </>
                )}
            </div>

            {/* Upload Button */}
            {file && (
                <button
                    onClick={uploadFile}
                    disabled={uploading}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <RefreshCw className="animate-spin" size={18} />
                            Import Ediliyor...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Import Et
                        </>
                    )}
                </button>
            )}

            {/* Result */}
            {result && (
                <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {result.success ? (
                            <Check className="text-green-600" size={20} />
                        ) : (
                            <AlertTriangle className="text-red-600" size={20} />
                        )}
                        <span className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                            {result.message || (result.success ? 'Import başarılı!' : 'Import başarısız')}
                        </span>
                    </div>

                    {result.data && (
                        <div className="text-sm text-gray-600 ml-7">
                            <p>Toplam: {result.data.totalRows} satır</p>
                            <p>Import edilen: {result.data.importedRows} satır</p>
                            <p>Ürünle eşleşen: {result.data.matchedRows} satır</p>
                            {result.data.unmatchedCampaigns.length > 0 && (
                                <p className="text-amber-600 mt-2">
                                    ⚠️ {result.data.unmatchedCampaigns.length} kampanya ürünle eşleştirilemedi
                                </p>
                            )}
                        </div>
                    )}

                    {result.errors && result.errors.length > 0 && (
                        <div className="text-sm text-red-600 ml-7 mt-2">
                            {result.errors.slice(0, 3).map((err, i) => (
                                <p key={i}>• {err}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Import History */}
            {history.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Import Geçmişi</h3>
                    <div className="space-y-2">
                        {history.slice(0, 5).map((batch) => (
                            <div key={batch.batchId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {batch.dateRange.start} - {batch.dateRange.end}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {batch.rowCount} satır • {batch.matchedCount} eşleşme • ${batch.totalSpend.toFixed(2)} harcama
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteBatch(batch.batchId)}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Nasıl Export Edilir?</h4>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Meta Ads Manager'a gidin</li>
                    <li>Tarih aralığını seçin</li>
                    <li>Export → CSV formatında indirin</li>
                    <li>Şu kolonları içerdiğinden emin olun: Campaign Name, Amount Spent, Purchases</li>
                </ol>
            </div>
        </div>
    )
}
