-- ===============================================================================
-- MIGRACIÓN: Progressive Pipeline Compatible con Schema Existente
-- ===============================================================================
-- 
-- ANÁLISIS PREVIO: Ya tienes implementado:
-- ✅ documents table (con organization_id)
-- ✅ extracted_invoices 
-- ✅ extracted_minutes
-- ✅ vector_embeddings 
-- ✅ pgvector extension
-- 
-- ESTRATEGIA: Extender tablas existentes + crear solo las necesarias
-- CUIDADO: Usar organization_id (no community_id) según tu schema actual
-- ===============================================================================

-- ===============================================================================
-- PASO 1: ANALIZAR TABLA DOCUMENTS EXISTENTE
-- ===============================================================================
-- Primero verificamos la estructura actual de documents
-- (Ejecuta esto por separado para revisar antes de continuar)

/*
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'documents' AND table_schema = 'public'
ORDER BY ordinal_position;
*/

-- ===============================================================================
-- PASO 2: EXTENDER TABLA DOCUMENTS CON CAMPOS PIPELINE PROGRESIVO
-- ===============================================================================
-- Solo añadimos campos que no existan

-- Campos de estado de procesamiento progresivo
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS processing_level INTEGER DEFAULT 1 CHECK (processing_level IN (1, 2, 3, 4));

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS extraction_status TEXT CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending';

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS extraction_error TEXT;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS extraction_method TEXT;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS extraction_completed_at TIMESTAMP WITH TIME ZONE;

