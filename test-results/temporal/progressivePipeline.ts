/**
 * ARCHIVO: progressivePipeline.ts
 * PROPÓSITO: Orquestador inteligente del pipeline progresivo de 4 niveles
 * ESTADO: Obsoleto por ser complicado y referencias circulares
 * DEPENDENCIAS: documentsStore, extraction, classification, metadata, chunking
 * OUTPUTS: Pipeline completo con gestión automática de dependencias
 * ACTUALIZADO: 2025-09-15
 */

// Sistema que gestiona automáticamente las dependencias entre niveles:
// Nivel 1: Storage + Extraction (siempre)
// Nivel 2: + Classification (depende de Nivel 1)
// Nivel 3: + Metadata (depende de Nivel 2)
// Nivel 4: + Chunking + RAG (depende de Nivel 3)

import {
  ChunkStore,
  ClassificationStore,
  DocumentsStore,
  MetadataStore,
} from '../storage/documentsStore';

import { createSupabaseClient } from '@/supabase-clients/server';

import { DocumentClassifier } from '../modules/classification/documentClassifier';

import { ActaMetadataExtractor } from '../modules/metadata/extractors/actaMetadataExtractor';

import type {
  DocumentRecord,
  DocumentType,
  ExtractionMethod,
  PipelineStatus,
  ProcessingLevel,
} from '../storage/types';

// ===============================================================================
// PIPELINE CONFIGURATION
// ===============================================================================

interface PipelineConfig {
  // Extraction (Nivel 1)
  extraction: {
    methods: ExtractionMethod[];
    fallback_enabled: boolean;
    max_retries: number;
  };

  // Classification (Nivel 2)
  classification: {
    confidence_threshold: number;
    enabled_types: DocumentType[];
    fallback_to_filename: boolean;
  };

  // Metadata (Nivel 3)
  metadata: {
    enabled_contracts: string[];
    validation_level: 'strict' | 'warn' | 'none';
    confidence_threshold: number;
  };

  // Chunking (Nivel 4)
  chunking: {
    method: 'semantic' | 'fixed-size' | 'paragraph';
    chunk_size: number;
    overlap: number;
    quality_threshold: number;
    generate_embeddings: boolean;
  };
}

const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  extraction: {
    methods: ['pdf-parse', 'ocr'],
    fallback_enabled: true,
    max_retries: 2,
  },
  classification: {
    confidence_threshold: 0.7,
    enabled_types: ['acta', 'contrato', 'factura', 'comunicado'],
    fallback_to_filename: true,
  },
  metadata: {
    enabled_contracts: ['acta', 'contrato', 'factura'],
    validation_level: 'warn',
    confidence_threshold: 0.6,
  },
  chunking: {
    method: 'semantic',
    chunk_size: 1000,
    overlap: 200,
    quality_threshold: 0.5,
    generate_embeddings: true,
  },
};

// ===============================================================================
// PIPELINE RESULT TYPES
// ===============================================================================

interface PipelineStepResult {
  step: 'extraction' | 'classification' | 'metadata' | 'chunking';
  success: boolean;
  processing_time_ms: number;
  tokens_used?: number;
  estimated_cost_usd?: number;
  error?: string;
  data?: any;
  confidence?: number;
}

interface PipelineExecutionResult {
  document_id: string;
  success: boolean;
  completed_steps: PipelineStepResult[];
  failed_steps: PipelineStepResult[];
  total_processing_time_ms: number;
  total_tokens_used: number;
  estimated_total_cost_usd: number;
  final_status: PipelineStatus;
  error?: string;
}

// ===============================================================================
// PROGRESSIVE PIPELINE CLASS
// ===============================================================================

export class ProgressivePipeline {
  private config: PipelineConfig;

  constructor(config: Partial<PipelineConfig> = {}) {
    this.config = { ...DEFAULT_PIPELINE_CONFIG, ...config };
  }

