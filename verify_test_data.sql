-- Verificar que los datos de prueba se crearon correctamente
SELECT '=== VERIFICATION OF TEST DATA ===' as info;

-- 1. Check communities created
SELECT 'Communities created:' as info;
SELECT id, name, city, user_id, created_at
FROM communities 
ORDER BY created_at DESC;

-- 2. Check user roles
SELECT 'User roles created:' as info;
SELECT ur.role, ur.community_id, c.name as community_name
FROM user_roles ur
LEFT JOIN communities c ON ur.community_id = c.id
WHERE ur.user_id = (SELECT id FROM auth.users WHERE email = 'sergioariasf@gmail.com' LIMIT 1)
ORDER BY ur.role;

-- 3. Check incidents created
SELECT 'Incidents created:' as info;
SELECT i.title, i.status, i.priority, c.name as community_name, i.created_at
FROM incidents i
JOIN communities c ON i.community_id = c.id
ORDER BY i.created_at DESC;

-- 4. Summary counts
SELECT 'Summary counts:' as info;
SELECT 
  'communities' as table_name, COUNT(*) as count 
FROM communities
UNION ALL
SELECT 
  'user_roles' as table_name, COUNT(*) as count 
FROM user_roles
UNION ALL
SELECT 
  'incidents' as table_name, COUNT(*) as count 
FROM incidents;