-- Estados opcionales (nivel ≥2)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS classification_status TEXT CHECK (classification_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS classification_error TEXT;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS classification_completed_at TIMESTAMP WITH TIME ZONE;

-- Estados opcionales (nivel ≥3)  
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS metadata_status TEXT CHECK (metadata_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS metadata_error TEXT;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS metadata_completed_at TIMESTAMP WITH TIME ZONE;

-- Estados opcionales (nivel ≥4)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS chunking_status TEXT CHECK (chunking_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS chunking_error TEXT;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS chunking_completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS chunks_count INTEGER DEFAULT 0;

-- Configuración y estadísticas
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS processing_config JSONB DEFAULT '{}';

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS total_processing_time_ms INTEGER DEFAULT 0;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS total_tokens_used INTEGER DEFAULT 0;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS estimated_cost_usd DECIMAL(10, 6) DEFAULT 0.000000;

-- Audit trail
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS last_processed_by UUID REFERENCES auth.users(id);

-- ===============================================================================
-- PASO 3: CREAR TABLA CLASSIFICATIONS (Nueva - usando organization_id)
-- ===============================================================================

CREATE TABLE IF NOT EXISTS document_classifications (
  -- ===== CAMPOS PRIMARIOS =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- ===== RELACIÓN CON DOCUMENTO =====
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- ===== RESULTADO DE CLASIFICACIÓN =====
  document_type TEXT NOT NULL CHECK (document_type IN ('acta', 'contrato', 'factura', 'comunicado')),
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  
  -- ===== MÉTODO Y METADATOS =====
  classification_method TEXT NOT NULL CHECK (classification_method IN ('gemini', 'filename-fallback', 'manual', 'default')),
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  
  -- ===== DATOS DE ENTRADA (para debugging) =====
  input_sample_length INTEGER,
  filename_analyzed TEXT,
  raw_response TEXT,
  
  -- ===== AUDIT TRAIL =====
  classified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_current BOOLEAN DEFAULT TRUE,
  superseded_by UUID REFERENCES document_classifications(id) ON DELETE SET NULL,
  
  -- ===== ORGANIZACIÓN (Compatible con tu schema) =====
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT positive_confidence CHECK (confidence >= 0.0)
);

-- ===============================================================================
-- PASO 4: CREAR TABLA METADATA (Nueva - usando organization_id)
-- ===============================================================================

CREATE TABLE IF NOT EXISTS document_metadata (
  -- ===== CAMPOS PRIMARIOS =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- ===== RELACIÓN CON DOCUMENTO =====
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- ===== METADATOS ESTRUCTURADOS =====
  metadata JSONB NOT NULL DEFAULT '{}',
  metadata_version TEXT DEFAULT '1.0',
  
  -- ===== EXTRACCIÓN Y CALIDAD =====
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  extraction_method TEXT NOT NULL CHECK (extraction_method IN ('gemini', 'fallback', 'manual')),
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  
  -- ===== VALIDACIÓN =====
  validation_status TEXT CHECK (validation_status IN ('valid', 'warnings', 'invalid')) DEFAULT 'valid',
  validation_errors TEXT[],
  validation_warnings TEXT[],
  
  -- ===== CAMPOS OPTIMIZADOS =====
  document_type TEXT,
  document_date DATE,
  topic_keywords TEXT[],
  
  -- ===== DEBUGGING =====
  input_sample_length INTEGER,
  filename_analyzed TEXT,
  raw_response TEXT,
  
  -- ===== AUDIT TRAIL =====
  extracted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_current BOOLEAN DEFAULT TRUE,
  superseded_by UUID REFERENCES document_metadata(id) ON DELETE SET NULL,
  
  -- ===== ORGANIZACIÓN (Compatible con tu schema) =====
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT valid_metadata_structure CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT non_empty_metadata CHECK (metadata != '{}'::jsonb)
);

-- ===============================================================================
-- PASO 5: CREAR TABLA CHUNKS (Nueva - usando organization_id)
-- ===============================================================================

CREATE TABLE IF NOT EXISTS document_chunks (
  -- ===== CAMPOS PRIMARIOS =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- ===== RELACIÓN CON DOCUMENTO =====
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- ===== INFORMACIÓN DEL CHUNK =====
  chunk_number INTEGER NOT NULL CHECK (chunk_number >= 1),
  chunk_type TEXT NOT NULL CHECK (chunk_type IN ('content', 'header', 'table', 'list', 'conclusion')),
  content TEXT NOT NULL CHECK (LENGTH(content) > 0),
  content_length INTEGER NOT NULL CHECK (content_length > 0),
  
  -- ===== POSICIÓN EN DOCUMENTO =====
  start_position INTEGER CHECK (start_position >= 0),
  end_position INTEGER CHECK (end_position >= start_position),
  page_numbers INTEGER[],
  
  -- ===== METADATOS DEL CHUNK =====
  chunk_metadata JSONB NOT NULL DEFAULT '{}',
  
  -- ===== EMBEDDINGS (Compatible con tu vector_embeddings existente) =====
  embedding vector(1536),
  embedding_model TEXT DEFAULT 'text-embedding-ada-002',
  embedding_created_at TIMESTAMP WITH TIME ZONE,
  
  -- ===== CHUNKING =====
  chunking_method TEXT NOT NULL CHECK (chunking_method IN ('semantic', 'fixed-size', 'paragraph', 'section')),
  confidence REAL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  quality_score REAL CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
  
  -- ===== PROCESSING =====
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  input_sample_length INTEGER,
  chunking_config JSONB DEFAULT '{}',
  
  -- ===== AUDIT TRAIL =====
  chunked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ===== ORGANIZACIÓN (Compatible con tu schema) =====
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT positive_content_length CHECK (content_length = LENGTH(content))
);

-- ===============================================================================
-- PASO 6: ÍNDICES PARA LAS NUEVAS TABLAS
-- ===============================================================================

-- ===== ÍNDICES CLASSIFICATIONS =====
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_classifications_current 
ON document_classifications(document_id) 
WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_document_classifications_org 
ON document_classifications(organization_id, created_at DESC);

-- ===== ÍNDICES METADATA =====
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_metadata_current 
ON document_metadata(document_id) 
WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_document_metadata_org 
ON document_metadata(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_metadata_jsonb 
ON document_metadata USING GIN (metadata);

-- ===== ÍNDICES CHUNKS =====
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_chunks_doc_number 
ON document_chunks(document_id, chunk_number);

CREATE INDEX IF NOT EXISTS idx_document_chunks_org 
ON document_chunks(organization_id, created_at DESC);

-- Solo crear índice embedding si no existe uno similar en vector_embeddings
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- ===============================================================================
-- PASO 7: RLS COMPATIBLE CON TU SCHEMA EXISTENTE
-- ===============================================================================

-- ===== RLS CLASSIFICATIONS =====
ALTER TABLE document_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_classifications_organization_isolation" ON document_classifications
  FOR ALL USING (organization_id = get_user_organization_id());

-- ===== RLS METADATA =====
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_metadata_organization_isolation" ON document_metadata
  FOR ALL USING (organization_id = get_user_organization_id());

-- ===== RLS CHUNKS =====
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_chunks_organization_isolation" ON document_chunks
  FOR ALL USING (organization_id = get_user_organization_id());

-- ===============================================================================
-- PASO 8: TRIGGERS BÁSICOS
-- ===============================================================================

-- Trigger para gestionar is_current en classifications
CREATE OR REPLACE FUNCTION manage_current_classification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = TRUE THEN
    UPDATE document_classifications 
    SET is_current = FALSE, superseded_by = NEW.id
    WHERE document_id = NEW.document_id 
      AND id != NEW.id 
      AND is_current = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manage_current_classification_trigger ON document_classifications;
CREATE TRIGGER manage_current_classification_trigger
  AFTER INSERT ON document_classifications
  FOR EACH ROW
  EXECUTE FUNCTION manage_current_classification();

-- Trigger para chunks_count
CREATE OR REPLACE FUNCTION update_document_chunks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE documents 
    SET chunks_count = chunks_count + 1
    WHERE id = NEW.document_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE documents 
    SET chunks_count = chunks_count - 1
    WHERE id = OLD.document_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_document_chunks_count_trigger ON document_chunks;
CREATE TRIGGER update_document_chunks_count_trigger
  AFTER INSERT OR DELETE ON document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_document_chunks_count();

-- ===============================================================================
-- PASO 9: HELPER FUNCTIONS
-- ===============================================================================

-- Function: Get documents que necesitan procesamiento
CREATE OR REPLACE FUNCTION get_documents_needing_processing(target_level INTEGER DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  processing_level INTEGER,
  current_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.filename,
    d.processing_level,
    CASE 
      WHEN d.extraction_status != 'completed' THEN 'extraction_needed'
      WHEN d.processing_level >= 2 AND (d.classification_status IS NULL OR d.classification_status != 'completed') THEN 'classification_needed'
      WHEN d.processing_level >= 3 AND (d.metadata_status IS NULL OR d.metadata_status != 'completed') THEN 'metadata_needed'
      WHEN d.processing_level >= 4 AND (d.chunking_status IS NULL OR d.chunking_status != 'completed') THEN 'chunking_needed'
      ELSE 'completed'
    END as current_status
  FROM documents d
  WHERE 
    (target_level IS NULL OR d.processing_level = target_level)
    AND (
      d.extraction_status != 'completed' OR
      (d.processing_level >= 2 AND (d.classification_status IS NULL OR d.classification_status != 'completed')) OR
      (d.processing_level >= 3 AND (d.metadata_status IS NULL OR d.metadata_status != 'completed')) OR
      (d.processing_level >= 4 AND (d.chunking_status IS NULL OR d.chunking_status != 'completed'))
    );
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- PASO 10: COMENTARIOS
-- ===============================================================================

COMMENT ON TABLE document_classifications IS 'Pipeline Level 2: Document classification results - Compatible with existing organization-based schema';
COMMENT ON TABLE document_metadata IS 'Pipeline Level 3: Structured document metadata - Compatible with existing organization-based schema'; 
COMMENT ON TABLE document_chunks IS 'Pipeline Level 4: Document chunks for RAG - Compatible with existing organization-based schema';

-- ===============================================================================
-- FIN DE MIGRACIÓN COMPATIBLE
-- ===============================================================================