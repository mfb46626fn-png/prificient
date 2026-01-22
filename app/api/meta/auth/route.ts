import { NextResponse } from 'next/server';
import { MetaService } from '@/lib/meta';

export const dynamic = 'force-dynamic';

export async function GET() {
    const loginUrl = MetaService.getLoginUrl();
    return NextResponse.redirect(loginUrl);
}
