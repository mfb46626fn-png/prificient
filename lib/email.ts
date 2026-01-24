import { Resend } from 'resend';
import { TicketCreated } from '@/emails/TicketCreated';
import { TicketReplied } from '@/emails/TicketReplied';
import { WeeklyFinancialReport } from '@/emails/WeeklyFinancialReport';
import { TicketClosed } from '@/emails/TicketClosed';

// Configuration
// Safe initialization for build time
const resend = new Resend(process.env.RESEND_API_KEY || 're_123_dummy');
const RESEND_FROM_EMAIL = 'Prificient <info@prificient.com>';

type EmailPayload = {
    to: string;
    subject: string;
    react: React.ReactElement; // Using ReactElement type from React
    replyTo?: string;
};

// Generic Wrapper Function
export const sendEmail = async ({ to, subject, react, replyTo }: EmailPayload) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email skipped.');
        return { success: false, error: 'Missing API Key' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to,
            subject,
            react,
            replyTo: replyTo,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected Email Error:', error);
        return { success: false, error };
    }
};

// Specialized Functions
export const EmailService = {
    // Triggered when user creates a ticket
    async sendTicketNotification(userEmail: string, ticketId: string, ticketSubject: string, userName?: string) {
        await sendEmail({
            to: userEmail,
            subject: `Destek Talebiniz Alındı (Ticket #${ticketId})`,
            react: TicketCreated({ userName, ticketId, subject: ticketSubject })
        });
    },

    // Triggered when support replies
    async sendTicketReply(userEmail: string, ticketId: string, ticketSubject: string, replyMessage: string, dashboardUrl: string, userName?: string) {
        // replyTo could receive future automated processing emails like support+ticketId@prificient.com
        await sendEmail({
            to: userEmail,
            subject: `Destek Talebiniz Yanıtlandı (Ticket #${ticketId})`,
            react: TicketReplied({ userName, ticketSubject, ticketId, dashboardUrl }),
            replyTo: `support+${ticketId}@prificient.com` // Future-proof: direct reply processing
        });
    },

    // Weekly Report Cron Job
    // Weekly/Daily/Monthly Report Cron Job
    async sendWeeklyReport(userEmail: string, reportData: { title?: string, netProfit: string, revenue: string, adSpend: string, roi: string, dashboardUrl: string, dateRange: string, userName?: string }) {
        const title = reportData.title || "Haftalık Finansal Özet";
        await sendEmail({
            to: userEmail,
            subject: `${title}: ${reportData.dateRange}`,
            react: WeeklyFinancialReport({
                title: title, // Updated Prop
                userName: reportData.userName,
                netProfit: reportData.netProfit,
                revenue: reportData.revenue,
                adSpend: reportData.adSpend,
                roi: reportData.roi,
                dashboardUrl: reportData.dashboardUrl,
                dateRange: reportData.dateRange,
            })
        });
    },

    // Triggered when ticket is closed
    async sendTicketClosed(userEmail: string, ticketId: string, ticketSubject: string, userName?: string) {
        await sendEmail({
            to: userEmail,
            subject: `Talebiniz Kapatıldı (Ticket #${ticketId})`,
            react: TicketClosed({ userName, ticketSubject, ticketId })
        });
    }
};
