-- ===============================================================================
-- CREACIÓN DE USUARIOS DE PRUEBA CON IDs REALES
-- ===============================================================================
-- Basado en los datos conocidos de tu base de datos

-- =============================================================================
-- PASO 1: EJECUTAR PRIMERO ESTAS QUERIES PARA OBTENER IDs ACTUALES
-- =============================================================================

-- Obtener ID de organización
SELECT 'ORG_ID -->' as label, id, name FROM organizations LIMIT 1;

-- Obtener IDs de comunidades (necesitamos 2)
SELECT 'COMMUNITY_IDs -->' as label, id, name FROM communities WHERE is_active = true ORDER BY name LIMIT 2;

-- Ver usuarios actuales
SELECT 'CURRENT_USERS -->' as label, id, email FROM auth.users ORDER BY created_at DESC;

-- =============================================================================
-- PASO 2: DESPUÉS DE CREAR USUARIOS EN SUPABASE DASHBOARD
-- =============================================================================
-- 1. Ve a: https://supabase.com/dashboard/project/vhybocthkbupgedovovj/auth/users
-- 2. Crear usuarios:
--    Email: manager@test.com | Password: TestManager123!
--    Email: resident@test.com | Password: TestResident123!

-- =============================================================================
-- PASO 3: OBTENER IDs DE LOS NUEVOS USUARIOS
-- =============================================================================

-- Ejecutar esta query para obtener los IDs de los usuarios recién creados
SELECT 'NEW_USER_IDs -->' as label, id, email 
FROM auth.users 
WHERE email IN ('manager@test.com', 'resident@test.com')
ORDER BY email;

-- =============================================================================
-- PASO 4: PLANTILLA PARA ASIGNAR ROLES (REEMPLAZAR IDs)
-- =============================================================================

-- EJEMPLO USANDO LOS DATOS QUE CONOCEMOS DE TU SISTEMA:
-- Tu organización: e3f4370b-2235-45ad-869a-737ee9fd95ab
-- Una de tus comunidades: 354420fd-5806-49c3-bfcf-a7ffc64f89ba

-- IMPORTANTE: REEMPLAZA ESTOS IDs CON LOS REALES DE LA QUERY ANTERIOR

-- Asignar manager@test.com (REEMPLAZAR MANAGER_USER_ID)
INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
VALUES 
    ('MANAGER_USER_ID_AQUI', '354420fd-5806-49c3-bfcf-a7ffc64f89ba', 'manager', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW());

-- Si tienes una segunda comunidad, agregar:
-- ('MANAGER_USER_ID_AQUI', 'SEGUNDA_COMUNIDAD_ID', 'manager', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW());

-- Asignar resident@test.com (REEMPLAZAR RESIDENT_USER_ID)
INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
VALUES 
    ('RESIDENT_USER_ID_AQUI', '354420fd-5806-49c3-bfcf-a7ffc64f89ba', 'resident', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW());

-- =============================================================================
-- PASO 5: VERIFICACIÓN
-- =============================================================================

-- Verificar que los usuarios se crearon correctamente
SELECT 
    'VERIFICATION -->' as label,
    ur.user_id,
    ur.role,
    c.name as community_name,
    o.name as organization_name
FROM user_roles ur
JOIN communities c ON ur.community_id = c.id
JOIN organizations o ON ur.organization_id = o.id
WHERE ur.user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('manager@test.com', 'resident@test.com')
)
ORDER BY ur.role, c.name;

-- =============================================================================
-- PROCESO SIMPLIFICADO:
-- =============================================================================
-- 1. Ejecutar PASO 1 para ver tus IDs actuales
-- 2. Ir a Supabase Dashboard > Authentication > Add User (crear los 2 usuarios)
-- 3. Ejecutar PASO 3 para obtener los IDs de los nuevos usuarios
-- 4. Copiar los IDs reales en PASO 4 y ejecutar los INSERTs
-- 5. Ejecutar PASO 5 para verificar

-- RESULTADO ESPERADO:
-- - manager@test.com tendrá acceso como manager a al menos 1 comunidad
-- - resident@test.com tendrá acceso como resident a 1 comunidad
-- - Ambos podrán probar el sistema de documentos con diferentes permisos