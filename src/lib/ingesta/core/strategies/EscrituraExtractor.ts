/**
 * ARCHIVO: EscrituraExtractor.ts
 * PROPÓSITO: Estrategia de extracción específica para documentos de tipo Escritura de Compraventa
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, saasAgents
 * OUTPUTS: Procesamiento de metadatos para Escrituras
 * ACTUALIZADO: 2025-09-22
 */

import { BaseDocumentExtractor, DocumentMetadata } from './BaseDocumentExtractor';

export class EscrituraExtractor extends BaseDocumentExtractor {
  constructor() {
    super({
      agentName: 'escritura_extractor_v1',
      saveFunctionName: 'saveExtractedPropertyDeed',
      documentType: 'escritura'
    });
  }

  async processMetadata(documentId: string, extractedText: string, testMode: boolean = false): Promise<DocumentMetadata> {
    this.logStart('escritura');
    
    try {
      // Import our validated agent system
      console.log('📦 [DEBUG] Importing saasAgents functions...');
      const { callSaaSAgent, saveExtractedPropertyDeed } = await import('@/lib/gemini/saasAgents');
      console.log('✅ [DEBUG] saasAgents imported successfully');
      
      this.logTextAnalysis(extractedText);
      
      const startTime = Date.now();
      this.logAgentCall(this.config.agentName);
      
      const agentResult = await callSaaSAgent(this.config.agentName, {
        document_text: extractedText
      }, true); // Use service client for tests
      
      const processingTime = Date.now() - startTime;
      this.logAgentResult(agentResult, processingTime);

      if (agentResult.success && agentResult.data) {
        this.logSuccess(this.config.agentName, agentResult.data);

        // En modo test, no guardamos en BD
        if (testMode) {
          console.log('🧪 [DEBUG] Test mode - skipping database save');
          console.log('🎯 [DEBUG] === ESCRITURA PROCESSING COMPLETED (TEST MODE) ===\n');
          
          return {
            success: true,
            data: agentResult.data
          };
        }

        // Guardar en base de datos
        const saveStartTime = Date.now();
        console.log('💾 [DEBUG] Saving extracted property deed data to database...');
        
        const savedData = await saveExtractedPropertyDeed(documentId, agentResult.data);
        
        const saveTime = Date.now() - saveStartTime;
        console.log(`✅ [DEBUG] Property deed data saved in ${saveTime}ms`);
        console.log('🎯 [DEBUG] === ESCRITURA PROCESSING COMPLETED ===\n');
        
        return {
          success: true,
          data: savedData
        };
      } else {
        console.error('❌ [ERROR] Escritura agent failed:', agentResult.error);
        return {
          success: false,
          error: agentResult.error || `Agent ${this.config.agentName} failed to extract metadata`
        };
      }
    } catch (error) {
      console.error('❌ [ERROR] Exception in EscrituraExtractor:', error);
      return {
        success: false,
        error: `EscrituraExtractor processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}