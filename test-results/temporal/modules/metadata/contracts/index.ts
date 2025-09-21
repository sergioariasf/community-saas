/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Índice de contratos para validación de metadatos
 * ESTADO: production
 * DEPENDENCIAS: types.ts, actaContract.ts
 * OUTPUTS: Exporta contratos de validación y estructuras de metadatos
 * ACTUALIZADO: 2025-09-14
 */

// Types base
export * from './types';

// Contrato de ACTA
export * from './actaContract';

// Re-export funciones de conveniencia
export { 
  ActaMetadataContract,
  ActaMetadataStructure,
  TipoReunion,
  ChapterCategory,
  TopicKeywords,
  testActaContract
} from './actaContract';

// TODO: Exportar cuando implementemos:
// export * from './contratoContract';
// export * from './facturaContract';
// export * from './comunicadoContract';

/**
 * Configuración por defecto del módulo de contratos
 */
export const DEFAULT_CONTRACTS_CONFIG = {
  name: 'metadata-contracts',
  version: '1.0.0',
  enabled: true,
  supportedDocumentTypes: ['acta'], // TODO: añadir 'contrato', 'factura', 'comunicado'
  validation: {
    strictMode: false,
    validateOnCreate: true,
    validateOnStorage: true
  },
  storage: {
    format: 'supabase',
    jsonFields: ['topic_keywords', 'decisiones_principales', 'estructura_detectada'],
    booleanOptimization: true
  }
};