-- ===============================================================================
-- MIGRACIÓN: Extender tabla documents existente con Pipeline Progresivo
-- ===============================================================================
-- 
-- TABLA DOCUMENTS ACTUAL:
-- ✅ id, organization_id, community_id (estructura multi-tenant OK)
-- ✅ filename, file_path, file_size, file_hash (archivos OK)  
-- ⚠️ document_type (simple text - necesita classification table)
-- ⚠️ status (text genérico - necesita estados específicos)
-- ✅ created_at, processed_at (timestamps básicos OK)
--
-- ESTRATEGIA: Extender con campos pipeline SIN tocar campos existentes
-- ===============================================================================

-- ===============================================================================
-- PASO 1: EXTENDER TABLA DOCUMENTS CON PIPELINE PROGRESIVO
-- ===============================================================================

-- Renombrar campo genérico 'status' para evitar confusión
ALTER TABLE documents 
RENAME COLUMN status TO legacy_status;

-- Datos básicos extraídos (Nivel 1)
ALTER TABLE documents 
ADD COLUMN extracted_text TEXT;

ALTER TABLE documents 
ADD COLUMN text_length INTEGER DEFAULT 0;

ALTER TABLE documents 
ADD COLUMN page_count INTEGER DEFAULT 0;

-- Configuración del procesamiento
ALTER TABLE documents 
ADD COLUMN processing_level INTEGER DEFAULT 1 CHECK (processing_level IN (1, 2, 3, 4));

ALTER TABLE documents 
ADD COLUMN processing_config JSONB DEFAULT '{}';

-- Estados de procesamiento progresivo (reemplaza 'status' genérico)
ALTER TABLE documents 
ADD COLUMN extraction_status TEXT CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending';

ALTER TABLE documents 
ADD COLUMN extraction_error TEXT;

ALTER TABLE documents 
ADD COLUMN extraction_method TEXT CHECK (extraction_method IN ('pdf-parse', 'ocr', 'llm'));

ALTER TABLE documents 
ADD COLUMN extraction_completed_at TIMESTAMP WITH TIME ZONE;

-- Estados opcionales (nivel ≥2)
ALTER TABLE documents 
ADD COLUMN classification_status TEXT CHECK (classification_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));

ALTER TABLE documents 
ADD COLUMN classification_error TEXT;

ALTER TABLE documents 
ADD COLUMN classification_completed_at TIMESTAMP WITH TIME ZONE;

-- Estados opcionales (nivel ≥3)
ALTER TABLE documents 
ADD COLUMN metadata_status TEXT CHECK (metadata_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));

ALTER TABLE documents 
ADD COLUMN metadata_error TEXT;

ALTER TABLE documents 
ADD COLUMN metadata_completed_at TIMESTAMP WITH TIME ZONE;

-- Estados opcionales (nivel ≥4)
ALTER TABLE documents 
ADD COLUMN chunking_status TEXT CHECK (chunking_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));

ALTER TABLE documents 
ADD COLUMN chunking_error TEXT;

ALTER TABLE documents 
ADD COLUMN chunking_completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE documents 
ADD COLUMN chunks_count INTEGER DEFAULT 0;

-- Estadísticas y costos
ALTER TABLE documents 
ADD COLUMN total_processing_time_ms INTEGER DEFAULT 0;

ALTER TABLE documents 
ADD COLUMN total_tokens_used INTEGER DEFAULT 0;

ALTER TABLE documents 
ADD COLUMN estimated_cost_usd DECIMAL(10, 6) DEFAULT 0.000000;

-- Audit trail mejorado
ALTER TABLE documents 
ADD COLUMN processing_started_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE documents 
ADD COLUMN processing_completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE documents 
ADD COLUMN last_processed_by UUID REFERENCES auth.users(id);

-- User que subió el documento (si no existe)
ALTER TABLE documents 
ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);

