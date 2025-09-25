/**
 * ARCHIVO: GeminiFlashExtractor.ts
 * PROPÓSITO: Extractor TODO-EN-UNO usando Gemini Flash para OCR + Classification + Metadata
 * ESTADO: development
 * DEPENDENCIAS: BaseTextExtractor, saasAgents
 * OUTPUTS: Procesamiento completo directo a BD (bypass pipeline normal)
 * ACTUALIZADO: 2025-09-21
 */

import { BaseTextExtractor, ExtractionResult, ExtractionContext } from './BaseTextExtractor.ts';

export interface GeminiAllInOneResult extends ExtractionResult {
  allInOneComplete?: boolean;
  documentType?: string;
  extractedMetadata?: any;
  skipPipeline?: boolean;
}

export class GeminiFlashExtractor extends BaseTextExtractor {
  private maxPages: number = 5; // Límite para Gemini Flash
  
  constructor() {
    super('gemini-flash-ocr-ia');
  }

  /**
   * Verifica si este extractor puede manejar el contexto
   */
  canHandle(context: ExtractionContext): boolean {
    // Solo para documentos pequeños cuando otras estrategias fallan
    const maxPagesAllowed = context.maxPages || this.maxPages;
    return (context.buffer.length / 1024 / 1024) < 10; // < 10MB aproximadamente ≤ 5 páginas
  }

  /**
   * Prioridad más baja (último recurso)
   */
  getPriority(): number {
    return 3;
  }

  /**
   * Extrae texto + clasifica + extrae metadata en una sola llamada
   */
  async extract(context: ExtractionContext): Promise<GeminiAllInOneResult> {
    this.log('info', 'Starting Gemini Flash OCR IA TODO-EN-UNO processing...');
    const startTime = Date.now();

    try {
      // Verificar límite de páginas
      if (!this.validatePageLimit(context)) {
        return this.createErrorResult(
          `Document too large for Gemini Flash (max ${this.maxPages} pages)`,
          'gemini-flash-ocr-ia'
        ) as GeminiAllInOneResult;
      }

      // Llamar al agente TODO-EN-UNO
      const result = await this.processAllInOne(context);
      const processingTime = `${Date.now() - startTime}ms`;

      if (result.success) {
        this.log('success', `Gemini Flash TODO-EN-UNO completed in ${processingTime}`);
        
        return {
          ...result,
          processingTime,
          allInOneComplete: true,
          skipPipeline: true,
          method: 'gemini-flash-ocr-ia-all-in-one'
        };
      } else {
        return this.createErrorResult(
          result.error || 'Gemini Flash OCR IA failed',
          'gemini-flash-ocr-ia'
        ) as GeminiAllInOneResult;
      }

    } catch (error) {
      return this.createErrorResult(error, 'gemini-flash-ocr-ia') as GeminiAllInOneResult;
    }
  }

