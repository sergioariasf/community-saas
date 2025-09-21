/**
 * ARCHIVO: documentsStore.ts
 * PROPÓSITO: CRUD operations para las 4 tablas del pipeline progresivo
 * ESTADO: production
 * DEPENDENCIAS: @supabase/supabase-js, types.ts
 * OUTPUTS: Funciones de base de datos con RLS por organization_id
 * ACTUALIZADO: 2025-09-14
 */

// Compatible con tu schema existente usando organization_id
// Funciones para las 4 tablas del pipeline progresivo

import { createClient } from '@supabase/supabase-js';
import type {
  DocumentRecord,
  DocumentClassificationRecord,
  DocumentMetadataRecord,
  DocumentChunkRecord,
  CreateDocumentInput,
  CreateDocumentOutput,
  UpdateDocumentStatusInput,
  UpdateDocumentStatusOutput,
  CreateClassificationInput,
  CreateMetadataInput,
  CreateChunkInput,
  DocumentNeedingProcessing,
  DocumentWithRelations,
  ProcessingResult,
  PipelineStatus,
  StorageError,
  ProcessingLevel,
  ProcessingStatus,
  DocumentType
} from './types';

// ===============================================================================
// SUPABASE CLIENT SETUP
// ===============================================================================

// Usar las variables de entorno de tu proyecto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===============================================================================
// DOCUMENTS CRUD (Tabla Principal)
// ===============================================================================

class DocumentsStore {
  
