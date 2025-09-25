/**
 * ARCHIVO: BaseTextExtractor.ts
 * PROPÓSITO: Interfaz base para todas las estrategias de extracción de texto
 * ESTADO: development
 * DEPENDENCIAS: Ninguna (interfaz base)
 * OUTPUTS: Interfaz común para extractores de texto
 * ACTUALIZADO: 2025-09-21
 */

export interface ExtractionResult {
  success: boolean;
  text?: string;
  textLength?: number;
  confidence?: number;
  pages?: number;
  method: string;
  processingTime?: string;
  error?: string;
}

export interface ExtractionContext {
  buffer: Buffer;
  filename: string;
  documentId: string;
  maxPages?: number;
  minTextLength?: number;
}

export abstract class BaseTextExtractor {
  protected extractorName: string;
  
  constructor(extractorName: string) {
    this.extractorName = extractorName;
  }

  /**
   * Método principal de extracción que debe implementar cada estrategia
   */
  abstract extract(context: ExtractionContext): Promise<ExtractionResult>;

  /**
   * Verifica si esta estrategia puede manejar el contexto dado
   */
  abstract canHandle(context: ExtractionContext): boolean;

  /**
   * Obtiene la prioridad de esta estrategia (menor número = mayor prioridad)
   */
  abstract getPriority(): number;

  /**
   * Logging unificado para todas las estrategias
   */
  protected log(level: 'info' | 'success' | 'error' | 'warning', message: string, data?: any): void {
    const emoji = {
      info: '🔧',
      success: '✅', 
      error: '❌',
      warning: '⚠️'
    }[level];

    const prefix = `${emoji} [${this.extractorName.toUpperCase()}]`;
    
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Valida el resultado de extracción
   */
  protected validateResult(result: ExtractionResult, minTextLength: number = 50): boolean {
    if (!result.success) {
      this.log('error', 'Extraction failed');
      return false;
    }

    if (!result.text || result.text.length < minTextLength) {
      this.log('warning', `Insufficient text extracted: ${result.text?.length || 0} chars (min: ${minTextLength})`);
      return false;
    }

    this.log('success', `Extraction successful: ${result.text.length} chars`);
    return true;
  }

  /**
   * Crea un resultado de error estandarizado
   */
  protected createErrorResult(error: string | Error, method?: string): ExtractionResult {
    const errorMessage = error instanceof Error ? error.message : error;
    this.log('error', `Extraction failed: ${errorMessage}`);
    
    return {
      success: false,
      method: method || this.extractorName,
      error: errorMessage
    };
  }

  /**
   * Crea un resultado exitoso estandarizado
   */
  protected createSuccessResult(
    text: string, 
    additionalData: Partial<ExtractionResult> = {}
  ): ExtractionResult {
    const result: ExtractionResult = {
      success: true,
      text,
      textLength: text.length,
      method: this.extractorName,
      ...additionalData
    };

    this.log('success', `Extracted ${text.length} characters`);
    return result;
  }
}