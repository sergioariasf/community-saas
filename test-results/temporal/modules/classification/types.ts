/**
 * ARCHIVO: types.ts
 * PROPÓSITO: Tipos para clasificación de documentos (acta/contrato/factura/comunicado)
 * ESTADO: production
 * DEPENDENCIAS: Ninguna (tipos base)
 * OUTPUTS: Interfaces para DocumentClassificationResult, DocumentType, ClassificationConfig
 * ACTUALIZADO: 2025-09-14
 */

export interface DocumentClassificationResult {
  type: DocumentType;
  confidence: number;
  method: 'gemini' | 'filename-fallback' | 'default';
  metadata: {
    sampleLength: number;
    estimatedTokens: number;
    processingTime: number;
    error?: string;
  };
}

export type DocumentType = 'acta' | 'contrato' | 'factura' | 'comunicado';

export interface ClassificationConfig {
  sampleSize: number;
  useFilenameFallback: boolean;
  geminiConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}

export interface TokenEstimate {
  sampleLength: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedTotalTokens: number;
  sampleTextPreview: string;
}

export interface ClassificationContext {
  text: string;
  filename: string;
  config: ClassificationConfig;
}