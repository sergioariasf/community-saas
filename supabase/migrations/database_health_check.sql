-- Database Health Check and Troubleshooting Script
-- Run this script to verify the database state and diagnose issues

-- 🔍 SECTION 1: Schema Verification
SELECT '=== SCHEMA VERIFICATION ===' as section;

-- Check if all required tables exist
SELECT 
    'Table Existence Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communities') THEN '✅'
        ELSE '❌'
    END as communities_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN '✅'
        ELSE '❌'
    END as user_roles_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'incidents') THEN '✅'
        ELSE '❌'
    END as incidents_table;

-- Check communities table columns
SELECT 
    'Communities Columns Check' as check_type,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'description') THEN '✅' ELSE '❌' END as description_col,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'city') THEN '✅' ELSE '❌' END as city_col,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'country') THEN '✅' ELSE '❌' END as country_col,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communities' AND column_name = 'user_id') THEN '✅' ELSE '❌' END as user_id_col;

-- 📊 SECTION 2: Data Count Verification  
SELECT '=== DATA COUNT VERIFICATION ===' as section;

SELECT 
    'Data Counts' as check_type,
    (SELECT COUNT(*) FROM public.communities) as total_communities,
    (SELECT COUNT(*) FROM public.user_roles) as total_user_roles,
    (SELECT COUNT(*) FROM public.incidents) as total_incidents,
    (SELECT COUNT(*) FROM auth.users) as total_users;

-- 🔒 SECTION 3: RLS Policy Verification
SELECT '=== RLS POLICIES VERIFICATION ===' as section;

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE schemaname = 'public' 
AND tablename IN ('communities', 'user_roles', 'incidents')
ORDER BY tablename;

-- List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as policy_command,
    permissive
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 👤 SECTION 4: User Roles Analysis
SELECT '=== USER ROLES ANALYSIS ===' as section;

-- Check admin user and roles
SELECT 
    au.email,
    ur.role,
    CASE 
        WHEN ur.community_id IS NULL THEN 'Global Admin'
        ELSE c.name
    END as scope,
    ur.created_at
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN communities c ON ur.community_id = c.id
WHERE au.email = 'sergioariasf@gmail.com'
ORDER BY ur.created_at;

-- 🎯 SECTION 5: Incidents Visibility Test
SELECT '=== INCIDENTS VISIBILITY TEST ===' as section;

-- Test what incidents the admin user can see
SELECT 
    'Admin Visibility Test' as test_type,
    i.title,
    i.status,
    i.priority,
    c.name as community_name
FROM incidents i
JOIN communities c ON i.community_id = c.id
WHERE EXISTS (
    -- This mimics the RLS policy logic
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = (SELECT id FROM auth.users WHERE email = 'sergioariasf@gmail.com')
    AND ur.community_id IS NULL 
    AND ur.role = 'admin'
)
ORDER BY i.created_at DESC;

-- 🔧 SECTION 6: Permission Debug Function Test
SELECT '=== PERMISSION DEBUG FUNCTION TEST ===' as section;

-- Test the debug function (if user is authenticated)
-- This will only work when executed by an authenticated user
-- SELECT * FROM debug_user_permissions();

-- 🚨 SECTION 7: Common Issues Diagnostic
SELECT '=== COMMON ISSUES DIAGNOSTIC ===' as section;

-- Check for orphaned incidents (community doesn't exist)
SELECT 
    'Orphaned Incidents Check' as issue_type,
    COUNT(*) as orphaned_count
FROM incidents i
LEFT JOIN communities c ON i.community_id = c.id
WHERE c.id IS NULL;

-- Check for users without roles
SELECT 
    'Users Without Roles' as issue_type,
    COUNT(*) as users_without_roles
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL;

-- Check for incidents without valid reporters
SELECT 
    'Invalid Reporter Check' as issue_type,
    COUNT(*) as invalid_reporters
FROM incidents i
LEFT JOIN auth.users au ON i.reported_by = au.id
WHERE au.id IS NULL;

-- 💡 SECTION 8: Recommended Actions
SELECT '=== RECOMMENDED ACTIONS ===' as section;

-- Summary and recommendations
SELECT 
    'Health Summary' as summary_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.communities) >= 3 AND
             (SELECT COUNT(*) FROM public.user_roles WHERE community_id IS NULL AND role = 'admin') >= 1 AND
             (SELECT COUNT(*) FROM public.incidents) >= 6 
        THEN '✅ Database appears healthy - incidents should be visible'
        ELSE '⚠️  Issues detected - check individual sections above'
    END as overall_status;