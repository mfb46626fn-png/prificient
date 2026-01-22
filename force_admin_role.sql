UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb), 
    '{role}', 
    '"prificient_admin"'
  ),
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb), 
    '{role}', 
    '"prificient_admin"'
  )
WHERE email ILIKE 'info@prificient.com';

-- Demote mcakar31 (Remove Role)
UPDATE auth.users
SET 
  raw_app_meta_data = raw_app_meta_data - 'role',
  raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email ILIKE 'mcakar31@icloud.com';

-- Kontrol sorgusu (Doğrulamak için)
SELECT email, raw_app_meta_data->>'role' as app_role, raw_user_meta_data->>'role' as user_role 
FROM auth.users 
WHERE email ILIKE 'info@prificient.com' OR email ILIKE 'mcakar31@icloud.com';
