-- ===============================================================================
-- TABLA 4: document_chunks (OPCIONAL - Nivel ≥4)
-- ===============================================================================
-- 
-- RESPONSABILIDAD: Almacena chunks de documentos para RAG + embeddings
-- Solo se usa si cliente configura processing_level >= 4
-- 
-- RELACIONES: N:1 con documents (un documento puede tener múltiples chunks)
-- DEPENDENCIAS: Requiere documents.chunking_status = 'completed'

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
  page_numbers INTEGER[], -- Array de páginas que contiene este chunk
  
  -- ===== METADATOS ESPECÍFICOS DEL CHUNK (JSON FLEXIBLE) =====
  chunk_metadata JSONB NOT NULL DEFAULT '{}',   -- Metadatos específicos por tipo documento
  
  -- ===== EMBEDDINGS PARA RAG =====
  embedding vector(1536),                       -- OpenAI ada-002 embeddings (1536 dim)
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
  input_sample_length INTEGER,                  -- Longitud del texto original analizado
  chunking_config JSONB DEFAULT '{}',           -- Configuración usada para chunking
  
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
-- ÍNDICES PARA RENDIMIENTO Y RAG
-- ===============================================================================

-- Índice principal: documento + número de chunk
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_chunks_doc_number 
ON document_chunks(document_id, chunk_number);

-- Índice para embeddings similarity search (HNSW para performance)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Índice alternativo IVFFlat para embeddings (menor memoria)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_ivf 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Índice por tipo de chunk (para filtros)
CREATE INDEX IF NOT EXISTS idx_document_chunks_type 
ON document_chunks(chunk_type, created_at DESC);

-- Índice por páginas (para búsquedas por página)
CREATE INDEX IF NOT EXISTS idx_document_chunks_pages 
ON document_chunks USING GIN (page_numbers);

-- Índice por método de chunking (para análisis performance)
CREATE INDEX IF NOT EXISTS idx_document_chunks_method_quality 
ON document_chunks(chunking_method, quality_score DESC NULLS LAST);

-- Índice por longitud de contenido (para análisis distribución chunks)
CREATE INDEX IF NOT EXISTS idx_document_chunks_length 
ON document_chunks(content_length DESC);

-- Índice compuesto para RAG queries (documento + embeddings)
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_embedding 
ON document_chunks(document_id) 
INCLUDE (embedding, content, chunk_metadata);

-- ===============================================================================
-- TRIGGERS PARA GESTIÓN AUTOMÁTICA
-- ===============================================================================

-- Trigger: Calcular automáticamente content_length
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

-- Trigger: Actualizar chunks_count en documents tabla
CREATE OR REPLACE FUNCTION update_document_chunks_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Al insertar nuevo chunk
  IF TG_OP = 'INSERT' THEN
    UPDATE documents 
    SET chunks_count = chunks_count + 1
    WHERE id = NEW.document_id;
    RETURN NEW;
  END IF;
  
  -- Al eliminar chunk
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

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see chunks from their community documents
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

-- Policy: Users can create chunks for their community documents
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

-- Policy: Users can update chunks they created
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

-- Policy: Only admins can delete chunks
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
-- FUNCTIONS HELPER PARA CHUNKS Y RAG
-- ===============================================================================

