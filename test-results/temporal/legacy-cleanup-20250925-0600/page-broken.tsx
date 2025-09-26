/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista detallada del documento con información del pipeline progresivo
 * ESTADO: production
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Vista completa del documento con metadatos y estado del pipeline
 * ACTUALIZADO: 2025-09-15
 */
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { getDocument, getExtractedMinutes, getExtractedInvoice } from '@/data/anon/documents';
import { createSupabaseClient } from '@/supabase-clients/server';
import { DocumentDetailRenderer } from '@/components/documents/DocumentDetailRenderer';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Building2,
  User,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Función para obtener metadatos ricos de la tabla document_metadata
async function getDocumentMetadata(documentId: string) {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from('document_metadata')
      .select('*')
      .eq('document_id', documentId)
      .eq('is_current', true)
      .single();

    if (error || !data) {
      console.log('No metadata found in document_metadata table for', documentId);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching document metadata:', error);
    return null;
  }
}

async function Document({ documentId }: { documentId: string }) {
  try {
    const [result, richMetadata] = await Promise.all([
      getDocument(documentId),
      getDocumentMetadata(documentId)
    ]);
    
    if (!result.success || !result.data) {
      return notFound();
    }

    const document = result.data;

    // Obtener datos específicos según el tipo de documento
    let specificData = null;
    if (document.document_type === 'acta') {
      const minutesResult = await getExtractedMinutes(documentId);
      specificData = minutesResult.success ? minutesResult.data : null;
    } else if (document.document_type === 'factura') {
      const invoiceResult = await getExtractedInvoice(documentId);
      specificData = invoiceResult.success ? invoiceResult.data : null;
    }

    return (
      <Card className="shadow-md border-t-4 border-t-blue-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Link
              href="/documents"
              className="text-sm text-muted-foreground hover:text-blue-500 flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> 
              <span>Volver a Documentos</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📄</div>
            <div className="flex-1">
              <T.H2 className="mb-1">{document.filename}</T.H2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Subido el {new Date(document.created_at).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4 space-y-6">
          {/* Estado del Pipeline */}
          <div>
            <T.H3 className="mb-4">Estado del Pipeline Progresivo</T.H3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`text-center p-3 rounded ${document.extraction_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                <div className="text-xs font-medium">Extracción</div>
                <div className="text-lg">{document.extraction_status === 'completed' ? '✅' : '⏳'}</div>
                <div className="text-xs">{document.extraction_status || 'pending'}</div>
              </div>
              
              {document.processing_level >= 2 && (
                <div className={`text-center p-3 rounded ${document.classification_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                  <div className="text-xs font-medium">Clasificación</div>
                  <div className="text-lg">{document.classification_status === 'completed' ? '✅' : '⏳'}</div>
                  <div className="text-xs">{document.classification_status || 'pending'}</div>
                </div>
              )}
              
              {document.processing_level >= 3 && (
                <div className={`text-center p-3 rounded ${document.metadata_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                  <div className="text-xs font-medium">Metadatos</div>
                  <div className="text-lg">{document.metadata_status === 'completed' ? '✅' : '⏳'}</div>
                  <div className="text-xs">{document.metadata_status || 'pending'}</div>
                </div>
              )}
              
              {document.processing_level >= 4 && (
                <div className={`text-center p-3 rounded ${document.chunking_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                  <div className="text-xs font-medium">Chunking</div>
                  <div className="text-lg">{document.chunking_status === 'completed' ? '✅' : '⏳'}</div>
                  <div className="text-xs">{document.chunking_status || 'pending'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Información Técnica Básica */}
          <div>
            <T.H3 className="mb-4">Información Técnica</T.H3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-sm font-medium">Tamaño</div>
                <div className="text-lg">{(document.file_size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
              
              {document.page_count && (
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-sm font-medium">Páginas</div>
                  <div className="text-lg">{document.page_count}</div>
                </div>
              )}
              
              {document.chunks_count && (
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-sm font-medium">Chunks</div>
                  <div className="text-lg">{document.chunks_count}</div>
                </div>
              )}
              
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-sm font-medium">Tipo</div>
                <div className="text-sm">{document.document_type}</div>
              </div>
            </div>
          </div>

          {/* Sistema de plantillas dinámico */}
          <Separator />
          
          {/* Renderizado directo para actas */}
          {document.document_type === 'acta' && specificData ? (
            <>
              {/* Import directo de ActaDetailView */}
              {(() => {
                const { ActaDetailView } = require('@/components/documents/templates/ActaDetailView');
                const actaData = {
                  id: specificData.id,
                  document_id: specificData.document_id,
                  organization_id: specificData.organization_id,
                  president_in: specificData.president_in,
                  president_out: specificData.president_out,
                  administrator: specificData.administrator,
                  summary: specificData.summary,
                  decisions: specificData.decisions,
                  created_at: specificData.created_at
                };
                
                const metadata = {
                  document_date: specificData.document_date,
                  tipo_reunion: specificData.tipo_reunion,
                  lugar: specificData.lugar,
                  comunidad_nombre: specificData.comunidad_nombre,
                  orden_del_dia: specificData.orden_del_dia || [],
                  acuerdos: specificData.acuerdos || [],
                  topic_keywords: specificData.topic_keywords || [],
                  estructura_detectada: specificData.estructura_detectada || {},
                  'topic-presupuesto': specificData.topic_presupuesto,
                  'topic-mantenimiento': specificData.topic_mantenimiento,
                  'topic-administracion': specificData.topic_administracion,
                  'topic-piscina': specificData.topic_piscina,
                  'topic-jardin': specificData.topic_jardin,
                  'topic-limpieza': specificData.topic_limpieza,
                  'topic-balance': specificData.topic_balance,
                  'topic-paqueteria': specificData.topic_paqueteria,
                  'topic-energia': specificData.topic_energia,
                  'topic-normativa': specificData.topic_normativa,
                  'topic-proveedor': specificData.topic_proveedor,
                  'topic-dinero': specificData.topic_dinero,
                  'topic-ascensor': specificData.topic_ascensor,
                  'topic-incendios': specificData.topic_incendios,
                  'topic-porteria': specificData.topic_porteria,
                };
                
                return (
                  <ActaDetailView
                    actaData={actaData}
                    metadata={metadata}
                    confidence={0.96}
                    extractionMethod="acta_extractor_v2"
                    processingTime={2500}
                    tokensUsed={850}
                  />
                );
              })()}
            </>
          ) : (
            /* Para otros tipos, usar DocumentDetailRenderer */
            <DocumentDetailRenderer
              documentType={document.document_type || 'default'}
              specificData={specificData}
              metadata={richMetadata?.metadata || null}
              confidence={richMetadata?.confidence}
              extractionMethod={richMetadata?.extraction_method}
              processingTime={richMetadata?.processing_time_ms}
              tokensUsed={richMetadata?.tokens_used}
              showTemplateInfo={process.env.NODE_ENV === 'development'}
            />
          )}

          {/* Fallback si no hay metadatos ricos */}
          {!richMetadata && (
            <>
              <Separator />
              <div>
                <T.H3 className="mb-4">❌ Sin Metadatos de IA</T.H3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <T.P className="mb-0 text-sm text-yellow-800">
                    No se encontraron metadatos extraídos con Gemini IA para este documento.
                    Esto puede significar que el procesamiento falló o que no se completó el nivel 3.
                  </T.P>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    return notFound();
  }
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<div>Cargando documento...</div>}>
        <Document documentId={id} />
      </Suspense>
    </div>
  );
}