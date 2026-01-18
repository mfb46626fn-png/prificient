'use client'

import DashboardHeader from '@/components/DashboardHeader'
import { BrainCircuit, Lightbulb, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'

interface Decision {
    id: number
    title: string
    description: string
    date: string
    type: 'suggestion' | 'warning'
}

interface DecisionsClientProps {
    decisions: Decision[]
    isDemo?: boolean
}

export default function DecisionsClient({ decisions, isDemo = false }: DecisionsClientProps) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <DashboardHeader isDemo={isDemo} />

            <main className="max-w-5xl mx-auto px-4 pt-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                        <BrainCircuit size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Karar Günlüğü</h1>
                        <p className="text-gray-500 font-medium">Yapay zeka analizlerine dayalı öneriler ve uyarılar.</p>
                    </div>
                </div>

                {decisions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lightbulb size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Henüz Bir Karar Önerisi Yok</h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-2">
                            {isDemo ? 'Sistem verilerini analiz ediyor...' : 'Veri akışı başladığında burada akıllı öneriler göreceksiniz.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {decisions.map((decision) => (
                            <div key={decision.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl flex-shrink-0 ${decision.type === 'suggestion' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {decision.type === 'suggestion' ? <Lightbulb size={24} /> : <AlertTriangle size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                {decision.title}
                                            </h3>
                                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                                {decision.date}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 font-medium leading-relaxed">
                                            {decision.description}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-black transition-colors">
                                            Detayları İncele <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
