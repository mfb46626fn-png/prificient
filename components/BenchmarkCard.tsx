import { Trophy, TrendingUp, AlertTriangle, Users } from 'lucide-react'

interface BenchmarkCardProps {
    metricLabel: string // e.g., "Kâr Marjı"
    userValue: number // 25 (percent)
    median: number // 15
    top10: number // 30
    unit?: string // "%"
    status: 'success' | 'warning' | 'neutral'
    aiComment: string
}

export default function BenchmarkCard({ metricLabel, userValue, median, top10, unit = '%', status, aiComment }: BenchmarkCardProps) {
    // Determine position percentage (Linear interpolation for visualization)
    // 0 -> 0% width
    // Max value -> 100% width
    // Let's assume max is (top10 * 1.5)

    const maxScale = Math.max(top10 * 1.5, userValue * 1.2, 5); // Avoid div by zero
    const getPos = (val: number) => Math.min(100, Math.max(0, (val / maxScale) * 100));

    const userPos = getPos(userValue);
    const medianPos = getPos(median);
    const top10Pos = getPos(top10);

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col h-full animate-in fade-in zoom-in-95 duration-700">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${status === 'success' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Users size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Rakiplere Göre {metricLabel}</h3>
                    <p className="text-xs text-gray-400 font-bold">Benzer Hacimli Mağazalar</p>
                </div>
            </div>

            {/* CHART AREA */}
            <div className="relative h-24 mb-4 mt-2 select-none">

                {/* Track Line */}
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 rounded-full -translate-y-1/2 overflow-hidden">
                    {/* Zones colors could be added here */}
                </div>

                {/* Markers */}
                {/* MEDIAN */}
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all" style={{ left: `${medianPos}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="h-4 w-4 bg-gray-300 rounded-full border-2 border-white shadow-sm z-10"></div>
                    <span className="text-[10px] font-bold text-gray-400 mt-6 absolute w-20 text-center">Sektör Ort. <br />{median}{unit}</span>
                </div>

                {/* TOP 10 */}
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all" style={{ left: `${top10Pos}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="h-6 w-6 bg-amber-100 rounded-full border-2 border-amber-400 shadow-sm z-10 flex items-center justify-center">
                        <Trophy size={10} className="text-amber-600" />
                    </div>
                    <span className="text-[10px] font-black text-amber-500 mt-8 absolute w-20 text-center">Top %10 <br />{top10}{unit}</span>
                </div>

                {/* USER (Pointer) */}
                <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all z-20" style={{ left: `${userPos}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="relative">
                        <div className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-lg mb-2 relative ${status === 'success' ? 'bg-emerald-600' : status === 'warning' ? 'bg-rose-600' : 'bg-blue-600'}`}>
                            SİZ {userValue}{unit}
                            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${status === 'success' ? 'bg-emerald-600' : status === 'warning' ? 'bg-rose-600' : 'bg-blue-600'}`}></div>
                        </div>
                    </div>
                </div>

            </div>

            {/* AI COMMENT */}
            <div className={`mt-auto p-4 rounded-xl border-l-4 text-xs font-medium leading-relaxed ${status === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' :
                    status === 'warning' ? 'bg-rose-50 border-rose-400 text-rose-800' :
                        'bg-blue-50 border-blue-400 text-blue-800'
                }`}>
                <div className="flex gap-2">
                    {status === 'success' ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
                    <span>{aiComment}</span>
                </div>
            </div>
        </div>
    )
}
