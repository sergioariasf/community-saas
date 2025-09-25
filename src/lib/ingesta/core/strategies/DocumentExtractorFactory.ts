/**
 * ARCHIVO: DocumentExtractorFactory.ts
 * PROPÓSITO: Factory para crear extractores específicos por tipo de documento
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, estrategias específicas
 * OUTPUTS: Instancias de extractores según el tipo de documento
 * ACTUALIZADO: 2025-09-23
 */

import { BaseDocumentExtractor } from './BaseDocumentExtractor';
import { ActaExtractor } from './ActaExtractor';
import { ComunicadoExtractor } from './ComunicadoExtractor';
import { FacturaExtractor } from './FacturaExtractor';
import { ContratoExtractor } from './ContratoExtractor';
import { EscrituraExtractor } from './EscrituraExtractor';
import { AlbaranExtractor } from './AlbaranExtractor';
import { PresupuestoExtractor } from './PresupuestoExtractor';
import { getSupportedDocumentTypes } from '../schemaBasedConfig';

export class DocumentExtractorFactory {
  private static extractors: Map<string, BaseDocumentExtractor> = new Map();

  /**
   * Crea o reutiliza un extractor para el tipo de documento dado
   */
  static getExtractor(documentType: string): BaseDocumentExtractor {
    // Usar instancias singleton para cada tipo
    if (!this.extractors.has(documentType)) {
      switch (documentType.toLowerCase()) {
        case 'acta':
          this.extractors.set(documentType, new ActaExtractor());
          break;
        case 'comunicado':
          this.extractors.set(documentType, new ComunicadoExtractor());
          break;
        case 'factura':
          this.extractors.set(documentType, new FacturaExtractor());
          break;
        case 'contrato':
          this.extractors.set(documentType, new ContratoExtractor());
          break;
        case 'escritura':
          this.extractors.set(documentType, new EscrituraExtractor());
          break;
        case 'presupuesto':
          this.extractors.set(documentType, new PresupuestoExtractor());
          break;
        case 'albaran':
          this.extractors.set(documentType, new AlbaranExtractor());
          break;
        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }
    }

    return this.extractors.get(documentType)!;
  }

  /**
   * Verifica si un tipo de documento está soportado
   * Usa la fuente de verdad (schema) para auto-discovery
   */
  static isSupported(documentType: string): boolean {
    const supportedTypes = getSupportedDocumentTypes();
    return supportedTypes.includes(documentType.toLowerCase());
  }

  /**
   * Obtiene la lista de tipos de documentos soportados
   * Usa la fuente de verdad (schema) para auto-discovery
   */
  static getSupportedTypes(): string[] {
    return getSupportedDocumentTypes();
  }

  /**
   * Limpia el cache de extractores (útil para testing)
   */
  static clearCache(): void {
    this.extractors.clear();
  }
}