-- Añadir campos de contacto faltantes a extracted_invoices
ALTER TABLE extracted_invoices 
ADD COLUMN vendor_phone TEXT,
ADD COLUMN vendor_email TEXT,
ADD COLUMN client_phone TEXT,
ADD COLUMN client_email TEXT;

-- Verificar que se añadieron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'extracted_invoices' 
AND table_schema = 'public'
AND column_name IN ('vendor_phone', 'vendor_email', 'client_phone', 'client_email')
ORDER BY column_name;