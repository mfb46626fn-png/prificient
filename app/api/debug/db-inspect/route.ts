
import { createAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabaseAdmin = createAdminClient();

    // Check product_costs columns
    const { data: costs, error: costError } = await supabaseAdmin
        .from('product_costs')
        .select('*')
        .limit(1);

    // Check products table existence
    const { data: products, error: productError } = await supabaseAdmin
        .from('products')
        .select('*')
        .limit(1);

    return NextResponse.json({
        product_costs: { data: costs, error: costError },
        products_table: { data: products, error: productError }
    });
}
