-- ===============================================================================
-- OBTENER DATOS ACTUALES PARA CREAR USUARIOS DE PRUEBA
-- ===============================================================================
-- Ejecutar estas queries en Supabase SQL Editor para obtener los IDs reales

-- 1. VER ORGANIZACIÓN ACTUAL
SELECT 'ORGANIZATIONS' as type, id, name, created_at 
FROM organizations 
ORDER BY created_at DESC;

-- 2. VER COMUNIDADES DISPONIBLES
SELECT 'COMMUNITIES' as type, id, name, organization_id, is_active 
FROM communities 
WHERE is_active = true 
ORDER BY name;

-- 3. VER USUARIOS ACTUALES EN AUTH (requiere permisos)
-- Si no funciona, crear usuarios manualmente en Dashboard > Authentication
SELECT 'CURRENT_USERS' as type, id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 4. VER ROLES EXISTENTES
SELECT 'USER_ROLES' as type, user_id, role, community_id, organization_id, created_at
FROM user_roles 
ORDER BY created_at DESC;