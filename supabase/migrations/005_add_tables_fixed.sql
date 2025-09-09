-- Migración 005: Tablas NextBase (SQL correcto para Supabase)
-- Fecha: 2025-01-09
-- Objetivo: Crear items y private_items sin IF NOT EXISTS en policies

-- 🧹 LIMPIAR (por si hay conflictos)
DROP TABLE IF EXISTS public.private_items CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;

-- 🔧 TABLA ITEMS (pública)
CREATE TABLE public.items (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name character varying NOT NULL,
  description character varying NOT NULL
);

-- 🔒 TABLA PRIVATE_ITEMS (privada por usuario)  
CREATE TABLE public.private_items (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name character varying NOT NULL,
  description character varying NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 🛡️ RLS PARA ITEMS (sin IF NOT EXISTS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items are viewable by everyone" 
ON public.items FOR SELECT USING (true);

CREATE POLICY "Users can insert their own items" 
ON public.items FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own items" 
ON public.items FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own items" 
ON public.items FOR DELETE USING (true);

-- 🛡️ RLS PARA PRIVATE_ITEMS (sin IF NOT EXISTS)
ALTER TABLE public.private_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own private_items" 
ON public.private_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own private_items" 
ON public.private_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own private_items" 
ON public.private_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own private_items" 
ON public.private_items FOR DELETE USING (auth.uid() = user_id);

-- 🧪 DATOS DE PRUEBA
INSERT INTO public.items (name, description) VALUES 
('Ejemplo Item 1', 'Este es un item público de ejemplo'),
('Ejemplo Item 2', 'Otro item que todos pueden ver'),
('Ejemplo Item 3', 'Tercer item para probar la funcionalidad');

-- ✅ VERIFICACIÓN
SELECT 'Tablas NextBase creadas: ' || 
  (SELECT count(*) FROM public.items) || ' items públicos, ' ||
  (SELECT count(*) FROM public.private_items) || ' items privados' as resultado;