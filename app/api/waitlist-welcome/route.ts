import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import WaitlistWelcomeEmail from '@/emails/WaitlistWelcomeEmail'

const resend = new Resend(process.env.RESEND_API_KEY || 're_123_dummy')

export async function POST(request: Request) {
    try {
        const { email, waitlistPosition } = await request.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Email geçersiz' },
                { status: 400 }
            )
        }

        const emailHtml = await render(
            WaitlistWelcomeEmail({ waitlistPosition: waitlistPosition || 1000 })
        )

        await resend.emails.send({
            from: 'Prificient <system@prificient.com>',
            to: email,
            subject: `Gerçeklerle Yüzleşmeye Hoş Geldiniz. Sıranız: #${waitlistPosition || 1000}`,
            html: emailHtml,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Waitlist Email Error]', error)
        return NextResponse.json(
            { error: 'E-posta gönderilemedi' },
            { status: 500 }
        )
    }
}
