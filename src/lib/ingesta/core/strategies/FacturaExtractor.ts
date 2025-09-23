/**
 * ARCHIVO: FacturaExtractor.ts
 * PROPÓSITO: Estrategia de extracción específica para documentos de tipo Factura
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, saasAgents
 * OUTPUTS: Procesamiento de metadatos para Facturas
 * ACTUALIZADO: 2025-09-21
 */

import { BaseDocumentExtractor, DocumentMetadata } from './BaseDocumentExtractor';

export class FacturaExtractor extends BaseDocumentExtractor {
  constructor() {
    super({
      agentName: 'factura_extractor_v2',
      saveFunctionName: 'saveExtractedInvoice',
      documentType: 'factura'
    });
  }

  async processMetadata(documentId: string, extractedText: string): Promise<DocumentMetadata> {
    this.logStart('factura');
    
    try {
      // Import our validated agent system
      console.log('📦 [DEBUG] Importing saasAgents functions...');
      const { callSaaSAgent, saveExtractedInvoice } = await import('@/lib/gemini/saasAgents');
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

        // Save extracted data to extracted_invoices table
        this.logSaveAttempt('extracted_invoices');
        
        const saveSuccess = await saveExtractedInvoice(documentId, agentResult.data);
        
        if (saveSuccess) {
          console.log('✅ [DEBUG] Data saved successfully to extracted_invoices table');
          console.log('🎯 [DEBUG] === FACTURA PROCESSING COMPLETED SUCCESSFULLY ===\n');
          
          return {
            success: true,
            data: agentResult.data
          };
        } else {
          throw new Error('Failed to save extracted factura data to database');
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