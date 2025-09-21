-- Migration 011: Create Documents System with AI Agents
-- Date: 2025-09-11
-- Objective: Implement document management with AI extraction for community SaaS
-- Architecture: organizations → documents → extracted_data + AI agents

-- ============================================================================
-- PHASE 1: ENABLE PGVECTOR EXTENSION
-- ============================================================================

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- PHASE 2: CREATE DOCUMENTS TABLE
-- ============================================================================

-- Create documents table - main document storage
CREATE TABLE IF NOT EXISTS public.documents (
  -- Primary identifier
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Multi-tenant isolation
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  
  -- File information
  filename TEXT NOT NULL CHECK (length(trim(filename)) >= 1 AND length(trim(filename)) <= 255),
  file_path TEXT NOT NULL CHECK (length(trim(file_path)) >= 1),
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  file_hash TEXT NOT NULL CHECK (length(trim(file_hash)) >= 32),
  
  -- Document classification and processing
  document_type TEXT CHECK (document_type IN ('acta', 'factura', 'comunicado', 'contrato', 'presupuesto')),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure unique file hash per organization
  CONSTRAINT unique_organization_file_hash UNIQUE(organization_id, file_hash)
);

-- Performance indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_community_id ON public.documents(community_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON public.documents(file_hash);

-- ============================================================================
-- PHASE 3: CREATE AGENTS TABLE
-- ============================================================================

-- Create agents table - SaaS AI agents with prompts
CREATE TABLE IF NOT EXISTS public.agents (
  -- Primary identifier
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Multi-tenant isolation (NULL = global SaaS agents, UUID = organization-specific)
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Agent configuration
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2 AND length(trim(name)) <= 100),
  purpose TEXT NOT NULL CHECK (length(trim(purpose)) >= 10 AND length(trim(purpose)) <= 500),
  prompt_template TEXT NOT NULL CHECK (length(trim(prompt_template)) >= 20),
  variables JSONB NOT NULL DEFAULT '{}',
  
  -- Agent metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure unique agent names per organization (global agents have NULL organization_id)
  CONSTRAINT unique_organization_agent_name UNIQUE(organization_id, name)
);

-- Performance indexes for agents
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON public.agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_name ON public.agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON public.agents(is_active);

-- ============================================================================
-- PHASE 4: CREATE EXTRACTED DATA TABLES
-- ============================================================================

