import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const analysis = await generateComprehensiveAnalysis(user.id);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('[Analysis API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
