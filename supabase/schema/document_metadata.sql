-- ===============================================================================
-- TABLA 3: document_metadata (OPCIONAL - Nivel ≥3)
-- ===============================================================================
-- 
-- RESPONSABILIDAD: Almacena metadatos estructurados extraídos de documentos
-- Solo se usa si cliente configura processing_level >= 3
-- 
-- RELACIONES: N:1 con documents (un documento puede tener múltiples versiones de metadatos)
-- DEPENDENCIAS: Requiere documents.metadata_status = 'completed'

CREATE TABLE IF NOT EXISTS document_metadata (
  -- ===== CAMPOS PRIMARIOS =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- ===== RELACIÓN CON DOCUMENTO =====
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- ===== METADATOS ESTRUCTURADOS (JSON FLEXIBLE) =====
  metadata JSONB NOT NULL DEFAULT '{}',    -- Toda la estructura del contrato aquí
  metadata_version TEXT DEFAULT '1.0',     -- Versión del schema de metadatos
  
  -- ===== EXTRACCIÓN Y CALIDAD =====
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  extraction_method TEXT NOT NULL CHECK (extraction_method IN ('gemini', 'fallback', 'manual')),
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  
  -- ===== VALIDACIÓN Y CALIDAD =====
  validation_status TEXT CHECK (validation_status IN ('valid', 'warnings', 'invalid')) DEFAULT 'valid',
  validation_errors TEXT[],                -- Array de errores de validación
  validation_warnings TEXT[],              -- Array de warnings de validación
  
  -- ===== CAMPOS OPTIMIZADOS PARA BÚSQUEDA =====
  -- Estos campos se extraen del JSON para índices rápidos
  document_type TEXT,                      -- Extraído de metadata.doc_type
  document_date DATE,                      -- Extraído de metadata.document_date (formato YYYY-MM-DD)
  topic_keywords TEXT[],                   -- Array de keywords para búsqueda
  
  -- ===== DATOS DE ENTRADA (para debugging) =====
  input_sample_length INTEGER,            -- Longitud del texto analizado
  filename_analyzed TEXT,                  -- Filename usado para extracción
  
  -- ===== RESPUESTA CRUDA (para debugging) =====
  raw_response TEXT,                       -- Respuesta cruda de Gemini (si aplica)
  
  -- ===== AUDIT TRAIL =====
  extracted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_current BOOLEAN DEFAULT TRUE,         -- Marca los metadatos actuales (para historial)
  superseded_by UUID REFERENCES document_metadata(id) ON DELETE SET NULL,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT positive_confidence CHECK (confidence >= 0.0),
  CONSTRAINT valid_metadata_structure CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT non_empty_metadata CHECK (metadata != '{}'::jsonb)
);

-- ===============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ===============================================================================

-- Índice principal: documento + metadatos actuales
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_metadata_current 
ON document_metadata(document_id) 
WHERE is_current = TRUE;

-- Índices GIN para búsquedas en JSONB
CREATE INDEX IF NOT EXISTS idx_document_metadata_jsonb 
ON document_metadata USING GIN (metadata);

-- Índice para búsquedas por topic keywords
CREATE INDEX IF NOT EXISTS idx_document_metadata_topics 
ON document_metadata USING GIN (topic_keywords);

-- Índice por tipo de documento
CREATE INDEX IF NOT EXISTS idx_document_metadata_type_date 
ON document_metadata(document_type, document_date DESC);

-- Índice por fecha de documento (para filtros temporales)
CREATE INDEX IF NOT EXISTS idx_document_metadata_date 
ON document_metadata(document_date DESC) 
WHERE document_date IS NOT NULL;

-- Índice por método de extracción (para análisis performance)
CREATE INDEX IF NOT EXISTS idx_document_metadata_method_confidence 
ON document_metadata(extraction_method, confidence DESC);

-- Índice por estado de validación
CREATE INDEX IF NOT EXISTS idx_document_metadata_validation 
ON document_metadata(validation_status, created_at DESC);

-- ===============================================================================
-- TRIGGERS PARA GESTIÓN DE CAMPOS OPTIMIZADOS
-- ===============================================================================

-- Trigger: Extraer campos optimizados del JSON cuando se inserta/actualiza
CREATE OR REPLACE FUNCTION extract_metadata_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Extraer document_type
  NEW.document_type := NEW.metadata->>'doc_type';
  
  -- Extraer y convertir document_date (formato YYYYMMDD -> YYYY-MM-DD)
  DECLARE
    date_str TEXT := NEW.metadata->>'document_date';
  BEGIN
    IF date_str IS NOT NULL AND LENGTH(date_str) = 8 AND date_str ~ '^\d{8}$' THEN
      NEW.document_date := TO_DATE(date_str, 'YYYYMMDD');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NEW.document_date := NULL;
  END;
  
  -- Extraer topic_keywords (convertir JSON array a TEXT array)
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

-- Trigger: Gestión de histórico (similar a classifications)
CREATE OR REPLACE FUNCTION manage_current_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Si los nuevos metadatos se marcan como actuales, desmarcar anteriores
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

-- ===============================================================================
-- RLS (ROW LEVEL SECURITY) PARA MULTI-TENANT
-- ===============================================================================

ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see metadata from their community documents
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

-- Policy: Users can create metadata for their community documents
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

-- Policy: Users can update metadata they extracted
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

-- Policy: Only admins can delete metadata
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

-- ===============================================================================
-- FUNCTIONS HELPER PARA METADATOS
-- ===============================================================================

