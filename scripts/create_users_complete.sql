-- ===============================================================================
-- CREACIÓN COMPLETA DE USUARIOS DE PRUEBA CON SQL
-- ===============================================================================
-- Crea usuarios directamente en auth.users y asigna roles

-- =============================================================================
-- PASO 1: CREAR USUARIOS EN AUTH.USERS
-- =============================================================================

-- Crear manager@test.com
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'manager@test.com',
    crypt('TestManager123!', gen_salt('bf')),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL
);

-- Crear resident@test.com
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'resident@test.com',
    crypt('TestResident123!', gen_salt('bf')),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL
);

-- =============================================================================
-- PASO 2: VERIFICAR QUE SE CREARON
-- =============================================================================

SELECT 'USUARIOS_CREADOS' as info, id, email, created_at
FROM auth.users 
WHERE email IN ('manager@test.com', 'resident@test.com')
ORDER BY email;

-- =============================================================================
-- PASO 3: ASIGNAR ROLES CON IDs REALES
-- =============================================================================

-- Asignar manager@test.com a 2 comunidades (Amara y El Pinar)
INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
SELECT 
    u.id,
    'c7e7b867-6180-4363-a2f8-2aa12eb804b5', -- Amara
    'manager',
    'e3f4370b-2235-45ad-869a-737ee9fd95ab',
    NOW(),
    NOW()
FROM auth.users u 
WHERE u.email = 'manager@test.com';

INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
SELECT 
    u.id,
    '354420fd-5806-49c3-bfcf-a7ffc64f89ba', -- El Pinar
    'manager',
    'e3f4370b-2235-45ad-869a-737ee9fd95ab',
    NOW(),
    NOW()
FROM auth.users u 
WHERE u.email = 'manager@test.com';

-- Asignar resident@test.com solo a Amara
INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
SELECT 
    u.id,
    'c7e7b867-6180-4363-a2f8-2aa12eb804b5', -- Amara
    'resident',
    'e3f4370b-2235-45ad-869a-737ee9fd95ab',
    NOW(),
    NOW()
FROM auth.users u 
WHERE u.email = 'resident@test.com';

-- =============================================================================
-- PASO 4: VERIFICACIÓN FINAL
-- =============================================================================

-- Ver todos los roles asignados
SELECT 
    'VERIFICACION_FINAL' as info,
    u.email,
    ur.user_id,
    ur.role,
    c.name as community_name,
    ur.created_at
FROM user_roles ur
LEFT JOIN communities c ON ur.community_id = c.id
LEFT JOIN auth.users u ON ur.user_id = u.id
WHERE ur.organization_id = 'e3f4370b-2235-45ad-869a-737ee9fd95ab'
ORDER BY u.email, ur.role, c.name;

-- =============================================================================
-- RESULTADO ESPERADO:
-- =============================================================================
-- 
-- ✅ manager@test.com / TestManager123!
--    - Manager en: Amara, El Pinar
--    - Para testing: Acceso a múltiples comunidades
-- 
-- ✅ resident@test.com / TestResident123!
--    - Resident en: Amara
--    - Para testing: Acceso restrictivo a una sola comunidad
-- 
-- ✅ Listos para probar el módulo de documentos con diferentes permisos RLS!