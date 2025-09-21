/**
 * ARCHIVO: types.ts
 * PROPÓSITO: Tipos base para contratos de validación de metadatos
 * ESTADO: production
 * DEPENDENCIAS: Ninguna (tipos base)
 * OUTPUTS: Interfaces para BaseMetadataStructure, MetadataExtractor, DocumentType
 * ACTUALIZADO: 2025-09-14
 */

// ============================================================================
// 📋 TIPOS BASE COMPARTIDOS
// ============================================================================

/**
 * Tipos de documento que procesa el sistema
 * Migrado desde RAG DocumentType enum
 */
export type DocumentType = 'acta' | 'contrato' | 'factura' | 'comunicado';

/**
 * Tipos de chunk que puede generar el sistema
 * Migrado desde RAG chunk_type
 */
export type ChunkType = 'document_overview' | 'content_chunk';

/**
 * Estados de extracción posibles
 */
export type ExtractionStatus = 'success' | 'error' | 'partial';

/**
 * Método usado para la extracción de metadatos
 */
export type MetadataExtractionMethod = 'gemini' | 'fallback' | 'manual';

// ============================================================================
// 🏗️ ESTRUCTURA BASE DE METADATOS
// ============================================================================

/**
 * Estructura base que todos los contratos deben implementar
 * Migrado desde RAG ActaMetadataStructure (campos comunes)
 */
export interface BaseMetadataStructure {
  // ===== METADATOS PRINCIPALES =====
  doc_type: DocumentType;
  chunk_type: ChunkType;
  document_id: string;
  community_id: string;                    // Para multi-tenant Supabase
  
  // ===== METADATOS DE DOCUMENTO =====
  document_name: string;
  document_date: string;                   // YYYYMMDD format
  
  // ===== CONTENIDO Y ANÁLISIS =====
  topic_keywords: string[];                // Lista de keywords detectados
  decisiones_principales: string[];        // Decisiones/conclusiones principales
  estructura_detectada: Record<string, any>; // Estructura detectada por IA
  
  // ===== METADATOS DE CHUNKS =====
  title: string;
  capitulo: string;                        // Título del capítulo/sección
  category: string;                        // Categoría del chunk
  content_type: string;
  
  // ===== INFORMACIÓN TÉCNICA =====
  chunk_id: string;
  chunk_number: number;
  content_length: number;
  extraction_status: ExtractionStatus;
}

// ============================================================================
// 🏷️ VALIDACIÓN Y TIPADO
// ============================================================================

/**
 * Resultado de validación de estructura de metadatos
 * Migrado desde RAG MetadataTypes.validate_metadata_structure()
 */
export interface MetadataValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  missing_fields: string[];
  extra_fields: string[];
}

/**
 * Configuración para extracción de metadatos
 */
export interface MetadataExtractionConfig {
  method: MetadataExtractionMethod;
  gemini_config?: {
    temperature: number;
    max_output_tokens: number;
  };
  fallback_enabled: boolean;
  validation_enabled: boolean;
}

/**
 * Resultado de extracción de metadatos
 */
export interface MetadataExtractionResult<T extends BaseMetadataStructure = BaseMetadataStructure> {
  success: boolean;
  metadata: T;
  method: MetadataExtractionMethod;
  confidence: number;
  processing_time: number;
  errors?: string[];
  warnings?: string[];
}

// ============================================================================
// 🔌 INTERFACES PARA CONTRATOS
// ============================================================================

/**
 * Interface que todos los contratos de metadatos deben implementar
 * Basado en RAG ActaMetadataContract pattern
 */
export interface MetadataContract<T extends BaseMetadataStructure> {
  // Información del contrato
  getDocumentType(): DocumentType;
  getSupportedTypes(): string[];
  
  // Validación
  validateStructure(metadata: Partial<T>): MetadataValidationResult;
  validateField(fieldName: keyof T, value: any): boolean;
  
  // Conversiones (para compatibilidad con storage)
  convertToStorageFormat(metadata: T): Record<string, any>;
  convertFromStorageFormat(data: Record<string, any>): T;
  
  // Utilidades
  createEmpty(): T;
  getRequiredFields(): Array<keyof T>;
  getFieldTypes(): Record<keyof T, string>;
}

/**
 * Interface para extractores de metadatos
 */
export interface MetadataExtractor<T extends BaseMetadataStructure> {
  // Información del extractor
  getName(): string;
  getSupportedDocumentTypes(): DocumentType[];
  
