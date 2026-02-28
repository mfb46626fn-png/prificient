import { NextResponse } from 'next/server';
import { MetaService } from '@/lib/meta';

export const dynamic = 'force-dynamic';

export async function GET() {
    // const loginUrl = MetaService.getLoginUrl();
    // return NextResponse.redirect(loginUrl);

    // TEMPORARILY DISABLED
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=feature_temporarily_disabled`);
}
