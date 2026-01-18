'use client'

import DecisionsClient from '@/components/DecisionsClient'
import { DEMO_DATA } from '@/lib/demo-data'

export default function DemoDecisionsPage() {
    // @ts-ignore
    return <DecisionsClient decisions={DEMO_DATA.decisions} isDemo={true} />
}
