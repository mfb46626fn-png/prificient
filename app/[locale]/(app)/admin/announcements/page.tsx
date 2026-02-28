import { createAdminClient } from '@/lib/supabase-admin';
import { Megaphone, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AdminAnnouncementsPage() {
    const supabaseAdmin = createAdminClient();

    // List Announcements
    const { data: announcements } = await supabaseAdmin
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false });

    async function createAnnouncement(formData: FormData) {
        'use server'
        const supabase = createAdminClient()
        const title = formData.get('title') as string
        const details = formData.get('details') as string
        const type = formData.get('type') as string

        // 1. Deactivate all existing active announcements
        await supabase.from('system_announcements')
            .update({ is_active: false })
            .eq('is_active', true);

        // 2. Create new active announcement
        await supabase.from('system_announcements').insert({
            title,   // New Field
            details, // New Field
            message: title, // Backward compatibility or just use title
            type,
            is_active: true
        })
        revalidatePath('/admin/announcements')
    }

    // ...

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* ... Header ... */}

            {/* Create Form */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-indigo-600" /> Yeni Duyuru Oluştur
                </h2>
                <form action={createAnnouncement} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duyuru Başlığı (Banner'da Görünür)</label>
                        <input
                            name="title"
                            required
                            placeholder="Örn: Sistem Bakımı"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Detaylı Açıklama (Pop-up İçeriği)</label>
                        <textarea
                            name="details"
                            rows={4}
                            placeholder="Kullanıcılar info butonuna tıkladığında detayları burada görecekler..."
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duyuru Tipi</label>
                            <select name="type" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white">
                                <option value="info">Bilgilendirme (Mavi)</option>
                                <option value="warning">Uyarı (Turuncu)</option>
                                <option value="error">Kritik (Kırmızı)</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm h-[42px]">
                            Yayınla
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider">Aktif Duyurular</h3>
                {announcements?.length === 0 ? (
                    <p className="text-gray-400 italic">Henüz duyuru yok.</p>
                ) : (
                    announcements?.map((a) => (
                        <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-colors">
                            <div className="flex items-start gap-4">
                                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${a.type === 'error' ? 'bg-red-500' : a.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                <div>
                                    <p className="text-gray-900 font-medium">{a.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(a.created_at).toLocaleDateString('tr-TR')} •
                                        {a.is_active ? <span className="text-green-600 ml-1 font-bold">Yayında</span> : <span className="text-gray-400 ml-1">Pasif</span>}
                                    </p>
                                </div>
                            </div>
                            <form action={async () => {
                                'use server'
                                const supabase = createAdminClient()
                                await supabase.from('system_announcements').delete().eq('id', a.id)
                                revalidatePath('/admin/announcements')
                            }}>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </form>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