-- Function: Get chunks for document
CREATE OR REPLACE FUNCTION get_document_chunks(doc_id UUID)
RETURNS TABLE (
  id UUID,
  chunk_number INTEGER,
  chunk_type TEXT,
  content TEXT,
  chunk_metadata JSONB,
  page_numbers INTEGER[],
  quality_score REAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.chunk_number,
    dc.chunk_type,
    dc.content,
    dc.chunk_metadata,
    dc.page_numbers,
    dc.quality_score,
    dc.created_at
  FROM document_chunks dc
  WHERE dc.document_id = doc_id 
  ORDER BY dc.chunk_number ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Semantic similarity search usando embeddings
CREATE OR REPLACE FUNCTION search_similar_chunks(
  community_uuid UUID,
  query_embedding vector(1536),
  similarity_threshold REAL DEFAULT 0.7,
  limit_count INTEGER DEFAULT 10,
  doc_types TEXT[] DEFAULT NULL
) RETURNS TABLE (
  document_id UUID,
  chunk_id UUID,
  filename TEXT,
  chunk_number INTEGER,
  content TEXT,
  similarity REAL,
  document_type TEXT,
  chunk_metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as document_id,
    dc.id as chunk_id,
    d.filename,
    dc.chunk_number,
    dc.content,
    (1 - (dc.embedding <=> query_embedding)) as similarity,
    dm.document_type,
    dc.chunk_metadata
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  LEFT JOIN document_metadata dm ON d.id = dm.document_id AND dm.is_current = TRUE
  WHERE d.community_id = community_uuid
    AND dc.embedding IS NOT NULL
    AND (1 - (dc.embedding <=> query_embedding)) >= similarity_threshold
    AND (doc_types IS NULL OR dm.document_type = ANY(doc_types))
  ORDER BY dc.embedding <=> query_embedding ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Create or update chunk with embedding
CREATE OR REPLACE FUNCTION upsert_document_chunk(
  doc_id UUID,
  chunk_num INTEGER,
  chunk_typ TEXT,
  chunk_content TEXT,
  chunk_embed vector(1536) DEFAULT NULL,
  chunk_meta JSONB DEFAULT '{}',
  pages INTEGER[] DEFAULT NULL,
  start_pos INTEGER DEFAULT NULL,
  end_pos INTEGER DEFAULT NULL,
  method TEXT DEFAULT 'semantic',
  conf REAL DEFAULT NULL,
  qual_score REAL DEFAULT NULL,
  proc_time_ms INTEGER DEFAULT NULL,
  tokens INTEGER DEFAULT 0,
  user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  chunk_id UUID;
BEGIN
  INSERT INTO document_chunks (
    document_id,
    chunk_number,
    chunk_type,
    content,
    content_length,
    embedding,
    chunk_metadata,
    page_numbers,
    start_position,
    end_position,
    chunking_method,
    confidence,
    quality_score,
    processing_time_ms,
    tokens_used,
    chunked_by,
    embedding_created_at
  ) VALUES (
    doc_id,
    chunk_num,
    chunk_typ,
    chunk_content,
    LENGTH(chunk_content),
    chunk_embed,
    chunk_meta,
    pages,
    start_pos,
    end_pos,
    method,
    conf,
    qual_score,
    proc_time_ms,
    tokens,
    COALESCE(user_id, auth.uid()),
    CASE WHEN chunk_embed IS NOT NULL THEN NOW() ELSE NULL END
  ) 
  ON CONFLICT (document_id, chunk_number) 
  DO UPDATE SET
    chunk_type = EXCLUDED.chunk_type,
    content = EXCLUDED.content,
    content_length = EXCLUDED.content_length,
    embedding = EXCLUDED.embedding,
    chunk_metadata = EXCLUDED.chunk_metadata,
    page_numbers = EXCLUDED.page_numbers,
    start_position = EXCLUDED.start_position,
    end_position = EXCLUDED.end_position,
    chunking_method = EXCLUDED.chunking_method,
    confidence = EXCLUDED.confidence,
    quality_score = EXCLUDED.quality_score,
    processing_time_ms = EXCLUDED.processing_time_ms,
    tokens_used = EXCLUDED.tokens_used,
    embedding_created_at = EXCLUDED.embedding_created_at
  RETURNING id INTO chunk_id;
  
  RETURN chunk_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get chunking statistics by community
CREATE OR REPLACE FUNCTION get_chunking_stats(community_uuid UUID)
RETURNS TABLE (
  document_type TEXT,
  total_chunks BIGINT,
  avg_chunk_length REAL,
  avg_quality_score REAL,
  chunks_with_embeddings BIGINT,
  common_chunk_types TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.document_type,
    COUNT(*) as total_chunks,
    AVG(dc.content_length) as avg_chunk_length,
    AVG(dc.quality_score) as avg_quality_score,
    SUM(CASE WHEN dc.embedding IS NOT NULL THEN 1 ELSE 0 END) as chunks_with_embeddings,
    ARRAY_AGG(DISTINCT dc.chunk_type) as common_chunk_types
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  LEFT JOIN document_metadata dm ON d.id = dm.document_id AND dm.is_current = TRUE
  WHERE d.community_id = community_uuid
  GROUP BY dm.document_type
  ORDER BY total_chunks DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Bulk update embeddings (para batch processing)
CREATE OR REPLACE FUNCTION batch_update_embeddings(
  chunk_ids UUID[],
  embeddings vector(1536)[]
) RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  i INTEGER;
BEGIN
  -- Verificar que arrays tienen mismo tamaño
  IF array_length(chunk_ids, 1) != array_length(embeddings, 1) THEN
    RAISE EXCEPTION 'Arrays chunk_ids and embeddings must have the same length';
  END IF;
  
  -- Actualizar embeddings en batch
  FOR i IN 1..array_length(chunk_ids, 1) LOOP
    UPDATE document_chunks 
    SET 
      embedding = embeddings[i],
      embedding_created_at = NOW()
    WHERE id = chunk_ids[i];
    
    IF FOUND THEN
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ===============================================================================
-- VIEWS PARA CONSULTAS COMUNES
-- ===============================================================================

-- View: Documents with chunk statistics
CREATE OR REPLACE VIEW documents_with_chunks AS
SELECT 
  d.id,
  d.filename,
  d.community_id,
  d.created_at,
  d.processing_level,
  d.chunking_status,
  d.chunks_count,
  COALESCE(chunk_stats.actual_chunks, 0) as actual_chunks,
  chunk_stats.avg_chunk_length,
  chunk_stats.chunks_with_embeddings,
  chunk_stats.chunk_types_used
FROM documents d
LEFT JOIN (
  SELECT 
    dc.document_id,
    COUNT(*) as actual_chunks,
    AVG(dc.content_length) as avg_chunk_length,
    SUM(CASE WHEN dc.embedding IS NOT NULL THEN 1 ELSE 0 END) as chunks_with_embeddings,
    ARRAY_AGG(DISTINCT dc.chunk_type) as chunk_types_used
  FROM document_chunks dc
  GROUP BY dc.document_id
) chunk_stats ON d.id = chunk_stats.document_id;

-- View: RAG-ready chunks (solo chunks con embeddings)
CREATE OR REPLACE VIEW rag_ready_chunks AS
SELECT 
  dc.id,
  dc.document_id,
  d.filename,
  d.community_id,
  dc.chunk_number,
  dc.chunk_type,
  dc.content,
  dc.embedding,
  dc.chunk_metadata,
  dc.quality_score,
  dm.document_type,
  dm.metadata as document_metadata
FROM document_chunks dc
JOIN documents d ON dc.document_id = d.id
LEFT JOIN document_metadata dm ON d.id = dm.document_id AND dm.is_current = TRUE
WHERE dc.embedding IS NOT NULL
ORDER BY d.community_id, d.filename, dc.chunk_number;

-- ===============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ===============================================================================

COMMENT ON TABLE document_chunks IS 'Chunks de documentos con embeddings para RAG (nivel≥4). Optimizado para similarity search con pgvector';

COMMENT ON COLUMN document_chunks.content IS 'Texto del chunk extraído del documento original';
COMMENT ON COLUMN document_chunks.embedding IS 'Vector embedding 1536-dim para similarity search';
COMMENT ON COLUMN document_chunks.chunk_metadata IS 'Metadatos específicos del chunk en JSON flexible';
COMMENT ON COLUMN document_chunks.chunking_method IS 'Método usado: semantic, fixed-size, paragraph, section';
COMMENT ON COLUMN document_chunks.quality_score IS 'Score 0.0-1.0 de calidad del chunk';
COMMENT ON COLUMN document_chunks.page_numbers IS 'Array de páginas del documento original que contiene';

COMMENT ON FUNCTION get_document_chunks(UUID) IS 'Obtiene todos los chunks de un documento ordenados por número';
COMMENT ON FUNCTION search_similar_chunks IS 'Búsqueda semántica usando embeddings con threshold de similaridad';
COMMENT ON FUNCTION upsert_document_chunk IS 'Crea o actualiza chunk con soporte para embeddings';
COMMENT ON FUNCTION get_chunking_stats(UUID) IS 'Estadísticas de chunking por comunidad y tipo documento';
COMMENT ON FUNCTION batch_update_embeddings IS 'Actualización masiva de embeddings para optimizar performance';

COMMENT ON VIEW documents_with_chunks IS 'Vista unificada de documentos con estadísticas de sus chunks';
COMMENT ON VIEW rag_ready_chunks IS 'Vista optimizada para RAG: solo chunks con embeddings listos para search';