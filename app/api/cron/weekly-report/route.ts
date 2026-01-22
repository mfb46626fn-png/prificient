import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { LedgerService } from '@/lib/ledger';
import { EmailService } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const supabaseAdmin = createAdminClient();

        // 1. Fetch Users & Settings
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        const { data: settingsData } = await supabaseAdmin.from('notification_settings').select('user_id, report_frequency');
        const userSettings = new Map(settingsData?.map(s => [s.user_id, s.report_frequency]) || []);

        const now = new Date();
        const isMonday = now.getDay() === 1; // Monday
        const isFirstOfMonth = now.getDate() === 1;

        const results = await Promise.allSettled(authUsers.map(async (user) => {
            if (!user.email) return;

            const frequency = userSettings.get(user.id) || 'weekly'; // Default to weekly

            if (frequency === 'never') return;

            // Scheduling Logic (Assuming Cron runs Daily)
            if (frequency === 'weekly' && !isMonday) return;
            if (frequency === 'monthly' && !isFirstOfMonth) return;
            // 'daily' runs every day

            // Determine Date Range
            const endDate = new Date();
            const startDate = new Date();

            let reportTitle = 'Finansal Rapor';

            if (frequency === 'daily') {
                startDate.setDate(endDate.getDate() - 1); // Yesterday
                reportTitle = 'Günlük Rapor';
            } else if (frequency === 'weekly') {
                startDate.setDate(endDate.getDate() - 7); // Last 7 Days
                reportTitle = 'Haftalık Rapor';
            } else if (frequency === 'monthly') {
                startDate.setMonth(endDate.getMonth() - 1); // Last Month
                reportTitle = 'Aylık Rapor';
            }

            // Calculate financials for this user
            const financials = await LedgerService.getWeeklyFinancials(user.id, startDate, endDate);

            // Send email
            await EmailService.sendWeeklyReport(user.email, {
                title: reportTitle, // New Param
                netProfit: `₺${financials.netProfit.toFixed(2)}`,
                revenue: `₺${financials.revenue.toFixed(2)}`,
                adSpend: `₺${financials.adSpend.toFixed(2)}`,
                roi: `%${financials.roi.toFixed(1)}`,
                dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
                dateRange: `${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')}`,
                userName: user.user_metadata?.full_name || 'Kullanıcı'
            });
        }));

        return NextResponse.json({
            success: true,
            summary: {
                total_users: authUsers.length,
                processed: results.length, // Actually attempts
                day_context: { isMonday, isFirstOfMonth }
            }
        });

    } catch (error: any) {
        console.error('Cron Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
