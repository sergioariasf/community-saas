/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Exportación central de todas las estrategias de extracción de texto
 * ESTADO: development
 * DEPENDENCIAS: Todos los extractores y factory
 * OUTPUTS: Interfaz unificada para el sistema de extracción de texto
 * ACTUALIZADO: 2025-09-21
 */

export { BaseTextExtractor } from './BaseTextExtractor';
export type { ExtractionResult, ExtractionContext } from './BaseTextExtractor';

export { PdfParseExtractor } from './PdfParseExtractor';
export { GoogleVisionExtractor } from './GoogleVisionExtractor';
export { GeminiFlashExtractor } from './GeminiFlashExtractor';
export type { GeminiAllInOneResult } from './GeminiFlashExtractor';

export { TextExtractionFactory } from './TextExtractionFactory';