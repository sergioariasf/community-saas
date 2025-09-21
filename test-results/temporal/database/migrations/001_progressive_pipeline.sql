-- ===============================================================================
-- MIGRACIÓN: Progressive Pipeline Document System
-- ===============================================================================
-- 
-- DESCRIPCIÓN: Sistema completo de 4 tablas para pipeline progresivo de documentos
-- NIVELES: 1=storage, 2=+classification, 3=+metadata, 4=+chunking+RAG
-- 
-- ORDEN DE CREACIÓN:
-- 1. documents (tabla principal - siempre se crea)
-- 2. document_classifications (opcional, nivel ≥2)
-- 3. document_metadata (opcional, nivel ≥3) 
-- 4. document_chunks (opcional, nivel ≥4)
--
-- PREREQUISITOS:
-- - Extension pgvector debe estar habilitada
-- - Tablas communities, auth.users, user_roles deben existir
-- ===============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ===============================================================================
-- TABLA 1: documents (PRINCIPAL) - Sistema Pipeline Progresivo
-- ===============================================================================

CREATE TABLE IF NOT EXISTS documents (
  -- ===== CAMPOS PRIMARIOS =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- ===== INFORMACIÓN BÁSICA DEL ARCHIVO =====
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  original_size BIGINT NOT NULL,
  file_hash TEXT,
  
  -- ===== STORAGE =====
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'documents' NOT NULL,
  
  -- ===== RELACIONES =====
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ===== DATOS BÁSICOS EXTRAÍDOS (Nivel 1 - Siempre se llena) =====
  extracted_text TEXT,
  text_length INTEGER DEFAULT 0,
  page_count INTEGER DEFAULT 0,
  
  -- ===== ESTADOS DE PROCESAMIENTO PROGRESIVO =====
  extraction_status TEXT CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  extraction_error TEXT,
  extraction_method TEXT,
  extraction_completed_at TIMESTAMP WITH TIME ZONE,
  
  classification_status TEXT CHECK (classification_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  classification_error TEXT,
  classification_completed_at TIMESTAMP WITH TIME ZONE,
  
  metadata_status TEXT CHECK (metadata_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  metadata_error TEXT,
  metadata_completed_at TIMESTAMP WITH TIME ZONE,
  
  chunking_status TEXT CHECK (chunking_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  chunking_error TEXT,
  chunking_completed_at TIMESTAMP WITH TIME ZONE,
  chunks_count INTEGER DEFAULT 0,
  
  -- ===== CONFIGURACIÓN DEL PROCESAMIENTO =====
  processing_level INTEGER DEFAULT 1 CHECK (processing_level IN (1, 2, 3, 4)),
  processing_config JSONB DEFAULT '{}',
  
  -- ===== METADATA Y ESTADÍSTICAS =====
  total_processing_time_ms INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  estimated_cost_usd DECIMAL(10, 6) DEFAULT 0.000000,
  
  -- ===== AUDIT TRAIL =====
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  last_processed_by UUID REFERENCES auth.users(id),
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT valid_processing_level CHECK (processing_level BETWEEN 1 AND 4),
  CONSTRAINT filename_not_empty CHECK (LENGTH(TRIM(filename)) > 0),
  CONSTRAINT positive_file_size CHECK (original_size > 0),
  CONSTRAINT consistent_timestamps CHECK (
    (extraction_completed_at IS NULL OR extraction_completed_at >= created_at) AND
    (classification_completed_at IS NULL OR classification_completed_at >= created_at) AND  
    (metadata_completed_at IS NULL OR metadata_completed_at >= created_at) AND
    (chunking_completed_at IS NULL OR chunking_completed_at >= created_at)
  )
);

-- ===============================================================================
-- TABLA 2: document_classifications (OPCIONAL - Nivel ≥2)
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
  
  -- ===== RESPUESTA CRUDA (para debugging) =====
  raw_response TEXT,
  
  -- ===== AUDIT TRAIL =====
  classified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_current BOOLEAN DEFAULT TRUE,
  superseded_by UUID REFERENCES document_classifications(id) ON DELETE SET NULL,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT positive_confidence CHECK (confidence >= 0.0),
  CONSTRAINT high_confidence_with_good_method CHECK (
    (confidence >= 0.8 AND classification_method IN ('gemini', 'manual')) OR 
    confidence < 0.8
  )
);

-- ===============================================================================
-- TABLA 3: document_metadata (OPCIONAL - Nivel ≥3)
-- ===============================================================================

CREATE TABLE IF NOT EXISTS document_metadata (
  -- ===== CAMPOS PRIMARIOS =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- ===== RELACIÓN CON DOCUMENTO =====
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- ===== METADATOS ESTRUCTURADOS (JSON FLEXIBLE) =====
  metadata JSONB NOT NULL DEFAULT '{}',
  metadata_version TEXT DEFAULT '1.0',
  
  -- ===== EXTRACCIÓN Y CALIDAD =====
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  extraction_method TEXT NOT NULL CHECK (extraction_method IN ('gemini', 'fallback', 'manual')),
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  
  -- ===== VALIDACIÓN Y CALIDAD =====
  validation_status TEXT CHECK (validation_status IN ('valid', 'warnings', 'invalid')) DEFAULT 'valid',
  validation_errors TEXT[],
  validation_warnings TEXT[],
  
  -- ===== CAMPOS OPTIMIZADOS PARA BÚSQUEDA =====
  document_type TEXT,
  document_date DATE,
  topic_keywords TEXT[],
  
  -- ===== DATOS DE ENTRADA (para debugging) =====
  input_sample_length INTEGER,
  filename_analyzed TEXT,
  
  -- ===== RESPUESTA CRUDA (para debugging) =====
  raw_response TEXT,
  
  -- ===== AUDIT TRAIL =====
  extracted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_current BOOLEAN DEFAULT TRUE,
  superseded_by UUID REFERENCES document_metadata(id) ON DELETE SET NULL,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT positive_confidence CHECK (confidence >= 0.0),
  CONSTRAINT valid_metadata_structure CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT non_empty_metadata CHECK (metadata != '{}'::jsonb)
);

-- ===============================================================================
-- TABLA 4: document_chunks (OPCIONAL - Nivel ≥4)
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
  
  -- ===== POSICIÓN EN DOCUMENTO ORIGINAL =====
  start_position INTEGER CHECK (start_position >= 0),
  end_position INTEGER CHECK (end_position >= start_position),
  page_numbers INTEGER[],
  
  -- ===== METADATOS ESPECÍFICOS DEL CHUNK (JSON FLEXIBLE) =====
  chunk_metadata JSONB NOT NULL DEFAULT '{}',
  
  -- ===== EMBEDDINGS PARA RAG =====
  embedding vector(1536),
  embedding_model TEXT DEFAULT 'text-embedding-ada-002',
  embedding_created_at TIMESTAMP WITH TIME ZONE,
  
  -- ===== CHUNKING Y CALIDAD =====
  chunking_method TEXT NOT NULL CHECK (chunking_method IN ('semantic', 'fixed-size', 'paragraph', 'section')),
  confidence REAL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  quality_score REAL CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
  
  -- ===== PROCESSING METADATA =====
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  
  -- ===== DATOS DE ENTRADA (para debugging) =====
  input_sample_length INTEGER,
  chunking_config JSONB DEFAULT '{}',
  
  -- ===== AUDIT TRAIL =====
  chunked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT positive_chunk_number CHECK (chunk_number >= 1),
  CONSTRAINT positive_content_length CHECK (content_length = LENGTH(content)),
  CONSTRAINT valid_chunk_metadata CHECK (jsonb_typeof(chunk_metadata) = 'object'),
  CONSTRAINT consistent_positions CHECK (
    (start_position IS NULL AND end_position IS NULL) OR
    (start_position IS NOT NULL AND end_position IS NOT NULL AND end_position >= start_position)
  )
);

-- ===============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ===============================================================================

-- ===== ÍNDICES DOCUMENTS =====
CREATE INDEX IF NOT EXISTS idx_documents_community_created 
ON documents(community_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_user_created 
ON documents(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_processing_status 
ON documents(processing_level, extraction_status, classification_status, metadata_status, chunking_status);

CREATE INDEX IF NOT EXISTS idx_documents_filename 
ON documents(community_id, filename);

CREATE INDEX IF NOT EXISTS idx_documents_hash 
ON documents(file_hash) WHERE file_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_pending_processing 
ON documents(processing_level, extraction_status, classification_status, metadata_status, chunking_status)
WHERE extraction_status IN ('pending', 'processing') 
   OR classification_status IN ('pending', 'processing')
   OR metadata_status IN ('pending', 'processing') 
   OR chunking_status IN ('pending', 'processing');

-- ===== ÍNDICES CLASSIFICATIONS =====
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_classifications_current 
ON document_classifications(document_id) 
WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_document_classifications_type_created 
ON document_classifications(document_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_classifications_method_confidence 
ON document_classifications(classification_method, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_document_classifications_confidence 
ON document_classifications(confidence DESC, created_at DESC);

-- ===== ÍNDICES METADATA =====
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_metadata_current 
ON document_metadata(document_id) 
WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_document_metadata_jsonb 
ON document_metadata USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_document_metadata_topics 
ON document_metadata USING GIN (topic_keywords);

CREATE INDEX IF NOT EXISTS idx_document_metadata_type_date 
ON document_metadata(document_type, document_date DESC);

CREATE INDEX IF NOT EXISTS idx_document_metadata_date 
ON document_metadata(document_date DESC) 
WHERE document_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_document_metadata_method_confidence 
ON document_metadata(extraction_method, confidence DESC);

CREATE INDEX IF NOT EXISTS idx_document_metadata_validation 
ON document_metadata(validation_status, created_at DESC);

-- ===== ÍNDICES CHUNKS =====
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_chunks_doc_number 
ON document_chunks(document_id, chunk_number);

CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_ivf 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_document_chunks_type 
ON document_chunks(chunk_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_chunks_pages 
ON document_chunks USING GIN (page_numbers);

CREATE INDEX IF NOT EXISTS idx_document_chunks_method_quality 
ON document_chunks(chunking_method, quality_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_document_chunks_length 
ON document_chunks(content_length DESC);

CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_embedding 
ON document_chunks(document_id) 
INCLUDE (embedding, content, chunk_metadata);

-- ===============================================================================
-- TRIGGERS Y FUNCTIONS CRÍTICAS
-- ===============================================================================

-- ===== TRIGGER: Updated_at automático para documents =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===== TRIGGER: Gestión histórico classifications =====
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

-- ===== TRIGGER: Extracción campos optimizados metadata =====
CREATE OR REPLACE FUNCTION extract_metadata_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.document_type := NEW.metadata->>'doc_type';
  
  DECLARE
    date_str TEXT := NEW.metadata->>'document_date';
  BEGIN
    IF date_str IS NOT NULL AND LENGTH(date_str) = 8 AND date_str ~ '^\\d{8}$' THEN
      NEW.document_date := TO_DATE(date_str, 'YYYYMMDD');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NEW.document_date := NULL;
  END;
  
  NEW.topic_keywords := ARRAY(
    SELECT jsonb_array_elements_text(NEW.metadata->'topic_keywords')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS extract_metadata_fields_trigger ON document_metadata;
CREATE TRIGGER extract_metadata_fields_trigger
  BEFORE INSERT OR UPDATE ON document_metadata
  FOR EACH ROW
  EXECUTE FUNCTION extract_metadata_fields();

-- ===== TRIGGER: Gestión histórico metadata =====
CREATE OR REPLACE FUNCTION manage_current_metadata()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = TRUE THEN
    UPDATE document_metadata 
    SET is_current = FALSE, superseded_by = NEW.id
    WHERE document_id = NEW.document_id 
      AND id != NEW.id 
      AND is_current = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS manage_current_metadata_trigger ON document_metadata;
CREATE TRIGGER manage_current_metadata_trigger
  AFTER INSERT ON document_metadata
  FOR EACH ROW
  EXECUTE FUNCTION manage_current_metadata();

-- ===== TRIGGER: Calcular content_length chunks =====
CREATE OR REPLACE FUNCTION calculate_chunk_length()
RETURNS TRIGGER AS $$
BEGIN
  NEW.content_length := LENGTH(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_chunk_length_trigger ON document_chunks;
CREATE TRIGGER calculate_chunk_length_trigger
  BEFORE INSERT OR UPDATE ON document_chunks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_chunk_length();

-- ===== TRIGGER: Actualizar chunks_count en documents =====
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
-- RLS (ROW LEVEL SECURITY) PARA MULTI-TENANT
-- ===============================================================================

-- ===== RLS DOCUMENTS =====
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents from their communities" ON documents
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in their communities" ON documents
  FOR INSERT WITH CHECK (
    community_id IN (
      SELECT community_id FROM user_roles 
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can update documents with permissions" ON documents
  FOR UPDATE USING (
    user_id = auth.uid() OR
    community_id IN (
      SELECT community_id FROM user_roles 
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Only admins can delete documents" ON documents
  FOR DELETE USING (
    community_id IN (
      SELECT community_id FROM user_roles 
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ===== RLS CLASSIFICATIONS =====
ALTER TABLE document_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view classifications from their communities" ON document_classifications
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create classifications in their communities" ON document_classifications
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Users can update their own classifications" ON document_classifications
  FOR UPDATE USING (
    classified_by = auth.uid() OR
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Only admins can delete classifications" ON document_classifications
  FOR DELETE USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role = 'admin'
      )
    )
  );

-- ===== RLS METADATA =====
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metadata from their communities" ON document_metadata
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create metadata in their communities" ON document_metadata
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Users can update their own metadata" ON document_metadata
  FOR UPDATE USING (
    extracted_by = auth.uid() OR
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Only admins can delete metadata" ON document_metadata
  FOR DELETE USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role = 'admin'
      )
    )
  );

-- ===== RLS CHUNKS =====
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chunks from their communities" ON document_chunks
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create chunks in their communities" ON document_chunks
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Users can update their own chunks" ON document_chunks
  FOR UPDATE USING (
    chunked_by = auth.uid() OR
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Only admins can delete chunks" ON document_chunks
  FOR DELETE USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE community_id IN (
        SELECT community_id FROM user_roles 
        WHERE user_id = auth.uid()
        AND role = 'admin'
      )
    )
  );

-- ===============================================================================
-- HELPER FUNCTIONS CRÍTICAS
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

-- Function: Update processing status
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
    'UPDATE documents SET %I = $1, %I = $2, %I = CASE WHEN $1 = ''completed'' THEN NOW() ELSE %I END WHERE id = $3',
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
-- COMENTARIOS FINALES
-- ===============================================================================

COMMENT ON TABLE documents IS 'Tabla principal del sistema de documentos con pipeline progresivo. Niveles: 1=storage, 2=+classification, 3=+metadata, 4=+chunking';
COMMENT ON TABLE document_classifications IS 'Resultados de clasificación de documentos (nivel≥2). Mantiene historial con is_current para clasificación activa';
COMMENT ON TABLE document_metadata IS 'Metadatos estructurados de documentos (nivel≥3). JSON flexible con campos optimizados para búsqueda';
COMMENT ON TABLE document_chunks IS 'Chunks de documentos con embeddings para RAG (nivel≥4). Optimizado para similarity search con pgvector';

-- ===============================================================================
-- FIN DE MIGRACIÓN
-- ===============================================================================