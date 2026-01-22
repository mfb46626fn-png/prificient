import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true });

    // Delete the cookie
    response.cookies.delete('impersonated_user_id');

    return response;
}
