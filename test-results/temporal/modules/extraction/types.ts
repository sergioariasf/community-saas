/**
 * ARCHIVO: types.ts
 * PROPÓSITO: Tipos específicos para estrategias de extracción de texto (PDF, OCR)
 * ESTADO: production
 * DEPENDENCIAS: ../../core/types.ts
 * OUTPUTS: Interfaces para ExtractionStrategy, DetailedExtractionResult, ExtractionContext
 * ACTUALIZADO: 2025-09-14
 */

import { ModuleConfig, TextExtractionResult } from '../../core/types';

// ============================================================================
// ESTRATEGIAS DE EXTRACCIÓN
// ============================================================================

export interface ExtractionStrategy {
  name: string;
  canHandle(buffer: Buffer, mimeType: string): Promise<boolean>;
  extract(buffer: Buffer): Promise<TextExtractionResult>;
  getConfidence(buffer: Buffer): Promise<number>;
}

// ============================================================================
// CONFIGURACIÓN DE EXTRACCIÓN
// ============================================================================

export interface PDFExtractionConfig {
  maxPages: number;
  version: string;
  pageRender: boolean;
  normalizeWhitespace: boolean;
  timeout: number;
}

export interface OCRExtractionConfig {
  provider: 'google-vision' | 'document-ai';
  language: string;
  confidence: number;
  timeout: number;
  retries: number;
}

export interface LLMExtractionConfig {
  provider: 'gemini' | 'openai';
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface ExtractionModuleConfig extends ModuleConfig {
  parameters: {
    preferredStrategy: 'pdf-parse' | 'ocr' | 'llm';
    fallbackEnabled: boolean;
    strategies: {
      pdfParse: PDFExtractionConfig;
      ocr: OCRExtractionConfig;
      llm: LLMExtractionConfig;
    };
    validation: {
      minTextLength: number;
      maxEmptyRatio: number;
      requiredConfidence: number;
    };
  };
}

// ============================================================================
// RESULTADOS DETALLADOS
// ============================================================================

export interface DetailedExtractionResult extends TextExtractionResult {
  strategy: string;
  attempts: ExtractionAttempt[];
  validation: ValidationResult;
  timing: ExtractionTiming;
}

export interface ExtractionAttempt {
  strategy: string;
  success: boolean;
  error?: string;
  confidence: number;
  textLength: number;
  executionTime: number;
}

export interface ValidationResult {
  isValid: boolean;
  textLength: number;
  emptyRatio: number;
  confidence: number;
  issues: string[];
}

export interface ExtractionTiming {
  totalTime: number;
  strategyTimes: Record<string, number>;
  validationTime: number;
  overheadTime: number;
}

// ============================================================================
// CONTEXTO DE EXTRACCIÓN
// ============================================================================

export interface ExtractionContext {
  filename: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  preferredStrategy?: string;
  fallbackStrategies?: string[];
  metadata: {
    userId: string;
    communityId: string;
    documentId?: string;
  };
}

// ============================================================================
// INTERFACES DE VALIDACIÓN
// ============================================================================

export interface TextValidator {
  validate(text: string, context: ExtractionContext): Promise<ValidationResult>;
}

export interface ExtractionCache {
  get(key: string): Promise<TextExtractionResult | null>;
  set(key: string, result: TextExtractionResult, ttl?: number): Promise<void>;
  generateKey(buffer: Buffer, strategy: string): string;
}