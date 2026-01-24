import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PayTR } from '@/lib/payment/paytr';
import { PLANS, PlanId } from '@/config/plans';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { planId } = body;

        const plan = PLANS[planId.toUpperCase() as keyof typeof PLANS];
        if (!plan) {
            return NextResponse.json({ error: 'Invalid Plan' }, { status: 400 });
        }

        // Generate Order ID (Unique)
        const orderId = `SUB-${user.id.slice(0, 5)}-${Date.now()}`;

        // Get IP (Approximate)
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(/, /)[0] : '127.0.0.1';

        // Get Token
        const token = await PayTR.getPaymentToken(
            {
                email: user.email || 'no-email@prificient.com',
                name: user.user_metadata?.full_name || 'Prificient User',
                address: 'Digital Service',
                phone_number: '905555555555',
                ip_ip: ip
            },
            [{ name: `Prificient ${plan.name} Plan`, price: plan.price.toFixed(2) }],
            plan.price,
            orderId
        );

        return NextResponse.json({ token, orderId });

    } catch (error: any) {
        console.error('Payment Start Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
