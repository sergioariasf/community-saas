-- Script para verificar la estructura actual de las tablas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de communities
SELECT 'COMMUNITIES TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'communities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar estructura de user_roles
SELECT 'USER_ROLES TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estructura de incidents
SELECT 'INCIDENTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'incidents' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar datos existentes
SELECT 'CURRENT DATA COUNT:' as info;
SELECT 
  'communities' as table_name, 
  COUNT(*) as count 
FROM communities
UNION ALL
SELECT 
  'user_roles' as table_name, 
  COUNT(*) as count 
FROM user_roles  
UNION ALL
SELECT 
  'incidents' as table_name, 
  COUNT(*) as count 
FROM incidents;

-- 5. Verificar usuarios auth
SELECT 'AUTH USERS:' as info;
SELECT id, email, created_at
FROM auth.users 
WHERE email = 'sergioariasf@gmail.com';

-- 6. Verificar políticas RLS
SELECT 'RLS POLICIES:' as info;
SELECT 
  tablename,
  policyname,
  cmd as command
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('communities', 'incidents', 'user_roles')
ORDER BY tablename, policyname;