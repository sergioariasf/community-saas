-- ===============================================================================
-- SCRIPT: Obtener Schema Completo de Supabase
-- ===============================================================================
-- Ejecuta cada sección por separado en SQL Editor y copia resultados
-- O ejecuta todo con pg_dump si tienes postgresql-client instalado

-- =============================================================================
-- 1. EXTENSIONES HABILITADAS
-- =============================================================================
SELECT extname as extension_name 
FROM pg_extension 
WHERE extname NOT IN ('plpgsql', 'pg_stat_statements')
ORDER BY extname;

-- =============================================================================
-- 2. TABLAS EXISTENTES (Schema público)
-- =============================================================================
SELECT 
    table_name,
    table_type,
    is_insertable_into,
    is_typed
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =============================================================================
-- 3. COLUMNAS DE TODAS LAS TABLAS
-- =============================================================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =============================================================================
-- 4. PRIMARY KEYS
-- =============================================================================
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =============================================================================
-- 5. FOREIGN KEYS Y REFERENCIAS
-- =============================================================================
SELECT
    tc.constraint_name,
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name as target_table,
    ccu.column_name as target_column,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =============================================================================
-- 6. CHECK CONSTRAINTS
-- =============================================================================
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =============================================================================
-- 7. ÍNDICES
-- =============================================================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =============================================================================
-- 8. FUNCIONES CUSTOM (Solo las tuyas, no pgvector)
-- =============================================================================
SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name NOT LIKE 'vector%'
    AND routine_name NOT LIKE 'halfvec%' 
    AND routine_name NOT LIKE 'sparsevec%'
    AND routine_name NOT LIKE '%distance'
    AND routine_name NOT LIKE 'ivf%'
    AND routine_name NOT LIKE 'hnsw%'
    AND routine_name NOT LIKE 'binary_quantize'
    AND routine_name NOT LIKE 'l2_%'
    AND routine_name NOT LIKE 'l1_%'
    AND routine_name NOT LIKE 'inner_product'
    AND routine_name NOT LIKE 'cosine_distance'
    AND routine_name NOT LIKE 'hamming_distance'
    AND routine_name NOT LIKE 'jaccard_distance'
    AND routine_name NOT LIKE 'array_to_%'
    AND routine_name NOT LIKE '%_to_float4'
    AND routine_name NOT LIKE 'subvector'
    AND routine_name NOT IN ('avg', 'sum')
ORDER BY routine_name;

-- =============================================================================
-- 9. TRIGGERS
-- =============================================================================
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =============================================================================
-- 10. RLS (Row Level Security) POLICIES
-- =============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- 11. DATOS DE MUESTRA DE TABLAS CRÍTICAS (OPCIONAL)
-- =============================================================================
-- Ejecuta solo si quieres ver datos de muestra de tablas importantes

-- Agentes existentes
SELECT name, purpose, is_active, created_at 
FROM agents 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 10;

-- Organizaciones
SELECT id, name, created_at 
FROM organizations 
ORDER BY created_at DESC 
LIMIT 5;

-- Documentos recientes  
SELECT id, filename, document_type, created_at 
FROM documents 
ORDER BY created_at DESC 
LIMIT 5;