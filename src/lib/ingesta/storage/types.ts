/**
 * ARCHIVO: types.ts
 * PROPÓSITO: Tipos para almacenamiento en base de datos con pipeline progresivo
 * ESTADO: production
 * DEPENDENCIAS: Schema Supabase (documents, document_metadata, document_chunks)
 * OUTPUTS: Interfaces compatibles con tablas existentes + organization_id
 * ACTUALIZADO: 2025-09-14
 */

// ===============================================================================
// STORAGE TYPES - Compatible con Schema Existente + Pipeline Progresivo
// ===============================================================================
// 
// Basado en tu tabla documents existente + extensiones de pipeline progresivo
// Usa organization_id (no community_id) según tu schema actual

// ===============================================================================
// BASE TYPES
// ===============================================================================

export type ProcessingLevel = 1 | 2 | 3 | 4;

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export type DocumentType = 'acta' | 'contrato' | 'factura' | 'comunicado' | 'otros';

export type ClassificationMethod = 'gemini' | 'filename-fallback' | 'manual' | 'legacy-migration';

export type ExtractionMethod = 'pdf-parse' | 'ocr' | 'llm';

export type ChunkType = 'content' | 'header' | 'table' | 'list' | 'conclusion' | 'summary';

export type ChunkingMethod = 'semantic' | 'fixed-size' | 'paragraph' | 'section';

export type ValidationStatus = 'valid' | 'warnings' | 'invalid';

// ===============================================================================
// TABLE 1: DOCUMENTS (Extendida con Pipeline Progresivo)
// ===============================================================================

export interface DocumentRecord {
  // ===== CAMPOS ORIGINALES (tu tabla existente) =====
  id: string;
  organization_id: string;
  community_id: string | null;
  filename: string;
  file_path: string;
  file_size: number;
  file_hash: string;
  document_type: string | null;                    // DEPRECATED - usar document_classifications
  legacy_status: string;                          // RENOMBRADO desde 'status'  
  created_at: string;
  processed_at: string | null;
  
  // ===== NUEVOS CAMPOS PIPELINE PROGRESIVO =====
  // Datos básicos extraídos (Nivel 1)
  extracted_text: string | null;
  text_length: number;
  page_count: number;
  
  // Configuración
  processing_level: ProcessingLevel;
  processing_config: Record<string, any>;
  
  // Estados de procesamiento
  extraction_status: ProcessingStatus;
  extraction_error: string | null;
  extraction_method: ExtractionMethod | null;
  extraction_completed_at: string | null;
  
  classification_status: ProcessingStatus | null;
  classification_error: string | null;
  classification_completed_at: string | null;
  
  metadata_status: ProcessingStatus | null;
  metadata_error: string | null;
  metadata_completed_at: string | null;
  
  chunking_status: ProcessingStatus | null;
  chunking_error: string | null;
  chunking_completed_at: string | null;
  chunks_count: number;
  
  // Estadísticas
  total_processing_time_ms: number;
  total_tokens_used: number;
  estimated_cost_usd: number;
  
  // Audit trail
  processing_started_at: string | null;
  processing_completed_at: string | null;
  last_processed_by: string | null;
  uploaded_by: string | null;
  
  // Campos adicionales de archivo
  mime_type: string | null;
  original_filename: string | null;
}

// ===============================================================================
// TABLE 2: DOCUMENT_CLASSIFICATIONS
// ===============================================================================

export interface DocumentClassificationRecord {
  id: string;
  created_at: string;
  
  // Relaciones
  document_id: string;
  organization_id: string;
  
  // Clasificación
  document_type: DocumentType;
  confidence: number;                             // 0.0 - 1.0
  classification_method: ClassificationMethod;
  
  // Metadatos de procesamiento
  processing_time_ms: number | null;
  tokens_used: number;
  input_sample_length: number | null;
  filename_analyzed: string | null;
  raw_response: string | null;
  
  // Historial
  is_current: boolean;
  superseded_by: string | null;
  classified_by: string | null;
}

// ===============================================================================
// TABLE 3: DOCUMENT_METADATA  
// ===============================================================================

