/**
 * ARCHIVO: types.ts
 * PROPÓSITO: Tipos para extractores de metadatos con IA
 * ESTADO: production
 * DEPENDENCIAS: ../contracts/types.ts
 * OUTPUTS: Interfaces para extractores de metadatos especializados
 * ACTUALIZADO: 2025-09-14
 */

import { 
  BaseMetadataStructure, 
  MetadataExtractionResult, 
  MetadataExtractionConfig, 
  MetadataExtractor,
  DocumentType 
} from '../contracts/types';

// ============================================================================
// 🤖 TIPOS ESPECÍFICOS PARA EXTRACTORES
// ============================================================================

/**
 * Configuración específica para extracción con Gemini
 */
export interface GeminiExtractionConfig extends MetadataExtractionConfig {
  gemini_config: {
    model: string;
    temperature: number;
    max_output_tokens: number;
    safety_settings?: any[];
  };
  prompt_config: {
    include_examples: boolean;
    include_structure_hints: boolean;
    max_text_sample_size: number;
  };
}

/**
 * Resultado interno de análisis con Gemini
 */
export interface GeminiAnalysisResult {
  success: boolean;
  raw_response: string;
  parsed_data: Record<string, any>;
  confidence: number;
  tokens_used: number;
  processing_time: number;
  errors: string[];
  warnings: string[];
}

/**
 * Contexto de extracción que reciben todos los extractores
 */
export interface ExtractionContext {
  text: string;
  filename: string;
  document_type: DocumentType;
  community_id?: string;
  additional_hints?: Record<string, any>;
}

/**
 * Estadísticas de extracción para monitoring
 */
export interface ExtractionStats {
  total_extractions: number;
  successful_extractions: number;
  failed_extractions: number;
  average_processing_time: number;
  total_tokens_used: number;
  average_confidence: number;
  last_extraction_timestamp: number;
}

// ============================================================================
// 🏭 ABSTRACT BASE CLASS PARA EXTRACTORES
// ============================================================================

/**
 * Clase base abstracta que todos los extractores deben extender
 * Proporciona funcionalidad común y define la interfaz estándar
 */
export abstract class BaseMetadataExtractor<T extends BaseMetadataStructure> implements MetadataExtractor<T> {
  protected name: string;
  protected supportedTypes: DocumentType[];
  protected stats: ExtractionStats;
  
  constructor(name: string, supportedTypes: DocumentType[]) {
    this.name = name;
    this.supportedTypes = supportedTypes;
    this.stats = {
      total_extractions: 0,
      successful_extractions: 0,
      failed_extractions: 0,
      average_processing_time: 0,
      total_tokens_used: 0,
      average_confidence: 0,
      last_extraction_timestamp: 0
    };
  }

  // ===== MÉTODOS PÚBLICOS DE LA INTERFAZ =====

  getName(): string {
    return this.name;
  }

  getSupportedDocumentTypes(): DocumentType[] {
    return [...this.supportedTypes];
  }

  canHandle(documentType: DocumentType): boolean {
    return this.supportedTypes.includes(documentType);
  }

  getDefaultConfig(): MetadataExtractionConfig {
    return {
      method: 'gemini',
      gemini_config: {
        temperature: 0.1,
        max_output_tokens: 2000
      },
      fallback_enabled: true,
      validation_enabled: true
    };
  }

  /**
   * Método principal de extracción (implementado por cada extractor)
   */
  abstract extractMetadata(
    text: string, 
    filename: string, 
    config?: Partial<MetadataExtractionConfig>
  ): Promise<MetadataExtractionResult<T>>;

  // ===== MÉTODOS PROTEGIDOS PARA SUBCLASES =====

  /**
   * Actualizar estadísticas después de una extracción
   */
  protected updateStats(
    success: boolean,
    processingTime: number,
    tokensUsed: number = 0,
    confidence: number = 0
  ): void {
    this.stats.total_extractions++;
    this.stats.last_extraction_timestamp = Date.now();
    
    if (success) {
      this.stats.successful_extractions++;
      
      // Actualizar promedios usando media móvil simple
      const total = this.stats.successful_extractions;
      this.stats.average_processing_time = (
        (this.stats.average_processing_time * (total - 1) + processingTime) / total
      );
      
      this.stats.average_confidence = (
        (this.stats.average_confidence * (total - 1) + confidence) / total
      );
      
      this.stats.total_tokens_used += tokensUsed;
    } else {
      this.stats.failed_extractions++;
    }
  }

