-- Migración 001: Crear tabla communities
-- Fecha: 2025-01-09
-- Objetivo: Tabla base para multi-tenancy del SaaS

CREATE TABLE IF NOT EXISTS public.communities (
  -- Identificador único
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Información básica
  name varchar(255) NOT NULL,
  address text,
  postal_code varchar(10),
  admin_contact varchar(255),
  
  -- Configuración
  max_units integer DEFAULT 100, -- Número máximo de viviendas
  is_active boolean DEFAULT true,
  
  -- Metadatos
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraints
  CONSTRAINT communities_name_not_empty CHECK (char_length(name) > 0)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_communities_active ON public.communities(is_active);
CREATE INDEX IF NOT EXISTS idx_communities_postal_code ON public.communities(postal_code);

-- RLS (Row Level Security) - Por ahora deshabilitado hasta que tengamos usuarios
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Política temporal - Permitir todo hasta que implementemos roles
CREATE POLICY "Allow all for authenticated users" ON public.communities
FOR ALL USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE public.communities IS 'Tabla principal para gestión multi-tenant de comunidades de vecinos';
COMMENT ON COLUMN public.communities.id IS 'Identificador único de la comunidad';
COMMENT ON COLUMN public.communities.name IS 'Nombre de la comunidad (ej: Residencial Los Álamos)';
COMMENT ON COLUMN public.communities.admin_contact IS 'Email del administrador de la comunidad';