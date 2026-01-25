'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { createClient } from '@/utils/supabase/server'
import { EmailService } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function forgotPassword(formData: FormData) {
    const email = formData.get('email') as string
    const supabaseAdmin = createAdminClient()

    if (!email) {
        return { error: 'E-posta adresi gerekli.' }
    }

    try {
        // 1. Check if user exists
        const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
        if (userError) throw userError

        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
        if (!user) {
            // Silently return success to prevent enumeration
            return { success: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.' }
        }

        // 2. Generate secure token
        const token = randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1 Hour

        // 3. Store in DB
        const { error: dbError } = await supabaseAdmin
            .from('password_resets')
            .insert({
                email: user.email,
                token,
                expires_at: expiresAt
            })

        if (dbError) {
            console.error('DB Token Error:', dbError)
            return { error: 'Sistem hatası.' }
        }

        // 4. Send Email
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const cleanSiteUrl = siteUrl.replace(/\/$/, '');
        const resetLink = `${cleanSiteUrl}/new-password?token=${token}`

        const emailResult = await EmailService.sendResetPassword(user.email!, resetLink)

        if (!emailResult.success) {
            return { error: 'E-posta gönderilemedi.' }
        }

        return { success: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.' }

    } catch (err) {
        console.error('Forgot Password Exception:', err)
        return { error: 'Bir hata oluştu.' }
    }
}

export async function resetPasswordWithToken(formData: FormData) {
    const token = formData.get('token') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    const supabaseAdmin = createAdminClient()

    if (password !== confirmPassword) return { error: 'Şifreler eşleşmiyor.' }
    if (password.length < 6) return { error: 'Şifre en az 6 karakter olmalı.' }

    try {
        // 1. Validate Token
        const { data: resetRecord, error: tokenError } = await supabaseAdmin
            .from('password_resets')
            .select('*')
            .eq('token', token)
            .single()

        if (tokenError || !resetRecord) {
            return { error: 'Geçersiz veya süresi dolmuş bağlantı.' }
        }

        if (new Date(resetRecord.expires_at) < new Date()) {
            return { error: 'Bağlantının süresi dolmuş.' }
        }

        // 2. Get User ID (we need ID to update password)
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const user = users.find(u => u.email?.toLowerCase() === resetRecord.email.toLowerCase())

        if (!user) {
            return { error: 'Kullanıcı bulunamadı.' }
        }

        // 3. Update Password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: password }
        )

        if (updateError) {
            return { error: updateError.message }
        }

        // 4. Consume Token (Delete it)
        await supabaseAdmin.from('password_resets').delete().eq('id', resetRecord.id)

        // 5. Send Alert
        await EmailService.sendSecurityAlert(user.email!, 'password_changed')

        return { success: 'Şifreniz başarıyla güncellendi.' }

    } catch (err) {
        console.error('Reset Token Exception:', err)
        return { error: 'Bir hata oluştu.' }
    }
}

export async function updatePassword(formData: FormData) {
    // Session-based update (Keep existing logic for logged-in users settings)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const supabase = await createClient()

    if (password !== confirmPassword) {
        return { error: 'Şifreler eşleşmiyor.' }
    }

    if (password.length < 6) {
        return { error: 'Şifre en az 6 karakter olmalı.' }
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !user.email) {
            return { error: 'Oturum bulunamadı.' }
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            return { error: error.message }
        }

        // Send Security Alert
        await EmailService.sendSecurityAlert(user.email, 'password_changed')

        return { success: 'Şifreniz başarıyla güncellendi.' }
    } catch (err) {
        return { error: 'Bir hata oluştu.' }
    }
}

export async function deleteAccount() {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !user.email) {
            return { error: 'Kullanıcı bulunamadı.' }
        }

        // Delete User via Admin API
        const { error } = await supabaseAdmin.auth.admin.deleteUser(
            user.id
        )

        if (error) {
            console.error('Delete user error:', error)
            return { error: 'Hesap silinemedi.' }
        }

        // Send Goodbye Email
        await EmailService.sendSecurityAlert(user.email, 'account_deleted')

        return { success: true }
    } catch (err) {
        console.error('Delete Account Exception:', err)
        return { error: 'Bir hata oluştu.' }
    }
}
