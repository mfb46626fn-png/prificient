-- 1. Bu komutu Supabase SQL Editor alanında çalıştırın.
-- 'info@prificient.com' yerine admin yapmak istediğiniz e-posta adresini yazın.

UPDATE auth.users
SET raw_app_meta_data = 
  CASE 
    WHEN raw_app_meta_data IS NULL THEN '{"role": "prificient_admin"}'::jsonb
    ELSE raw_app_meta_data || '{"role": "prificient_admin"}'::jsonb
  END
WHERE email = 'info@prificient.com';

-- 2. Kontrol Etmek İçin:
SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'info@prificient.com';
