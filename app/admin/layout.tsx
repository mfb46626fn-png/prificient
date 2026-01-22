import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { cookies } from 'next/headers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check for Impersonation Cookie
    const cookieStore = await cookies();
    const isImpersonating = cookieStore.has('impersonated_user_id');

    const email = (user.email || '').toLowerCase().trim();
    const isExplicitAdmin = ['can@prificient.com', 'info@prificient.com', 'mcanakarofficial@gmail.com'].includes(email);

    // Hardcoded MVP Admin Logic
    const isAdmin = user.app_metadata?.role === 'prificient_admin' ||
        user.user_metadata?.role === 'prificient_admin' ||
        isExplicitAdmin;

    if (email === 'info@prificient.com') {
        // BYPASS: Explicitly allow this email
    } else if (!isAdmin && !isImpersonating) {
        redirect('/dashboard');
    }

    // If NOT admin AND NOT impersonating, kick them out.
    // If impersonating, we assume they are an admin (Middleware protects the cookie set, and server.ts mocks the user).
    // We allow access so they can see the "User View" inside the admin wrapper?
    // WAIT. If they are impersonating, they see the USER dashboard usually?
    // "God Mode" = "See what they see".
    // If I go to /admin while impersonating, what should I see?
    // If I am impersonating, I AM the user effectively.
    // The user CANNOT access /admin.
    // So if I am impersonating, /admin should probably be BLOCKED or show a warning "You are impersonating X. Stop impersonating to access Admin".
    // BUT the prompt said "Admin UI: Kullanıcı listesinin yanına bir 'Göz' ikonu koy. Tıklayınca bu API'yi çağırsın ve sayfayı /dashboard'a yönlendirsin."
    // So if I impersonate, I go to /dashboard.
    // So if the user is staying on /admin (e.g. via layout), they shouldn't be impersonating?
    // Wait. If I click "Impersonate", `ImpersonateButton` redirects to `/dashboard`.
    // So I leave `/admin`.
    // If I try to go BACK to `/admin` while impersonating?
    // I am the target user. Target user is not admin.
    // So I should be redirected to `/dashboard`.
    // THIS IS CORRECT BEHAVIOR.

    // So why is the user complaining?
    // "info@prificient.com hesabıyla giriş yapmama rağmen...".
    // They are likely NOT impersonating.
    // They are just blocked.
    // So it's probably the Case Sensitivity.
    // I will fix the case sensitivity.

    if (!isAdmin && !isImpersonating) {
        redirect('/dashboard');
    }
    // If impersonating, we let them try to render? 
    // If they render /admin while impersonating, `server.ts` returns Target User.
    // The components will verify Admin again? 
    // If I allow them here, they will see the Admin Sidebar but with User Data?
    // That's weird.
    // Ideally, if impersonating, /admin should redirect to /dashboard.
    // Current logic: !isAdmin -> redirect.

    // I will stick to Case Sensitivity fix first.

    if (!isAdmin) {
        // If we are impersonating, strictly speaking we ARE NOT admin in this session context.
        // So redirection is correct?
        // Unless user wants to see Admin Panel AS user? No.
        redirect('/dashboard');
    }

    // Fetch Pending Tickets for Sidebar Badge
    // Use admin client for speed and bypassing simple RLS if needed, or standard client works too.
    // Since we are already async, let's just do a quick count.
    const { count: pendingTicketCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
            {/* Fixed Sidebar */}
            <AdminSidebar ticketCount={pendingTicketCount || 0} />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen">
                {/* Optional: We could add a top header here too, but for now just content */}
                <div className="p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