  // ===== MAIN PIPELINE EXECUTION =====
  async processDocument(
    documentId: string,
    targetLevel?: ProcessingLevel,
    organizationId?: string
  ): Promise<PipelineExecutionResult> {
    const startTime = Date.now();
    const completed_steps: PipelineStepResult[] = [];
    const failed_steps: PipelineStepResult[] = [];
    let total_tokens_used = 0;
    let estimated_total_cost_usd = 0;

    try {
      console.log(
        `🚀 Starting progressive pipeline for document ${documentId}`
      );

      // 1. Get document and determine current status
      const document = await DocumentsStore.getDocument(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      const currentStatus = await this.analyzeCurrentStatus(document);
      const effectiveTargetLevel = targetLevel || document.processing_level;

      console.log(`📊 Current status: ${JSON.stringify(currentStatus)}`);
      console.log(`🎯 Target level: ${effectiveTargetLevel}`);

      // 2. Execute steps in order based on dependencies (RE-EVALUATE AFTER EACH STEP)

      // STEP 1: EXTRACTION
      if (currentStatus.needs_extraction) {
        const extractionResult = await this.executeExtraction(document);
        if (extractionResult.success) {
          completed_steps.push(extractionResult);
          total_tokens_used += extractionResult.tokens_used || 0;
          estimated_total_cost_usd += extractionResult.estimated_cost_usd || 0;

          // 🔄 RE-FETCH document status after successful extraction
          document = await DocumentsStore.getDocumentById(documentId);
          if (!document)
            throw new Error(
              `Document ${documentId} not found after extraction`
            );
        } else {
          failed_steps.push(extractionResult);
        }
      }

      // STEP 2: CLASSIFICATION - Re-evaluate after extraction
      const statusAfterExtraction = await this.analyzeCurrentStatus(document);
      if (effectiveTargetLevel >= 2 && statusAfterExtraction.can_classify) {
        console.log('🏷️ Starting classification step...');
        const classificationResult = await this.executeClassification(document);
        if (classificationResult.success) {
          completed_steps.push(classificationResult);
          total_tokens_used += classificationResult.tokens_used || 0;
          estimated_total_cost_usd +=
            classificationResult.estimated_cost_usd || 0;

          // 🔄 RE-FETCH document status after successful classification
          document = await DocumentsStore.getDocumentById(documentId);
          if (!document)
            throw new Error(
              `Document ${documentId} not found after classification`
            );
        } else {
          failed_steps.push(classificationResult);
        }
      }

      // STEP 3: METADATA - Re-evaluate after classification
      const statusAfterClassification = await this.analyzeCurrentStatus(
        document
      );
      if (
        effectiveTargetLevel >= 3 &&
        statusAfterClassification.can_extract_metadata
      ) {
        console.log('📋 Starting metadata extraction step...');
        const metadataResult = await this.executeMetadataExtraction(document);
        if (metadataResult.success) {
          completed_steps.push(metadataResult);
          total_tokens_used += metadataResult.tokens_used || 0;
          estimated_total_cost_usd += metadataResult.estimated_cost_usd || 0;

          // 🔄 RE-FETCH document status after successful metadata
          document = await DocumentsStore.getDocumentById(documentId);
          if (!document)
            throw new Error(`Document ${documentId} not found after metadata`);
        } else {
          failed_steps.push(metadataResult);
        }
      }

      // STEP 4: CHUNKING - Re-evaluate after metadata
      const statusAfterMetadata = await this.analyzeCurrentStatus(document);
      if (effectiveTargetLevel >= 4 && statusAfterMetadata.can_chunk) {
        console.log('🧩 Starting chunking step...');
        const chunkingResult = await this.executeChunking(document);
        if (chunkingResult.success) {
          completed_steps.push(chunkingResult);
          total_tokens_used += chunkingResult.tokens_used || 0;
          estimated_total_cost_usd += chunkingResult.estimated_cost_usd || 0;
        } else {
          failed_steps.push(chunkingResult);
        }
      }

      // 3. Update final costs and get final status
      await this.updateDocumentCosts(
        documentId,
        total_tokens_used,
        estimated_total_cost_usd
      );
      const final_status = await DocumentsStore.getPipelineStatus(documentId);

      const totalTime = Date.now() - startTime;

      return {
        document_id: documentId,
        success: failed_steps.length === 0,
        completed_steps,
        failed_steps,
        total_processing_time_ms: totalTime,
        total_tokens_used,
        estimated_total_cost_usd,
        final_status: final_status!,
        error:
          failed_steps.length > 0
            ? `${failed_steps.length} steps failed`
            : undefined,
      };
    } catch (error: any) {
      console.error(`❌ Pipeline execution failed:`, error);
      const totalTime = Date.now() - startTime;

      const final_status = await DocumentsStore.getPipelineStatus(documentId);

      return {
        document_id: documentId,
        success: false,
        completed_steps,
        failed_steps,
        total_processing_time_ms: totalTime,
        total_tokens_used,
        estimated_total_cost_usd,
        final_status: final_status || ({} as PipelineStatus),
        error: error.message,
      };
    }
  }

  // ===== ANALYZE CURRENT STATUS =====
  private async analyzeCurrentStatus(document: DocumentRecord): Promise<{
    needs_extraction: boolean;
    can_classify: boolean;
    can_extract_metadata: boolean;
    can_chunk: boolean;
  }> {
    return {
      needs_extraction: document.extraction_status !== 'completed',
      can_classify:
        document.extraction_status === 'completed' &&
        (!document.classification_status ||
          document.classification_status !== 'completed'),
      can_extract_metadata:
        document.extraction_status === 'completed' &&
        document.classification_status === 'completed' &&
        (!document.metadata_status || document.metadata_status !== 'completed'),
      can_chunk:
        document.extraction_status === 'completed' &&
        document.classification_status === 'completed' &&
        document.metadata_status === 'completed' &&
        (!document.chunking_status || document.chunking_status !== 'completed'),
    };
  }

  // ===== STEP 1: EXTRACTION =====
  private async executeExtraction(
    document: DocumentRecord
  ): Promise<PipelineStepResult> {
    const startTime = Date.now();
    console.log(`📄 Executing extraction for ${document.filename}`);

    try {
      // Update status to processing
      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'extraction',
        status: 'processing',
      });

      let extractionResult = null;
      let method: ExtractionMethod = 'pdf-parse';

      // Hybrid solution: Use external script to extract text (avoiding Next.js pdf-parse issues)
      console.log(
        '🔍 Using external script for PDF extraction (avoiding Next.js conflicts)...'
      );
      try {
        // Use external Node.js script that we know works
        const { execFile } = require('child_process');
        const { promisify } = require('util');
        const execFileAsync = promisify(execFile);

        console.log('🚀 Executing external extraction script...');
        const scriptPath = 'src/lib/ingesta/test/extract-document.js';

        const { stdout, stderr } = await execFileAsync(
          'node',
          [scriptPath, document.id],
          {
            timeout: 30000, // 30 segundos
            maxBuffer: 10 * 1024 * 1024, // 10MB
            cwd: process.cwd(),
          }
        );

        if (stderr) {
          console.warn('⚠️ External process stderr:', stderr);
        }

        console.log('✅ External script completed');

        // Parse the result from the external script
        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1];

        try {
          const result = JSON.parse(lastLine);
          if (result.success) {
            extractionResult = {
              success: true,
              text: 'TEXT_EXTRACTED_BY_EXTERNAL_SCRIPT', // Placeholder, actual text is in DB
              confidence: 0.95,
              method: 'external-script',
              metadata: {
                pages: result.pages || 0,
                length: result.textLength || 0,
                processingTime: 0,
              },
            };
            console.log(
              `✅ External extraction successful: ${result.textLength} characters`
            );
          } else {
            throw new Error(`External script failed: ${result.error}`);
          }
        } catch (parseError) {
          console.error(
            '❌ Failed to parse external script result:',
            parseError.message
          );
          console.log('Raw stdout:', stdout);
          throw new Error('External script returned invalid result');
        }
      } catch (error) {
        console.log('❌ External extraction failed:', error.message);
      }

