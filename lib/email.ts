import { Resend } from 'resend';
import ResetPasswordEmail from '@/emails/ResetPasswordEmail';
import WelcomeEmail from '@/emails/WelcomeEmail';
import SecurityAlertEmail from '@/emails/SecurityAlertEmail';
import WeeklyFinancialReport from '@/emails/WeeklyFinancialReport';
import TicketClosed from '@/emails/TicketClosed';
import TicketCreated from '@/emails/TicketCreated';
import TicketReplied from '@/emails/TicketReplied';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Prificient <onboarding@prificient.com>'; // Make sure this domain is verified in Resend

export const sendEmail = async ({
    to,
    subject,
    react,
}: {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
}) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            react,
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Exception sending email:', error);
        return { success: false, error };
    }
};

export const EmailService = {
    sendResetPassword: async (email: string, url: string, name?: string) => {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [email],
                subject: 'Şifrenizi Sıfırlayın - Prificient',
                react: ResetPasswordEmail({ resetLink: url, name }),
            });

            if (error) {
                console.error('Error sending reset password email:', error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Exception sending reset password email:', error);
            return { success: false, error };
        }
    },

    sendWelcome: async (email: string, name?: string) => {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [email],
                subject: "Prificient'a Hoş Geldiniz - Gerçekler Başlıyor",
                react: WelcomeEmail({ name }),
            });

            if (error) {
                console.error('Error sending welcome email:', error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Exception sending welcome email:', error);
            return { success: false, error };
        }
    },

    sendSecurityAlert: async (email: string, type: 'password_changed' | 'account_deleted', name?: string, ipAddress?: string) => {
        const subjects = {
            password_changed: '⚠️ Güvenlik Uyarısı: Şifreniz Değiştirildi',
            account_deleted: '⚠️ Güvenlik Uyarısı: Hesabınız Silindi',
        };

        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [email],
                subject: subjects[type],
                react: SecurityAlertEmail({
                    type,
                    name,
                    ipAddress,
                    date: new Date().toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }),
            });

            if (error) {
                console.error('Error sending security alert email:', error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Exception sending security alert email:', error);
            return { success: false, error };
        }
    },

    sendWeeklyReport: async (email: string, props: any) => {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [email],
                subject: `${props.title || 'Haftalık Özet'} - Prificient`,
                react: WeeklyFinancialReport(props),
            });

            if (error) {
                console.error('Error sending weekly report:', error);
                return { success: false, error };
            }

            return { success: true, data };
        } catch (error) {
            console.error('Exception sending weekly report:', error);
            return { success: false, error };
        }
    },

    sendTicketCreated: async (email: string, ticketId: string, subject: string, userName?: string) => {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [email],
                subject: `Destek Talebi Oluşturuldu: ${subject} (#${ticketId})`,
                react: TicketCreated({ userName, ticketId, subject }),
            });

            if (error) {
                console.error('Error sending ticket created email:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (error) {
            console.error('Exception sending ticket created email:', error);
            return { success: false, error };
        }
    },

    sendTicketReplied: async (email: string, ticketId: string, ticketSubject: string, dashboardUrl: string, userName?: string) => {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [email],
                subject: `Destek Talebinize Yanıt: ${ticketSubject} (#${ticketId})`,
                react: TicketReplied({ userName, ticketSubject, ticketId, dashboardUrl }),
            });

            if (error) {
                console.error('Error sending ticket replied email:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (error) {
            console.error('Exception sending ticket replied email:', error);
            return { success: false, error };
        }
    },

    sendTicketClosed: async (email: string, ticketId: string, ticketSubject: string, userName?: string) => {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: [email],
                subject: `Destek Talebi Kapatıldı: ${ticketSubject} (#${ticketId})`,
                react: TicketClosed({ userName, ticketSubject, ticketId }),
            });

            if (error) {
                console.error('Error sending ticket closed email:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (error) {
            console.error('Exception sending ticket closed email:', error);
            return { success: false, error };
        }
    },
};
