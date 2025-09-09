  -- Migración 001: Limpiar y crear tabla communities
  -- Fecha: 2025-01-09
  -- Objetivo: Tabla base limpia para multi-tenancy del SaaS

  -- 🧹 LIMPIEZA: Borrar tabla existente si existe
  DROP TABLE IF EXISTS public.communities CASCADE;

  -- 🏗️ CREAR TABLA COMMUNITIES DESDE CERO
  CREATE TABLE public.communities (
    -- Identificador único
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Información básica
    name varchar(255) NOT NULL,
    address text,
    postal_code varchar(10),
    admin_contact varchar(255),
    
    -- Configuración
    max_units integer DEFAULT 100,
    is_active boolean DEFAULT true,
    
    -- Metadatos
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Constraints
    CONSTRAINT communities_name_not_empty CHECK (char_length(name) > 0)
  );

  -- 📊 ÍNDICES para performance
  CREATE INDEX idx_communities_active ON public.communities(is_active);
  CREATE INDEX idx_communities_postal_code ON public.communities(postal_code);

  -- 🔒 ROW LEVEL SECURITY
  ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

  -- 🛡️ POLÍTICA TEMPORAL (hasta implementar roles)
  CREATE POLICY "Allow all for authenticated users" ON public.communities
  FOR ALL USING (auth.role() = 'authenticated');

  -- 📝 COMENTARIOS
  COMMENT ON TABLE public.communities IS 'Tabla principal para gestión multi-tenant de comunidades de vecinos';
  COMMENT ON COLUMN public.communities.id IS 'Identificador único de la comunidad';
  COMMENT ON COLUMN public.communities.name IS 'Nombre de la comunidad (ej: Residencial Los Álamos)';

  -- 🧪 DATOS DE PRUEBA
  INSERT INTO public.communities (name, address, postal_code, admin_contact) VALUES 
  ('Residencial Los Álamos', 'Calle Principal 123, Madrid', '28001', 'admin@losalamos.com'),
  ('Urbanización El Pinar', 'Avenida del Pinar 45, Barcelona', '08001', 'admin@elpinar.com'),
  ('Comunidad Las Flores', 'Plaza de las Flores 12, Valencia', '46001', 'admin@lasflores.com');

  -- ✅ VERIFICACIÓN
  SELECT 'Tabla communities creada exitosamente con ' || count(*) || ' comunidades de prueba' as resultado
  FROM public.communities;