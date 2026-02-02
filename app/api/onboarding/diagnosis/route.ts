import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateDiagnosisReport } from '@/lib/onboarding/diagnosis';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const report = await generateDiagnosisReport(user.id);

        return NextResponse.json(report);
    } catch (error: any) {
        console.error('Diagnosis API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal error', hasEnoughData: false },
            { status: 500 }
        );
    }
}