-- Create extracted_minutes table - extracted data from community meeting minutes
CREATE TABLE IF NOT EXISTS public.extracted_minutes (
  -- Primary identifier
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relations
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Extracted data fields specific to community minutes
  president_in TEXT CHECK (president_in IS NULL OR length(trim(president_in)) <= 255),
  president_out TEXT CHECK (president_out IS NULL OR length(trim(president_out)) <= 255),
  administrator TEXT CHECK (administrator IS NULL OR length(trim(administrator)) <= 255),
  summary TEXT CHECK (summary IS NULL OR length(trim(summary)) <= 2000),
  decisions TEXT CHECK (decisions IS NULL OR length(trim(decisions)) <= 2000),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance indexes for extracted_minutes
CREATE INDEX IF NOT EXISTS idx_extracted_minutes_document_id ON public.extracted_minutes(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_minutes_organization_id ON public.extracted_minutes(organization_id);
CREATE INDEX IF NOT EXISTS idx_extracted_minutes_created_at ON public.extracted_minutes(created_at DESC);

-- Create extracted_invoices table - extracted data from invoices
CREATE TABLE IF NOT EXISTS public.extracted_invoices (
  -- Primary identifier
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relations
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Extracted data fields specific to invoices
  provider_name TEXT CHECK (provider_name IS NULL OR length(trim(provider_name)) <= 255),
  client_name TEXT CHECK (client_name IS NULL OR length(trim(client_name)) <= 255),
  amount DECIMAL(12,2) CHECK (amount IS NULL OR amount >= 0),
  invoice_date DATE,
  category TEXT CHECK (category IS NULL OR length(trim(category)) <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance indexes for extracted_invoices
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_document_id ON public.extracted_invoices(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_organization_id ON public.extracted_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_invoice_date ON public.extracted_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_amount ON public.extracted_invoices(amount);
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_created_at ON public.extracted_invoices(created_at DESC);

-- ============================================================================
-- PHASE 5: CREATE VECTOR EMBEDDINGS TABLE
-- ============================================================================

-- Create vector_embeddings table - for semantic search with pgvector
CREATE TABLE IF NOT EXISTS public.vector_embeddings (
  -- Primary identifier
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relations
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Content and vector data
  content TEXT NOT NULL CHECK (length(trim(content)) >= 10),
  embedding VECTOR(768), -- Gemini embeddings are 768 dimensions
  
  -- Chunk metadata for large documents
  chunk_index INTEGER DEFAULT 0 CHECK (chunk_index >= 0),
  chunk_size INTEGER CHECK (chunk_size IS NULL OR chunk_size > 0),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Performance indexes for vector_embeddings
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_document_id ON public.vector_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_organization_id ON public.vector_embeddings(organization_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_chunk_index ON public.vector_embeddings(chunk_index);

-- Vector similarity search index using HNSW (Hierarchical Navigable Small World)
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_cosine ON public.vector_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- PHASE 6: ENABLE RLS ON ALL NEW TABLES
-- ============================================================================

-- Enable RLS on all document tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vector_embeddings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PHASE 7: CREATE RLS POLICIES USING ORGANIZATION ISOLATION
-- ============================================================================

-- Documents policies
CREATE POLICY "documents_organization_isolation" ON public.documents
  FOR ALL
  USING (organization_id = get_user_organization_id());

-- Agents policies (global agents visible to all, organization agents isolated)
CREATE POLICY "agents_global_and_organization_access" ON public.agents
  FOR SELECT
  USING (
    organization_id IS NULL  -- Global SaaS agents
    OR organization_id = get_user_organization_id()  -- Organization-specific agents
  );

-- Organization owners can insert their own agents
CREATE POLICY "agents_organization_insert" ON public.agents
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = get_user_organization_id()
      AND o.owner_id = auth.uid()
    )
  );

-- Organization owners can update their own agents
CREATE POLICY "agents_organization_update" ON public.agents
  FOR UPDATE
  USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = get_user_organization_id()
      AND o.owner_id = auth.uid()
    )
  );

-- Organization owners can delete their own agents
CREATE POLICY "agents_organization_delete" ON public.agents
  FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = get_user_organization_id()
      AND o.owner_id = auth.uid()
    )
  );

-- Extracted minutes policies
CREATE POLICY "extracted_minutes_organization_isolation" ON public.extracted_minutes
  FOR ALL
  USING (organization_id = get_user_organization_id());

-- Extracted invoices policies
CREATE POLICY "extracted_invoices_organization_isolation" ON public.extracted_invoices
  FOR ALL
  USING (organization_id = get_user_organization_id());

-- Vector embeddings policies
CREATE POLICY "vector_embeddings_organization_isolation" ON public.vector_embeddings
  FOR ALL
  USING (organization_id = get_user_organization_id());

-- ============================================================================
-- PHASE 8: INSERT INITIAL GLOBAL SAAS AGENTS
-- ============================================================================

-- Insert the 3 basic SaaS agents for document processing
INSERT INTO public.agents (organization_id, name, purpose, prompt_template, variables) VALUES

-- Agent 1: Document Classifier
(NULL, 
 'document_classifier', 
 'Determinar si es acta o factura',
 'Analiza este texto y di si es "acta" o "factura": {document_text}', 
 '{"input_key": "document_text"}'),

-- Agent 2: Minutes Extractor
(NULL,
 'minutes_extractor',
 'Extraer datos de actas',
 'Del siguiente acta extrae: presidente entrante, presidente saliente, administrador, resumen. Texto: {document_text}',
 '{"input_key": "document_text"}'),

-- Agent 3: Invoice Extractor
(NULL,
 'invoice_extractor',
 'Extraer datos de facturas', 
 'De esta factura extrae: proveedor, cliente, importe, fecha. Texto: {document_text}',
 '{"input_key": "document_text"}')

ON CONFLICT (organization_id, name) DO NOTHING;

-- ============================================================================
-- PHASE 9: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get document statistics for an organization
CREATE OR REPLACE FUNCTION get_organization_document_stats(org_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_documents BIGINT,
  processing_documents BIGINT,
  completed_documents BIGINT,
  error_documents BIGINT,
  total_actas BIGINT,
  total_facturas BIGINT,
  total_size_mb NUMERIC
) AS $$
DECLARE
    target_org_id UUID;
BEGIN
    -- Use provided org_id or get current user's organization
    target_org_id := COALESCE(org_id, get_user_organization_id());
    
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_documents,
        COUNT(*) FILTER (WHERE status = 'processing')::BIGINT as processing_documents,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_documents,
        COUNT(*) FILTER (WHERE status = 'error')::BIGINT as error_documents,
        COUNT(*) FILTER (WHERE document_type = 'acta')::BIGINT as total_actas,
        COUNT(*) FILTER (WHERE document_type = 'factura')::BIGINT as total_facturas,
        ROUND((SUM(file_size) / 1024.0 / 1024.0)::NUMERIC, 2) as total_size_mb
    FROM public.documents
    WHERE organization_id = target_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search documents by content using vector similarity
CREATE OR REPLACE FUNCTION search_documents_by_content(
  search_query TEXT,
  query_embedding VECTOR(768),
  similarity_threshold FLOAT8 DEFAULT 0.7,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  document_id UUID,
  filename TEXT,
  document_type TEXT,
  content_snippet TEXT,
  similarity_score FLOAT8,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.filename,
        d.document_type,
        LEFT(ve.content, 200) as content_snippet,
        (1 - (ve.embedding <=> query_embedding)) as similarity_score,
        d.created_at
    FROM public.vector_embeddings ve
    JOIN public.documents d ON ve.document_id = d.id
    WHERE 
        ve.organization_id = get_user_organization_id()
        AND d.organization_id = get_user_organization_id()
        AND (1 - (ve.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY ve.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PHASE 10: UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

-- Trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to agents table
CREATE TRIGGER agents_updated_at_trigger
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PHASE 11: TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- Add table and column comments
COMMENT ON TABLE public.documents IS 'Main document storage table with AI processing status and file metadata';
COMMENT ON COLUMN public.documents.organization_id IS 'Organization this document belongs to (tenant isolation)';
COMMENT ON COLUMN public.documents.file_hash IS 'SHA-256 hash for duplicate detection and integrity verification';
COMMENT ON COLUMN public.documents.document_type IS 'AI-classified document type: acta, factura, comunicado, contrato, presupuesto';
COMMENT ON COLUMN public.documents.status IS 'Processing status: processing, completed, error';

COMMENT ON TABLE public.agents IS 'AI agents with prompts for document processing (global SaaS agents + org-specific)';
COMMENT ON COLUMN public.agents.organization_id IS 'NULL for global SaaS agents, UUID for organization-specific agents';
COMMENT ON COLUMN public.agents.prompt_template IS 'Template with {variable} placeholders for AI processing';
COMMENT ON COLUMN public.agents.variables IS 'JSON configuration for prompt variable substitution';

COMMENT ON TABLE public.extracted_minutes IS 'Extracted data from community meeting minutes using AI';
COMMENT ON COLUMN public.extracted_minutes.summary IS 'AI-generated summary of the meeting minutes';
COMMENT ON COLUMN public.extracted_minutes.decisions IS 'Key decisions and resolutions from the meeting';

COMMENT ON TABLE public.extracted_invoices IS 'Extracted data from invoices using AI';
COMMENT ON COLUMN public.extracted_invoices.amount IS 'Invoice total amount in decimal format';
COMMENT ON COLUMN public.extracted_invoices.category IS 'AI-classified expense category';

COMMENT ON TABLE public.vector_embeddings IS 'Vector embeddings for semantic document search using pgvector';
COMMENT ON COLUMN public.vector_embeddings.embedding IS '768-dimensional vector from Gemini embeddings';
COMMENT ON COLUMN public.vector_embeddings.chunk_index IS 'Chunk sequence number for large documents';

-- ============================================================================
-- PHASE 12: FINAL VERIFICATION
-- ============================================================================

-- Verification query to ensure migration success
DO $$
DECLARE
    total_agents INTEGER;
    global_agents INTEGER;
    documents_table_exists BOOLEAN := FALSE;
    pgvector_enabled BOOLEAN := FALSE;
BEGIN
    -- Check if pgvector extension is enabled
    SELECT EXISTS(
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
    ) INTO pgvector_enabled;
    
    -- Check if documents table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'documents'
    ) INTO documents_table_exists;
    
    -- Count agents
    SELECT COUNT(*) INTO total_agents FROM public.agents;
    SELECT COUNT(*) INTO global_agents FROM public.agents WHERE organization_id IS NULL;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '✅ MIGRATION 011 COMPLETED SUCCESSFULLY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Document management system with AI agents implemented:';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '  📄 documents: % (with multi-tenant isolation)', CASE WHEN documents_table_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE '  🤖 agents: ✅ (% total, % global SaaS agents)', total_agents, global_agents;
    RAISE NOTICE '  📋 extracted_minutes: ✅ (for community meeting data)';
    RAISE NOTICE '  🧾 extracted_invoices: ✅ (for invoice data)';
    RAISE NOTICE '  🔍 vector_embeddings: ✅ (for semantic search)';
    RAISE NOTICE '';
    RAISE NOTICE '🧩 Extensions:';
    RAISE NOTICE '  🔧 pgvector: % (for vector similarity search)', CASE WHEN pgvector_enabled THEN '✅ enabled' ELSE '❌ failed' END;
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Security:';
    RAISE NOTICE '  🛡️ RLS enabled on all tables with organization isolation';
    RAISE NOTICE '  🔐 Policies using get_user_organization_id() function';
    RAISE NOTICE '  🌐 Global SaaS agents accessible to all organizations';
    RAISE NOTICE '';
    RAISE NOTICE '📈 Performance:';
    RAISE NOTICE '  📇 Indexes created on foreign keys and search columns';
    RAISE NOTICE '  🏎️ HNSW index for vector similarity search';
    RAISE NOTICE '';
    RAISE NOTICE '🤖 SaaS Agents Installed:';
    RAISE NOTICE '  1️⃣ document_classifier - Classifies documents as acta/factura';
    RAISE NOTICE '  2️⃣ minutes_extractor - Extracts data from meeting minutes';
    RAISE NOTICE '  3️⃣ invoice_extractor - Extracts data from invoices';
    RAISE NOTICE '';
    RAISE NOTICE '🛠️ Helper Functions:';
    RAISE NOTICE '  📊 get_organization_document_stats() - Document statistics';
    RAISE NOTICE '  🔍 search_documents_by_content() - Vector similarity search';
    RAISE NOTICE '';
    
    IF NOT pgvector_enabled THEN
        RAISE WARNING 'pgvector extension is not enabled! Vector search will not work.';
    END IF;
    
    IF total_agents < 3 THEN
        RAISE WARNING 'Expected 3 global SaaS agents, found %', total_agents;
    END IF;
    
    RAISE NOTICE '✅ Document management system ready for use!';
    RAISE NOTICE 'Next steps: Implement UI and document processing logic';
    RAISE NOTICE '============================================================================';
END $$;