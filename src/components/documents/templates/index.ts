/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Registro centralizado de todas las plantillas de documentos
 * ESTADO: development
 * DEPENDENCIAS: Templates individuales
 * OUTPUTS: Registry para mapear tipos de documento a componentes
 * ACTUALIZADO: 2025-09-16
 */

import { ActaDetailView } from './ActaDetailView';
import { DefaultDetailView } from './DefaultDetailView';
import { FacturaDetailView } from './FacturaDetailView';
import { AlbaranDetailView } from './AlbaranDetailView';
import { ContratoDetailView } from './ContratoDetailView';
import { PresupuestoDetailView } from './PresupuestoDetailView';
import { EscrituraCompraventaDetailView } from './EscrituraCompraventaDetailView';
import { ComunicadoDetailView } from './ComunicadoDetailView';

// Tipos soportados
export type DocumentType =
  | 'acta'
  | 'factura'
  | 'albaran'
  | 'contrato'
  | 'comunicado'
  | 'presupuesto'
  | 'escritura'
  | string; // Para tipos dinámicos

// Registry de plantillas
export const DOCUMENT_TEMPLATES = {
  // Plantillas específicas implementadas
  acta: ActaDetailView,
  factura: FacturaDetailView,
  albaran: AlbaranDetailView,
  contrato: ContratoDetailView,
  presupuesto: PresupuestoDetailView,
  escritura: EscrituraCompraventaDetailView,
  comunicado: ComunicadoDetailView,

  // Plantilla por defecto
  default: DefaultDetailView,
} as const;

// Metadatos de plantillas para debugging y documentación
export const TEMPLATE_METADATA = {
  acta: {
    name: 'Actas de Junta',
    description:
      'Plantilla específica para actas con personas clave, decisiones y estructura',
    status: 'implemented',
    dataSource: 'extracted_minutes',
    fields: [
      'president_in',
      'president_out',
      'administrator',
      'summary',
      'decisions',
    ],
    lastUpdated: '2025-09-16',
  },
  factura: {
    name: 'Facturas',
    description: 'Plantilla para facturas con datos comerciales',
    status: 'implemented',
    dataSource: 'extracted_invoices',
    fields: [
      'provider_name',
      'client_name',
      'amount',
      'invoice_date',
      'category',
    ],
    lastUpdated: '2025-09-16',
  },
  albaran: {
    name: 'Albaranes',
    description: 'Plantilla para albaranes y notas de entrega',
    status: 'implemented',
    dataSource: 'extracted_delivery_notes',
    fields: [
      'emisor_name',
      'receptor_name',
      'numero_albaran',
      'fecha_emision',
      'numero_pedido',
      'category',
    ],
    lastUpdated: '2025-09-18',
  },
  contrato: {
    name: 'Contratos',
    description: 'Plantilla para contratos y acuerdos legales',
    status: 'implemented',
    dataSource: 'extracted_contracts',
    fields: [
      'titulo_contrato',
      'parte_a',
      'parte_b',
      'objeto_contrato',
      'duracion',
      'importe_total',
      'fecha_inicio',
      'fecha_fin',
    ],
    lastUpdated: '2025-09-18',
  },
  comunicado: {
    name: 'Comunicados Vecinos',
    description: 'Plantilla para comunicados vecinales y oficiales',
    status: 'implemented',
    dataSource: 'extracted_communications',
    fields: [
      'fecha',
      'comunidad',
      'remitente',
      'resumen',
      'asunto',
      'urgencia',
      'destinatarios',
      'accion_requerida',
    ],
    lastUpdated: '2025-09-18',
  },
  presupuesto: {
    name: 'Presupuestos',
    description: 'Plantilla para presupuestos y cotizaciones',
    status: 'implemented',
    dataSource: 'extracted_budgets',
    fields: [
      'numero_presupuesto',
      'emisor_name',
      'cliente_name',
      'fecha_emision',
      'fecha_validez',
      'subtotal',
      'impuestos',
      'total',
    ],
    lastUpdated: '2025-09-18',
  },
  escritura: {
    name: 'Escrituras de Compraventa',
    description: 'Plantilla para escrituras de compraventa inmobiliaria',
    status: 'implemented',
    dataSource: 'extracted_property_deeds',
    fields: [
      'vendedor_nombre',
      'comprador_nombre',
      'direccion_inmueble',
      'precio_venta',
      'fecha_escritura',
      'notario_nombre',
      'referencia_catastral',
      'superficie_m2',
    ],
    lastUpdated: '2025-09-18',
  },
  default: {
    name: 'Genérica',
    description: 'Plantilla fallback para tipos no implementados',
    status: 'implemented',
    dataSource: 'document_metadata',
    fields: ['dynamic'],
    lastUpdated: '2025-09-16',
  },
} as const;

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
