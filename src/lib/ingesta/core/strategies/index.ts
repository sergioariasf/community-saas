/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Exportación central de todas las estrategias de extracción
 * ESTADO: development
 * DEPENDENCIAS: Todas las estrategias y factory
 * OUTPUTS: Interfaz unificada para el sistema de estrategias
 * ACTUALIZADO: 2025-09-21
 */

export { BaseDocumentExtractor } from './BaseDocumentExtractor';
export type { DocumentMetadata, DocumentExtractionConfig } from './BaseDocumentExtractor';
export { ActaExtractor } from './ActaExtractor';
export { ComunicadoExtractor } from './ComunicadoExtractor';
export { FacturaExtractor } from './FacturaExtractor';
export { ContratoExtractor } from './ContratoExtractor';
export { DocumentExtractorFactory } from './DocumentExtractorFactory';