      if (!extractionResult?.success) {
        throw new Error('All extraction methods failed');
      }

      // Update document with extracted text
      await this.updateDocumentWithExtractedText(
        document.id,
        extractionResult,
        method
      );

      // Update status to completed
      const processingTime = Date.now() - startTime;
      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'extraction',
        status: 'completed',
        processing_time_ms: processingTime,
        method: method,
      });

      console.log(`✅ Extraction completed in ${processingTime}ms`);

      return {
        step: 'extraction',
        success: true,
        processing_time_ms: processingTime,
        data: {
          text_length: extractionResult.text.length,
          method: method,
          confidence: extractionResult.metadata.confidence,
        },
      };
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Extraction failed:`, error);

      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'extraction',
        status: 'failed',
        error_message: error.message,
        processing_time_ms: processingTime,
      });

      return {
        step: 'extraction',
        success: false,
        processing_time_ms: processingTime,
        error: error.message,
      };
    }
  }

  // ===== STEP 2: CLASSIFICATION =====
  private async executeClassification(
    document: DocumentRecord
  ): Promise<PipelineStepResult> {
    const startTime = Date.now();
    console.log(`🏷️ Executing classification for ${document.filename}`);

    try {
      // Update status to processing
      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'classification',
        status: 'processing',
      });

      // Get extracted text
      const updatedDocument = await DocumentsStore.getDocument(document.id);
      if (!updatedDocument?.extracted_text) {
        throw new Error('No extracted text available for classification');
      }

      // Run classification
      const classifier = new DocumentClassifier();
      const classificationResult = await classifier.classify(
        updatedDocument.extracted_text,
        updatedDocument.filename
      );

      if (!classificationResult.success) {
        throw new Error('Classification failed');
      }

      // Check confidence threshold
      if (
        classificationResult.confidence <
        this.config.classification.confidence_threshold
      ) {
        console.log(
          `⚠️ Low confidence classification: ${classificationResult.confidence}`
        );
      }

      // Save classification to database
      await ClassificationStore.createClassification({
        document_id: document.id,
        organization_id: document.organization_id,
        document_type: classificationResult.document_type,
        confidence: classificationResult.confidence,
        classification_method: classificationResult.method,
        processing_time_ms: classificationResult.processing_time_ms,
        tokens_used: classificationResult.tokens_used,
        input_sample_length: updatedDocument.extracted_text.length,
        filename_analyzed: updatedDocument.filename,
        raw_response: classificationResult.raw_response,
      });

      // Update status to completed
      const processingTime = Date.now() - startTime;
      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'classification',
        status: 'completed',
        processing_time_ms: processingTime,
        tokens_used: classificationResult.tokens_used,
      });

      console.log(
        `✅ Classification completed: ${classificationResult.document_type} (${classificationResult.confidence})`
      );

      return {
        step: 'classification',
        success: true,
        processing_time_ms: processingTime,
        tokens_used: classificationResult.tokens_used,
        estimated_cost_usd: classificationResult.estimated_cost_usd,
        confidence: classificationResult.confidence,
        data: {
          document_type: classificationResult.document_type,
          method: classificationResult.method,
        },
      };
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Classification failed:`, error);

      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'classification',
        status: 'failed',
        error_message: error.message,
        processing_time_ms: processingTime,
      });

      return {
        step: 'classification',
        success: false,
        processing_time_ms: processingTime,
        error: error.message,
      };
    }
  }

  // ===== STEP 3: METADATA EXTRACTION =====
  private async executeMetadataExtraction(
    document: DocumentRecord
  ): Promise<PipelineStepResult> {
    const startTime = Date.now();
    console.log(`📊 Executing metadata extraction for ${document.filename}`);

    try {
      // Update status to processing
      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'metadata',
        status: 'processing',
      });

      // Get current classification
      const classification = await ClassificationStore.getCurrentClassification(
        document.id
      );
      if (!classification) {
        throw new Error('No classification available for metadata extraction');
      }

      // Get extracted text
      const updatedDocument = await DocumentsStore.getDocument(document.id);
      if (!updatedDocument?.extracted_text) {
        throw new Error('No extracted text available for metadata extraction');
      }

      let metadataResult = null;

      // Choose extractor based on document type
      if (
        classification.document_type === 'acta' &&
        this.config.metadata.enabled_contracts.includes('acta')
      ) {
        const actaExtractor = new ActaMetadataExtractor();
        metadataResult = await actaExtractor.extractMetadata(
          updatedDocument.extracted_text,
          updatedDocument.filename,
          { community_id: updatedDocument.community_id || '' } // TODO: Handle community_id properly
        );
      }

      if (!metadataResult?.success) {
        throw new Error(
          `No metadata extractor available for document type: ${classification.document_type}`
        );
      }

      // Check confidence threshold
      if (
        metadataResult.confidence < this.config.metadata.confidence_threshold
      ) {
        console.log(
          `⚠️ Low confidence metadata extraction: ${metadataResult.confidence}`
        );
      }

      // Save metadata to database
      await MetadataStore.createMetadata({
        document_id: document.id,
        organization_id: document.organization_id,
        metadata: metadataResult.metadata,
        confidence: metadataResult.confidence,
        extraction_method: 'gemini',
        processing_time_ms: metadataResult.processing_time_ms,
        tokens_used: metadataResult.tokens_used,
        validation_status: metadataResult.validation_status || 'valid',
        validation_errors: metadataResult.validation_errors,
        validation_warnings: metadataResult.validation_warnings,
        input_sample_length: updatedDocument.extracted_text.length,
        filename_analyzed: updatedDocument.filename,
        raw_response: metadataResult.raw_response,
      });

      // Update status to completed
      const processingTime = Date.now() - startTime;
      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'metadata',
        status: 'completed',
        processing_time_ms: processingTime,
        tokens_used: metadataResult.tokens_used,
      });

      console.log(
        `✅ Metadata extraction completed with confidence: ${metadataResult.confidence}`
      );

      return {
        step: 'metadata',
        success: true,
        processing_time_ms: processingTime,
        tokens_used: metadataResult.tokens_used,
        estimated_cost_usd: metadataResult.estimated_cost_usd,
        confidence: metadataResult.confidence,
        data: {
          fields_extracted: Object.keys(metadataResult.metadata).length,
          validation_status: metadataResult.validation_status,
        },
      };
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Metadata extraction failed:`, error);

      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'metadata',
        status: 'failed',
        error_message: error.message,
        processing_time_ms: processingTime,
      });

      return {
        step: 'metadata',
        success: false,
        processing_time_ms: processingTime,
        error: error.message,
      };
    }
  }

  // ===== STEP 4: CHUNKING =====
  private async executeChunking(
    document: DocumentRecord
  ): Promise<PipelineStepResult> {
    const startTime = Date.now();
    console.log(`🧩 Executing chunking for ${document.filename}`);

    try {
      // Update status to processing
      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'chunking',
        status: 'processing',
      });

      // Get extracted text
      const updatedDocument = await DocumentsStore.getDocument(document.id);
      if (!updatedDocument?.extracted_text) {
        throw new Error('No extracted text available for chunking');
      }

      // Simple chunking implementation (placeholder)
      // TODO: Implement proper chunking based on document type and method
      const text = updatedDocument.extracted_text;
      const chunkSize = this.config.chunking.chunk_size;
      const overlap = this.config.chunking.overlap;

      const chunks: string[] = [];
      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        const chunk = text.slice(i, i + chunkSize);
        if (chunk.trim().length > 50) {
          // Skip very small chunks
          chunks.push(chunk.trim());
        }
      }

      // Save chunks to database
      let totalTokensUsed = 0;
      for (let i = 0; i < chunks.length; i++) {
        await ChunkStore.createChunk({
          document_id: document.id,
          organization_id: document.organization_id,
          chunk_number: i + 1,
          chunk_type: 'content',
          content: chunks[i],
          chunking_method: this.config.chunking.method,
          quality_score: 0.8, // Placeholder quality score
          chunking_config: {
            chunk_size: chunkSize,
            overlap: overlap,
            method: this.config.chunking.method,
          },
        });
      }

      // Update status to completed
      const processingTime = Date.now() - startTime;
      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'chunking',
        status: 'completed',
        processing_time_ms: processingTime,
        tokens_used: totalTokensUsed,
      });

      console.log(`✅ Chunking completed: ${chunks.length} chunks created`);

      return {
        step: 'chunking',
        success: true,
        processing_time_ms: processingTime,
        tokens_used: totalTokensUsed,
        data: {
          chunks_created: chunks.length,
          avg_chunk_size:
            chunks.reduce((sum, chunk) => sum + chunk.length, 0) /
            chunks.length,
        },
      };
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Chunking failed:`, error);

      await DocumentsStore.updateProcessingStatus({
        document_id: document.id,
        step: 'chunking',
        status: 'failed',
        error_message: error.message,
        processing_time_ms: processingTime,
      });

      return {
        step: 'chunking',
        success: false,
        processing_time_ms: processingTime,
        error: error.message,
      };
    }
  }

  // ===== HELPER METHODS =====

  private async updateDocumentWithExtractedText(
    documentId: string,
    extractionResult: any,
    method: ExtractionMethod
  ): Promise<void> {
    // Update document with extracted text and metadata
    // Note: This would typically use a direct SQL update for better performance
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from('documents')
      .update({
        extracted_text: extractionResult.text,
        text_length: extractionResult.text.length,
        page_count: extractionResult.metadata.pages,
        extraction_method: method,
      })
      .eq('id', documentId);

    if (error) {
      throw new Error(
        `Failed to update document with extracted text: ${error.message}`
      );
    }
  }

  private async updateDocumentCosts(
    documentId: string,
    totalTokens: number,
    totalCostUsd: number
  ): Promise<void> {
    const supabase = await createSupabaseClient();
    await supabase
      .from('documents')
      .update({
        total_tokens_used: totalTokens,
        estimated_cost_usd: totalCostUsd,
        processing_completed_at: new Date().toISOString(),
      })
      .eq('id', documentId);
  }

  // ===== RESUME PROCESSING =====
  async resumeProcessing(
    organizationId: string,
    targetLevel?: ProcessingLevel
  ): Promise<PipelineExecutionResult[]> {
    console.log(`🔄 Resuming processing for organization ${organizationId}`);

    const documentsNeedingProcessing =
      await DocumentsStore.getDocumentsNeedingProcessing(
        organizationId,
        targetLevel
      );

    console.log(
      `📋 Found ${documentsNeedingProcessing.length} documents needing processing`
    );

    const results: PipelineExecutionResult[] = [];

    for (const doc of documentsNeedingProcessing) {
      console.log(
        `🔄 Processing document: ${doc.filename} (${doc.current_status})`
      );
      const result = await this.processDocument(
        doc.id,
        targetLevel,
        organizationId
      );
      results.push(result);
    }

    return results;
  }

  // ===== BATCH PROCESSING =====
  async processBatch(
    documentIds: string[],
    targetLevel?: ProcessingLevel
  ): Promise<PipelineExecutionResult[]> {
    console.log(`📦 Processing batch of ${documentIds.length} documents`);

    const results: PipelineExecutionResult[] = [];

    // Process documents in parallel (but limit concurrency)
    const BATCH_SIZE = 3;
    for (let i = 0; i < documentIds.length; i += BATCH_SIZE) {
      const batch = documentIds.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((id) =>
        this.processDocument(id, targetLevel)
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }
}

// ===============================================================================
// EXPORTS
// ===============================================================================

export default ProgressivePipeline;

export type { PipelineConfig, PipelineExecutionResult, PipelineStepResult };

// Supabase client is created inline where needed using @/supabase-clients/server
