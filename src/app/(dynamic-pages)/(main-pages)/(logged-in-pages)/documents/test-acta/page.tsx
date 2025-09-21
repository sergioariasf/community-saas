/**
 * ARCHIVO: page.tsx (test-acta)
 * PROPÓSITO: Página de prueba para visualizar datos reales de extracted_minutes con plantilla UI
 * ESTADO: testing
 * DEPENDENCIAS: ActaDetailView, supabase/server, extracted_minutes table
 * OUTPUTS: Visualización de datos reales del documento "ACTA 19 MAYO 2022.pdf"
 * ACTUALIZADO: 2025-09-16
 */

import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';
import { T } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ActaDetailView, type ExtractedMinutes, type ActaMetadata } from '@/components/documents/templates/ActaDetailView';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ID específico del documento "ACTA 19 MAYO 2022.pdf"
const TEST_DOCUMENT_ID = '958c2703-bd03-4495-b72c-3a85612e1833';

export default async function TestActaPage() {
  const supabase = await createSupabaseClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // PASO 1: Obtener datos del documento base
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', TEST_DOCUMENT_ID)
    .single();

  if (docError || !document) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/documents" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a documentos</span>
          </Link>
          <T.H2>🧪 TEST - Visualización de Acta Real</T.H2>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <T.H4 className="text-red-800 mb-2">❌ Error al cargar documento</T.H4>
            <T.P className="text-sm text-red-700">
              No se pudo encontrar el documento de prueba (ID: {TEST_DOCUMENT_ID})
            </T.P>
            <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">
              {JSON.stringify({ docError, TEST_DOCUMENT_ID }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PASO 2: Obtener datos de extracted_minutes
  const { data: extractedMinutes, error: minutesError } = await supabase
    .from('extracted_minutes')
    .select('*')
    .eq('document_id', TEST_DOCUMENT_ID)
    .single();

  if (minutesError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/documents" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a documentos</span>
          </Link>
          <T.H2>🧪 TEST - Visualización de Acta Real</T.H2>
        </div>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <T.H4 className="text-orange-800 mb-2">⚠️ Sin datos de extracted_minutes</T.H4>
            <T.P className="text-sm text-orange-700">
              El documento existe pero no tiene datos procesados en extracted_minutes.
            </T.P>
            <div className="mt-4 space-y-2">
              <T.Small className="block"><strong>Documento:</strong> {document.filename}</T.Small>
              <T.Small className="block"><strong>ID:</strong> {document.id}</T.Small>
              <T.Small className="block"><strong>Texto extraído:</strong> {document.extracted_text ? `${document.extracted_text.length.toLocaleString()} caracteres` : 'No disponible'}</T.Small>
              <T.Small className="block"><strong>Sugerencia:</strong> Ejecuta test_agent_simple.js para procesar este documento</T.Small>
            </div>
            <pre className="text-xs mt-4 bg-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify({ minutesError, document_info: { id: document.id, filename: document.filename } }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  // PASO 3: Preparar datos para ActaDetailView
  const actaData: ExtractedMinutes = {
    id: extractedMinutes.id,
    document_id: extractedMinutes.document_id,
    organization_id: extractedMinutes.organization_id,
    president_in: extractedMinutes.president_in,
    president_out: extractedMinutes.president_out,
    administrator: extractedMinutes.administrator,
    summary: extractedMinutes.summary,
    decisions: extractedMinutes.decisions,
    created_at: extractedMinutes.created_at
  };

  // PASO 4: Preparar metadatos para ActaDetailView
  const metadata: ActaMetadata = {
    document_date: extractedMinutes.document_date,
    tipo_reunion: extractedMinutes.tipo_reunion,
    lugar: extractedMinutes.lugar,
    comunidad_nombre: extractedMinutes.comunidad_nombre,
    orden_del_dia: extractedMinutes.orden_del_dia ? 
      (Array.isArray(extractedMinutes.orden_del_dia) ? extractedMinutes.orden_del_dia : []) : [],
    acuerdos: extractedMinutes.acuerdos ? 
      (Array.isArray(extractedMinutes.acuerdos) ? extractedMinutes.acuerdos : []) : [],
    topic_keywords: extractedMinutes.topic_keywords || [],
    estructura_detectada: extractedMinutes.estructura_detectada || {},
    
    // Temas como topic-xxx (formato esperado por ActaDetailView)
    'topic-presupuesto': extractedMinutes.topic_presupuesto,
    'topic-mantenimiento': extractedMinutes.topic_mantenimiento,
    'topic-administracion': extractedMinutes.topic_administracion,
    'topic-piscina': extractedMinutes.topic_piscina,
    'topic-jardin': extractedMinutes.topic_jardin,
    'topic-limpieza': extractedMinutes.topic_limpieza,
    'topic-balance': extractedMinutes.topic_balance,
    'topic-paqueteria': extractedMinutes.topic_paqueteria,
    'topic-energia': extractedMinutes.topic_energia,
    'topic-normativa': extractedMinutes.topic_normativa,
    'topic-proveedor': extractedMinutes.topic_proveedor,
    'topic-dinero': extractedMinutes.topic_dinero,
    'topic-ascensor': extractedMinutes.topic_ascensor,
    'topic-incendios': extractedMinutes.topic_incendios,
    'topic-porteria': extractedMinutes.topic_porteria
  };

  // PASO 5: Contabilizar temas activos para estadísticas
  const temasActivos = Object.keys(metadata)
    .filter(key => key.startsWith('topic-') && metadata[key] === true).length;
  
  const totalCamposConDatos = [
    actaData.president_in,
    actaData.administrator,
    actaData.summary,
    metadata.document_date,
    metadata.tipo_reunion,
    metadata.lugar,
    metadata.comunidad_nombre
  ].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header con navegación */}
      <div className="mb-6">
        <Link href="/documents" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a documentos</span>
        </Link>
        <div className="flex items-center justify-between">
          <T.H2>🧪 TEST - Visualización de Acta Real</T.H2>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">PASO 1</Badge>
            <Badge className="bg-green-100 text-green-800">TEST VISUAL</Badge>
          </div>
        </div>
      </div>

      {/* Panel de información del test */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <T.H4 className="text-blue-800 mb-0">📊 Información del Test</T.H4>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <T.Small className="text-muted-foreground block">Documento de prueba</T.Small>
              <T.Small className="font-medium text-blue-800">{document.filename}</T.Small>
            </div>
            <div>
              <T.Small className="text-muted-foreground block">Campos con datos</T.Small>
              <T.Small className="font-medium text-green-600">{totalCamposConDatos}/7 campos principales</T.Small>
            </div>
            <div>
              <T.Small className="text-muted-foreground block">Temas detectados</T.Small>
              <T.Small className="font-medium text-purple-600">{temasActivos}/15 temas activos</T.Small>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded border">
            <T.Small className="text-muted-foreground font-medium block mb-2">🎯 Objetivo del Test</T.Small>
            <T.Small className="text-gray-700">
              Verificar que los datos reales de la tabla <code className="bg-gray-100 px-1 rounded">extracted_minutes</code> 
              se muestran correctamente en la plantilla UI <code className="bg-gray-100 px-1 rounded">ActaDetailView</code> 
              antes de integrarlos en el pipeline principal.
            </T.Small>
          </div>
        </CardContent>
      </Card>

      {/* Renderizar la plantilla ActaDetailView con datos reales */}
      <ActaDetailView 
        actaData={actaData}
        metadata={metadata}
        confidence={0.95}
        extractionMethod="acta_extractor_v2"
        processingTime={2500}
        tokensUsed={850}
      />

      {/* Panel de depuración (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-6 border-gray-300">
          <CardHeader>
            <T.H4 className="text-gray-700 mb-0">🔧 Panel de Depuración (Dev Only)</T.H4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <T.Small className="text-muted-foreground font-medium block mb-2">Datos de extracted_minutes (raw)</T.Small>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(extractedMinutes, null, 2)}
                </pre>
              </div>
              <div>
                <T.Small className="text-muted-foreground font-medium block mb-2">Metadata procesada para UI</T.Small>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <T.Small className="text-yellow-800 font-medium block mb-2">🚨 Próximos pasos sugeridos</T.Small>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>PASO 2: Si los datos se ven correctos, integrar en página principal (/documents/[id]/page.tsx)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>PASO 3: Actualizar el pipeline para usar el agente acta_extractor_v2</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>PASO 4: Eliminar datos hardcoded de demo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}