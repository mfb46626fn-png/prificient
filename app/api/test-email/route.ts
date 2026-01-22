import { NextResponse, NextRequest } from 'next/server';
import { sendEmail } from '@/lib/email';
import * as React from 'react';
import { TicketReplied } from '@/emails/TicketReplied';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const to = searchParams.get('to');

    if (!to) {
        return NextResponse.json({ error: 'Missing "to" parameter' }, { status: 400 });
    }

    try {
        console.log('Testing email to:', to);
        console.log('API Key present:', !!process.env.RESEND_API_KEY);

        // Test 1: Direct Raw Send
        const element = React.createElement('div', { style: { fontFamily: 'sans-serif' } },
            React.createElement('h1', null, 'System Test'),
            React.createElement('p', null, 'If you see this, email sending is working (Raw).')
        );

        const { data, error } = await sendEmail({
            to,
            subject: 'Test Email System Diagnosis',
            react: element as React.ReactElement
        });

        if (error) {
            console.error('Test Send Failed:', error);
            return NextResponse.json({
                success: false,
                stage: 'raw_send',
                error: error,
            }, { status: 500 });
        }

        // Test 2: Ticket Reply Template - ACTUAL RENDER TEST
        const { data: replyData, error: replyError } = await sendEmail({
            to,
            subject: 'Test Ticket Reply Template (Real Render)',
            react: TicketReplied({
                userName: 'Test User',
                ticketSubject: 'Test Subject',
                ticketId: '12345',
                dashboardUrl: 'http://localhost:3000/support'
            })
        });

        if (replyError) {
            console.error('Template Send Failed:', replyError);
            return NextResponse.json({
                success: false,
                stage: 'template_send',
                error: replyError
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data,
            replyData,
            message: 'Both generic and template emails sent successfully via Resend API.'
        });

    } catch (e: any) {
        return NextResponse.json({
            success: false,
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
