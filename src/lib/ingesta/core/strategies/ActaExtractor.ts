/**
 * ARCHIVO: ActaExtractor.ts
 * PROPÓSITO: Estrategia de extracción específica para documentos de tipo Acta
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, saasAgents
 * OUTPUTS: Procesamiento de metadatos para Actas
 * ACTUALIZADO: 2025-09-21
 */

import { BaseDocumentExtractor, DocumentMetadata } from './BaseDocumentExtractor';

export class ActaExtractor extends BaseDocumentExtractor {
  constructor() {
    super({
      agentName: 'acta_extractor_v2',
      saveFunctionName: 'saveExtractedMinute',
      documentType: 'acta'
    });
  }

  async processMetadata(documentId: string, extractedText: string): Promise<DocumentMetadata> {
    this.logStart('acta');
    
    try {
      // Import our validated agent system
      console.log('📦 [DEBUG] Importing saasAgents functions...');
      const { callSaaSAgent, saveExtractedMinutes } = await import('@/lib/gemini/saasAgents');
      console.log('✅ [DEBUG] saasAgents imported successfully');
      
      this.logTextAnalysis(extractedText);
      
      const startTime = Date.now();
      this.logAgentCall(this.config.agentName);
      
      const agentResult = await callSaaSAgent(this.config.agentName, {
        document_text: extractedText
      });
      
      const processingTime = Date.now() - startTime;
      this.logAgentResult(agentResult, processingTime);

      if (agentResult.success && agentResult.data) {
        this.logSuccess(this.config.agentName, agentResult.data);

        // Save extracted data to extracted_minutes table
        this.logSaveAttempt('extracted_minutes');
        
        const saveSuccess = await saveExtractedMinutes(documentId, agentResult.data);
        
        if (saveSuccess) {
          console.log('✅ [DEBUG] Data saved successfully to extracted_minutes table');
          console.log('🎯 [DEBUG] === ACTA PROCESSING COMPLETED SUCCESSFULLY ===\n');
          
          return {
            success: true,
            data: agentResult.data
          };
        } else {
          throw new Error('Failed to save extracted acta data to database');
        }
      } else {
        throw new Error(`${this.config.agentName} agent failed: ${agentResult.error || 'Unknown error'}`);
      }
    } catch (agentError) {
      const errorMsg = `❌ ${this.config.agentName.toUpperCase()} ERROR: ${agentError instanceof Error ? agentError.message : 'Error desconocido'}`;
      console.error(errorMsg);
      
      return {
        success: false,
        error: agentError instanceof Error ? agentError.message : 'Unknown error'
      };
    }
  }
}