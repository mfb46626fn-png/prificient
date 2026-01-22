import { createClient } from '@/utils/supabase/server';

const ADMIN_EMAILS = ['can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com']; // Add your hardcoded emails here

export async function isAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    // Check 1: App Metadata Role
    if (user.app_metadata?.role === 'prificient_admin') return true;

    // Check 2: User Metadata Role
    if (user.user_metadata?.role === 'prificient_admin') return true;

    // Check 3: Hardcoded Email Whitelist (MVP Check)
    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;

    return false;
}
