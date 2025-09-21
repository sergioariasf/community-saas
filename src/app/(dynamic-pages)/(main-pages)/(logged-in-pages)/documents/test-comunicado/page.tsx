/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Página de test para comunicado siguiendo metodología exitosa de actas
 * ESTADO: testing
 * DEPENDENCIAS: ComunicadoDetailView, datos reales de extracted_communications
 * OUTPUTS: Validación UI con datos reales de comunicado
 * ACTUALIZADO: 2025-09-18
 */

import { createSupabaseClient } from '@/supabase-clients/server';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComunicadoDetailView } from '@/components/documents/templates/ComunicadoDetailView';
import { ArrowLeft, TestTube } from 'lucide-react';
import Link from 'next/link';

// Usar ID del test exitoso
const TEST_DOCUMENT_ID = '4d41ca1d-bcae-4a85-b3e6-d8393bd5fa26';

export default async function TestComunicadoPage() {
  const supabase = await createSupabaseClient();
  
  try {
    // Obtener documento
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', TEST_DOCUMENT_ID)
      .single();
    
    if (docError) throw docError;
    
    // Obtener datos extraídos
    const { data: comunicadoData, error: comError } = await supabase
      .from('extracted_communications')
      .select('*')
      .eq('document_id', TEST_DOCUMENT_ID)
      .single();
    
    if (comError) throw comError;
    
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/documents">Documentos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/documents/templates">Plantillas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Test Comunicado</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Header de Test */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-green-600" />
              <h1 className="text-2xl font-bold">🧪 Test Plantilla COMUNICADO</h1>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Con Datos Reales
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Validación de plantilla con datos extraídos por agente real
            </p>
          </div>
          <Link 
            href="/documents/templates" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Plantillas
          </Link>
        </div>
        
        {/* Info del Test */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Información del Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">Documento:</span>
                <br />
                <span className="text-muted-foreground">
                  {document.filename}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-700">Agente:</span>
                <br />
                <span className="text-muted-foreground">
                  comunicado_extractor_v1
                </span>
              </div>
              <div>
                <span className="font-medium text-green-700">Estado:</span>
                <br />
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {document.metadata_status}
                </Badge>
              </div>
            </div>
            
            <div className="pt-2 border-t border-green-200">
              <div className="flex flex-wrap gap-4 text-xs text-green-600">
                <span>📊 Document ID: {document.id.substring(0, 8)}...</span>
                <span>📊 Extracted ID: {comunicadoData.id.substring(0, 8)}...</span>
                <span>📄 Páginas: {document.page_count}</span>
                <span>📝 Caracteres: {document.text_length?.toLocaleString()}</span>
                <span>📈 Campos extraídos: {Object.keys(comunicadoData).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Plantilla de Comunicado */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Plantilla ComunicadoDetailView</h2>
            <Badge variant="outline">
              {Object.keys(comunicadoData).length} campos
            </Badge>
          </div>
          
          <ComunicadoDetailView 
            comunicadoData={comunicadoData}
            confidence={0.95}
          />
        </div>
        
        {/* Debug Info */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-gray-700 text-sm">🔍 Debug - Datos Raw</CardTitle>
          </CardHeader>
          <CardContent>
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium text-gray-600">
                Ver datos completos extraídos por el agente
              </summary>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                {JSON.stringify(comunicadoData, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    );
    
  } catch (error) {
    console.error('Error loading test data:', error);
    
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">❌ Error en Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              No se pudieron cargar los datos del test: {error.message}
            </p>
            <p className="text-sm text-red-600 mt-2">
              Document ID: {TEST_DOCUMENT_ID}
            </p>
            <Link 
              href="/documents/templates" 
              className="inline-flex items-center gap-2 mt-4 text-sm text-red-600 hover:text-red-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Plantillas
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}