  // Extracción principal
  extractMetadata(
    text: string, 
    filename: string, 
    config?: Partial<MetadataExtractionConfig>
  ): Promise<MetadataExtractionResult<T>>;
  
  // Validación y configuración
  canHandle(documentType: DocumentType): boolean;
  getDefaultConfig(): MetadataExtractionConfig;
}

// ============================================================================
// 🔧 UTILITIES
// ============================================================================

/**
 * Utilidades para fechas (migrado desde RAG)
 */
export class MetadataDateUtils {
  /**
   * Convertir fecha a formato estándar YYYYMMDD
   * Migrado desde RAG convert_date_to_standard_format()
   */
  static convertToStandardFormat(dateInput: string): string {
    if (!dateInput || typeof dateInput !== 'string') {
      return '';
    }

    const dateStr = dateInput.trim();

    // Formato de 8 dígitos - detectar YYYYMMDD vs DDMMYYYY
    if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
      // Si empieza con 20 o 19, probablemente ya es YYYYMMDD
      if (dateStr.startsWith('20') || dateStr.startsWith('19')) {
        const yyyy = dateStr.substring(0, 4);
        const mm = dateStr.substring(4, 6);
        const dd = dateStr.substring(6, 8);
        
        // Validar que sea una fecha válida
        const month = parseInt(mm, 10);
        const day = parseInt(dd, 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return dateStr; // Ya está en formato correcto
        }
      }

      // Si no, asumir que es DDMMYYYY
      const dd = dateStr.substring(0, 2);
      const mm = dateStr.substring(2, 4);
      const yyyy = dateStr.substring(4, 8);
      return `${yyyy}${mm}${dd}`;
    }

    // Formato DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const dd = parts[0].padStart(2, '0');
        const mm = parts[1].padStart(2, '0');
        const yyyy = parts[2];
        return `${yyyy}${mm}${dd}`;
      }
    }

    // Formato DD.MM.YYYY
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const dd = parts[0].padStart(2, '0');
        const mm = parts[1].padStart(2, '0');
        const yyyy = parts[2];
        return `${yyyy}${mm}${dd}`;
      }
    }

    // Formato YYYY-MM-DD (ISO)
    if (dateStr.includes('-') && dateStr.length === 10) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const yyyy = parts[0];
        const mm = parts[1];
        const dd = parts[2];
        return `${yyyy}${mm}${dd}`;
      }
    }

    return '';
  }

  /**
   * Validar que una fecha esté en formato YYYYMMDD correcto
   */
  static isValidDateFormat(date: string): boolean {
    if (!date || date.length !== 8) return false;
    
    const yyyy = parseInt(date.substring(0, 4), 10);
    const mm = parseInt(date.substring(4, 6), 10);
    const dd = parseInt(date.substring(6, 8), 10);
    
    return yyyy >= 1900 && yyyy <= 2100 && 
           mm >= 1 && mm <= 12 && 
           dd >= 1 && dd <= 31;
  }
}

/**
 * Utilidades para validación de metadatos
 */
export class MetadataValidationUtils {
  /**
   * Validar estructura básica de metadatos
   */
  static validateBaseStructure(metadata: Partial<BaseMetadataStructure>): MetadataValidationResult {
    const result: MetadataValidationResult = {
      is_valid: true,
      errors: [],
      warnings: [],
      missing_fields: [],
      extra_fields: []
    };

    // Campos obligatorios básicos
    const requiredFields: Array<keyof BaseMetadataStructure> = [
      'doc_type', 'chunk_type', 'document_id', 'community_id'
    ];

    // Verificar campos obligatorios
    for (const field of requiredFields) {
      if (!(field in metadata) || !metadata[field]) {
        result.errors.push(`Campo obligatorio faltante: ${field}`);
        result.missing_fields.push(field);
        result.is_valid = false;
      }
    }

    // Validar tipos básicos
    if (metadata.doc_type && !['acta', 'contrato', 'factura', 'comunicado'].includes(metadata.doc_type)) {
      result.warnings.push(`doc_type no reconocido: ${metadata.doc_type}`);
    }

    if (metadata.chunk_type && !['document_overview', 'content_chunk'].includes(metadata.chunk_type)) {
      result.warnings.push(`chunk_type no reconocido: ${metadata.chunk_type}`);
    }

    if (metadata.document_date && !MetadataDateUtils.isValidDateFormat(metadata.document_date)) {
      result.warnings.push(`document_date en formato incorrecto: ${metadata.document_date}`);
    }

    return result;
  }
}