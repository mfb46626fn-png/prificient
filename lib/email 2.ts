import { Resend } from 'resend';
import TicketReceivedEmail from '@/emails/TicketReceivedEmail';
import TicketRepliedEmail from '@/emails/TicketRepliedEmail';
import WeeklyReportEmail from '@/emails/WeeklyReportEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.SUPPORT_EMAIL || 'destek@prificient.com'; // Ensure this domain is verified in Resend

export const EmailService = {
    /**
     * Send acknowledgment email when a new ticket is created.
     */
    async sendTicketCreated(userEmail: string, userName: string, ticketId: string, subject: string) {
        if (!userEmail) return;

        try {
            const { data, error } = await resend.emails.send({
                from: `Prificient Destek <${fromEmail}>`,
                to: [userEmail],
                subject: `Destek Talebiniz Alındı: #${ticketId}`,
                react: TicketReceivedEmail({ userName, ticketId, subject }),
            });

            if (error) {
                console.error('Email send error:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error('Email service exception:', err);
            return { success: false, error: err };
        }
    },

    /**
     * Send notification when a ticket is replied to.
     */
    async sendTicketReply(userEmail: string, userName: string, ticketId: string, subject: string, replyMessage: string) {
        if (!userEmail) return;

        try {
            const { data, error } = await resend.emails.send({
                from: `Prificient Destek <${fromEmail}>`,
                to: [userEmail],
                subject: `YNT: ${subject} (#${ticketId})`,
                react: TicketRepliedEmail({ userName, ticketId, subject, replyMessage }),
            });

            if (error) {
                console.error('Email send error:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error('Email service exception:', err);
            return { success: false, error: err };
        }
    },

    /**
     * Send weekly financial report.
     */
    async sendWeeklyReport(userEmail: string, userName: string, reportData: {
        startDate: string;
        endDate: string;
        netProfit: number;
        revenue: number;
        adSpend: number;
        roi: number; // Removed | string to match component prop, ensure you pass number
    }) {
        if (!userEmail) return;

        try {
            const { data, error } = await resend.emails.send({
                from: `Prificient Rapor <${fromEmail}>`,
                to: [userEmail],
                subject: `Haftalık Finansal Özetiniz`,
                react: WeeklyReportEmail({
                    userName,
                    startDate: reportData.startDate,
                    endDate: reportData.endDate,
                    netProfit: reportData.netProfit,
                    revenue: reportData.revenue,
                    adSpend: reportData.adSpend,
                    roi: reportData.roi,
                }),
            });

            if (error) {
                console.error('Email send error:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error('Email service exception:', err);
            return { success: false, error: err };
        }
    },
};
