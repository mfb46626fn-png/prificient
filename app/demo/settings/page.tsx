'use client'

import SettingsClient from '@/components/SettingsClient'
import { DEMO_DATA } from '@/lib/demo-data'

export default function DemoSettingsPage() {
    return <SettingsClient initialProfile={DEMO_DATA.profile} isDemo={true} />
}
