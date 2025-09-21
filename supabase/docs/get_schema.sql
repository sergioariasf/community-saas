-- Ejecuta estas queries en el SQL Editor de Supabase Dashboard
-- y copia los resultados aquí

-- 1. TABLAS EXISTENTES
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. ESTRUCTURA DE TABLAS (ejecuta para cada tabla que aparezca arriba)
-- Ejemplo para communities:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'communities' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. FOREIGN KEYS Y CONSTRAINTS
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';

-- 4. EXTENSIONES
SELECT extname FROM pg_extension;

-- 5. FUNCIONES EXISTENTES
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';