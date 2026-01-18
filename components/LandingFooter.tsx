'use client'

import Link from 'next/link'
import { ShieldCheck, Lock, Globe, Instagram, Linkedin, Twitter, Heart } from 'lucide-react'

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* ÜST KISIM: LOGO, DEĞER ÖNERİSİ VE MENÜLER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* 1. KOLON: MARKA & DEĞER */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">P</div>
              <span className="text-xl font-black tracking-tight text-gray-900">Prificient</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              E-ticaret finansını yönetmenin en akıllı ve şeffaf yolu. Verilerinizle barışın, kârınızı artırın.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="text-gray-400 hover:text-black transition-colors"><Twitter size={20} /></Link>
              <Link href="#" className="text-gray-400 hover:text-black transition-colors"><Instagram size={20} /></Link>
              <Link href="#" className="text-gray-400 hover:text-black transition-colors"><Linkedin size={20} /></Link>
            </div>
          </div>

          {/* 2. KOLON: ÜRÜN */}
          <div>
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-4">Ürün</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-600">
              <li><Link href="#ozellikler" className="hover:text-blue-600 transition-colors">Özellikler</Link></li>
              <li><Link href="#nasil" className="hover:text-blue-600 transition-colors">Nasıl Çalışır?</Link></li>
              <li><Link href="#pricing" className="hover:text-blue-600 transition-colors">Fiyatlandırma</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 transition-colors">Giriş Yap</Link></li>
              <li><Link href="/demo/dashboard" className="hover:text-blue-600 transition-colors">Demo</Link></li>
            </ul>
          </div>

          {/* 3. KOLON: KURUMSAL */}
          <div>
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-4">Kurumsal</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-600">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">Hakkımızda</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">İletişim</Link></li>
              <li><Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link href="/help" className="hover:text-blue-600 transition-colors">Yardım Merkezi</Link></li>
            </ul>
          </div>

          {/* 4. KOLON: YASAL (KVKK & SÖZLEŞMELER) */}
          <div>
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-4">Yasal</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-600">
              <li><Link href="/legal/kvkk" className="hover:text-blue-600 transition-colors">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-blue-600 transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/legal/terms" className="hover:text-blue-600 transition-colors">Kullanıcı Sözleşmesi</Link></li>
              <li><Link href="/legal/cookie" className="hover:text-blue-600 transition-colors">Çerez Politikası</Link></li>
            </ul>
          </div>
        </div>

        {/* ORTA KISIM: GÜVEN ROZETLERİ (Trust Badges) */}
        <div className="border-t border-b border-gray-100 py-8 mb-8 bg-gray-50/50 rounded-3xl px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">

            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full"><ShieldCheck size={24} /></div>
              <div>
                <p className="font-bold text-gray-900 text-sm">KVKK Uyumlu</p>
                <p className="text-xs text-gray-500">Verileriniz Türkiye'de güvende.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Lock size={24} /></div>
              <div>
                <p className="font-bold text-gray-900 text-sm">256-bit SSL Koruma</p>
                <p className="text-xs text-gray-500">Uçtan uca şifreli bağlantı.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><Globe size={24} /></div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Kredi Kartı Gerekmez</p>
                <p className="text-xs text-gray-500">Beta sürecinde %100 ücretsiz.</p>
              </div>
            </div>

          </div>
        </div>

        {/* ALT KISIM: COPYRIGHT */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-400">
          <p>&copy; {new Date().getFullYear()} Prificient Inc. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-1">
            <span>Türkiye'de</span>
            <Heart size={12} className="text-rose-500 fill-rose-500" />
            <span>ile geliştirildi.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}