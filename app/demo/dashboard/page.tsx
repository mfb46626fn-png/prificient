'use client'

import DashboardClient from '@/components/DashboardClient'
import { DEMO_DATA } from '@/lib/demo-data'

export default function DemoDashboardPage() {
    return <DashboardClient metrics={DEMO_DATA.metrics} isDemo={true} />
}
