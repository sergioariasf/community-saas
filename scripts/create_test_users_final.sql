-- ===============================================================================
-- CREACIÓN DE USUARIOS DE PRUEBA - VERSIÓN FINAL CON IDs REALES
-- ===============================================================================
-- Basado en los datos reales de tu sistema:
-- Organization ID: e3f4370b-2235-45ad-869a-737ee9fd95ab

-- =============================================================================
-- PASO 1: VER COMUNIDADES DISPONIBLES PARA ASIGNAR
-- =============================================================================

SELECT 'COMUNIDADES_DISPONIBLES' as info, id, name, organization_id, is_active 
FROM communities 
WHERE organization_id = 'e3f4370b-2235-45ad-869a-737ee9fd95ab'
  AND is_active = true 
ORDER BY name;

-- =============================================================================
-- PASO 2: CREAR USUARIOS EN SUPABASE DASHBOARD
-- =============================================================================
-- 🌐 Ve a: https://supabase.com/dashboard/project/vhybocthkbupgedovovj/auth/users
-- 📝 Click "Add User" y crear:

-- Usuario 1:
-- Email: manager@test.com
-- Password: TestManager123!
-- ✅ Auto Confirm User: ON

-- Usuario 2:  
-- Email: resident@test.com
-- Password: TestResident123!
-- ✅ Auto Confirm User: ON

-- =============================================================================
-- PASO 3: OBTENER IDs DE LOS NUEVOS USUARIOS
-- =============================================================================

SELECT 'NUEVOS_USUARIOS' as info, id as user_id, email, created_at
FROM auth.users 
WHERE email IN ('manager@test.com', 'resident@test.com')
ORDER BY email;

-- =============================================================================
-- PASO 4: ASIGNAR ROLES (EJECUTAR DESPUÉS DE OBTENER LOS USER_IDs)
-- =============================================================================

-- 🚨 IMPORTANTE: Reemplaza 'USER_ID_MANAGER' y 'USER_ID_RESIDENT' con los IDs reales del PASO 3
-- 🚨 IMPORTANTE: Reemplaza 'COMMUNITY_ID_1' y 'COMMUNITY_ID_2' con IDs del PASO 1

-- Asignar manager@test.com como manager en 2 comunidades
INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
VALUES 
    ('USER_ID_MANAGER', 'COMMUNITY_ID_1', 'manager', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW()),
    ('USER_ID_MANAGER', 'COMMUNITY_ID_2', 'manager', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW());

-- Asignar resident@test.com como resident en 1 comunidad
INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
VALUES 
    ('USER_ID_RESIDENT', 'COMMUNITY_ID_1', 'resident', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW());

-- =============================================================================
-- PASO 5: VERIFICACIÓN FINAL
-- =============================================================================

-- Ver todos los roles asignados
SELECT 
    'VERIFICACION' as info,
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
-- RESULTADO ESPERADO DESPUÉS DE COMPLETAR TODOS LOS PASOS:
-- =============================================================================
-- 
-- USUARIOS PARA TESTING:
-- 1. manager@test.com / TestManager123! 
--    - Rol: manager en 2 comunidades
--    - Propósito: Probar funcionalidades de gestión y RLS con acceso múltiple
-- 
-- 2. resident@test.com / TestResident123!
--    - Rol: resident en 1 comunidad  
--    - Propósito: Probar RLS restrictivo y funcionalidades básicas
-- 
-- 3. Tu usuario actual (sergioariasf@gmail.com)
--    - Rol: admin global
--    - Propósito: Control total para supervisar las pruebas
-- 
-- LISTO PARA TESTING DEL MÓDULO DE DOCUMENTOS! 🎯