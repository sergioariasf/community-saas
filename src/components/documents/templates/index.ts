/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Registro centralizado de todas las plantillas de documentos
 * ESTADO: development
 * DEPENDENCIAS: Templates individuales
 * OUTPUTS: Registry para mapear tipos de documento a componentes
 * ACTUALIZADO: 2025-09-23 (v2 - Auto-discovery desde schema)
 */

import { ActaDetailView } from './ActaDetailView';
import { DefaultDetailView } from './DefaultDetailView';
import { FacturaDetailView } from './FacturaDetailView';
import { AlbaranDetailView } from './AlbaranDetailView';
import { ContratoDetailView } from './ContratoDetailView';
import { PresupuestoDetailView } from './PresupuestoDetailView';
import { EscrituraCompraventaDetailView } from './EscrituraCompraventaDetailView';
import { ComunicadoDetailView } from './ComunicadoDetailView';

// Import schema-based config for auto-discovery
import { getDocumentConfigs } from '@/lib/ingesta/core/schemaBasedConfig';

// Tipos soportados - ahora generados dinámicamente desde schema
export type DocumentType = string;

// Mapeo de componentes disponibles (hasta que sean 100% generados dinámicamente)
const COMPONENT_MAP = {
  acta: ActaDetailView,
  factura: FacturaDetailView,
  albaran: AlbaranDetailView,
  contrato: ContratoDetailView,
  presupuesto: PresupuestoDetailView,
  escritura: EscrituraCompraventaDetailView,
  comunicado: ComunicadoDetailView,
  default: DefaultDetailView,
} as const;

// Registry de plantillas - GENERADO DINÁMICAMENTE desde schema
function generateDocumentTemplates() {
  const templates: Record<string, any> = { default: DefaultDetailView };
  
  try {
    const documentConfigs = getDocumentConfigs();
    
    Object.keys(documentConfigs).forEach(docType => {
      const config = documentConfigs[docType];
      const componentName = config.metadata?.component_name;
      
      // Buscar el componente en el mapeo
      const component = COMPONENT_MAP[docType as keyof typeof COMPONENT_MAP];
      if (component) {
        templates[docType] = component;
      } else {
        console.warn(`[TemplateRegistry] Component not found for type: ${docType}`);
        templates[docType] = DefaultDetailView;
      }
    });
  } catch (error) {
    console.error('[TemplateRegistry] Error loading document configs:', error);
    // Fallback al mapeo estático
    return COMPONENT_MAP;
  }
  
  return templates;
}

export const DOCUMENT_TEMPLATES = generateDocumentTemplates();

// Metadatos de plantillas - GENERADOS DINÁMICAMENTE desde schema
function generateTemplateMetadata() {
  const metadata: Record<string, any> = {
    default: {
      name: 'Genérica',
      description: 'Plantilla fallback para tipos no implementados',
      status: 'implemented',
      dataSource: 'document_metadata',
      fields: ['dynamic'],
      lastUpdated: '2025-09-23',
    }
  };
  
  try {
    const documentConfigs = getDocumentConfigs();
    
    Object.keys(documentConfigs).forEach(docType => {
      const config = documentConfigs[docType];
      const meta = config.metadata;
      const dbSchema = config.database_schema;
      
      // Extraer campos de todas las secciones del schema
      const fields: string[] = [];
      if (dbSchema?.primary_fields) {
        fields.push(...dbSchema.primary_fields.map((f: any) => f.name));
      }
      if (dbSchema?.detail_fields) {
        fields.push(...dbSchema.detail_fields.map((f: any) => f.name));
      }
      if (dbSchema?.topic_fields) {
        fields.push(...dbSchema.topic_fields.map((f: any) => f.name));
      }
      
      metadata[docType] = {
        name: meta?.display_name || `${docType.charAt(0).toUpperCase() + docType.slice(1)}s`,
        description: `Plantilla para ${meta?.display_name || docType}`,
        status: 'implemented',
        dataSource: meta?.table_name || `extracted_${docType}s`,
        fields: fields.slice(0, 8), // Primeros 8 campos para metadata
        lastUpdated: '2025-09-23',
      };
    });
  } catch (error) {
    console.error('[TemplateRegistry] Error generating metadata:', error);
  }
  
  return metadata;
}

export const TEMPLATE_METADATA = generateTemplateMetadata();

// Función helper para obtener plantilla
export function getDocumentTemplate(documentType: string) {
  const normalizedType = documentType?.toLowerCase() || 'default';
  return (
    DOCUMENT_TEMPLATES[normalizedType as keyof typeof DOCUMENT_TEMPLATES] ||
    DOCUMENT_TEMPLATES.default
  );
}

// Función helper para obtener metadatos de plantilla
export function getTemplateMetadata(documentType: string) {
  const normalizedType = documentType?.toLowerCase() || 'default';
  return (
    TEMPLATE_METADATA[normalizedType as keyof typeof TEMPLATE_METADATA] ||
    TEMPLATE_METADATA.default
  );
}

// Función para listar todas las plantillas disponibles
export function getAvailableTemplates() {
  return Object.keys(TEMPLATE_METADATA)
    .filter((key) => key !== 'default')
    .map((key) => ({
      type: key,
      ...TEMPLATE_METADATA[key as keyof typeof TEMPLATE_METADATA],
    }));
}

// Función para obtener estadísticas de implementación
export function getTemplateStats() {
  const templates = getAvailableTemplates();
  const implemented = templates.filter(
    (t) => t.status === 'implemented'
  ).length;
  const pending = templates.filter((t) => t.status === 'pending').length;

  return {
    total: templates.length,
    implemented,
    pending,
    implementationRate: Math.round((implemented / templates.length) * 100),
  };
}

// Exportar componentes individuales
export { ActaDetailView, DefaultDetailView, FacturaDetailView, AlbaranDetailView, ContratoDetailView, PresupuestoDetailView, EscrituraCompraventaDetailView, ComunicadoDetailView };
