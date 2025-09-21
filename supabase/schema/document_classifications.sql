-- ===============================================================================
-- TABLA 2: document_classifications (OPCIONAL - Nivel ≥2)
-- ===============================================================================
-- 
-- RESPONSABILIDAD: Almacena resultados de clasificación de documentos
-- Solo se usa si cliente configura processing_level >= 2
-- 
-- RELACIONES: N:1 con documents (un documento puede tener múltiples intentos)
-- DEPENDENCIAS: Requiere documents.classification_status = 'completed'

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
  input_sample_length INTEGER,              -- Longitud del texto analizado
  filename_analyzed TEXT,                   -- Filename usado para clasificación
  
  -- ===== RESPUESTA CRUDA (para debugging) =====
  raw_response TEXT,                        -- Respuesta cruda de Gemini (si aplica)
  
  -- ===== AUDIT TRAIL =====
  classified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_current BOOLEAN DEFAULT TRUE,          -- Marca la clasificación actual (para historial)
  superseded_by UUID REFERENCES document_classifications(id) ON DELETE SET NULL,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT positive_confidence CHECK (confidence >= 0.0),
  CONSTRAINT high_confidence_with_good_method CHECK (
    (confidence >= 0.8 AND classification_method IN ('gemini', 'manual')) OR 
    confidence < 0.8
  )
);

-- ===============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ===============================================================================

-- Índice principal: documento + clasificación actual
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_classifications_current 
ON document_classifications(document_id) 
WHERE is_current = TRUE;

-- Índice por tipo de documento (para estadísticas)
CREATE INDEX IF NOT EXISTS idx_document_classifications_type_created 
ON document_classifications(document_type, created_at DESC);

-- Índice por método de clasificación (para análisis performance)
CREATE INDEX IF NOT EXISTS idx_document_classifications_method_confidence 
ON document_classifications(classification_method, confidence DESC);

-- Índice por confianza (para filtros de calidad)
CREATE INDEX IF NOT EXISTS idx_document_classifications_confidence 
ON document_classifications(confidence DESC, created_at DESC);

-- ===============================================================================
-- TRIGGERS PARA GESTIÓN DE HISTÓRICO
-- ===============================================================================

-- Trigger: Cuando se inserta nueva clasificación, marcar anteriores como no actuales
CREATE OR REPLACE FUNCTION manage_current_classification()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la nueva clasificación se marca como actual, desmarcar las anteriores
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

-- ===============================================================================
-- RLS (ROW LEVEL SECURITY) PARA MULTI-TENANT
-- ===============================================================================

ALTER TABLE document_classifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see classifications from their community documents
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

-- Policy: Users can create classifications for their community documents
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

-- Policy: Users can update classifications they created
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

-- Policy: Only admins can delete classifications
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

-- ===============================================================================
-- FUNCTIONS HELPER PARA CLASIFICACIONES
-- ===============================================================================

-- Function: Get current classification for document
CREATE OR REPLACE FUNCTION get_current_classification(doc_id UUID)
RETURNS TABLE (
  id UUID,
  document_type TEXT,
  confidence REAL,
  classification_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.document_type,
    dc.confidence,
    dc.classification_method,
    dc.created_at
  FROM document_classifications dc
  WHERE dc.document_id = doc_id 
    AND dc.is_current = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Get classification statistics by community
CREATE OR REPLACE FUNCTION get_classification_stats(community_uuid UUID)
RETURNS TABLE (
  document_type TEXT,
  total_count BIGINT,
  avg_confidence REAL,
  gemini_count BIGINT,
  fallback_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.document_type,
    COUNT(*) as total_count,
    AVG(dc.confidence) as avg_confidence,
    SUM(CASE WHEN dc.classification_method = 'gemini' THEN 1 ELSE 0 END) as gemini_count,
    SUM(CASE WHEN dc.classification_method = 'filename-fallback' THEN 1 ELSE 0 END) as fallback_count
  FROM document_classifications dc
  JOIN documents d ON dc.document_id = d.id
  WHERE d.community_id = community_uuid
    AND dc.is_current = TRUE
  GROUP BY dc.document_type
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Create or update classification
CREATE OR REPLACE FUNCTION upsert_document_classification(
  doc_id UUID,
  doc_type TEXT,
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
  classification_id UUID;
BEGIN
  INSERT INTO document_classifications (
    document_id,
    document_type,
    confidence,
    classification_method,
    processing_time_ms,
    tokens_used,
    input_sample_length,
    filename_analyzed,
    raw_response,
    classified_by
  ) VALUES (
    doc_id,
    doc_type,
    conf,
    method,
    proc_time_ms,
    tokens,
    sample_len,
    filename,
    raw_resp,
    COALESCE(user_id, auth.uid())
  ) RETURNING id INTO classification_id;
  
  RETURN classification_id;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- VIEWS PARA CONSULTAS COMUNES
-- ===============================================================================

-- View: Documents with their current classification
CREATE OR REPLACE VIEW documents_with_classification AS
SELECT 
  d.id,
  d.filename,
  d.community_id,
  d.created_at,
  d.processing_level,
  d.classification_status,
  dc.document_type,
  dc.confidence as classification_confidence,
  dc.classification_method,
  dc.created_at as classified_at
FROM documents d
LEFT JOIN document_classifications dc ON d.id = dc.document_id AND dc.is_current = TRUE;

-- ===============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ===============================================================================

COMMENT ON TABLE document_classifications IS 'Resultados de clasificación de documentos (nivel≥2). Mantiene historial con is_current para clasificación activa';

COMMENT ON COLUMN document_classifications.document_type IS 'Tipo detectado: acta, contrato, factura, comunicado';
COMMENT ON COLUMN document_classifications.confidence IS 'Confianza 0.0-1.0 en la clasificación';
COMMENT ON COLUMN document_classifications.classification_method IS 'Método usado: gemini, filename-fallback, manual, default';
COMMENT ON COLUMN document_classifications.is_current IS 'TRUE para la clasificación activa del documento';
COMMENT ON COLUMN document_classifications.superseded_by IS 'ID de la clasificación que reemplazó a esta';

COMMENT ON FUNCTION get_current_classification(UUID) IS 'Obtiene la clasificación actual de un documento';
COMMENT ON FUNCTION get_classification_stats(UUID) IS 'Estadísticas de clasificación por comunidad';
COMMENT ON FUNCTION upsert_document_classification IS 'Crea nueva clasificación y marca anteriores como no actuales';

COMMENT ON VIEW documents_with_classification IS 'Vista unificada de documentos con su clasificación actual';