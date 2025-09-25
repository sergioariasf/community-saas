-- Verificar estructura actual de la tabla extracted_invoices
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'extracted_invoices' 
AND table_schema = 'public'
ORDER BY ordinal_position;