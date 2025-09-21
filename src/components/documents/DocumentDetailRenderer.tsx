/**
 * ARCHIVO: DocumentDetailRenderer.tsx
 * PROPÓSITO: Componente que selecciona y renderiza la plantilla adecuada según el tipo de documento
 * ESTADO: development
 * DEPENDENCIAS: templates registry, tipos de documentos
 * OUTPUTS: Renderizado dinámico de plantillas específicas
 * ACTUALIZADO: 2025-09-16
 */

import React from 'react';
import { getDocumentTemplate, getTemplateMetadata, type DocumentType } from './templates';
import { Badge } from '@/components/ui/badge';
import { T } from '@/components/ui/Typography';

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

      {/* Renderizar plantilla seleccionada */}
      {documentType === 'acta' && specificData ? (
        // Para actas con datos reales, usar los datos de extracted_minutes
        <TemplateComponent
          documentType={documentType}
          specificData={specificData}
          actaData={specificData as ExtractedMinutes}
          metadata={{
            ...(metadata || {}),
            // Campos básicos
            document_date: (specificData as ExtractedMinutes).document_date,
            tipo_reunion: (specificData as ExtractedMinutes).tipo_reunion,
            lugar: (specificData as ExtractedMinutes).lugar,
            comunidad_nombre: (specificData as ExtractedMinutes).comunidad_nombre,
            orden_del_dia: (specificData as ExtractedMinutes).orden_del_dia || [],
            acuerdos: (specificData as ExtractedMinutes).acuerdos || [],
            topic_keywords: (specificData as ExtractedMinutes).topic_keywords || [],
            estructura_detectada: (specificData as ExtractedMinutes).estructura_detectada || {},
            // Temas con guiones
            'topic-presupuesto': (specificData as ExtractedMinutes).topic_presupuesto,
            'topic-mantenimiento': (specificData as ExtractedMinutes).topic_mantenimiento,
            'topic-administracion': (specificData as ExtractedMinutes).topic_administracion,
            'topic-piscina': (specificData as ExtractedMinutes).topic_piscina,
            'topic-jardin': (specificData as ExtractedMinutes).topic_jardin,
            'topic-limpieza': (specificData as ExtractedMinutes).topic_limpieza,
            'topic-balance': (specificData as ExtractedMinutes).topic_balance,
            'topic-paqueteria': (specificData as ExtractedMinutes).topic_paqueteria,
            'topic-energia': (specificData as ExtractedMinutes).topic_energia,
            'topic-normativa': (specificData as ExtractedMinutes).topic_normativa,
            'topic-proveedor': (specificData as ExtractedMinutes).topic_proveedor,
            'topic-dinero': (specificData as ExtractedMinutes).topic_dinero,
            'topic-ascensor': (specificData as ExtractedMinutes).topic_ascensor,
            'topic-incendios': (specificData as ExtractedMinutes).topic_incendios,
            'topic-porteria': (specificData as ExtractedMinutes).topic_porteria,
          }}
          confidence={confidence}
          extractionMethod={extractionMethod || 'acta_extractor_v2'}
          processingTime={processingTime}
          tokensUsed={tokensUsed}
        />
      ) : documentType === 'comunicado' && specificData ? (
        // Para comunicados con datos reales, usar los datos de extracted_communications
        <TemplateComponent
          documentType={documentType}
          specificData={specificData}
          comunicadoData={specificData}
          confidence={confidence}
          extractionMethod={extractionMethod || 'comunicado_extractor_v1'}
          processingTime={processingTime}
          tokensUsed={tokensUsed}
        />
      ) : (
        // Para otros tipos o sin datos específicos, usar el método original
        <TemplateComponent
          documentType={documentType}
          specificData={specificData}
          metadata={metadata}
          confidence={confidence}
          extractionMethod={extractionMethod}
          processingTime={processingTime}
          tokensUsed={tokensUsed}
          {...(documentType === 'factura' && specificData ? {
            facturaData: specificData as ExtractedInvoice
          } : {})}
        />
      )}
    </div>
  );
}

// Hook para obtener estadísticas de plantillas
export function useTemplateStats() {
  const { getTemplateStats } = require('./templates');
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