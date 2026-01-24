import { createClient } from '@/utils/supabase/server'
import { PainEngine } from '@/lib/scoring/pain-engine'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await PainEngine.diagnose(user.id)
        return NextResponse.json(result)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
