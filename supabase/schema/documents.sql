-- ===============================================================================
-- TABLA 1: documents (PRINCIPAL) - Sistema Pipeline Progresivo
-- ===============================================================================
-- 
-- RESPONSABILIDAD: Tabla principal que SIEMPRE se crea (Nivel 1)
-- Contiene información básica del documento + estado de procesamiento
-- 
-- NIVELES PROGRESIVOS:
-- - Nivel 1: Solo upload + storage (siempre)
-- - Nivel 2+: Estados de processing (classification_status, etc.)
-- 
-- DEPENDENCIAS: Tabla base sin dependencias
-- RELACIONES: 1:1 con document_classifications, document_metadata, 1:N con document_chunks

CREATE TABLE IF NOT EXISTS documents (
  -- ===== CAMPOS PRIMARIOS =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- ===== INFORMACIÓN BÁSICA DEL ARCHIVO =====
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,          -- Nombre original del usuario
  mime_type TEXT NOT NULL,
  original_size BIGINT NOT NULL,            -- Tamaño en bytes
  file_hash TEXT,                           -- MD5/SHA256 para detección duplicados
  
  -- ===== STORAGE =====
  storage_path TEXT NOT NULL,               -- Ruta en Supabase Storage
  storage_bucket TEXT DEFAULT 'documents' NOT NULL,
  
  -- ===== RELACIONES =====
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ===== DATOS BÁSICOS EXTRAÍDOS (Nivel 1 - Siempre se llena) =====
  extracted_text TEXT,                      -- Resultado de text extraction
  text_length INTEGER DEFAULT 0,            -- Longitud del texto extraído
  page_count INTEGER DEFAULT 0,             -- Número de páginas detectadas
  
  -- ===== ESTADOS DE PROCESAMIENTO PROGRESIVO =====
  -- Cada estado puede ser: null (no aplica), 'pending', 'processing', 'completed', 'failed'
  
  extraction_status TEXT CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  extraction_error TEXT,                    -- Error específico si falla
  extraction_method TEXT,                   -- 'pdf-parse', 'ocr', 'llm'
  extraction_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Estados opcionales (solo si cliente configura nivel ≥2)
  classification_status TEXT CHECK (classification_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  classification_error TEXT,
  classification_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Estados opcionales (solo si cliente configura nivel ≥3)  
  metadata_status TEXT CHECK (metadata_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  metadata_error TEXT,
  metadata_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Estados opcionales (solo si cliente configura nivel ≥4)
  chunking_status TEXT CHECK (chunking_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  chunking_error TEXT,
  chunking_completed_at TIMESTAMP WITH TIME ZONE,
  chunks_count INTEGER DEFAULT 0,           -- Número de chunks generados
  
  -- ===== CONFIGURACIÓN DEL PROCESAMIENTO =====
  processing_level INTEGER DEFAULT 1 CHECK (processing_level IN (1, 2, 3, 4)),
  processing_config JSONB DEFAULT '{}',     -- Configuración específica del pipeline
  
  -- ===== METADATA Y ESTADÍSTICAS =====
  total_processing_time_ms INTEGER DEFAULT 0, -- Tiempo total de procesamiento
  total_tokens_used INTEGER DEFAULT 0,      -- Tokens Gemini usados
  estimated_cost_usd DECIMAL(10, 6) DEFAULT 0.000000, -- Coste estimado
  
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
-- ÍNDICES PARA RENDIMIENTO
-- ===============================================================================

-- Índice principal para búsquedas por comunidad (más común)
CREATE INDEX IF NOT EXISTS idx_documents_community_created 
ON documents(community_id, created_at DESC);

-- Índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_documents_user_created 
ON documents(user_id, created_at DESC);

-- Índice para estado de procesamiento (para monitoreo)
CREATE INDEX IF NOT EXISTS idx_documents_processing_status 
ON documents(processing_level, extraction_status, classification_status, metadata_status, chunking_status);

-- Índice para búsquedas por filename (para duplicados)
CREATE INDEX IF NOT EXISTS idx_documents_filename 
ON documents(community_id, filename);

-- Índice para hash de archivo (detección duplicados)
CREATE INDEX IF NOT EXISTS idx_documents_hash 
ON documents(file_hash) WHERE file_hash IS NOT NULL;

-- Índice para documentos pendientes de procesamiento
CREATE INDEX IF NOT EXISTS idx_documents_pending_processing 
ON documents(processing_level, extraction_status, classification_status, metadata_status, chunking_status)
WHERE extraction_status IN ('pending', 'processing') 
   OR classification_status IN ('pending', 'processing')
   OR metadata_status IN ('pending', 'processing') 
   OR chunking_status IN ('pending', 'processing');

-- ===============================================================================
-- TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- ===============================================================================

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

-- ===============================================================================
-- RLS (ROW LEVEL SECURITY) PARA MULTI-TENANT
-- ===============================================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see documents from their communities
CREATE POLICY "Users can view documents from their communities" ON documents
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert documents into their communities
CREATE POLICY "Users can create documents in their communities" ON documents
  FOR INSERT WITH CHECK (
    community_id IN (
      SELECT community_id FROM user_roles 
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')  -- Solo admin/manager pueden subir documentos
    )
  );

-- Policy: Users can update documents they uploaded or if they have permissions
CREATE POLICY "Users can update documents with permissions" ON documents
  FOR UPDATE USING (
    user_id = auth.uid() OR -- Own documents
    community_id IN (
      SELECT community_id FROM user_roles 
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Policy: Only admins can delete documents
CREATE POLICY "Only admins can delete documents" ON documents
  FOR DELETE USING (
    community_id IN (
      SELECT community_id FROM user_roles 
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ===============================================================================
-- FUNCTIONS HELPER PARA ESTADO
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
  -- Construir query dinámico basado en el step
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
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ===============================================================================

COMMENT ON TABLE documents IS 'Tabla principal del sistema de documentos con pipeline progresivo. Niveles: 1=storage, 2=+classification, 3=+metadata, 4=+chunking';

COMMENT ON COLUMN documents.processing_level IS 'Nivel de procesamiento configurado: 1=storage, 2=+classification, 3=+metadata, 4=+chunking+RAG';
COMMENT ON COLUMN documents.extraction_status IS 'Estado extracción texto: pending→processing→completed/failed';
COMMENT ON COLUMN documents.classification_status IS 'Estado clasificación (nivel≥2): null/pending→processing→completed/failed/skipped';
COMMENT ON COLUMN documents.metadata_status IS 'Estado metadatos (nivel≥3): null/pending→processing→completed/failed/skipped';
COMMENT ON COLUMN documents.chunking_status IS 'Estado chunking (nivel≥4): null/pending→processing→completed/failed/skipped';

COMMENT ON FUNCTION get_documents_needing_processing(INTEGER) IS 'Obtiene documentos que necesitan procesamiento según su nivel configurado';
COMMENT ON FUNCTION update_processing_status(UUID, TEXT, TEXT, TEXT) IS 'Actualiza estado de procesamiento de un paso específico';