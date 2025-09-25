-- ARCHIVO: get_extracted_invoices_structure.sql
-- PROPÓSITO: Ver estructura completa de la tabla extracted_invoices
-- ESTADO: development
-- DEPENDENCIAS: Supabase database
-- OUTPUTS: Información detallada de columnas y estructura
-- ACTUALIZADO: 2025-09-19

-- 1. Ver estructura de columnas
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

-- 2. Ver constraints y claves
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'extracted_invoices'
    AND tc.table_schema = 'public';

-- 3. Ver índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'extracted_invoices' 
    AND schemaname = 'public';