export interface DocumentMetadataRecord {
  id: string;
  created_at: string;
  
  // Relaciones
  document_id: string;
  organization_id: string;
  
  // Metadatos estructurados
  metadata: Record<string, any>;                  // JSON flexible según contrato documento
  metadata_version: string;
  
  // Calidad de extracción
  confidence: number;                             // 0.0 - 1.0
  extraction_method: 'gemini' | 'fallback' | 'manual';
  processing_time_ms: number | null;
  tokens_used: number;
  
  // Validación
  validation_status: ValidationStatus;
  validation_errors: string[] | null;
  validation_warnings: string[] | null;
  
  // Campos optimizados (extraídos del JSON)
  document_type: string | null;
  document_date: string | null;                   // DATE format YYYY-MM-DD
  topic_keywords: string[] | null;
  
  // Debug
  input_sample_length: number | null;
  filename_analyzed: string | null;
  raw_response: string | null;
  
  // Historial
  is_current: boolean;
  superseded_by: string | null;
  extracted_by: string | null;
}

// ===============================================================================
// TABLE 4: DOCUMENT_CHUNKS
// ===============================================================================

export interface DocumentChunkRecord {
  id: string;
  created_at: string;
  
  // Relaciones
  document_id: string;
  organization_id: string;
  
  // Información del chunk
  chunk_number: number;                           // >= 1
  chunk_type: ChunkType;
  content: string;
  content_length: number;                         // Auto-calculated
  
  // Posición en documento
  start_position: number | null;
  end_position: number | null;
  page_numbers: number[] | null;
  
  // Metadatos específicos del chunk
  chunk_metadata: Record<string, any>;
  
  // Embeddings para RAG
  embedding: number[] | null;                     // vector(1536) - OpenAI ada-002
  embedding_model: string;                        // Default: 'text-embedding-ada-002'
  embedding_created_at: string | null;
  
  // Chunking method y calidad
  chunking_method: ChunkingMethod;
  confidence: number | null;                      // 0.0 - 1.0
  quality_score: number | null;                  // 0.0 - 1.0
  
  // Processing
  processing_time_ms: number | null;
  tokens_used: number;
  input_sample_length: number | null;
  chunking_config: Record<string, any>;
  
  // Audit
  chunked_by: string | null;
}

// ===============================================================================
// INPUT/OUTPUT TYPES PARA CRUD OPERATIONS
// ===============================================================================

// ===== CREATE DOCUMENT =====
export interface CreateDocumentInput {
  organization_id: string;
  community_id?: string | null;
  filename: string;
  file_path: string;
  file_size: number;
  file_hash: string;
  processing_level?: ProcessingLevel;
  processing_config?: Record<string, any>;
  uploaded_by?: string;
  mime_type?: string;
  original_filename?: string;
}

export interface CreateDocumentOutput {
  document: DocumentRecord;
  success: boolean;
  error?: string;
}

// ===== UPDATE DOCUMENT STATUS =====
export interface UpdateDocumentStatusInput {
  document_id: string;
  step: 'extraction' | 'classification' | 'metadata' | 'chunking';
  status: ProcessingStatus;
  error_message?: string | null;
  processing_time_ms?: number;
  tokens_used?: number;
  method?: string;
}

export interface UpdateDocumentStatusOutput {
  success: boolean;
  updated_fields: string[];
  error?: string;
}

// ===== CREATE CLASSIFICATION =====
export interface CreateClassificationInput {
  document_id: string;
  organization_id: string;
  document_type: DocumentType;
  confidence: number;
  classification_method: ClassificationMethod;
  processing_time_ms?: number;
  tokens_used?: number;
  input_sample_length?: number;
  filename_analyzed?: string;
  raw_response?: string;
  classified_by?: string;
}

// ===== CREATE METADATA =====
export interface CreateMetadataInput {
  document_id: string;
  organization_id: string;
  metadata: Record<string, any>;
  confidence: number;
  extraction_method: 'gemini' | 'fallback' | 'manual';
  processing_time_ms?: number;
  tokens_used?: number;
  validation_status?: ValidationStatus;
  validation_errors?: string[];
  validation_warnings?: string[];
  input_sample_length?: number;
  filename_analyzed?: string;
  raw_response?: string;
  extracted_by?: string;
}