-- Campos de archivo adicionales si necesarios
ALTER TABLE documents 
ADD COLUMN mime_type TEXT;

ALTER TABLE documents 
ADD COLUMN original_filename TEXT;

-- ===============================================================================
-- PASO 2: MIGRAR DATOS EXISTENTES
-- ===============================================================================

-- Migrar status genérico a extraction_status
UPDATE documents 
SET extraction_status = CASE 
    WHEN legacy_status = 'completed' THEN 'completed'
    WHEN legacy_status = 'processing' THEN 'processing' 
    WHEN legacy_status = 'failed' THEN 'failed'
    ELSE 'pending'
END
WHERE legacy_status IS NOT NULL;

-- Migrar processed_at a extraction_completed_at si estaba completed
UPDATE documents 
SET extraction_completed_at = processed_at
WHERE extraction_status = 'completed' AND processed_at IS NOT NULL;

-- Establecer text_length basado en file_size (aproximación)
UPDATE documents 
SET text_length = LEAST(file_size, file_size / 2)  -- Aproximación: texto ≈ 50% del PDF
WHERE file_size IS NOT NULL AND text_length = 0;

-- Establecer original_filename = filename si no existe
UPDATE documents 
SET original_filename = filename
WHERE original_filename IS NULL;

-- ===============================================================================
-- PASO 3: CREAR TABLA CLASSIFICATIONS
-- ===============================================================================

CREATE TABLE IF NOT EXISTS document_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Relación con documento
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Clasificación
  document_type TEXT NOT NULL CHECK (document_type IN ('acta', 'contrato', 'factura', 'comunicado', 'otros')),
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  classification_method TEXT NOT NULL CHECK (classification_method IN ('gemini', 'filename-fallback', 'manual', 'legacy-migration')),
  
  -- Metadatos de procesamiento
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0,
  input_sample_length INTEGER,
  filename_analyzed TEXT,
  raw_response TEXT,
  
  -- Historial
  is_current BOOLEAN DEFAULT TRUE,
  superseded_by UUID REFERENCES document_classifications(id),
  classified_by UUID REFERENCES auth.users(id)
);

-- ===============================================================================
-- PASO 4: CREAR TABLA METADATA
-- ===============================================================================

CREATE TABLE IF NOT EXISTS document_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Relación con documento  
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Metadatos estructurados (JSON flexible)
  metadata JSONB NOT NULL DEFAULT '{}',
  metadata_version TEXT DEFAULT '1.0',
  
  -- Calidad de extracción
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  extraction_method TEXT NOT NULL CHECK (extraction_method IN ('gemini', 'fallback', 'manual')),
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0,
  
  -- Validación
  validation_status TEXT CHECK (validation_status IN ('valid', 'warnings', 'invalid')) DEFAULT 'valid',
  validation_errors TEXT[],
  validation_warnings TEXT[],
  
  -- Campos optimizados para búsqueda (extraídos del JSON)
  document_type TEXT,            -- Extraído de metadata.doc_type
  document_date DATE,            -- Extraído de metadata.document_date
  topic_keywords TEXT[],         -- Extraído de metadata.topic_keywords
  
  -- Debug info
  input_sample_length INTEGER,
  filename_analyzed TEXT,
  raw_response TEXT,
  
  -- Historial
  is_current BOOLEAN DEFAULT TRUE,
  superseded_by UUID REFERENCES document_metadata(id),
  extracted_by UUID REFERENCES auth.users(id)
);

-- ===============================================================================
-- PASO 5: CREAR TABLA CHUNKS (Compatible con vector_embeddings existente)
-- ===============================================================================

CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Relación con documento
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Información del chunk
  chunk_number INTEGER NOT NULL CHECK (chunk_number >= 1),
  chunk_type TEXT NOT NULL CHECK (chunk_type IN ('content', 'header', 'table', 'list', 'conclusion', 'summary')),
  content TEXT NOT NULL CHECK (LENGTH(content) > 0),
  content_length INTEGER NOT NULL DEFAULT 0,
  
  -- Posición en documento
  start_position INTEGER CHECK (start_position >= 0),
  end_position INTEGER CHECK (end_position >= start_position),
  page_numbers INTEGER[],
  
  -- Metadatos específicos del chunk
  chunk_metadata JSONB DEFAULT '{}',
  
  -- Embeddings para RAG (compatible con tu vector_embeddings)
  embedding vector(1536),                      -- OpenAI ada-002 embeddings  
  embedding_model TEXT DEFAULT 'text-embedding-ada-002',
  embedding_created_at TIMESTAMP WITH TIME ZONE,
  
  -- Chunking method y calidad
  chunking_method TEXT NOT NULL CHECK (chunking_method IN ('semantic', 'fixed-size', 'paragraph', 'section')),
  confidence REAL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  quality_score REAL CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
  
  -- Processing info
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0,
  input_sample_length INTEGER,
  chunking_config JSONB DEFAULT '{}',
  
  -- Audit
  chunked_by UUID REFERENCES auth.users(id),
  
  -- Auto-calculate content_length
  CONSTRAINT positive_content_length CHECK (content_length = LENGTH(content))
);

-- ===============================================================================
-- PASO 6: ÍNDICES OPTIMIZADOS
-- ===============================================================================

-- Índices adicionales para documents (extienden los existentes)
CREATE INDEX IF NOT EXISTS idx_documents_processing_status 
ON documents(organization_id, processing_level, extraction_status, classification_status, metadata_status, chunking_status);

CREATE INDEX IF NOT EXISTS idx_documents_pending_processing 
ON documents(processing_level, extraction_status) 
WHERE extraction_status IN ('pending', 'processing');

-- Índices classifications
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_classifications_current 
ON document_classifications(document_id) 
WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_document_classifications_org_type 
ON document_classifications(organization_id, document_type, created_at DESC);

