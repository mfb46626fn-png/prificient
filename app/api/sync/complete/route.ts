import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { EmailService } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabaseAdmin = createAdminClient();

        // 1. Update Integration Status (Admin Client)
        const { error } = await supabaseAdmin
            .from('integrations')
            .update({
                sync_status: 'completed',
                sync_progress: 100,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('platform', 'shopify');

        if (error) throw error;

        // 2. Trigger System Ready Email (Phase 6)
        try {
            if (user.email) {
                await EmailService.sendSystemReady(user.email);
            }
        } catch (emailError) {
            console.error('Failed to send Ready Email:', emailError);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Sync Complete] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
