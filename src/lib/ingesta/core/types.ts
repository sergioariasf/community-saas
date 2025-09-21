/**
 * ARCHIVO: types.ts
 * PROPÓSITO: Tipos centrales compartidos por todo el sistema de ingesta modular
 * ESTADO: production
 * DEPENDENCIAS: Ninguna (tipos base)
 * OUTPUTS: Interfaces TypeScript para extracción, clasificación, metadata, chunking
 * ACTUALIZADO: 2025-09-14
 */

// ============================================================================
// RESULTADO DE EXTRACCIÓN DE TEXTO
// ============================================================================

export interface TextExtractionResult {
  text: string;
  success: boolean;
  method: 'pdf-parse' | 'ocr' | 'llm' | 'error';
  metadata: {
    pages: number;
    size: number;
    confidence: number;
    error?: string;
  };
}

// ============================================================================
// CONFIGURACIÓN DE MÓDULOS
// ============================================================================

export interface ModuleConfig {
  name: string;
  version: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface ExtractionModuleConfig extends ModuleConfig {
  parameters: {
    preferredMethod: 'pdf-parse' | 'ocr' | 'llm';
    fallbackEnabled: boolean;
    ocrEnabled: boolean;
    llmEnabled: boolean;
    maxFileSize: number;
  };
}

// ============================================================================
// RESULTADO DE PROCESAMIENTO
// ============================================================================

export interface ProcessResult {
  success: boolean;
  documentId?: string;
  error?: string;
  processingStatus: 'processing' | 'completed' | 'error';
  steps: ProcessSteps;
  metrics: ProcessMetrics;
}

export interface ProcessSteps {
  upload: boolean;
  extraction: boolean;
  classification: boolean;
  chunking: boolean;
  embedding: boolean;
  storage: boolean;
}

export interface ProcessMetrics {
  totalTime: number;
  moduleTimings: Record<string, number>;
  chunksGenerated: number;
  embeddingsCreated: number;
  storageOperations: number;
  cacheHits: number;
  errors: string[];
}

// ============================================================================
// INTERFACES DE MÓDULOS
// ============================================================================

export interface ProcessingModule {
  configure(config: ModuleConfig): Promise<void>;
  process(input: any): Promise<any>;
  validate(input: any): Promise<boolean>;
  getMetrics(): ModuleMetrics;
}

export interface ModuleMetrics {
  executionTime: number;
  inputSize: number;
  outputSize: number;
  success: boolean;
  errors: string[];
  cacheHit: boolean;
}

// ============================================================================
// TIPOS DE PROCESO
// ============================================================================

export type ProcessType = 'basic' | 'extract' | 'classify' | 'full';

export interface ProcessConfig {
  type: ProcessType;
  modules: ModuleConfig[];
  options: ProcessOptions;
}

export interface ProcessOptions {
  skipOnError: boolean;
  enableCache: boolean;
  enableLogging: boolean;
  maxRetries: number;
  timeout: number;
}

// ============================================================================
// CONTEXTO DE PROCESAMIENTO
// ============================================================================

export interface ProcessingContext {
  documentId?: string;
  userId: string;
  communityId: string;
  filename: string;
  fileBuffer: Buffer;
  mimeType: string;
  size: number;
  startTime: number;
  currentStep: string;
  metadata: Record<string, any>;
}

// ============================================================================
// ERRORES PERSONALIZADOS
// ============================================================================

export class ProcessingError extends Error {
  constructor(
    public module: string,
    public stage: string,
    public originalError: Error,
    public recoverable: boolean = false
  ) {
    super(`${module}:${stage} - ${originalError.message}`);
    this.name = 'ProcessingError';
  }
}

export class ModuleConfigError extends Error {
  constructor(
    public moduleName: string,
    public configIssue: string
  ) {
    super(`Configuration error in ${moduleName}: ${configIssue}`);
    this.name = 'ModuleConfigError';
  }
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

export const DEFAULT_MODULE_TIMEOUT = 30000; // 30 segundos
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_CACHE_TTL = 3600; // 1 hora en segundos