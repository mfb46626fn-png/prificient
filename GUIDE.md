# Prificient Destek Sistemi - Yönetici Kılavuzu

Sistemin tam olarak çalışması için aşağıdaki adımları sırasıyla tamamlamanız gerekmektedir.

## 1. Resend API Key Alma
E-posta gönderimi için Resend servisine ihtiyacımız var.

1.  [Resend.com](https://resend.com) adresine gidin ve hesap oluşturun.
2.  Sol menüden **API Keys** sekmesine tıklayın.
3.  **Create API Key** butonuna basın.
    *   **Name:** Prificient
    *   **Permission:** Full Access
4.  Oluşturulan `re_` ile başlayan anahtarı kopyalayın.

## 2. Environment Ayarları
Projenizin `.env.local` dosyasını açın ve şu şekilde güncelleyin:

```env
RESEND_API_KEY=re_SizinKopyaladiginizAnahtar
SUPPORT_EMAIL=info@prificient.com (Resend'de doğruladığınız bir email)
CRON_SECRET=GucluBirSifreYazin (Örn: Prificient2025Secret!)
# Eğer Vercel Cron kullanacaksanız bu CRON_SECRET'i Vercel panelinde de tanımlayın.
```

## 3. Yönetici (Admin) Paneline Erişim
Size özel bir "Admin Destek Ekranı" hazırladım. Bu ekran üzerinden kullanıcılardan gelen talepleri görebilir ve yanıtlayabilirsiniz.

*   **Adres:** `/admin/support`
    *   Örn: `http://localhost:3000/admin/support` (Local)
    *   Örn: `https://prificient.com/admin/support` (Canlı)

**Nasıl Çalışır?**
1.  Kullanıcı `/dashboard/support` üzerinden talep oluşturur.
2.  Size (Admin'e) e-posta gelmez (şu an sadece kullanıcıya gidiyor, isterseniz size de bildirim ekleyebiliriz).
3.  Siz `/admin/support` sayfasına girersiniz.
4.  Talebi seçip yanıt yazdığınızda, kullanıcıya **otomatik e-posta** gider.

> [!WARNING]
> Admin panelinden cevap verebilmek için giriş yapmış olduğunuz kullanıcının `prificient_admin` rolüne sahip olması gerekir.
> Eğer rol sisteminiz henüz aktif değilse, veritabanından kendinize bu rolü vermeli veya geçici olarak API'deki rol kontrolünü kaldırmalısınız.
> **Hızlı Çözüm:** Supabase SQL Editor'den kendi kullanıcınıza rol verin:
> ```sql
> UPDATE auth.users SET raw_app_meta_data = '{"role": "prificient_admin"}' WHERE email = 'SizinEmailiniz';
> ```

## 4. Domain Doğrulama (Spam Önleme)
E-postalarınızın "Spam" kutusuna düşmemesi için:
1.  Resend panelinde **Domains** sekmesine gidin.
2.  `Add Domain` diyerek `prificient.com` ekleyin.
3.  Size verilen **DNS (TXT)** kayıtlarını domain sağlayıcınızın paneline ekleyin.
4.  "Verify" butonuna basarak onaylayın.

## Özet: İş Akışı
1.  Kullanıcı talep açar -> `TicketCreated` maili alır.
2.  Admin `/admin/support` sayfasına girer.
3.  Admin cevap yazar -> Kullanıcı `TicketReplied` maili alır.
4.  Haftada bir Cron çalışır -> Herkese `WeeklyFinancialReport` maili gider.

Sistem şu an bu şekilde **full eksiksiz** hazırdır.