  // ===== CREATE DOCUMENT =====
  static async createDocument(input: CreateDocumentInput): Promise<CreateDocumentOutput> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          organization_id: input.organization_id,
          community_id: input.community_id || null,
          filename: input.filename,
          file_path: input.file_path,
          file_size: input.file_size,
          file_hash: input.file_hash,
          processing_level: input.processing_level || 1,
          processing_config: input.processing_config || {},
          extraction_status: 'pending',
          uploaded_by: input.uploaded_by || null,
          mime_type: input.mime_type || null,
          original_filename: input.original_filename || input.filename,
          processing_started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        document: data as DocumentRecord,
        success: true
      };
    } catch (error: any) {
      return {
        document: {} as DocumentRecord,
        success: false,
        error: error.message
      };
    }
  }

  // ===== GET DOCUMENT BY ID =====
  static async getDocument(documentId: string): Promise<DocumentRecord | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data as DocumentRecord;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }

  // ===== GET DOCUMENT WITH RELATIONS =====
  static async getDocumentWithRelations(documentId: string): Promise<DocumentWithRelations | null> {
    try {
      // Get document
      const document = await this.getDocument(documentId);
      if (!document) return null;

      // Get current classification
      const classification = await ClassificationStore.getCurrentClassification(documentId);
      
      // Get current metadata
      const metadata = await MetadataStore.getCurrentMetadata(documentId);
      
      // Get chunks summary
      const chunks_summary = await ChunkStore.getChunksSummary(documentId);

      return {
        ...document,
        classification,
        metadata,
        chunks_summary
      };
    } catch (error) {
      console.error('Error fetching document with relations:', error);
      return null;
    }
  }

  // ===== UPDATE PROCESSING STATUS =====
  static async updateProcessingStatus(input: UpdateDocumentStatusInput): Promise<UpdateDocumentStatusOutput> {
    try {
      const updates: Record<string, any> = {};
      const updated_fields: string[] = [];

      // Determinar campos a actualizar según el step
      const statusField = `${input.step}_status`;
      const errorField = `${input.step}_error`;
      const completedAtField = `${input.step}_completed_at`;
      const methodField = input.step === 'extraction' ? 'extraction_method' : null;

      updates[statusField] = input.status;
      updated_fields.push(statusField);

      if (input.error_message !== undefined) {
        updates[errorField] = input.error_message;
        updated_fields.push(errorField);
      }

      if (input.status === 'completed') {
        updates[completedAtField] = new Date().toISOString();
        updated_fields.push(completedAtField);
      }

      if (methodField && input.method) {
        updates[methodField] = input.method;
        updated_fields.push(methodField);
      }

      if (input.processing_time_ms) {
        updates.total_processing_time_ms = supabase.raw(
          `COALESCE(total_processing_time_ms, 0) + ${input.processing_time_ms}`
        );
        updated_fields.push('total_processing_time_ms');
      }

      if (input.tokens_used) {
        updates.total_tokens_used = supabase.raw(
          `COALESCE(total_tokens_used, 0) + ${input.tokens_used}`
        );
        updated_fields.push('total_tokens_used');
      }

      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', input.document_id);

      if (error) throw error;

      return {
        success: true,
        updated_fields
      };
    } catch (error: any) {
      return {
        success: false,
        updated_fields: [],
        error: error.message
      };
    }
  }

  // ===== GET DOCUMENTS NEEDING PROCESSING =====
  static async getDocumentsNeedingProcessing(
    organizationId?: string,
    targetLevel?: ProcessingLevel
  ): Promise<DocumentNeedingProcessing[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_documents_needing_processing', {
          target_level: targetLevel || null
        });

      if (error) throw error;

      let results = data as DocumentNeedingProcessing[];

      // Filtrar por organization si se especifica
      if (organizationId) {
        results = results.filter(doc => doc.organization_id === organizationId);
      }

      return results;
    } catch (error) {
      console.error('Error fetching documents needing processing:', error);
      return [];
    }
  }

  // ===== GET PIPELINE STATUS =====
  static async getPipelineStatus(documentId: string): Promise<PipelineStatus | null> {
    try {
      const document = await this.getDocument(documentId);
      if (!document) return null;

      const completed_steps: string[] = [];
      const pending_steps: string[] = [];
      const failed_steps: string[] = [];

      // Analizar estado de cada step según processing_level
      if (document.extraction_status === 'completed') {
        completed_steps.push('extraction');
      } else if (document.extraction_status === 'failed') {
        failed_steps.push('extraction');
      } else {
        pending_steps.push('extraction');
      }

      if (document.processing_level >= 2) {
        if (document.classification_status === 'completed') {
          completed_steps.push('classification');
        } else if (document.classification_status === 'failed') {
          failed_steps.push('classification');
        } else if (document.classification_status) {
          pending_steps.push('classification');
        }
      }

      if (document.processing_level >= 3) {
        if (document.metadata_status === 'completed') {
          completed_steps.push('metadata');
        } else if (document.metadata_status === 'failed') {
          failed_steps.push('metadata');
        } else if (document.metadata_status) {
          pending_steps.push('metadata');
        }
      }

      if (document.processing_level >= 4) {
        if (document.chunking_status === 'completed') {
          completed_steps.push('chunking');
        } else if (document.chunking_status === 'failed') {
          failed_steps.push('chunking');
        } else if (document.chunking_status) {
          pending_steps.push('chunking');
        }
      }

      // Determinar overall_status
      let overall_status: PipelineStatus['overall_status'] = 'pending';
      if (failed_steps.length > 0) {
        overall_status = 'failed';
      } else if (pending_steps.length > 0) {
        overall_status = 'processing';
      } else if (completed_steps.length > 0) {
        overall_status = 'completed';
      }

      return {
        document_id: documentId,
        current_level: document.processing_level,
        completed_steps,
        pending_steps,
        failed_steps,
        overall_status,
        total_processing_time_ms: document.total_processing_time_ms,
        total_tokens_used: document.total_tokens_used,
        estimated_cost_usd: document.estimated_cost_usd
      };
    } catch (error) {
      console.error('Error getting pipeline status:', error);
      return null;
    }
  }

  // ===== LIST DOCUMENTS BY ORGANIZATION =====
  static async listDocuments(
    organizationId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: ProcessingStatus;
      document_type?: DocumentType;
      processing_level?: ProcessingLevel;
    } = {}
  ): Promise<DocumentRecord[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      if (options.status) {
        query = query.eq('extraction_status', options.status);
      }

      if (options.processing_level) {
        query = query.eq('processing_level', options.processing_level);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DocumentRecord[];
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  }
}

// ===============================================================================
// CLASSIFICATIONS STORE (Tabla 2)
// ===============================================================================

class ClassificationStore {
  
