import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Careful: Webhook usually needs Service Role if updating unauthorized
// Actually we can use createClient if we have Supabase Admin/Service Key configured or simply rely on row policies, but webhooks are public endpoints.
// We should use createAdminClient for secure operations from webhook.
import { createAdminClient } from '@/lib/supabase-admin';
import { PayTR } from '@/lib/payment/paytr';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const params: any = {};
        formData.forEach((value, key) => params[key] = value);

        console.log('PayTR Webhook:', params);

        // 1. Validate Hash
        if (!PayTR.validateCallback(params)) {
            console.error("PayTR Hash Mismatch");
            return new NextResponse('PAYTR Notification Failed', { status: 400 }); // Must verify exact string expected by PayTR if any
        }

        const { merchant_oid, status, total_amount } = params;

        // 2. Process Order
        if (status === 'success') {
            // merchant_oid format: SUB-userIdPart-timestamp ?? 
            // Better to pass userId in merchant_oid or store order mapping.
            // But we used `SUB-${user.id.slice(0, 5)}-${Date.now()}` which is lossy for ID.
            // CRITICAL: We need full UserID to update subscription.
            // Correction: app/api/payment/start/route.ts should store a "pending order" in DB mapping OrderID -> UserID.
            // OR we embed UserID in OrderID safely. Assuming UUID is 36 chars.
            // Let's rely on finding the User via the partial ID is risky.
            // Optimization: Store "payment_intents" table or update `subscriptions` with `provider_ref_id` = orderId PENDING status before starting.
            // For MVP: Let's assume we can fetch the user by EMAIL which PayTR sends back? 
            // PayTR returns `email`.

            const email = params.email;
            const supabaseAdmin = createAdminClient();

            // Find User by Email
            const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
            const user = users?.find(u => u.email === email);

            if (user) {
                // Update Subscription
                // Determine plan by amount? 
                // 299 -> Clear, 899 -> Control, 1999 -> Vision
                let planId = 'clear';
                if (Number(total_amount) >= 1999) planId = 'vision';
                else if (Number(total_amount) >= 899) planId = 'control';

                const nextMonth = new Date();
                nextMonth.setDate(nextMonth.getDate() + 30);

                await supabaseAdmin.from('subscriptions').upsert({
                    user_id: user.id,
                    status: 'active',
                    plan_id: planId,
                    current_period_end: nextMonth.toISOString(),
                    payment_provider: 'paytr',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

                // Log Financial Event
                await supabaseAdmin.from('financial_event_log').insert({
                    user_id: user.id,
                    event_type: 'SubscriptionPaymentSuccess',
                    amount: total_amount,
                    currency: 'TRY',
                    description: `Abonelik Yenileme (${planId})`,
                    payload: params
                });
            } else {
                console.error("User not found for email:", email);
            }
        } else {
            console.log("Payment Failed or Wait");
        }

        return new NextResponse('OK'); // PayTR expects literal "OK"

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return new NextResponse('Error', { status: 500 });
    }
}
