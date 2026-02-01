/**
 * Admin Metrics API
 * GET /api/admin/metrics
 * 
 * Returns system-wide metrics for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verify admin access
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', user.id)
            .single()

        const adminEmails = ['can@wecahan.com', 'admin@prificient.com']
        if (!adminEmails.includes(userData?.email || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get total users count
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })

        // Get beta users count
        const { count: betaUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('is_beta_user', true)

        // Get active users (logged in last 7 days) - check beta_usage_logs
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: activeUserData } = await supabase
            .from('beta_usage_logs')
            .select('user_id')
            .gte('created_at', sevenDaysAgo.toISOString())

        const activeUsers = new Set(activeUserData?.map(u => u.user_id)).size

        // Get total orders processed
        const { count: totalOrders } = await supabase
            .from('processed_orders')
            .select('*', { count: 'exact', head: true })

        // Get total ad imports
        const { count: totalAdImports } = await supabase
            .from('ad_imports')
            .select('*', { count: 'exact', head: true })

        // Get total events logged
        const { count: totalEvents } = await supabase
            .from('merchant_events')
            .select('*', { count: 'exact', head: true })

        // Get usage by action type
        const { data: usageByType } = await supabase
            .from('beta_usage_logs')
            .select('action_type')

        const usageCounts: Record<string, number> = {}
        usageByType?.forEach(log => {
            usageCounts[log.action_type] = (usageCounts[log.action_type] || 0) + 1
        })

        // Get pain segment distribution
        const { data: painSegments } = await supabase
            .from('users')
            .select('pain_segment')

        const segmentCounts: Record<string, number> = {
            'rahat': 0,
            'risk': 0,
            'tehlike': 0,
            'alarm': 0,
            'unknown': 0
        }
        painSegments?.forEach(user => {
            const segment = user.pain_segment || 'unknown'
            segmentCounts[segment] = (segmentCounts[segment] || 0) + 1
        })

        // Get package distribution
        const { data: packageData } = await supabase
            .from('users')
            .select('beta_package')

        const packageCounts: Record<string, number> = {
            'clear': 0,
            'control': 0,
            'vision': 0
        }
        packageData?.forEach(user => {
            const pkg = user.beta_package || 'vision'
            packageCounts[pkg] = (packageCounts[pkg] || 0) + 1
        })

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            users: {
                total: totalUsers || 0,
                beta: betaUsers || 0,
                activeLastWeek: activeUsers
            },
            data: {
                ordersProcessed: totalOrders || 0,
                adImports: totalAdImports || 0,
                eventsLogged: totalEvents || 0
            },
            usage: usageCounts,
            segments: segmentCounts,
            packages: packageCounts
        })

    } catch (error) {
        console.error('Admin metrics error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch metrics'
        }, { status: 500 })
    }
}
