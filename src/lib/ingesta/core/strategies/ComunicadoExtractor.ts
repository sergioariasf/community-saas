/**
 * ARCHIVO: ComunicadoExtractor.ts
 * PROPÓSITO: Extractor específico para documentos tipo Comunicado Vecinal
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, AgentOrchestrator
 * OUTPUTS: Datos estructurados de comunicado
 * ACTUALIZADO: 2025-09-27
 */

import { BaseDocumentExtractor, ExtractionResult } from './BaseDocumentExtractor';
import { callSaaSAgent } from '@/lib/agents/AgentOrchestrator';

export class ComunicadoExtractor extends BaseDocumentExtractor {
  getDocumentType(): string {
    return 'comunicado';
  }

  getAgentName(): string {
    return 'comunicado_extractor_v1';
  }

  async extractData(content: string): Promise<ExtractionResult> {
    try {
      console.log(`[ComunicadoExtractor] Extrayendo datos de ${this.getDocumentType()}...`);
      
      const inputs = {
        document_content: content,
        document_type: 'comunicado',
        extraction_mode: 'complete'
      };

      const agentResponse = await callSaaSAgent(this.getAgentName(), inputs);
      
      if (!agentResponse.success) {
        console.error(`[ComunicadoExtractor] Error del agente:`, agentResponse.error);
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

      console.log(`[ComunicadoExtractor] Extracción exitosa en ${agentResponse.processingTime}ms`);
      
      return {
        success: true,
        data: extractedData,
        processingTime: agentResponse.processingTime || 0,
        tokensUsed: agentResponse.tokensUsed || 0
      };

    } catch (error) {
      console.error(`[ComunicadoExtractor] Error durante extracción:`, error);
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
    const requiredFields = ['fecha', 'comunidad', 'remitente', 'resumen'];
    
    return requiredFields.every(field => data.hasOwnProperty(field));
  }
}