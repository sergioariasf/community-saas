/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Índice del módulo de clasificación con IA
 * ESTADO: production
 * DEPENDENCIAS: types.ts, documentClassifier.ts
 * OUTPUTS: Exporta clasificador de documentos y configuración optimizada
 * ACTUALIZADO: 2025-09-14
 */

// Types
export * from './types';

// Classifier
export * from './documentClassifier';

// Re-export tipos core para conveniencia
export type { ProcessingError } from '../../core/types';

// Funciones de conveniencia
export { 
  DocumentClassifier,
  classifyDocument, 
  createDocumentClassifier,
  testDocumentClassification 
} from './documentClassifier';

/**
 * Configuración por defecto del módulo de clasificación
 */
export const DEFAULT_CLASSIFICATION_CONFIG = {
  name: 'document-classification',
  version: '1.0.0',
  enabled: true,
  parameters: {
    sampleSize: 1000,
    useFilenameFallback: true,
    geminiConfig: {
      temperature: 0.1,
      maxOutputTokens: 10
    },
    supportedTypes: ['acta', 'contrato', 'factura', 'comunicado'],
    costOptimization: {
      maxSampleSize: 1000,
      enableTokenEstimation: true,
      preferFilenameFallback: true
    }
  }
};