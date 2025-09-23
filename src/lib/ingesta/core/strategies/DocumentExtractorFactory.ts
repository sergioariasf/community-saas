/**
 * ARCHIVO: DocumentExtractorFactory.ts
 * PROPÓSITO: Factory para crear extractores específicos por tipo de documento
 * ESTADO: development
 * DEPENDENCIAS: BaseDocumentExtractor, estrategias específicas
 * OUTPUTS: Instancias de extractores según el tipo de documento
 * ACTUALIZADO: 2025-09-21
 */

import { BaseDocumentExtractor } from './BaseDocumentExtractor';
import { ActaExtractor } from './ActaExtractor';
import { ComunicadoExtractor } from './ComunicadoExtractor';
import { FacturaExtractor } from './FacturaExtractor';
import { ContratoExtractor } from './ContratoExtractor';

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
        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }
    }

    return this.extractors.get(documentType)!;
  }

  /**
   * Verifica si un tipo de documento está soportado
   */
  static isSupported(documentType: string): boolean {
    const supportedTypes = ['acta', 'comunicado', 'factura', 'contrato'];
    return supportedTypes.includes(documentType.toLowerCase());
  }

  /**
   * Obtiene la lista de tipos de documentos soportados
   */
  static getSupportedTypes(): string[] {
    return ['acta', 'comunicado', 'factura', 'contrato'];
  }

  /**
   * Limpia el cache de extractores (útil para testing)
   */
  static clearCache(): void {
    this.extractors.clear();
  }
}