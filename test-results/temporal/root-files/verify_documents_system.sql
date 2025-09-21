-- Verification script for documents system implementation
-- Run this in Supabase SQL Editor to check if all tables were created correctly

-- Check if pgvector extension is enabled
SELECT 
    'pgvector extension' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector') 
        THEN '✅ ENABLED' 
        ELSE '❌ NOT FOUND' 
    END as status;

-- Check if all tables exist
SELECT 
    'documents table' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status
UNION ALL
SELECT 
    'agents table' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agents') 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status
UNION ALL
SELECT 
    'extracted_minutes table' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'extracted_minutes') 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status
UNION ALL
SELECT 
    'extracted_invoices table' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'extracted_invoices') 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status
UNION ALL
SELECT 
    'vector_embeddings table' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vector_embeddings') 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    'RLS Policy' as type
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('documents', 'agents', 'extracted_minutes', 'extracted_invoices', 'vector_embeddings')
ORDER BY tablename, policyname;

-- Check SaaS agents
SELECT 
    name,
    purpose,
    CASE 
        WHEN organization_id IS NULL THEN 'Global SaaS Agent' 
        ELSE 'Organization Specific' 
    END as scope,
    is_active
FROM public.agents 
WHERE organization_id IS NULL
ORDER BY name;

-- Count indexes on new tables
SELECT 
    schemaname,
    tablename,
    indexname,
    'Performance Index' as type
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('documents', 'agents', 'extracted_minutes', 'extracted_invoices', 'vector_embeddings')
ORDER BY tablename, indexname;