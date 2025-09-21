/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Índice del módulo de extracción - PDF y OCR
 * ESTADO: production
 * DEPENDENCIAS: types.ts, pdfTextExtraction.ts, ocrExtraction.ts
 * OUTPUTS: Exporta estrategias de extracción y configuración por defecto
 * ACTUALIZADO: 2025-09-14
 */

// Types
export * from './types';

// Estrategias
export * from './pdfTextExtraction';
export * from './ocrExtraction';

// TODO: Agregar cuando implementemos:
// export * from './llmExtraction';
// export * from './extractionOrchestrator';

// Re-export tipos core para conveniencia
export type { TextExtractionResult, ProcessingError } from '../../core/types';

// Funciones de conveniencia
export { extractTextFromPDF, createPDFTextExtractionStrategy } from './pdfTextExtraction';
export { createOCRExtractionStrategy, testOCRExtraction } from './ocrExtraction';

/**
 * Configuración por defecto del módulo de extracción
 */
export const DEFAULT_EXTRACTION_CONFIG = {
  name: 'text-extraction',
  version: '1.0.0',
  enabled: true,
  parameters: {
    preferredStrategy: 'pdf-parse' as const,
    fallbackEnabled: true,
    strategies: {
      pdfParse: {
        maxPages: 0,
        version: 'v1.10.100',
        pageRender: false,
        normalizeWhitespace: true,
        timeout: 30000
      }
    },
    validation: {
      minTextLength: 10,
      maxEmptyRatio: 0.95,
      requiredConfidence: 0.5
    }
  }
};