// ===== CREATE CHUNK =====
export interface CreateChunkInput {
  document_id: string;
  organization_id: string;
  chunk_number: number;
  chunk_type: ChunkType;
  content: string;
  chunking_method: ChunkingMethod;
  start_position?: number;
  end_position?: number;
  page_numbers?: number[];
  chunk_metadata?: Record<string, any>;
  embedding?: number[];
  confidence?: number;
  quality_score?: number;
  processing_time_ms?: number;
  tokens_used?: number;
  chunking_config?: Record<string, any>;
  chunked_by?: string;
}

// ===============================================================================
// QUERY TYPES
// ===============================================================================

// ===== GET DOCUMENTS NEEDING PROCESSING =====
export interface DocumentNeedingProcessing {
  id: string;
  filename: string;
  processing_level: ProcessingLevel;
  current_status: 'extraction_needed' | 'classification_needed' | 'metadata_needed' | 'chunking_needed' | 'completed';
  organization_id: string;
}

// ===== DOCUMENT WITH RELATIONS =====
export interface DocumentWithRelations extends DocumentRecord {
  classification?: DocumentClassificationRecord | null;
  metadata?: DocumentMetadataRecord | null;
  chunks_summary?: {
    total_chunks: number;
    chunks_with_embeddings: number;
    avg_quality_score: number | null;
  };
}

// ===== SEARCH RESULTS =====
export interface DocumentSearchResult {
  document: DocumentRecord;
  classification?: DocumentClassificationRecord;
  metadata?: DocumentMetadataRecord;
  relevance_score?: number;
  match_type: 'filename' | 'content' | 'metadata' | 'semantic';
}

export interface ChunkSearchResult {
  chunk: DocumentChunkRecord;
  document: DocumentRecord;
  similarity_score: number;
  match_context: string;
}

// ===============================================================================
// PIPELINE PROCESSING TYPES
// ===============================================================================

export interface ProcessingResult {
  success: boolean;
  step_completed: 'extraction' | 'classification' | 'metadata' | 'chunking';
  processing_time_ms: number;
  tokens_used?: number;
  estimated_cost_usd?: number;
  error?: string;
  data?: any;
}

export interface PipelineStatus {
  document_id: string;
  current_level: ProcessingLevel;
  completed_steps: string[];
  pending_steps: string[];
  failed_steps: string[];
  overall_status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  total_processing_time_ms: number;
  total_tokens_used: number;
  estimated_cost_usd: number;
}

// ===============================================================================
// CONFIGURATION TYPES
// ===============================================================================

export interface ProcessingLevelConfig {
  level: ProcessingLevel;
  enabled_steps: {
    extraction: boolean;
    classification: boolean;
    metadata: boolean;
    chunking: boolean;
  };
  extraction_config?: {
    methods: ExtractionMethod[];
    fallback_enabled: boolean;
  };
  classification_config?: {
    confidence_threshold: number;
    allowed_types: DocumentType[];
  };
  metadata_config?: {
    contracts_enabled: string[];
    validation_level: 'strict' | 'warn' | 'none';
  };
  chunking_config?: {
    method: ChunkingMethod;
    chunk_size: number;
    overlap: number;
    quality_threshold: number;
  };
}

// ===============================================================================
// ERROR TYPES
// ===============================================================================

export interface StorageError {
  code: 'NOT_FOUND' | 'PERMISSION_DENIED' | 'INVALID_INPUT' | 'PROCESSING_FAILED' | 'DATABASE_ERROR';
  message: string;
  details?: Record<string, any>;
  table?: string;
  operation?: string;
}

// ===============================================================================
// UTILITY TYPES
// ===============================================================================

export type DocumentStatus = 'draft' | 'processing' | 'completed' | 'failed';

export type DatabaseTable = 'documents' | 'document_classifications' | 'document_metadata' | 'document_chunks';

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: SortOrder;
}

export interface PaginatedResult<T> {
  data: T[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}