-- Índices metadata
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_metadata_current 
ON document_metadata(document_id) 
WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_document_metadata_org 
ON document_metadata(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_metadata_jsonb 
ON document_metadata USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_document_metadata_keywords 
ON document_metadata USING GIN (topic_keywords);

-- Índices chunks  
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_chunks_doc_number 
ON document_chunks(document_id, chunk_number);

CREATE INDEX IF NOT EXISTS idx_document_chunks_org 
ON document_chunks(organization_id, created_at DESC);

-- Índice embeddings (solo si no interfiere con vector_embeddings existente)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- ===============================================================================
-- PASO 7: RLS POLICIES (Compatible con tu schema existente)
-- ===============================================================================

-- Las policies para documents ya existen, solo añadimos para nuevas tablas

-- RLS Classifications
ALTER TABLE document_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_classifications_organization_isolation" ON document_classifications
  FOR ALL USING (organization_id = get_user_organization_id());

-- RLS Metadata  
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_metadata_organization_isolation" ON document_metadata
  FOR ALL USING (organization_id = get_user_organization_id());

-- RLS Chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_chunks_organization_isolation" ON document_chunks
  FOR ALL USING (organization_id = get_user_organization_id());

-- ===============================================================================
-- PASO 8: TRIGGERS ESENCIALES
-- ===============================================================================

-- Trigger: Auto-calcular content_length en chunks
CREATE OR REPLACE FUNCTION calculate_chunk_length()
RETURNS TRIGGER AS $$
BEGIN
  NEW.content_length := LENGTH(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_chunk_length_trigger
  BEFORE INSERT OR UPDATE ON document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_chunk_length();

-- Trigger: Actualizar chunks_count en documents
CREATE OR REPLACE FUNCTION update_document_chunks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE documents SET chunks_count = chunks_count + 1 WHERE id = NEW.document_id;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE documents SET chunks_count = chunks_count - 1 WHERE id = OLD.document_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_chunks_count_trigger
  AFTER INSERT OR DELETE ON document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_document_chunks_count();

-- Trigger: Gestión historial classifications
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

CREATE TRIGGER manage_current_classification_trigger
  AFTER INSERT ON document_classifications
  FOR EACH ROW
  EXECUTE FUNCTION manage_current_classification();

-- ===============================================================================
-- PASO 9: HELPER FUNCTIONS
-- ===============================================================================

-- Function: Get documents que necesitan procesamiento
CREATE OR REPLACE FUNCTION get_documents_needing_processing(target_level INTEGER DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  processing_level INTEGER,
  current_status TEXT,
  organization_id UUID
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
    END as current_status,
    d.organization_id
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

-- Function: Update processing status helper
CREATE OR REPLACE FUNCTION update_processing_status(
  doc_id UUID,
  step_name TEXT,
  new_status TEXT,
  error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  update_query TEXT;
BEGIN
  update_query := format(
    'UPDATE documents SET %I = $1, %I = $2, %I = CASE WHEN $1 = ''completed'' THEN NOW() ELSE %I END, updated_at = NOW() WHERE id = $3',
    step_name || '_status',
    step_name || '_error', 
    step_name || '_completed_at',
    step_name || '_completed_at'
  );
  
  EXECUTE update_query USING new_status, error_message, doc_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- PASO 10: MIGRAR DATOS DE document_type EXISTENTE
-- ===============================================================================

-- Si hay datos en document_type, migrarlos a document_classifications
INSERT INTO document_classifications (
  document_id,
  organization_id,
  document_type,
  confidence,
  classification_method,
  is_current,
  created_at
)
SELECT 
  d.id,
  d.organization_id,
  CASE 
    WHEN LOWER(d.document_type) LIKE '%acta%' THEN 'acta'
    WHEN LOWER(d.document_type) LIKE '%factura%' THEN 'factura' 
    WHEN LOWER(d.document_type) LIKE '%contrato%' THEN 'contrato'
    WHEN LOWER(d.document_type) LIKE '%comunicado%' THEN 'comunicado'
    ELSE 'otros'
  END,
  0.8,  -- Confidence moderada para migración automática
  'legacy-migration',
  TRUE,
  d.created_at
FROM documents d 
WHERE d.document_type IS NOT NULL 
  AND d.document_type != ''
  AND NOT EXISTS (
    SELECT 1 FROM document_classifications dc 
    WHERE dc.document_id = d.id AND dc.is_current = TRUE
  );

-- Actualizar classification_status para documentos migrados
UPDATE documents 
SET classification_status = 'completed',
    classification_completed_at = created_at
WHERE id IN (
  SELECT document_id FROM document_classifications 
  WHERE classification_method = 'legacy-migration'
)
AND classification_status IS NULL;

-- ===============================================================================
-- PASO 11: COMENTARIOS Y DOCUMENTACIÓN
-- ===============================================================================

COMMENT ON COLUMN documents.legacy_status IS 'Campo status original (deprecated - usar extraction_status)';
COMMENT ON COLUMN documents.processing_level IS 'Nivel pipeline: 1=storage, 2=+classification, 3=+metadata, 4=+chunking';
COMMENT ON COLUMN documents.extraction_status IS 'Estado extracción: pending→processing→completed/failed';
COMMENT ON COLUMN documents.classification_status IS 'Estado clasificación (nivel≥2): null→pending→completed/failed/skipped';

COMMENT ON TABLE document_classifications IS 'Pipeline Level 2: Clasificaciones de documentos con historial';
COMMENT ON TABLE document_metadata IS 'Pipeline Level 3: Metadatos estructurados JSON con campos optimizados';
COMMENT ON TABLE document_chunks IS 'Pipeline Level 4: Chunks con embeddings para RAG';

-- ===============================================================================
-- FIN MIGRACIÓN - SISTEMA PIPELINE PROGRESIVO SOBRE TABLA EXISTENTE
-- ===============================================================================