/**
 * ARCHIVO: MultiDocumentCoordinator.ts
 * PROPÓSITO: Coordinar procesamiento multidocumento SIN dependencias de base de datos
 * ESTADO: development
 * DEPENDENCIAS: Solo tipos y utilidades puras
 * OUTPUTS: Orchestración pura de procesamiento
 * ACTUALIZADO: 2025-09-28
 */

export interface SeparatedDocument {
  id: string;
  type: string;
  suggestedTitle: string;
  textFragment: string;
  startLine: number;
  endLine: number;
  confidence: number;
  isSupportedByPipeline: boolean;
  metadata?: Record<string, any>;
}

export interface ProcessingConfig {
  processingLevel: 'extract' | 'classify' | 'metadata' | 'chunks';
  communityId: string;
  originalFilename: string;
  extractedText: string;
  timeout?: number;
  batchSize?: number;
}

export interface ProcessingResult {
  documentId: string;
  success: boolean;
  stages: string[];
  error?: string;
  processingTimeMs: number;
  extractedData?: any;
}

export interface BatchProcessingReport {
  totalDocuments: number;
  processedSuccessfully: number;
  failed: number;
  results: ProcessingResult[];
  totalTimeMs: number;
  errors: string[];
}

/**
 * COORDINADOR PURO - Sin dependencias de base de datos
 * Responsabilidad: Orquestar el flujo de procesamiento
 */
export class MultiDocumentCoordinator {
  
  /**
   * Procesar lote de documentos separados
   * PURO - No toca base de datos, solo coordina
   */
  async processBatch(
    documents: SeparatedDocument[],
    config: ProcessingConfig,
    processorCallback: (doc: SeparatedDocument, config: ProcessingConfig) => Promise<ProcessingResult>
  ): Promise<BatchProcessingReport> {
    
    const startTime = Date.now();
    const results: ProcessingResult[] = [];
    const errors: string[] = [];
    
    console.log(`🎭 [COORDINATOR] Processing batch of ${documents.length} documents`);
    console.log(`⚙️ [COORDINATOR] Level: ${config.processingLevel}`);
    
    // Filtrar solo documentos soportados
    const supportedDocuments = documents.filter(doc => doc.isSupportedByPipeline);
    
    if (supportedDocuments.length === 0) {
      throw new Error('No supported documents to process');
    }
    
    console.log(`📊 [COORDINATOR] Processing ${supportedDocuments.length}/${documents.length} supported documents`);
    
    // Procesar en lotes para evitar sobrecarga
    const batchSize = config.batchSize || 3;
    const batches = this.createBatches(supportedDocuments, batchSize);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 [COORDINATOR] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} documents)`);
      
      // Procesar lote en paralelo
      const batchPromises = batch.map(async (doc, index) => {
        try {
          console.log(`📄 [COORDINATOR] Processing document ${index + 1}: ${doc.type} - ${doc.suggestedTitle}`);
          
          const result = await processorCallback(doc, config);
          console.log(`✅ [COORDINATOR] Document ${result.documentId} processed successfully`);
          
          return result;
          
        } catch (docError) {
          const errorMsg = `Error processing document ${doc.id}: ${docError instanceof Error ? docError.message : 'Unknown error'}`;
          console.error(`❌ [COORDINATOR] ${errorMsg}`);
          errors.push(errorMsg);
          
          return {
            documentId: doc.id,
            success: false,
            stages: [],
            error: errorMsg,
            processingTimeMs: 0
          } as ProcessingResult;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Pausa entre lotes para no sobrecargar
      if (batchIndex < batches.length - 1) {
        await this.delay(1000);
      }
    }
    
    const totalTimeMs = Date.now() - startTime;
    const processedSuccessfully = results.filter(r => r.success).length;
    
    const report: BatchProcessingReport = {
      totalDocuments: documents.length,
      processedSuccessfully,
      failed: results.length - processedSuccessfully,
      results,
      totalTimeMs,
      errors
    };
    
    console.log(`🏁 [COORDINATOR] Batch processing completed:`, {
      processed: processedSuccessfully,
      failed: report.failed,
      totalTime: `${totalTimeMs}ms`
    });
    
    return report;
  }
  
  /**
   * Validar configuración antes del procesamiento
   */
  validateConfig(config: ProcessingConfig): string[] {
    const errors: string[] = [];
    
    if (!config.communityId) {
      errors.push('communityId is required');
    }
    
    if (!config.originalFilename) {
      errors.push('originalFilename is required');
    }
    
    if (!config.extractedText) {
      errors.push('extractedText is required');
    }
    
    if (!['extract', 'classify', 'metadata', 'chunks'].includes(config.processingLevel)) {
      errors.push('processingLevel must be one of: extract, classify, metadata, chunks');
    }
    
    return errors;
  }
  
  /**
   * Preparar texto de documento individual
   */
  prepareDocumentText(doc: SeparatedDocument, config: ProcessingConfig): string {
    if (doc.textFragment) {
      return doc.textFragment;
    }
    
    // Extraer texto usando líneas de referencia
    const lines = config.extractedText.split('\n');
    const documentLines = lines.slice(doc.startLine - 1, doc.endLine);
    return documentLines.join('\n');
  }
  
  /**
   * Generar nombre de archivo único para documento separado
   */
  generateDocumentFilename(doc: SeparatedDocument, index: number, config: ProcessingConfig): string {
    const timestamp = Date.now();
    const safeTitle = doc.suggestedTitle
      .replace(/[^a-zA-Z0-9\s\-\_]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    return `separated_${index + 1}_${doc.type}_${safeTitle}_${timestamp}.txt`;
  }
  
  /**
   * Crear lotes de documentos para procesamiento
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
  
  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Calcular estadísticas del procesamiento
   */
  calculateStats(report: BatchProcessingReport) {
    const avgProcessingTime = report.results.length > 0 
      ? report.results.reduce((sum, r) => sum + r.processingTimeMs, 0) / report.results.length 
      : 0;
    
    const successRate = report.totalDocuments > 0 
      ? (report.processedSuccessfully / report.totalDocuments) * 100 
      : 0;
    
    return {
      successRate: Math.round(successRate * 100) / 100,
      avgProcessingTimeMs: Math.round(avgProcessingTime),
      documentsPerSecond: report.totalTimeMs > 0 
        ? Math.round((report.processedSuccessfully / report.totalTimeMs) * 1000 * 100) / 100 
        : 0
    };
  }
}