'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function DateFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPeriod = searchParams.get('period') || 'all'

  const periods = [
    { id: 'all', label: 'Tümü' },
    { id: 'this-month', label: 'Bu Ay' },
    { id: 'last-month', label: 'Geçen Ay' }
  ]

  const handleFilter = (period: string) => {
    router.push(`/dashboard?period=${period}`)
  }

  return (
    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
      {periods.map((p) => (
        <button
          key={p.id}
          onClick={() => handleFilter(p.id)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            currentPeriod === p.id 
            ? 'bg-white text-black shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}