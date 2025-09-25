/**
 * ARCHIVO: AlbaranExtractor.ts
 * PROPÓSITO: Extractor específico para documentos tipo Albarán de Entrega
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, AgentOrchestrator
 * OUTPUTS: Datos estructurados de albaran
 * ACTUALIZADO: 2025-09-24
 */

import { BaseDocumentExtractor, ExtractionResult } from './BaseDocumentExtractor';
import { callSaaSAgent } from '@/lib/agents/AgentOrchestrator';

export class AlbaranExtractor extends BaseDocumentExtractor {
  getDocumentType(): string {
    return 'albaran';
  }

  getAgentName(): string {
    return 'albaran_extractor_v1';
  }

  async extractData(content: string): Promise<ExtractionResult> {
    try {
      console.log(`[AlbaranExtractor] Extrayendo datos de ${this.getDocumentType()}...`);
      
      const inputs = {
        document_content: content,
        document_type: 'albaran',
        extraction_mode: 'complete'
      };

      const agentResponse = await callSaaSAgent(this.getAgentName(), inputs);
      
      if (!agentResponse.success) {
        console.error(`[AlbaranExtractor] Error del agente:`, agentResponse.error);
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

      console.log(`[AlbaranExtractor] Extracción exitosa en ${agentResponse.processingTime}ms`);
      
      return {
        success: true,
        data: extractedData,
        processingTime: agentResponse.processingTime || 0,
        tokensUsed: agentResponse.tokensUsed || 0
      };

    } catch (error) {
      console.error(`[AlbaranExtractor] Error durante extracción:`, error);
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
    const requiredFields = ['emisor_name', 'receptor_name', 'numero_albaran', 'fecha_emision'];
    
    return requiredFields.every(field => data.hasOwnProperty(field));
  }
}