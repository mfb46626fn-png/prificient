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

    static async sendOrderProfitAlert(to: string, orderData: { name?: string; order_number?: string; id: string }, profitData: { profit: number; revenue: number; costs: number }) {
        if (!to || !to.includes('@')) return;

        const { profit, revenue, costs } = profitData;
        const orderName = orderData.name || orderData.order_number || 'Unknown';
        const orderId = orderData.id;

        console.log(`[Email] Sending OrderProfit to ${to}`);

        try {
            const emailHtml = await render(OrderProfitEmail({
                orderName,
                revenue: revenue.toFixed(2),
                costs: costs.toFixed(2),
                profit: profit.toFixed(2),
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

    /**
     * Send ROAS vs Net Profit Warning
     * When ROAS looks good but actual profit is negative
     */
    static async sendROASWarning(
        to: string,
        data: {
            roas: number;
            netProfit: number;
            adSpend: number;
            revenue: number;
            currency: string;
        }
    ) {
        if (!to || !to.includes('@')) return;

        const { roas, netProfit, adSpend, revenue, currency } = data;

        console.log(`[Email] Sending ROAS Warning to ${to}`);

        try {
            // Simple HTML template for ROAS warning
            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .stat-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; }
        .stat-label { color: #666; }
        .stat-value { font-weight: bold; }
        .stat-value.negative { color: #dc2626; }
        .stat-value.positive { color: #16a34a; }
        .warning-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ ROAS Tuzağı Uyarısı</h1>
        </div>
        <div class="content">
            <p>ROAS'ınız iyi görünüyor ama <strong>gerçek kâr negatif</strong>:</p>
            
            <div class="stat-row">
                <span class="stat-label">ROAS</span>
                <span class="stat-value positive">${roas.toFixed(2)}x</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Reklam Harcaması</span>
                <span class="stat-value">${currency}${adSpend.toLocaleString('tr-TR')}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Ciro</span>
                <span class="stat-value">${currency}${revenue.toLocaleString('tr-TR')}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Net Kâr</span>
                <span class="stat-value negative">${currency}${netProfit.toLocaleString('tr-TR')}</span>
            </div>
            
            <div class="warning-box">
                <strong>Ne Oldu?</strong><br>
                ROAS sadece ciro/reklam harcaması oranıdır. Maliyet, vergi, komisyon ve iade kayıplarını hesaba katmaz.
                <br><br>
                <strong>Ne Yapmalı?</strong><br>
                1. Ürün maliyetlerinizi kontrol edin<br>
                2. İade oranlarınızı inceleyin<br>
                3. Reklam hedeflemenizi optimize edin
            </div>
        </div>
        <div class="footer">
            Prificient - Gerçek Kârınızı Görün
        </div>
    </div>
</body>
</html>
            `;

            await resend.emails.send({
                from: 'Prificient <alerts@prificient.com>',
                to,
                subject: `⚠️ ROAS Tuzağı: ${roas.toFixed(1)}x ROAS ama ${currency}${Math.abs(netProfit).toLocaleString('tr-TR')} Zarar`,
                html: emailHtml
            });
        } catch (error) {
            console.error('[Email Error]', error);
        }
    }

    /**
     * Send Daily Net Profit Summary
     */
    static async sendDailySummary(
        to: string,
        data: {
            date: string;
            revenue: number;
            netProfit: number;
            orderCount: number;
            zombieCount: number;
            currency: string;
        }
    ) {
        if (!to || !to.includes('@')) return;

        const { date, revenue, netProfit, orderCount, zombieCount, currency } = data;
        const isProfitable = netProfit >= 0;

        console.log(`[Email] Sending Daily Summary to ${to}`);

        try {
            const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: ${isProfitable ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'}; color: white; padding: 30px; text-align: center; }
        .profit-amount { font-size: 36px; font-weight: bold; margin: 10px 0; }
        .content { padding: 30px; }
        .stat-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 14px; opacity: 0.9;">${date} Günlük Özet</div>
            <div class="profit-amount">${isProfitable ? '+' : ''}${currency}${netProfit.toLocaleString('tr-TR')}</div>
            <div style="font-size: 14px;">Net Kâr</div>
        </div>
        <div class="content">
            <div class="stat-row">
                <span>Toplam Ciro</span>
                <span><strong>${currency}${revenue.toLocaleString('tr-TR')}</strong></span>
            </div>
            <div class="stat-row">
                <span>Sipariş Sayısı</span>
                <span><strong>${orderCount}</strong></span>
            </div>
            ${zombieCount > 0 ? `
            <div class="stat-row" style="color: #dc2626;">
                <span>⚠️ Zombi Ürün Satışı</span>
                <span><strong>${zombieCount}</strong></span>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            Prificient - Gerçek Kârınızı Görün
        </div>
    </div>
</body>
</html>
            `;

            await resend.emails.send({
                from: 'Prificient <reports@prificient.com>',
                to,
                subject: `${date}: ${isProfitable ? '📈' : '📉'} ${isProfitable ? '+' : ''}${currency}${netProfit.toLocaleString('tr-TR')} Net Kâr`,
                html: emailHtml
            });
        } catch (error) {
            console.error('[Email Error]', error);
        }
    }

    /**
     * Check if ROAS warning should be sent
     * ROAS > 2 but netProfit < 0 = ROAS Trap
     */
    static shouldSendROASWarning(roas: number, netProfit: number): boolean {
        return roas >= 2 && netProfit < 0;
    }
}

