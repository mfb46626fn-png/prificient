import { Resend } from 'resend';
import { render } from '@react-email/render';
import SystemReadyEmail from '@/emails/SystemReadyEmail';
import OrderProfitEmail from '@/emails/OrderProfitEmail';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123_dummy');

export class EmailService {
    static async sendSystemReady(to: string) {
        if (!to || !to.includes('@')) return;

        console.log(`[Email] Sending SystemReady to ${to}`);

        try {
            const emailHtml = await render(SystemReadyEmail());

            await resend.emails.send({
                from: 'Prificient <system@prificient.com>',
                to,
                subject: 'Verileriniz İşlendi. Gerçeklerle Yüzleşme Vakti.',
                html: emailHtml
            });
        } catch (error) {
            console.error('[Email Error]', error);
        }
    }

    static async sendOrderProfitAlert(to: string, orderData: any, profitData: any) {
        if (!to || !to.includes('@')) return;

        const { profit, revenue, costs } = profitData;
        const orderName = orderData.name || orderData.order_number;
        const orderId = orderData.id;

        console.log(`[Email] Sending OrderProfit to ${to}`);

        try {
            const emailHtml = await render(OrderProfitEmail({
                orderName,
                revenue,
                costs,
                profit,
                orderId
            }));

            await resend.emails.send({
                from: 'Prificient <system@prificient.com>',
                to,
                subject: `Sipariş ${orderName}: ₺${profit} Net Kâr Bıraktı 💰`,
                html: emailHtml
            });
        } catch (error) {
            console.error('[Email Error]', error);
        }
    }
}
