-- ===============================================================================
-- CREACIÓN DE USUARIOS DE PRUEBA PARA TESTING DEL MÓDULO DE DOCUMENTOS
-- ===============================================================================
-- Ejecutar estas queries directamente en Supabase SQL Editor
-- 
-- USUARIOS A CREAR:
-- 1. manager@test.com - Manager con acceso a 2-3 comunidades
-- 2. resident@test.com - Resident con acceso a 1 comunidad
-- 
-- PROPÓSITO: Testing de RLS (Row Level Security) en progressive pipeline

-- =============================================================================
-- PASO 1: VERIFICAR ESTADO ACTUAL
-- =============================================================================

-- Ver organizaciones existentes
SELECT id, name, created_at 
FROM organizations 
ORDER BY created_at DESC;

-- Ver comunidades activas
SELECT id, name, organization_id, is_active 
FROM communities 
WHERE is_active = true 
ORDER BY name;

-- Ver usuarios existentes (roles)
SELECT 
    ur.user_id,
    ur.role,
    c.name as community_name,
    ur.created_at
FROM user_roles ur
LEFT JOIN communities c ON ur.community_id = c.id
ORDER BY ur.created_at DESC;

-- =============================================================================
-- PASO 2: CREAR USUARIOS EN SUPABASE AUTH (MANUAL)
-- =============================================================================
-- ⚠️ IMPORTANTE: Estos usuarios se crean desde Supabase Dashboard > Authentication
-- 
-- 1. Ve a: https://supabase.com/dashboard/project/vhybocthkbupgedovovj/auth/users
-- 2. Click "Add User"
-- 3. Crear:
--    - Email: manager@test.com
--    - Password: TestManager123!
--    - Confirmar automáticamente
-- 
-- 4. Repetir para:
--    - Email: resident@test.com  
--    - Password: TestResident123!

-- =============================================================================
-- PASO 3: ASIGNAR ROLES (EJECUTAR DESPUÉS DE CREAR USUARIOS)
-- =============================================================================

-- Variables que necesitas reemplazar:
-- @MANAGER_USER_ID = ID del usuario manager@test.com desde Auth
-- @RESIDENT_USER_ID = ID del usuario resident@test.com desde Auth
-- @ORG_ID = ID de tu organización principal
-- @COMMUNITY_1_ID = ID de primera comunidad
-- @COMMUNITY_2_ID = ID de segunda comunidad (solo para manager)

-- PLANTILLA - REEMPLAZA LOS IDs REALES:

-- Asignar manager@test.com a 2 comunidades
INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
VALUES 
    ('@MANAGER_USER_ID', '@COMMUNITY_1_ID', 'manager', '@ORG_ID', NOW(), NOW()),
    ('@MANAGER_USER_ID', '@COMMUNITY_2_ID', 'manager', '@ORG_ID', NOW(), NOW());

-- Asignar resident@test.com a 1 comunidad
INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
VALUES 
    ('@RESIDENT_USER_ID', '@COMMUNITY_1_ID', 'resident', '@ORG_ID', NOW(), NOW());

-- =============================================================================
-- PASO 4: VERIFICACIÓN
-- =============================================================================

-- Verificar que los roles se asignaron correctamente
SELECT 
    ur.user_id,
    ur.role,
    c.name as community_name,
    o.name as organization_name,
    ur.created_at
FROM user_roles ur
JOIN communities c ON ur.community_id = c.id
JOIN organizations o ON ur.organization_id = o.id
WHERE ur.user_id IN ('@MANAGER_USER_ID', '@RESIDENT_USER_ID')
ORDER BY ur.user_id, ur.role;

-- =============================================================================
-- QUERIES DE AYUDA PARA OBTENER LOS IDs
-- =============================================================================

-- 1. Obtener IDs de usuarios desde Auth (requiere acceso a auth.users)
-- SELECT id, email, created_at 
-- FROM auth.users 
-- WHERE email IN ('manager@test.com', 'resident@test.com')
-- ORDER BY email;

-- 2. Obtener ID de organización
SELECT id, name 
FROM organizations 
LIMIT 1;

-- 3. Obtener IDs de comunidades (tomar las primeras 2)
SELECT id, name, organization_id 
FROM communities 
WHERE is_active = true 
ORDER BY name 
LIMIT 2;

-- =============================================================================
-- EJEMPLO CON IDs REALES (ACTUALIZAR CON TUS VALORES)
-- =============================================================================

-- EJEMPLO - NO EJECUTAR SIN REEMPLAZAR IDs:
/*
-- Suponiendo IDs de ejemplo:
-- Manager User ID: 12345678-1234-1234-1234-123456789012
-- Resident User ID: 87654321-4321-4321-4321-210987654321
-- Organization ID: e3f4370b-2235-45ad-869a-737ee9fd95ab
-- Community 1 ID: 354420fd-5806-49c3-bfcf-a7ffc64f89ba
-- Community 2 ID: (siguiente ID de comunidad)

INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
VALUES 
    ('12345678-1234-1234-1234-123456789012', '354420fd-5806-49c3-bfcf-a7ffc64f89ba', 'manager', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW()),
    ('87654321-4321-4321-4321-210987654321', '354420fd-5806-49c3-bfcf-a7ffc64f89ba', 'resident', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW());
*/

-- =============================================================================
-- RESUMEN DEL PROCESO
-- =============================================================================
-- 
-- 1. ✅ Ejecutar PASO 1 para ver estado actual
-- 2. 🌐 PASO 2: Crear usuarios manualmente en Supabase Dashboard
-- 3. 📝 Anotar los IDs de usuarios generados
-- 4. ✏️ PASO 3: Reemplazar @VARIABLES con IDs reales y ejecutar
-- 5. ✅ PASO 4: Verificar que todo funciona
-- 
-- CREDENCIALES FINALES:
-- - manager@test.com / TestManager123! (acceso a 2 comunidades)
-- - resident@test.com / TestResident123! (acceso a 1 comunidad)
-- 
-- LISTO PARA TESTING DEL MÓDULO DE DOCUMENTOS!