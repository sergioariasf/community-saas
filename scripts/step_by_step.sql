-- ===============================================================================
-- PROCESO PASO A PASO - EJECUTAR EN ORDEN
-- ===============================================================================

-- =============================================================================
-- EJECUTAR PRIMERO: Ver comunidades disponibles
-- =============================================================================
SELECT 'COMUNIDADES_DISPONIBLES' as info, id, name, organization_id, is_active 
FROM communities 
WHERE organization_id = 'e3f4370b-2235-45ad-869a-737ee9fd95ab'
  AND is_active = true 
ORDER BY name;

-- 📝 ANOTA LOS IDs DE COMUNIDADES QUE APAREZCAN AQUÍ

-- =============================================================================
-- DESPUÉS DE CREAR USUARIOS EN DASHBOARD: Ver IDs de usuarios nuevos
-- =============================================================================
-- ⚠️ SOLO EJECUTAR DESPUÉS DE CREAR LOS USUARIOS EN DASHBOARD

SELECT 'USUARIOS_TEST' as info, id as user_id, email, created_at
FROM auth.users 
WHERE email IN ('manager@test.com', 'resident@test.com')
ORDER BY email;

-- 📝 ANOTA LOS USER_IDs QUE APAREZCAN AQUÍ

-- =============================================================================
-- PLANTILLA PARA COPIAR Y PEGAR (REEMPLAZA LOS VALORES)
-- =============================================================================
-- 
-- Una vez tengas los IDs reales, copia esta plantilla y reemplaza:
-- 
-- INSERT INTO user_roles (user_id, community_id, role, organization_id, created_at, updated_at)
-- VALUES 
--     ('MANAGER_USER_ID_REAL', 'COMMUNITY_ID_REAL', 'manager', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW()),
--     ('RESIDENT_USER_ID_REAL', 'COMMUNITY_ID_REAL', 'resident', 'e3f4370b-2235-45ad-869a-737ee9fd95ab', NOW(), NOW());
-- 
-- DONDE:
-- - MANAGER_USER_ID_REAL = ID del manager@test.com
-- - RESIDENT_USER_ID_REAL = ID del resident@test.com  
-- - COMMUNITY_ID_REAL = ID de una comunidad de la primera query