/**
 * ARCHIVO: DocumentDetailRenderer.tsx
 * PROPÓSITO: Componente que selecciona y renderiza la plantilla adecuada según el tipo de documento
 * ESTADO: development
 * DEPENDENCIAS: templates registry, tipos de documentos
 * OUTPUTS: Renderizado dinámico de plantillas específicas
 * ACTUALIZADO: 2025-09-16
 */

import React from 'react';
import { getDocumentTemplate, getTemplateMetadata, getTemplateStats, type DocumentType } from './templates';
import { Badge } from '@/components/ui/badge';
import { T } from '@/components/ui/Typography';

// ELIMINADO HARDCODING: Import auto-discovery configuration
import { getDocumentTypeConfig } from '@/lib/ingesta/core/schemaBasedConfig';

// Tipos de datos específicos por documento (importados de la fuente principal)
import type { ExtractedMinutes, ExtractedInvoice } from '@/data/anon/documents';


// Tipo genérico para metadatos
export type DocumentMetadata = {
  [key: string]: any;
};

// Props del renderer
interface DocumentDetailRendererProps {
  documentType: string;
  specificData?: ExtractedMinutes | ExtractedInvoice | any;
  metadata?: DocumentMetadata | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
  showTemplateInfo?: boolean; // Para mostrar info de debug de la plantilla
}

// ELIMINADO HARDCODING: Helper functions for dynamic rendering
function generateDefaultExtractorName(documentType: string): string {
  const config = getDocumentTypeConfig(documentType);
  return config?.agentName || `${documentType}_extractor_v1`;
}

function generateDynamicProps(documentType: string, specificData: any): any {
  if (!specificData) return {};
  
  // Generate dynamic props based on document type conventions
  const propName = `${documentType}Data`;
  return { [propName]: specificData };
}

function generateDynamicMetadata(documentType: string, specificData: any, originalMetadata: any): any {
  const baseMetadata = { ...(originalMetadata || {}) };
  
  if (!specificData) return baseMetadata;

  // For acta type, handle special topic field mapping
  if (documentType === 'acta' && specificData) {
    const actaData = specificData as ExtractedMinutes;
    return {
      ...baseMetadata,
      // Basic fields
      document_date: actaData.document_date,
      tipo_reunion: actaData.tipo_reunion,
      lugar: actaData.lugar,
      comunidad_nombre: actaData.comunidad_nombre,
      orden_del_dia: actaData.orden_del_dia || [],
      acuerdos: actaData.acuerdos || [],
      topic_keywords: actaData.topic_keywords || [],
      estructura_detectada: actaData.estructura_detectada || {},
      // Topic fields with dash format for UI compatibility
      'topic-presupuesto': actaData.topic_presupuesto,
      'topic-mantenimiento': actaData.topic_mantenimiento,
      'topic-administracion': actaData.topic_administracion,
      'topic-piscina': actaData.topic_piscina,
      'topic-jardin': actaData.topic_jardin,
      'topic-limpieza': actaData.topic_limpieza,
      'topic-balance': actaData.topic_balance,
      'topic-paqueteria': actaData.topic_paqueteria,
      'topic-energia': actaData.topic_energia,
      'topic-normativa': actaData.topic_normativa,
      'topic-proveedor': actaData.topic_proveedor,
      'topic-dinero': actaData.topic_dinero,
      'topic-ascensor': actaData.topic_ascensor,
      'topic-incendios': actaData.topic_incendios,
      'topic-porteria': actaData.topic_porteria,
    };
  }

  // For other document types, return base metadata + specific data
  return {
    ...baseMetadata,
    ...specificData
  };
}

export function DocumentDetailRenderer({
  documentType,
  specificData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed,
  showTemplateInfo = false
}: DocumentDetailRendererProps) {
  // Obtener plantilla y metadatos
  const TemplateComponent = getDocumentTemplate(documentType);
  const templateMetadata = getTemplateMetadata(documentType);
  
  // Validar que tenemos un tipo de documento
  if (!documentType) {
    console.warn('[DocumentDetailRenderer] No document type provided, using default template');
  }

  return (
    <div className="space-y-4">
      {/* Info de plantilla (solo en desarrollo) */}
      {showTemplateInfo && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                Template: {templateMetadata.name}
              </Badge>
              <Badge 
                variant={templateMetadata.status === 'implemented' ? 'default' : 'secondary'}
                className={templateMetadata.status === 'implemented' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
                }
              >
                {templateMetadata.status}
              </Badge>
            </div>
          </div>
          <T.Small className="text-purple-700">
            <strong>Fuente:</strong> {templateMetadata.dataSource} • 
            <strong>Campos:</strong> {templateMetadata.fields.join(', ')}
          </T.Small>
        </div>
      )}

      {/* ELIMINADO HARDCODING: Renderizado dinámico basado en schema */}
      <TemplateComponent
        documentType={documentType}
        specificData={specificData}
        metadata={generateDynamicMetadata(documentType, specificData, metadata)}
        confidence={confidence}
        extractionMethod={extractionMethod || generateDefaultExtractorName(documentType)}
        processingTime={processingTime}
        tokensUsed={tokensUsed}
        {...generateDynamicProps(documentType, specificData)}
      />
    </div>
  );
}

// Hook para obtener estadísticas de plantillas
export function useTemplateStats() {
  return getTemplateStats();
}

// Componente para mostrar estadísticas de plantillas (útil para admin)
export function TemplateStatsDisplay() {
  const stats = useTemplateStats();
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Plantillas: {stats.implemented}/{stats.total} implementadas</span>
      <Badge variant="outline" className="text-xs">
        {stats.implementationRate}%
      </Badge>
    </div>
  );
}