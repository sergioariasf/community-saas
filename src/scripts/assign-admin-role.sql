-- Script para asignar rol de admin a un usuario
-- Ejecuta esto en Supabase SQL Editor para asignarte permisos de admin

-- 1. Ver tu ID de usuario actual
SELECT id, email FROM auth.users WHERE email = 'sergioariasf@gmail.com';

-- 2. Asignar rol de admin (reemplaza el ID con el que obtienes arriba)
INSERT INTO user_roles (user_id, role, community_id) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'sergioariasf@gmail.com'), 
  'admin', 
  null
)
ON CONFLICT DO NOTHING;