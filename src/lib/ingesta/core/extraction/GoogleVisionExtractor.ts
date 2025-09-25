/**
 * ARCHIVO: GoogleVisionExtractor.ts
 * PROPÓSITO: Extractor de texto usando Google Vision OCR para PDFs escaneados
 * ESTADO: development
 * DEPENDENCIAS: BaseTextExtractor, @google-cloud/vision
 * OUTPUTS: Texto extraído usando OCR de Google Vision
 * ACTUALIZADO: 2025-09-21
 */

import { BaseTextExtractor, ExtractionResult, ExtractionContext } from './BaseTextExtractor.ts';

export class GoogleVisionExtractor extends BaseTextExtractor {
  constructor() {
    super('google-vision-ocr');
  }

  /**
   * Verifica si este extractor puede manejar el contexto
   */
  canHandle(context: ExtractionContext): boolean {
    // Google Vision siempre puede intentar procesar, verificaremos disponibilidad en extract()
    return true;
  }

  /**
   * Prioridad media (segundo intento)
   */
  getPriority(): number {
    return 2;
  }

  /**
   * Extrae texto usando Google Vision OCR
   */
  async extract(context: ExtractionContext): Promise<ExtractionResult> {
    this.log('info', 'Starting Google Vision OCR extraction...');
    const startTime = Date.now();

    try {
      // Usar la implementación existente que ya funciona
      const { extractWithGoogleVision } = await import('@/lib/pdf/textExtraction');
      const { isGoogleVisionAvailable } = await import('@/lib/pdf/googleVision');
      
      if (!isGoogleVisionAvailable()) {
        return this.createErrorResult(
          'Google Vision not configured - GOOGLE_APPLICATION_CREDENTIALS missing',
          'google-vision-ocr'
        );
      }

      const result = await extractWithGoogleVision(context.buffer);
      
      const processingTime = `${Date.now() - startTime}ms`;

      if (result.success && result.text) {
        this.log('success', `OCR extracted ${result.text.length} characters in ${processingTime}`);
        
        return this.createSuccessResult(result.text, {
          confidence: result.metadata?.confidence || 0.8,
          pages: result.metadata?.pages || 0,
          processingTime,
          method: 'google-vision-ocr'
        });
      } else {
        return this.createErrorResult(
          result.metadata?.error || 'Google Vision OCR failed',
          'google-vision-ocr'
        );
      }

    } catch (error) {
      return this.createErrorResult(error, 'google-vision-ocr');
    }
  }

  /**
   * Verifica si Google Vision está disponible
   */
  private isGoogleVisionAvailable(): boolean {
    try {
      const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      return !!credentials;
    } catch {
      return false;
    }
  }
}