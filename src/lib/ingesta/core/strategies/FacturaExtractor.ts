/**
 * ARCHIVO: FacturaExtractor.ts
 * PROPÓSITO: Extractor específico para documentos tipo Factura Comercial
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, AgentOrchestrator
 * OUTPUTS: Datos estructurados de factura
 * ACTUALIZADO: 2025-09-27
 */

import { BaseDocumentExtractor, ExtractionResult } from './BaseDocumentExtractor';
import { callSaaSAgent } from '@/lib/agents/AgentOrchestrator';

export class FacturaExtractor extends BaseDocumentExtractor {
  getDocumentType(): string {
    return 'factura';
  }

  getAgentName(): string {
    return 'factura_extractor_v2';
  }

  async extractData(content: string): Promise<ExtractionResult> {
    try {
      console.log(`[FacturaExtractor] Extrayendo datos de ${this.getDocumentType()}...`);
      
      const inputs = {
        document_content: content,
        document_type: 'factura',
        extraction_mode: 'complete'
      };

      const agentResponse = await callSaaSAgent(this.getAgentName(), inputs);
      
      if (!agentResponse.success) {
        console.error(`[FacturaExtractor] Error del agente:`, agentResponse.error);
        return {
          success: false,
          error: agentResponse.error || 'Error desconocido del agente',
          data: null,
          processingTime: agentResponse.processingTime || 0
        };
      }

      // Validar estructura de datos esperada
      const extractedData = agentResponse.data;
      if (!this.validateExtractedData(extractedData)) {
        return {
          success: false,
          error: 'Datos extraídos no cumplen estructura esperada',
          data: null,
          processingTime: agentResponse.processingTime || 0
        };
      }

      console.log(`[FacturaExtractor] Extracción exitosa en ${agentResponse.processingTime}ms`);
      
      return {
        success: true,
        data: extractedData,
        processingTime: agentResponse.processingTime || 0,
        tokensUsed: agentResponse.tokensUsed || 0
      };

    } catch (error) {
      console.error(`[FacturaExtractor] Error durante extracción:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        data: null,
        processingTime: 0
      };
    }
  }

  private validateExtractedData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // Validar campos obligatorios según schema
    const requiredFields = ['provider_name', 'client_name', 'amount', 'invoice_date'];
    
    return requiredFields.every(field => data.hasOwnProperty(field));
  }
}