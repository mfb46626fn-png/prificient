'use client'

import { useState } from 'react'
import { BarChart3, PieChart, LineChart, FileText, Calendar, Filter, Save, ArrowRight, Check } from 'lucide-react'

export type ReportConfig = {
    type: 'revenue' | 'expense' | 'profit'
    range: '7d' | '30d' | '90d' | 'custom'
    visualization: 'bar' | 'line' | 'pie' | 'table'
}

interface ReportBuilderProps {
    onSave: (title: string, config: ReportConfig) => void
    onCancel: () => void
}

export default function ReportBuilder({ onSave, onCancel }: ReportBuilderProps) {
    const [step, setStep] = useState(1)
    const [title, setTitle] = useState('')
    const [config, setConfig] = useState<ReportConfig>({
        type: 'revenue',
        range: '30d',
        visualization: 'bar'
    })

    const handleSave = () => {
        if (!title.trim()) return
        onSave(title, config)
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Rapor Oluşturucu</h2>
                    <p className="text-gray-500 font-medium">Adım {step}/3</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-black font-bold text-sm">İptal</button>
            </div>

            {/* STEP 1: VERİ TİPİ */}
            {step === 1 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">1. Ne raporlamak istiyorsunuz?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { id: 'revenue', label: 'Gelirler', icon: <BarChart3 size={24} />, desc: 'Satışlar ve diğer gelirler' },
                            { id: 'expense', label: 'Giderler', icon: <FileText size={24} />, desc: 'Operasyonel harcamalar' },
                            { id: 'profit', label: 'Net Kâr', icon: <LineChart size={24} />, desc: 'Gelir - Gider analizi' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setConfig({ ...config, type: opt.id as any })}
                                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${config.type === opt.id
                                    ? 'border-black bg-white text-black shadow-xl shadow-black/5 scale-[1.02] ring-1 ring-black/5'
                                    : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                    }`}
                            >
                                <div className="mb-3 !bg-transparent">{opt.icon}</div>
                                <div className="font-bold text-lg mb-1 !bg-transparent">{opt.label}</div>
                                <div className="text-xs opacity-70 !bg-transparent">{opt.desc}</div>
                            </button>
                        ))}
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button onClick={() => setStep(2)} className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2">
                            Sonraki Adım <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: ZAMAN ARALIĞI & GÖRÜNÜM */}
            {step === 2 && (
                <div className="space-y-8">
                    {/* Range */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">2. Zaman Aralığı</h3>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { id: '7d', label: 'Son 7 Gün' },
                                { id: '30d', label: 'Son 30 Gün' },
                                { id: '90d', label: 'Son 3 Ay' },
                                { id: 'custom', label: 'Özel Aralık (Yakında)' },
                            ].map((range) => (
                                <button
                                    key={range.id}
                                    onClick={() => setConfig({ ...config, range: range.id as any })}
                                    disabled={range.id === 'custom'}
                                    className={`px-6 py-3 rounded-xl font-bold border-2 transition-all duration-200 ${config.range === range.id
                                        ? 'border-black bg-white text-black shadow-md'
                                        : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                        }`}
                                >
                                    <span className="bg-transparent">{range.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Visualization */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">3. Görünüm Tipi</h3>
                        <div className="flex gap-4">
                            {[
                                { id: 'bar', icon: <BarChart3 />, label: 'Sütun' },
                                { id: 'line', icon: <LineChart />, label: 'Çizgi' },
                                { id: 'pie', icon: <PieChart />, label: 'Pasta' },
                                { id: 'table', icon: <FileText />, label: 'Tablo' },
                            ].map((vis) => (
                                <button
                                    key={vis.id}
                                    onClick={() => setConfig({ ...config, visualization: vis.id as any })}
                                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${config.visualization === vis.id
                                        ? 'border-black bg-white text-black shadow-xl shadow-black/5 scale-[1.05]'
                                        : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                        }`}
                                >
                                    <div className="!bg-transparent">{vis.icon}</div>
                                    <span className="text-xs font-bold !bg-transparent">{vis.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                        <button onClick={() => setStep(1)} className="text-gray-500 font-bold px-4 py-2 hover:bg-gray-100 rounded-lg">Geri</button>
                        <button onClick={() => setStep(3)} className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2">
                            Sonraki Adım <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: İSİMLENDİRME & KAYDET */}
            {step === 3 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Raporunuza bir isim verin</h3>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-4 text-sm font-medium text-gray-500">
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">
                                {config.type === 'revenue' ? 'Gelir' : config.type === 'expense' ? 'Gider' : 'Kâr'}
                            </span>
                            <ArrowRight size={14} />
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">{config.range}</span>
                            <ArrowRight size={14} />
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">{config.visualization}</span>
                        </div>

                        <input
                            type="text"
                            placeholder="Örn: Aylık Gider Özeti"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white border-2 border-transparent p-4 rounded-xl font-bold text-lg outline-none focus:border-black transition-all"
                            autoFocus
                        />
                    </div>

                    <div className="pt-4 flex justify-between">
                        <button onClick={() => setStep(2)} className="text-gray-500 font-bold px-4 py-2 hover:bg-gray-100 rounded-lg">Geri</button>
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
                        >
                            <Check size={20} /> Raporu Kaydet
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
