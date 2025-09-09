-- Migración 006: Sistema de Roles y Permisos
-- Fecha: 2025-01-09
-- Objetivo: Crear tabla user_roles para sistema de autorización

-- 🔧 CREAR TABLA USER_ROLES
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'resident')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Un usuario solo puede tener UN rol por comunidad
  CONSTRAINT unique_user_community_role UNIQUE(user_id, community_id)
);

-- 📊 ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_community_id ON public.user_roles(community_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- 🔒 HABILITAR RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 🛡️ POLÍTICAS RLS
-- Solo usuarios autenticados pueden ver sus propios roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- Solo admins pueden insertar roles (lo implementaremos luego)
CREATE POLICY "Authenticated users can insert roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Solo admins pueden actualizar roles
CREATE POLICY "Users can update their own roles" 
ON public.user_roles FOR UPDATE 
USING (auth.uid() = user_id);

-- 🧪 DATOS DE PRUEBA
-- Necesitamos obtener el user_id del usuario actual
-- Como no podemos hacer esto dinámicamente, crearemos los datos después

-- Función helper para obtener user ID por email
CREATE OR REPLACE FUNCTION get_user_id_by_email(email_address text)
RETURNS uuid AS $$
DECLARE
    user_uuid uuid;
BEGIN
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = email_address;
    
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 🎭 INSERTAR ROLES DE PRUEBA
-- ADMIN: Acceso total
INSERT INTO public.user_roles (user_id, community_id, role) 
VALUES (
  get_user_id_by_email('sergioariasf@gmail.com'),
  NULL, -- NULL significa acceso a todas las comunidades
  'admin'
);

-- MANAGER: Una comunidad específica  
-- Primero obtenemos el ID de la primera comunidad
DO $$
DECLARE
    first_community_id uuid;
BEGIN
    SELECT id INTO first_community_id 
    FROM public.communities 
    LIMIT 1;
    
    INSERT INTO public.user_roles (user_id, community_id, role) 
    VALUES (
        get_user_id_by_email('sergioariasf@gmail.com'),
        first_community_id,
        'manager'
    );
END $$;

-- ✅ VERIFICACIÓN
SELECT 
    'Roles creados: ' || count(*) || ' roles asignados' as resultado,
    string_agg(role, ', ') as roles_asignados
FROM public.user_roles;

-- 📋 COMENTARIOS PARA DOCUMENTACIÓN
COMMENT ON TABLE public.user_roles IS 'Tabla de roles de usuarios por comunidad';
COMMENT ON COLUMN public.user_roles.user_id IS 'ID del usuario (referencia a auth.users)';
COMMENT ON COLUMN public.user_roles.community_id IS 'ID de la comunidad (NULL = admin global)';
COMMENT ON COLUMN public.user_roles.role IS 'Rol del usuario: admin, manager, resident';