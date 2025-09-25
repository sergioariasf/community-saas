/**
 * ARCHIVO: ContratoExtractor.ts
 * PROPÓSITO: Extractor específico para documentos tipo Contrato Legal
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, AgentOrchestrator
 * OUTPUTS: Datos estructurados de contrato
 * ACTUALIZADO: 2025-09-24
 */

import { BaseDocumentExtractor, ExtractionResult } from './BaseDocumentExtractor';
import { callSaaSAgent } from '@/lib/agents/AgentOrchestrator';

export class ContratoExtractor extends BaseDocumentExtractor {
  getDocumentType(): string {
    return 'contrato';
  }

  getAgentName(): string {
    return 'contrato_extractor_v1';
  }

  async extractData(content: string): Promise<ExtractionResult> {
    try {
      console.log(`[ContratoExtractor] Extrayendo datos de ${this.getDocumentType()}...`);
      
      const inputs = {
        document_content: content,
        document_type: 'contrato',
        extraction_mode: 'complete'
      };

      const agentResponse = await callSaaSAgent(this.getAgentName(), inputs);
      
      if (!agentResponse.success) {
        console.error(`[ContratoExtractor] Error del agente:`, agentResponse.error);
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

      console.log(`[ContratoExtractor] Extracción exitosa en ${agentResponse.processingTime}ms`);
      
      return {
        success: true,
        data: extractedData,
        processingTime: agentResponse.processingTime || 0,
        tokensUsed: agentResponse.tokensUsed || 0
      };

    } catch (error) {
      console.error(`[ContratoExtractor] Error durante extracción:`, error);
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
    const requiredFields = ['titulo_contrato', 'parte_a', 'parte_b', 'objeto_contrato'];
    
    return requiredFields.every(field => data.hasOwnProperty(field));
  }
}