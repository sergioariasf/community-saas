-- Migración 003: Setup corregido para Supabase
-- Fecha: 2025-01-09
-- Objetivo: SQL compatible con Supabase (sin IF NOT EXISTS en policies)

-- 🧹 LIMPIEZA (por si hay datos previos)
DROP TABLE IF EXISTS public.communities CASCADE;

-- 🏗️ CREAR TABLA COMMUNITIES
CREATE TABLE public.communities (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name varchar(255) NOT NULL,
  address text,
  postal_code varchar(10),
  admin_contact varchar(255),
  max_units integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT communities_name_not_empty CHECK (char_length(name) > 0)
);

-- 📊 ÍNDICES
CREATE INDEX idx_communities_active ON public.communities(is_active);
CREATE INDEX idx_communities_postal_code ON public.communities(postal_code);

-- 🔒 HABILITAR RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- 🛡️ POLÍTICA (sin IF NOT EXISTS)
CREATE POLICY "Allow all for authenticated users" ON public.communities
FOR ALL USING (auth.role() = 'authenticated');

-- 🧪 DATOS DE PRUEBA
INSERT INTO public.communities (name, address, postal_code, admin_contact) VALUES 
('Residencial Los Álamos', 'Calle Principal 123, Madrid', '28001', 'admin@losalamos.com'),
('Urbanización El Pinar', 'Avenida del Pinar 45, Barcelona', '08001', 'admin@elpinar.com'),
('Comunidad Las Flores', 'Plaza de las Flores 12, Valencia', '46001', 'admin@lasflores.com');

-- ✅ VERIFICACIÓN
SELECT 'Tabla communities creada con ' || count(*) || ' registros' as resultado
FROM public.communities;