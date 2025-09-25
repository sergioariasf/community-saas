-- ARCHIVO: optimize_invoice_table.sql
-- PROPÓSITO: Optimizar tabla extracted_invoices para manejar facturas complejas sin exceso de tokens
-- ESTADO: development
-- DEPENDENCIAS: tabla extracted_invoices
-- OUTPUTS: Campos optimizados para resumen de productos en lugar de detalle individual
-- ACTUALIZADO: 2025-09-22

-- Agregar nuevos campos optimizados para facturas complejas
ALTER TABLE public.extracted_invoices 
ADD COLUMN IF NOT EXISTS products_summary text,
ADD COLUMN IF NOT EXISTS products_count integer DEFAULT 0;

-- Agregar comentarios explicativos
COMMENT ON COLUMN public.extracted_invoices.products_summary IS 'Resumen general de productos/servicios (máximo 200 caracteres) - reemplaza el detalle individual en facturas complejas';
COMMENT ON COLUMN public.extracted_invoices.products_count IS 'Número total de líneas de productos en la factura';
COMMENT ON COLUMN public.extracted_invoices.products IS 'JSONB detallado de productos - solo para facturas simples (1-5 productos)';

-- Crear índice para búsquedas por resumen de productos
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_products_summary 
ON public.extracted_invoices USING gin (to_tsvector('spanish', products_summary));

-- Crear índice para número de productos
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_products_count 
ON public.extracted_invoices USING btree (products_count);

-- Verificar que los campos se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'extracted_invoices' 
  AND column_name IN ('products_summary', 'products_count', 'products')
ORDER BY column_name;