-- Function: Get current metadata for document
CREATE OR REPLACE FUNCTION get_current_metadata(doc_id UUID)
RETURNS TABLE (
  id UUID,
  metadata JSONB,
  confidence REAL,
  extraction_method TEXT,
  validation_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.id,
    dm.metadata,
    dm.confidence,
    dm.extraction_method,
    dm.validation_status,
    dm.created_at
  FROM document_metadata dm
  WHERE dm.document_id = doc_id 
    AND dm.is_current = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Search documents by metadata fields
CREATE OR REPLACE FUNCTION search_documents_by_metadata(
  community_uuid UUID,
  doc_type TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  keywords TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
) RETURNS TABLE (
  document_id UUID,
  filename TEXT,
  document_type TEXT,
  document_date DATE,
  topic_keywords TEXT[],
  confidence REAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as document_id,
    d.filename,
    dm.document_type,
    dm.document_date,
    dm.topic_keywords,
    dm.confidence,
    dm.created_at
  FROM documents d
  JOIN document_metadata dm ON d.id = dm.document_id
  WHERE d.community_id = community_uuid
    AND dm.is_current = TRUE
    AND (doc_type IS NULL OR dm.document_type = doc_type)
    AND (date_from IS NULL OR dm.document_date >= date_from)
    AND (date_to IS NULL OR dm.document_date <= date_to)
    AND (keywords IS NULL OR dm.topic_keywords && keywords)
  ORDER BY dm.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Create or update metadata
CREATE OR REPLACE FUNCTION upsert_document_metadata(
  doc_id UUID,
  metadata_json JSONB,
  conf REAL,
  method TEXT,
  proc_time_ms INTEGER DEFAULT NULL,
  tokens INTEGER DEFAULT 0,
  sample_len INTEGER DEFAULT NULL,
  filename TEXT DEFAULT NULL,
  raw_resp TEXT DEFAULT NULL,
  user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  metadata_id UUID;
BEGIN
  INSERT INTO document_metadata (
    document_id,
    metadata,
    confidence,
    extraction_method,
    processing_time_ms,
    tokens_used,
    input_sample_length,
    filename_analyzed,
    raw_response,
    extracted_by
  ) VALUES (
    doc_id,
    metadata_json,
    conf,
    method,
    proc_time_ms,
    tokens,
    sample_len,
    filename,
    raw_resp,
    COALESCE(user_id, auth.uid())
  ) RETURNING id INTO metadata_id;
  
  RETURN metadata_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get metadata statistics by community
CREATE OR REPLACE FUNCTION get_metadata_stats(community_uuid UUID)
RETURNS TABLE (
  document_type TEXT,
  total_count BIGINT,
  avg_confidence REAL,
  common_topics TEXT[],
  date_range_start DATE,
  date_range_end DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.document_type,
    COUNT(*) as total_count,
    AVG(dm.confidence) as avg_confidence,
    (
      SELECT ARRAY_AGG(DISTINCT keyword) 
      FROM (
        SELECT UNNEST(dm2.topic_keywords) as keyword
        FROM document_metadata dm2
        JOIN documents d2 ON dm2.document_id = d2.id
        WHERE d2.community_id = community_uuid 
          AND dm2.document_type = dm.document_type
          AND dm2.is_current = TRUE
      ) keywords_unnested
      LIMIT 10
    ) as common_topics,
    MIN(dm.document_date) as date_range_start,
    MAX(dm.document_date) as date_range_end
  FROM document_metadata dm
  JOIN documents d ON dm.document_id = d.id
  WHERE d.community_id = community_uuid
    AND dm.is_current = TRUE
  GROUP BY dm.document_type
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- VIEWS PARA CONSULTAS COMUNES
-- ===============================================================================

-- View: Documents with their current metadata
CREATE OR REPLACE VIEW documents_with_metadata AS
SELECT 
  d.id,
  d.filename,
  d.community_id,
  d.created_at,
  d.processing_level,
  d.metadata_status,
  dm.metadata,
  dm.document_type,
  dm.document_date,
  dm.topic_keywords,
  dm.confidence as metadata_confidence,
  dm.extraction_method,
  dm.validation_status,
  dm.created_at as metadata_created_at
FROM documents d
LEFT JOIN document_metadata dm ON d.id = dm.document_id AND dm.is_current = TRUE;

-- ===============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ===============================================================================

COMMENT ON TABLE document_metadata IS 'Metadatos estructurados de documentos (nivel≥3). JSON flexible con campos optimizados para búsqueda';

COMMENT ON COLUMN document_metadata.metadata IS 'Metadatos estructurados en JSON según contratos por tipo de documento';
COMMENT ON COLUMN document_metadata.confidence IS 'Confianza 0.0-1.0 en la extracción de metadatos';
COMMENT ON COLUMN document_metadata.extraction_method IS 'Método usado: gemini, fallback, manual';
COMMENT ON COLUMN document_metadata.document_type IS 'Campo optimizado extraído de metadata.doc_type';
COMMENT ON COLUMN document_metadata.document_date IS 'Campo optimizado extraído de metadata.document_date';
COMMENT ON COLUMN document_metadata.topic_keywords IS 'Array optimizado extraído de metadata.topic_keywords';
COMMENT ON COLUMN document_metadata.is_current IS 'TRUE para los metadatos actuales del documento';

COMMENT ON FUNCTION get_current_metadata(UUID) IS 'Obtiene los metadatos actuales de un documento';
COMMENT ON FUNCTION search_documents_by_metadata IS 'Búsqueda avanzada por campos de metadatos';
COMMENT ON FUNCTION upsert_document_metadata IS 'Crea nuevos metadatos y marca anteriores como no actuales';
COMMENT ON FUNCTION get_metadata_stats(UUID) IS 'Estadísticas de metadatos por comunidad';

COMMENT ON VIEW documents_with_metadata IS 'Vista unificada de documentos con sus metadatos actuales';