'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Megaphone,
    Settings,
    LogOut,
    ExternalLink
} from 'lucide-react'

interface MenuItem {
    name: string
    href: string
    icon: any
    exact?: boolean
    badge?: string
}

const MENU_ITEMS: MenuItem[] = [
    { name: 'Genel Bakış', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { name: 'Destek', href: '/admin/support', icon: MessageSquare },
    { name: 'Duyurular', href: '/admin/announcements', icon: Megaphone },
    { name: 'Sistem', href: '/admin/system', icon: Settings },
]

interface AdminSidebarProps {
    ticketCount?: number;
}

export default function AdminSidebar({ ticketCount = 0 }: AdminSidebarProps) {
    const pathname = usePathname()

    // Dynamic Menu Items
    const menuItems = MENU_ITEMS.map(item => {
        if (item.href === '/admin/support') {
            return { ...item, badge: ticketCount > 0 ? ticketCount.toString() : undefined }
        }
        return item;
    });

    return (
        <aside className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800 shadow-xl z-50 text-slate-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
                <div className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-900/20">
                        P
                    </span>
                    <span>Prificient</span>
                    <span className="bg-indigo-900/50 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-indigo-800">
                        Admin
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {menuItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-indigo-600/10 text-white shadow-sm ring-1 ring-indigo-500/20'
                                    : 'hover:bg-slate-800/50 hover:text-white'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon
                                    size={18}
                                    className={`${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                                />
                                <span>{item.name}</span>
                            </div>

                            {item.badge && (
                                <span className="bg-rose-500/10 text-rose-400 text-xs py-0.5 px-2 rounded-full border border-rose-500/20 shadow-sm font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Admin User</p>
                        <p className="text-xs text-slate-500 truncate">Super Admin</p>
                    </div>
                </div>

                <a
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 rounded-lg transition-colors border border-slate-700"
                >
                    <ExternalLink size={14} />
                    Kullanıcı Paneline Dön
                </a>
            </div>
        </aside>
    )
}