  /**
   * Limpiar y validar texto de entrada
   */
  protected preprocessText(text: string, maxLength: number = 10000): string {
    if (!text || typeof text !== 'string') {
      throw new Error('Texto inválido proporcionado');
    }

    // Limpiar texto
    let cleanText = text
      .trim()
      .replace(/\s+/g, ' ')           // Normalizar espacios
      .replace(/\n\s*\n/g, '\n\n')    // Normalizar saltos de línea
      .replace(/[^\x00-\x7F]/g, '');   // Remover caracteres no ASCII problemáticos

    // Truncar si es muy largo
    if (cleanText.length > maxLength) {
      cleanText = cleanText.substring(0, maxLength) + '...';
    }

    return cleanText;
  }

  /**
   * Generar ID único para documentos
   */
  protected generateDocumentId(filename: string, text: string): string {
    // Usar timestamp + hash simple del contenido
    const timestamp = Date.now().toString();
    const textHash = this.simpleHash(text).toString();
    const filenameClean = filename.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    return `${filenameClean}-${timestamp}-${textHash}`;
  }

  /**
   * Hash simple para generar IDs únicos
   */
  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
  }

  /**
   * Extraer muestra de texto para análisis (similar a documentClassifier)
   */
  protected extractTextSample(text: string, sampleSize: number): string {
    if (text.length <= sampleSize) {
      return text.trim();
    }

    // Estrategia: Inicio + muestra del medio para capturar estructura completa
    const inicio = text.substring(0, Math.floor(sampleSize * 0.6)).trim();
    
    // Buscar una sección del medio/final que contenga información estructural
    const middleStart = Math.floor(text.length * 0.4);
    const middleEnd = middleStart + Math.floor(sampleSize * 0.4);
    const medio = text.substring(middleStart, middleEnd).trim();
    
    // Combinar inicio + medio
    const combined = `${inicio}\n\n[... CONTENIDO OMITIDO ...]\n\n${medio}`;
    
    // Si aún es muy largo, truncar
    if (combined.length > sampleSize) {
      return combined.substring(0, sampleSize) + '...';
    }
    
    return combined;
  }

  // ===== MÉTODOS PÚBLICOS PARA MONITORING =====

  /**
   * Obtener estadísticas del extractor
   */
  getStats(): ExtractionStats {
    return { ...this.stats };
  }

  /**
   * Resetear estadísticas
   */
  resetStats(): void {
    this.stats = {
      total_extractions: 0,
      successful_extractions: 0,
      failed_extractions: 0,
      average_processing_time: 0,
      total_tokens_used: 0,
      average_confidence: 0,
      last_extraction_timestamp: 0
    };
  }

  /**
   * Obtener tasa de éxito
   */
  getSuccessRate(): number {
    if (this.stats.total_extractions === 0) return 0;
    return (this.stats.successful_extractions / this.stats.total_extractions) * 100;
  }

  /**
   * Obtener coste estimado en USD
   */
  getEstimatedCost(): number {
    // Precio aproximado Gemini Flash: $0.000015 per 1K tokens
    const pricePerToken = 0.000015 / 1000;
    return this.stats.total_tokens_used * pricePerToken;
  }
}

// ============================================================================
// 🔧 UTILIDADES PARA EXTRACTORES
// ============================================================================

/**
 * Utilidades comunes para todos los extractores
 */
export class ExtractorUtils {
  /**
   * Parsear respuesta JSON de Gemini de forma robusta
   */
  static parseGeminiResponse(response: string): { success: boolean; data: any; errors: string[] } {
    const result = { success: false, data: null, errors: [] as string[] };
    
    if (!response || typeof response !== 'string') {
      result.errors.push('Respuesta vacía o inválida de Gemini');
      return result;
    }

    try {
      // Intentar parsear como JSON directo
      result.data = JSON.parse(response.trim());
      result.success = true;
      return result;
    } catch (directError) {
      // Intentar extraer JSON de una respuesta con texto adicional
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result.data = JSON.parse(jsonMatch[0]);
          result.success = true;
          return result;
        } catch (extractError) {
          result.errors.push(`Error extrayendo JSON: ${extractError.message}`);
        }
      } else {
        result.errors.push(`No se encontró JSON válido en la respuesta`);
      }
      
      result.errors.push(`Error de parseo directo: ${directError.message}`);
      return result;
    }
  }

  /**
   * Validar que la respuesta de Gemini tiene los campos esperados
   */
  static validateGeminiResponse(data: any, requiredFields: string[]): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!data || typeof data !== 'object') {
      return { valid: false, missing: ['Datos no es un objeto'] };
    }

    for (const field of requiredFields) {
      if (!(field in data)) {
        missing.push(field);
      }
    }

    return { valid: missing.length === 0, missing };
  }

  /**
   * Estimar tokens de un texto (aproximación)
   */
  static estimateTokens(text: string): number {
    // Estimación aproximada: 1 token ≈ 4 caracteres en español
    return Math.ceil(text.length / 4);
  }
}