  /**
   * Procesa OCR + Classification + Metadata en una sola llamada a Gemini
   */
  private async processAllInOne(context: ExtractionContext): Promise<GeminiAllInOneResult> {
    this.log('info', 'Calling Gemini Flash for complete document processing...');

    try {
      // Importar saasAgents dinámicamente
      const { callSaaSAgent } = await import('@/lib/gemini/saasAgents');
      
      // Buscar agente TODO-EN-UNO en BD
      const classifier = await this.getAllInOneAgent();
      if (!classifier) {
        return {
          success: false,
          method: 'gemini-flash-ocr-ia',
          error: 'No all-in-one classifier agent found in database'
        };
      }

      this.log('info', `Found all-in-one agent: ${classifier.name}`);

      // Preparar input para el agente
      const agentInput = {
        filename: context.filename,
        document_id: context.documentId,
        buffer_size: context.buffer.length,
        instruction: 'Perform OCR + Classification + Metadata extraction in one call'
      };

      // Llamar al agente con el PDF buffer
      this.log('info', 'Calling Gemini Flash agent...');
      const agentResult = await callSaaSAgent(classifier.name, agentInput, context.buffer);

      if (agentResult.success && agentResult.data) {
        // El agente debe retornar: text, documentType, metadata
        const { text, document_type, extracted_metadata } = agentResult.data;

        if (text && document_type && extracted_metadata) {
          // Guardar directamente en la BD
          await this.saveDirectToDatabase(context.documentId, document_type, extracted_metadata);

          return {
            success: true,
            text,
            textLength: text.length,
            method: 'gemini-flash-ocr-ia-all-in-one',
            documentType: document_type,
            extractedMetadata: extracted_metadata,
            allInOneComplete: true
          };
        } else {
          return {
            success: false,
            method: 'gemini-flash-ocr-ia',
            error: 'Incomplete response from Gemini Flash agent'
          };
        }
      } else {
        return {
          success: false,
          method: 'gemini-flash-ocr-ia',
          error: agentResult.error || 'Gemini Flash agent call failed'
        };
      }

    } catch (error) {
      this.log('error', `All-in-one processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        method: 'gemini-flash-ocr-ia',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Valida que el documento no exceda el límite de páginas
   */
  private validatePageLimit(context: ExtractionContext): boolean {
    // Estimación aproximada: 1MB ≈ 1 página PDF
    const estimatedPages = Math.ceil(context.buffer.length / (1024 * 1024));
    const maxPages = context.maxPages || this.maxPages;
    
    this.log('info', `Estimated pages: ${estimatedPages}, max allowed: ${maxPages}`);
    return estimatedPages <= maxPages;
  }

  /**
   * Busca el agente TODO-EN-UNO en la BD
   */
  private async getAllInOneAgent() {
    try {
      const { createSupabaseClient } = await import('@/supabase-clients/server');
      const supabase = await createSupabaseClient();
      
      const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .ilike('name', '%all_in_one%')
        .eq('is_active', true)
        .single();
      
      if (error) {
        this.log('warning', `Error finding all-in-one agent: ${error.message}`);
        return null;
      }
      
      return agent;
      
    } catch (error) {
      this.log('error', `Error getting all-in-one agent: ${error}`);
      return null;
    }
  }

  /**
   * Guarda los datos directamente en la BD sin pasar por el pipeline
   */
  private async saveDirectToDatabase(documentId: string, documentType: string, metadata: any) {
    try {
      this.log('info', `Saving directly to database: ${documentType}`);
      
      // Importar funciones de guardado
      const { DocumentsStore } = await import('@/lib/ingesta/storage/documentsStore');
      
      // Guardar según el tipo de documento
      switch (documentType) {
        case 'acta':
          await DocumentsStore.saveExtractedMinutes(documentId, metadata);
          break;
        case 'comunicado':
          await DocumentsStore.saveExtractedComunicado(documentId, metadata);
          break;
        case 'factura':
          await DocumentsStore.saveExtractedInvoice(documentId, metadata);
          break;
        case 'contrato':
          await DocumentsStore.saveExtractedContract(documentId, metadata);
          break;
        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }

      // Actualizar estado del documento
      await this.updateDocumentStatus(documentId, documentType);
      
      this.log('success', `Data saved directly to ${documentType} table`);

    } catch (error) {
      this.log('error', `Failed to save to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Actualiza el estado del documento tras procesamiento TODO-EN-UNO
   */
  private async updateDocumentStatus(documentId: string, documentType: string) {
    try {
      const { createSupabaseClient } = await import('@/supabase-clients/server');
      const supabase = await createSupabaseClient();
      
      const { error } = await supabase
        .from('documents')
        .update({
          document_type: documentType,
          extraction_status: 'completed',
          classification_status: 'completed',
          metadata_status: 'completed',
          chunking_status: 'completed', // TODO: Implementar chunking también
          status: 'completed'
        })
        .eq('id', documentId);

      if (error) {
        throw new Error(`Failed to update document status: ${error.message}`);
      }
      
      this.log('success', 'Document status updated to completed');

    } catch (error) {
      this.log('error', `Failed to update document status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}