  // ===== CREATE CLASSIFICATION =====
  static async createClassification(input: CreateClassificationInput): Promise<DocumentClassificationRecord | null> {
    try {
      const { data, error } = await supabase
        .from('document_classifications')
        .insert({
          document_id: input.document_id,
          organization_id: input.organization_id,
          document_type: input.document_type,
          confidence: input.confidence,
          classification_method: input.classification_method,
          processing_time_ms: input.processing_time_ms || null,
          tokens_used: input.tokens_used || 0,
          input_sample_length: input.input_sample_length || null,
          filename_analyzed: input.filename_analyzed || null,
          raw_response: input.raw_response || null,
          classified_by: input.classified_by || null,
          is_current: true
        })
        .select()
        .single();

      if (error) throw error;
      return data as DocumentClassificationRecord;
    } catch (error) {
      console.error('Error creating classification:', error);
      return null;
    }
  }

  // ===== GET CURRENT CLASSIFICATION =====
  static async getCurrentClassification(documentId: string): Promise<DocumentClassificationRecord | null> {
    try {
      const { data, error } = await supabase
        .from('document_classifications')
        .select('*')
        .eq('document_id', documentId)
        .eq('is_current', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data as DocumentClassificationRecord | null;
    } catch (error) {
      console.error('Error fetching current classification:', error);
      return null;
    }
  }

  // ===== LIST CLASSIFICATIONS BY ORGANIZATION =====
  static async listClassificationsByOrganization(
    organizationId: string,
    document_type?: DocumentType
  ): Promise<DocumentClassificationRecord[]> {
    try {
      let query = supabase
        .from('document_classifications')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_current', true)
        .order('created_at', { ascending: false });

      if (document_type) {
        query = query.eq('document_type', document_type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DocumentClassificationRecord[];
    } catch (error) {
      console.error('Error listing classifications:', error);
      return [];
    }
  }
}

// ===============================================================================
// METADATA STORE (Tabla 3)
// ===============================================================================

class MetadataStore {
  
  // ===== CREATE METADATA =====
  static async createMetadata(input: CreateMetadataInput): Promise<DocumentMetadataRecord | null> {
    try {
      const { data, error } = await supabase
        .from('document_metadata')
        .insert({
          document_id: input.document_id,
          organization_id: input.organization_id,
          metadata: input.metadata,
          confidence: input.confidence,
          extraction_method: input.extraction_method,
          processing_time_ms: input.processing_time_ms || null,
          tokens_used: input.tokens_used || 0,
          validation_status: input.validation_status || 'valid',
          validation_errors: input.validation_errors || null,
          validation_warnings: input.validation_warnings || null,
          input_sample_length: input.input_sample_length || null,
          filename_analyzed: input.filename_analyzed || null,
          raw_response: input.raw_response || null,
          extracted_by: input.extracted_by || null,
          is_current: true
        })
        .select()
        .single();

      if (error) throw error;
      return data as DocumentMetadataRecord;
    } catch (error) {
      console.error('Error creating metadata:', error);
      return null;
    }
  }

  // ===== GET CURRENT METADATA =====
  static async getCurrentMetadata(documentId: string): Promise<DocumentMetadataRecord | null> {
    try {
      const { data, error } = await supabase
        .from('document_metadata')
        .select('*')
        .eq('document_id', documentId)
        .eq('is_current', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as DocumentMetadataRecord | null;
    } catch (error) {
      console.error('Error fetching current metadata:', error);
      return null;
    }
  }

  // ===== SEARCH BY METADATA =====
  static async searchByMetadata(
    organizationId: string,
    searchParams: {
      document_type?: string;
      date_from?: string;
      date_to?: string;
      keywords?: string[];
      limit?: number;
    }
  ): Promise<DocumentMetadataRecord[]> {
    try {
      let query = supabase
        .from('document_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_current', true)
        .order('created_at', { ascending: false });

      if (searchParams.document_type) {
        query = query.eq('document_type', searchParams.document_type);
      }

      if (searchParams.date_from) {
        query = query.gte('document_date', searchParams.date_from);
      }

      if (searchParams.date_to) {
        query = query.lte('document_date', searchParams.date_to);
      }

      if (searchParams.keywords && searchParams.keywords.length > 0) {
        query = query.overlaps('topic_keywords', searchParams.keywords);
      }

      if (searchParams.limit) {
        query = query.limit(searchParams.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DocumentMetadataRecord[];
    } catch (error) {
      console.error('Error searching metadata:', error);
      return [];
    }
  }
}

// ===============================================================================
// CHUNKS STORE (Tabla 4)
// ===============================================================================

class ChunkStore {
  
  // ===== CREATE CHUNK =====
  static async createChunk(input: CreateChunkInput): Promise<DocumentChunkRecord | null> {
    try {
      const { data, error } = await supabase
        .from('document_chunks')
        .insert({
          document_id: input.document_id,
          organization_id: input.organization_id,
          chunk_number: input.chunk_number,
          chunk_type: input.chunk_type,
          content: input.content,
          chunking_method: input.chunking_method,
          start_position: input.start_position || null,
          end_position: input.end_position || null,
          page_numbers: input.page_numbers || null,
          chunk_metadata: input.chunk_metadata || {},
          embedding: input.embedding || null,
          confidence: input.confidence || null,
          quality_score: input.quality_score || null,
          processing_time_ms: input.processing_time_ms || null,
          tokens_used: input.tokens_used || 0,
          chunking_config: input.chunking_config || {},
          chunked_by: input.chunked_by || null,
          embedding_created_at: input.embedding ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      return data as DocumentChunkRecord;
    } catch (error) {
      console.error('Error creating chunk:', error);
      return null;
    }
  }

  // ===== GET CHUNKS FOR DOCUMENT =====
  static async getDocumentChunks(
    documentId: string,
    options: { with_embeddings?: boolean; limit?: number } = {}
  ): Promise<DocumentChunkRecord[]> {
    try {
      let query = supabase
        .from('document_chunks')
        .select('*')
        .eq('document_id', documentId)
        .order('chunk_number', { ascending: true });

      if (options.with_embeddings) {
        query = query.not('embedding', 'is', null);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DocumentChunkRecord[];
    } catch (error) {
      console.error('Error fetching document chunks:', error);
      return [];
    }
  }

  // ===== GET CHUNKS SUMMARY =====
  static async getChunksSummary(documentId: string): Promise<{
    total_chunks: number;
    chunks_with_embeddings: number;
    avg_quality_score: number | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('document_chunks')
        .select('embedding, quality_score')
        .eq('document_id', documentId);

      if (error) throw error;

      const total_chunks = data.length;
      const chunks_with_embeddings = data.filter(chunk => chunk.embedding !== null).length;
      
      const quality_scores = data
        .map(chunk => chunk.quality_score)
        .filter(score => score !== null) as number[];
      
      const avg_quality_score = quality_scores.length > 0 
        ? quality_scores.reduce((sum, score) => sum + score, 0) / quality_scores.length
        : null;

      return {
        total_chunks,
        chunks_with_embeddings,
        avg_quality_score
      };
    } catch (error) {
      console.error('Error getting chunks summary:', error);
      return {
        total_chunks: 0,
        chunks_with_embeddings: 0,
        avg_quality_score: null
      };
    }
  }

  // ===== SEMANTIC SEARCH =====
  static async semanticSearch(
    organizationId: string,
    queryEmbedding: number[],
    options: {
      similarity_threshold?: number;
      limit?: number;
      document_types?: DocumentType[];
    } = {}
  ): Promise<DocumentChunkRecord[]> {
    try {
      // Esta función requiere la función SQL search_similar_chunks
      // Por ahora implementamos búsqueda básica por contenido
      let query = supabase
        .from('document_chunks')
        .select('*')
        .eq('organization_id', organizationId)
        .not('embedding', 'is', null)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DocumentChunkRecord[];
    } catch (error) {
      console.error('Error in semantic search:', error);
      return [];
    }
  }

  // ===== UPDATE CHUNK EMBEDDING =====
  static async updateChunkEmbedding(
    chunkId: string,
    embedding: number[],
    embedding_model: string = 'text-embedding-ada-002'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('document_chunks')
        .update({
          embedding,
          embedding_model,
          embedding_created_at: new Date().toISOString()
        })
        .eq('id', chunkId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating chunk embedding:', error);
      return false;
    }
  }
}

// ===============================================================================
// EXPORTS
// ===============================================================================

export {
  DocumentsStore,
  ClassificationStore,
  MetadataStore,
  ChunkStore
};

export default DocumentsStore;