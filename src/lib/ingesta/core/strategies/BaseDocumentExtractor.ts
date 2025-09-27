/**
 * ARCHIVO: BaseDocumentExtractor.ts
 * PROPÓSITO: Interfaz base para estrategias de extracción de documentos
 * ESTADO: development
 * DEPENDENCIAS: ninguna
 * OUTPUTS: Interfaz base para Strategy pattern
 * ACTUALIZADO: 2025-09-21
 */

export interface DocumentMetadata {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ExtractionResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export interface DocumentExtractionConfig {
  agentName: string;
  saveFunctionName: string;
  documentType: string;
}

export abstract class BaseDocumentExtractor {
  protected config: DocumentExtractionConfig;

  constructor(config: DocumentExtractionConfig) {
    this.config = config;
  }

  /**
   * Procesa los metadatos del documento usando el agente específico
   */
  abstract processMetadata(documentId: string, extractedText: string, testMode?: boolean): Promise<DocumentMetadata>;

  /**
   * Obtiene la configuración del extractor
   */
  getConfig(): DocumentExtractionConfig {
    return this.config;
  }

  /**
   * Logging común para todos los extractores
   */
  protected logStart(documentType: string): void {
    console.log(`\n🤖 [DEBUG] === PROCESSING ${documentType.toUpperCase()} WITH AGENT ===`);
    console.log(`🤖 [DEBUG] Using VALIDATED ${this.config.agentName} agent for ${documentType.toUpperCase()} metadata...`);
  }

  protected logTextAnalysis(text: string): void {
    console.log('📝 [DEBUG] Text to analyze length:', text.length);
    console.log('📝 [DEBUG] Text preview (first 200 chars):', text.substring(0, 200));
  }

  protected logAgentCall(agentName: string): void {
    console.log(`🚀 [DEBUG] Calling ${agentName} agent...`);
  }

  protected logAgentResult(result: any, processingTime: number): void {
    console.log(`⏱️ [DEBUG] Agent call completed in ${processingTime}ms`);
    console.log('📊 [DEBUG] Agent result:', {
      success: result.success,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : null,
      error: result.error
    });
  }

  protected logSuccess(agentName: string, data: any): void {
    console.log(`✅ [DEBUG] ${agentName} extraction successful!`);
    console.log('📋 [DEBUG] Extracted data preview:', JSON.stringify(data, null, 2));
  }

  protected logSaveAttempt(tableName: string): void {
    console.log(`💾 [DEBUG] Saving extracted data to ${tableName} table...`);
  }
}