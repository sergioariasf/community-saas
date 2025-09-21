/**
 * ARCHIVO: page-simple.tsx
 * PROPÓSITO: Página simplificada para debug - sin DocumentDetailRenderer complejo
 * ESTADO: testing
 * DEPENDENCIAS: supabase, datos básicos
 * OUTPUTS: Debug de la carga de documento
 * ACTUALIZADO: 2025-09-16
 */

import { createSupabaseClient } from '@/supabase-clients/server';
import { T } from '@/components/ui/Typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function DocumentPageSimple({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  console.log('DocumentPageSimple - Starting with ID:', id);
  
  try {
    const supabase = await createSupabaseClient();
    console.log('DocumentPageSimple - Supabase client created');

    // 1. Obtener documento básico
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    console.log('DocumentPageSimple - Document query result:', {
      hasDocument: !!document,
      error: docError?.message || 'no error',
      documentType: document?.document_type
    });

    if (docError || !document) {
      console.log('DocumentPageSimple - Document not found');
      return (
        <div className="container mx-auto px-4 py-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <T.H4 className="text-red-800 mb-2">❌ Documento no encontrado</T.H4>
              <T.P className="text-sm text-red-700">
                ID: {id}
              </T.P>
              <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">
                {JSON.stringify(docError, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      );
    }

    // 2. Obtener datos específicos según el tipo
    let extractedData = null;
    if (document.document_type === 'acta') {
      console.log('DocumentPageSimple - Document is acta, fetching extracted_minutes...');
      const { data: minutes, error: minutesError } = await supabase
        .from('extracted_minutes')
        .select('*')
        .eq('document_id', id)
        .single();

      console.log('DocumentPageSimple - Minutes query result:', {
        hasMinutes: !!minutes,
        error: minutesError?.message || 'no error'
      });

      extractedData = minutes;
    } else if (document.document_type === 'comunicado') {
      console.log('DocumentPageSimple - Document is comunicado, fetching extracted_communications...');
      const { data: comunicado, error: comunicadoError } = await supabase
        .from('extracted_communications')
        .select('*')
        .eq('document_id', id)
        .single();

      console.log('DocumentPageSimple - Comunicado query result:', {
        hasComunicado: !!comunicado,
        error: comunicadoError?.message || 'no error'
      });

      extractedData = comunicado;
    } else if (document.document_type === 'factura') {
      console.log('DocumentPageSimple - Document is factura, fetching extracted_invoices...');
      const { data: factura, error: facturaError } = await supabase
        .from('extracted_invoices')
        .select('*')
        .eq('document_id', id)
        .single();

      console.log('DocumentPageSimple - Factura query result:', {
        hasFactura: !!factura,
        error: facturaError?.message || 'no error'
      });

      extractedData = factura;
    } else if (document.document_type === 'contrato') {
      console.log('DocumentPageSimple - Document is contrato, fetching extracted_contracts...');
      const { data: contrato, error: contratoError } = await supabase
        .from('extracted_contracts')
        .select('*')
        .eq('document_id', id)
        .single();

      console.log('DocumentPageSimple - Contrato query result:', {
        hasContrato: !!contrato,
        error: contratoError?.message || 'no error'
      });

      extractedData = contrato;
    }

    console.log('DocumentPageSimple - Rendering page...');

    return (
      <div className="container mx-auto px-4 py-6">
        <Link href="/documents" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a documentos</span>
        </Link>

        <Card>
          <CardHeader>
            <T.H2>🧪 DEBUG - {document.filename}</T.H2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <T.H4>📄 Documento básico</T.H4>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <div><strong>ID:</strong> {document.id}</div>
                  <div><strong>Tipo:</strong> {document.document_type}</div>
                  <div><strong>Tamaño:</strong> {(document.file_size / 1024 / 1024).toFixed(1)} MB</div>
                  <div><strong>Fecha:</strong> {new Date(document.created_at).toLocaleDateString('es-ES')}</div>
                </div>
              </div>

              {extractedData && document.document_type === 'acta' && (
                <div>
                  <T.H4>📋 Datos extraídos (extracted_minutes)</T.H4>
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <div><strong>Administrador:</strong> {extractedData.administrator || 'N/A'}</div>
                    <div><strong>Presidente:</strong> {extractedData.president_in || 'N/A'}</div>
                    <div><strong>Fecha acta:</strong> {extractedData.document_date || 'N/A'}</div>
                    <div><strong>Tipo reunión:</strong> {extractedData.tipo_reunion || 'N/A'}</div>
                    <div><strong>Lugar:</strong> {extractedData.lugar || 'N/A'}</div>
                    <div><strong>Temas detectados:</strong> {
                      Object.keys(extractedData)
                        .filter(key => key.startsWith('topic_') && extractedData[key] === true)
                        .map(key => key.replace('topic_', ''))
                        .join(', ') || 'Ninguno'
                    }</div>
                  </div>
                </div>
              )}

              {extractedData && document.document_type === 'comunicado' && (
                <div>
                  <T.H4>📢 Datos extraídos (extracted_communications)</T.H4>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <div><strong>Fecha:</strong> {extractedData.fecha || 'N/A'}</div>
                    <div><strong>Comunidad:</strong> {extractedData.comunidad || 'N/A'}</div>
                    <div><strong>Remitente:</strong> {extractedData.remitente || 'N/A'}</div>
                    <div><strong>Asunto:</strong> {extractedData.asunto?.substring(0, 100) + '...' || 'N/A'}</div>
                    <div><strong>Categoría:</strong> {extractedData.category || 'N/A'}</div>
                    <div><strong>Urgencia:</strong> {extractedData.urgencia || 'N/A'}</div>
                    <div><strong>Tipo:</strong> {extractedData.tipo_comunicado || 'N/A'}</div>
                    <div><strong>Requiere respuesta:</strong> {extractedData.requiere_respuesta ? 'Sí' : 'No'}</div>
                    <div><strong>Acciones:</strong> {
                      extractedData.accion_requerida && extractedData.accion_requerida.length > 0 
                        ? extractedData.accion_requerida.join(', ')
                        : 'Ninguna'
                    }</div>
                  </div>
                </div>
              )}

              {extractedData && document.document_type === 'factura' && (
                <div>
                  <T.H4>💰 Datos extraídos (extracted_invoices)</T.H4>
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <div><strong>Proveedor:</strong> {extractedData.provider_name || 'N/A'}</div>
                    <div><strong>Cliente:</strong> {extractedData.client_name || 'N/A'}</div>
                    <div><strong>Número factura:</strong> {extractedData.invoice_number || 'N/A'}</div>
                    <div><strong>Fecha emisión:</strong> {extractedData.issue_date || extractedData.invoice_date || 'N/A'}</div>
                    <div><strong>Fecha vencimiento:</strong> {extractedData.due_date || 'N/A'}</div>
                    <div><strong>Subtotal:</strong> {extractedData.subtotal ? `${extractedData.subtotal} €` : 'N/A'}</div>
                    <div><strong>IVA:</strong> {extractedData.tax_amount ? `${extractedData.tax_amount} €` : 'N/A'}</div>
                    <div><strong>Total:</strong> {extractedData.total_amount || extractedData.amount ? `${extractedData.total_amount || extractedData.amount} €` : 'N/A'}</div>
                    <div><strong>Categoría:</strong> {extractedData.category || 'N/A'}</div>
                    <div><strong>Método pago:</strong> {extractedData.payment_method || 'N/A'}</div>
                    <div><strong>Productos:</strong> {
                      extractedData.products && extractedData.products.length > 0 
                        ? `${extractedData.products.length} producto(s)`
                        : 'No especificados'
                    }</div>
                  </div>
                </div>
              )}

              {extractedData && document.document_type === 'contrato' && (
                <div>
                  <T.H4>📝 Datos extraídos (extracted_contracts)</T.H4>
                  <div className="bg-purple-50 p-3 rounded text-sm">
                    <div><strong>Título:</strong> {extractedData.titulo_contrato || 'N/A'}</div>
                    <div><strong>Tipo contrato:</strong> {extractedData.tipo_contrato || 'N/A'}</div>
                    <div><strong>Parte A:</strong> {extractedData.parte_a || 'N/A'}</div>
                    <div><strong>Parte B:</strong> {extractedData.parte_b || 'N/A'}</div>
                    <div><strong>Objeto:</strong> {extractedData.objeto_contrato?.substring(0, 100) + '...' || 'N/A'}</div>
                    <div><strong>Fecha inicio:</strong> {extractedData.fecha_inicio || 'N/A'}</div>
                    <div><strong>Fecha fin:</strong> {extractedData.fecha_fin || 'N/A'}</div>
                    <div><strong>Duración:</strong> {extractedData.duracion || 'N/A'}</div>
                    <div><strong>Importe total:</strong> {extractedData.importe_total ? `${extractedData.importe_total} €` : 'N/A'}</div>
                    <div><strong>Moneda:</strong> {extractedData.moneda || 'N/A'}</div>
                    <div><strong>Forma pago:</strong> {extractedData.forma_pago || 'N/A'}</div>
                    <div><strong>Categoría:</strong> {extractedData.category || 'N/A'}</div>
                    <div><strong>Confidencialidad:</strong> {extractedData.confidencialidad ? 'Sí' : 'No'}</div>
                    <div><strong>Legislación:</strong> {extractedData.legislacion_aplicable || 'N/A'}</div>
                  </div>
                </div>
              )}

              {document.document_type === 'acta' && !extractedData && (
                <div>
                  <T.H4>⚠️ Sin datos extraídos</T.H4>
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    Este documento es un acta pero no tiene datos en extracted_minutes.
                    Necesita ser procesado por el agente acta_extractor_v2.
                  </div>
                </div>
              )}

              {document.document_type === 'comunicado' && !extractedData && (
                <div>
                  <T.H4>⚠️ Sin datos extraídos</T.H4>
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    Este documento es un comunicado pero no tiene datos en extracted_communications.
                    Necesita ser procesado por el agente comunicado_extractor_v1.
                  </div>
                </div>
              )}

              {document.document_type === 'factura' && !extractedData && (
                <div>
                  <T.H4>⚠️ Sin datos extraídos</T.H4>
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    Este documento es una factura pero no tiene datos en extracted_invoices.
                    Necesita ser procesado por el agente factura_extractor_v2.
                  </div>
                </div>
              )}

              {document.document_type === 'contrato' && !extractedData && (
                <div>
                  <T.H4>⚠️ Sin datos extraídos</T.H4>
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    Este documento es un contrato pero no tiene datos en extracted_contracts.
                    Necesita ser procesado por el agente contrato_extractor_v1.
                  </div>
                </div>
              )}

              {/* RENDER ACTA TEMPLATE si hay datos */}
              {document.document_type === 'acta' && extractedData && (
                <div className="mt-8">
                  <div className="border-t border-gray-200 pt-6">
                    <T.H3 className="mb-4">📋 Vista Completa del Acta</T.H3>
                    {(() => {
                      try {
                        const { ActaDetailView } = require('@/components/documents/templates/ActaDetailView');
                        
                        const actaData = {
                          id: extractedData.id,
                          document_id: extractedData.document_id,
                          organization_id: extractedData.organization_id,
                          president_in: extractedData.president_in,
                          president_out: extractedData.president_out,
                          administrator: extractedData.administrator,
                          summary: extractedData.summary,
                          decisions: extractedData.decisions,
                          created_at: extractedData.created_at
                        };
                        
                        const metadata = {
                          document_date: extractedData.document_date,
                          tipo_reunion: extractedData.tipo_reunion,
                          lugar: extractedData.lugar,
                          comunidad_nombre: extractedData.comunidad_nombre,
                          orden_del_dia: extractedData.orden_del_dia || [],
                          acuerdos: extractedData.acuerdos || [],
                          topic_keywords: extractedData.topic_keywords || [],
                          estructura_detectada: extractedData.estructura_detectada || {},
                          'topic-presupuesto': extractedData.topic_presupuesto,
                          'topic-mantenimiento': extractedData.topic_mantenimiento,
                          'topic-administracion': extractedData.topic_administracion,
                          'topic-piscina': extractedData.topic_piscina,
                          'topic-jardin': extractedData.topic_jardin,
                          'topic-limpieza': extractedData.topic_limpieza,
                          'topic-balance': extractedData.topic_balance,
                          'topic-paqueteria': extractedData.topic_paqueteria,
                          'topic-energia': extractedData.topic_energia,
                          'topic-normativa': extractedData.topic_normativa,
                          'topic-proveedor': extractedData.topic_proveedor,
                          'topic-dinero': extractedData.topic_dinero,
                          'topic-ascensor': extractedData.topic_ascensor,
                          'topic-incendios': extractedData.topic_incendios,
                          'topic-porteria': extractedData.topic_porteria,
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
                      } catch (error) {
                        console.error('Error renderizando ActaDetailView:', error);
                        return (
                          <div className="bg-red-50 p-4 rounded border border-red-200">
                            <T.H4 className="text-red-800">Error renderizando plantilla</T.H4>
                            <T.Small className="text-red-700">
                              {error instanceof Error ? error.message : 'Error desconocido'}
                            </T.Small>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* RENDER COMUNICADO TEMPLATE si hay datos */}
              {document.document_type === 'comunicado' && extractedData && (
                <div className="mt-8">
                  <div className="border-t border-gray-200 pt-6">
                    <T.H3 className="mb-4">📢 Vista Completa del Comunicado</T.H3>
                    {(() => {
                      try {
                        const { ComunicadoDetailView } = require('@/components/documents/templates/ComunicadoDetailView');
                        
                        const comunicadoData = {
                          id: extractedData.id,
                          document_id: extractedData.document_id,
                          organization_id: extractedData.organization_id,
                          fecha: extractedData.fecha,
                          comunidad: extractedData.comunidad,
                          remitente: extractedData.remitente,
                          resumen: extractedData.resumen,
                          category: extractedData.category,
                          asunto: extractedData.asunto,
                          tipo_comunicado: extractedData.tipo_comunicado,
                          urgencia: extractedData.urgencia,
                          comunidad_direccion: extractedData.comunidad_direccion,
                          remitente_cargo: extractedData.remitente_cargo,
                          destinatarios: extractedData.destinatarios,
                          fecha_limite: extractedData.fecha_limite,
                          categoria_comunicado: extractedData.categoria_comunicado,
                          requiere_respuesta: extractedData.requiere_respuesta,
                          accion_requerida: extractedData.accion_requerida,
                          anexos: extractedData.anexos,
                          contacto_info: extractedData.contacto_info,
                          created_at: extractedData.created_at
                        };
                        
                        return (
                          <ComunicadoDetailView
                            comunicadoData={comunicadoData}
                            confidence={0.95}
                            extractionMethod="comunicado_extractor_v1"
                            processingTime={4000}
                            tokensUsed={600}
                          />
                        );
                      } catch (error) {
                        console.error('Error renderizando ComunicadoDetailView:', error);
                        return (
                          <div className="bg-red-50 p-4 rounded border border-red-200">
                            <T.H4 className="text-red-800">Error renderizando plantilla</T.H4>
                            <T.Small className="text-red-700">
                              {error instanceof Error ? error.message : 'Error desconocido'}
                            </T.Small>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* RENDER FACTURA TEMPLATE si hay datos */}
              {document.document_type === 'factura' && extractedData && (
                <div className="mt-8">
                  <div className="border-t border-gray-200 pt-6">
                    <T.H3 className="mb-4">💰 Vista Completa de la Factura</T.H3>
                    {(() => {
                      try {
                        const { FacturaDetailView } = require('@/components/documents/templates/FacturaDetailView');
                        
                        const facturaData = {
                          id: extractedData.id,
                          document_id: extractedData.document_id,
                          organization_id: extractedData.organization_id,
                          provider_name: extractedData.provider_name,
                          client_name: extractedData.client_name,
                          amount: extractedData.amount,
                          invoice_date: extractedData.invoice_date,
                          category: extractedData.category,
                          created_at: extractedData.created_at
                        };

                        const facturaMetadata = {
                          // Campos principales de la tabla
                          invoice_number: extractedData.invoice_number,
                          issue_date: extractedData.issue_date,
                          due_date: extractedData.due_date,
                          subtotal: extractedData.subtotal,
                          tax_amount: extractedData.tax_amount,
                          total_amount: extractedData.total_amount,
                          currency: extractedData.currency,
                          payment_method: extractedData.payment_method,
                          vendor_address: extractedData.vendor_address,
                          vendor_tax_id: extractedData.vendor_tax_id,
                          client_address: extractedData.client_address,
                          client_tax_id: extractedData.client_tax_id,
                          products: extractedData.products,
                          payment_terms: extractedData.payment_terms,
                          notes: extractedData.notes,
                          
                          // Campos compatibles con plantilla
                          document_date: extractedData.issue_date || extractedData.invoice_date,
                          proveedor: extractedData.provider_name,
                          cliente: extractedData.client_name,
                          importe: extractedData.total_amount || extractedData.amount,
                          numero_factura: extractedData.invoice_number,
                          fecha_emision: extractedData.issue_date,
                          fecha_vencimiento: extractedData.due_date,
                          vendedor_nombre: extractedData.provider_name,
                          vendedor_direccion: extractedData.vendor_address,
                          vendedor_identificacion_fiscal: extractedData.vendor_tax_id,
                          vendedor_telefono: extractedData.vendor_phone,
                          vendedor_email: extractedData.vendor_email,
                          cliente_nombre: extractedData.client_name,
                          cliente_direccion: extractedData.client_address,
                          cliente_identificacion_fiscal: extractedData.client_tax_id,
                          subtotal: extractedData.subtotal,
                          iva: extractedData.tax_amount,
                          importe_total: extractedData.total_amount,
                          forma_pago: extractedData.payment_method,
                          moneda: extractedData.currency || 'EUR',
                          vencimiento: extractedData.due_date,
                          datos_bancarios: extractedData.bank_details
                        };
                        
                        return (
                          <FacturaDetailView
                            facturaData={facturaData}
                            metadata={facturaMetadata}
                            confidence={0.94}
                            extractionMethod="factura_extractor_v2"
                            processingTime={3500}
                            tokensUsed={850}
                          />
                        );
                      } catch (error) {
                        console.error('Error renderizando FacturaDetailView:', error);
                        return (
                          <div className="bg-red-50 p-4 rounded border border-red-200">
                            <T.H4 className="text-red-800">Error renderizando plantilla</T.H4>
                            <T.Small className="text-red-700">
                              {error instanceof Error ? error.message : 'Error desconocido'}
                            </T.Small>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* RENDER CONTRATO TEMPLATE si hay datos */}
              {document.document_type === 'contrato' && extractedData && (
                <div className="mt-8">
                  <div className="border-t border-gray-200 pt-6">
                    <T.H3 className="mb-4">📝 Vista Completa del Contrato</T.H3>
                    {(() => {
                      try {
                        const { ContratoDetailView } = require('@/components/documents/templates/ContratoDetailView');
                        
                        const contratoData = {
                          id: extractedData.id,
                          document_id: extractedData.document_id,
                          organization_id: extractedData.organization_id,
                          titulo_contrato: extractedData.titulo_contrato,
                          parte_a: extractedData.parte_a,
                          parte_b: extractedData.parte_b,
                          objeto_contrato: extractedData.objeto_contrato,
                          duracion: extractedData.duracion,
                          importe_total: extractedData.importe_total,
                          fecha_inicio: extractedData.fecha_inicio,
                          fecha_fin: extractedData.fecha_fin,
                          category: extractedData.category,
                          created_at: extractedData.created_at
                        };

                        const contratoMetadata = {
                          // Campos principales de la tabla
                          tipo_contrato: extractedData.tipo_contrato,
                          parte_a_direccion: extractedData.parte_a_direccion,
                          parte_a_identificacion_fiscal: extractedData.parte_a_identificacion_fiscal,
                          parte_a_representante: extractedData.parte_a_representante,
                          parte_b_direccion: extractedData.parte_b_direccion,
                          parte_b_identificacion_fiscal: extractedData.parte_b_identificacion_fiscal,
                          parte_b_representante: extractedData.parte_b_representante,
                          descripcion_detallada: extractedData.descripcion_detallada,
                          alcance_servicios: extractedData.alcance_servicios,
                          obligaciones_parte_a: extractedData.obligaciones_parte_a,
                          obligaciones_parte_b: extractedData.obligaciones_parte_b,
                          moneda: extractedData.moneda,
                          forma_pago: extractedData.forma_pago,
                          plazos_pago: extractedData.plazos_pago,
                          penalizaciones: extractedData.penalizaciones,
                          confidencialidad: extractedData.confidencialidad,
                          condiciones_terminacion: extractedData.condiciones_terminacion,
                          legislacion_aplicable: extractedData.legislacion_aplicable,
                          jurisdiccion: extractedData.jurisdiccion,
                          fecha_firma: extractedData.fecha_firma,
                          lugar_firma: extractedData.lugar_firma,
                          firmas_presentes: extractedData.firmas_presentes,
                          
                          // Campos compatibles con plantilla
                          document_date: extractedData.fecha_inicio,
                          titulo_contrato: extractedData.titulo_contrato,
                          parte_a_nombre: extractedData.parte_a,
                          parte_b_nombre: extractedData.parte_b,
                          objeto_contrato: extractedData.objeto_contrato,
                          fecha_inicio: extractedData.fecha_inicio,
                          fecha_fin: extractedData.fecha_fin,
                          duracion: extractedData.duracion,
                          importe_total: extractedData.importe_total
                        };
                        
                        return (
                          <ContratoDetailView
                            contratoData={contratoData}
                            metadata={contratoMetadata}
                            confidence={0.93}
                            extractionMethod="contrato_extractor_v1"
                            processingTime={4500}
                            tokensUsed={950}
                          />
                        );
                      } catch (error) {
                        console.error('Error renderizando ContratoDetailView:', error);
                        return (
                          <div className="bg-red-50 p-4 rounded border border-red-200">
                            <T.H4 className="text-red-800">Error renderizando plantilla</T.H4>
                            <T.Small className="text-red-700">
                              {error instanceof Error ? error.message : 'Error desconocido'}
                            </T.Small>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              <div>
                <T.Small className="text-muted-foreground">
                  Esta es una página de debug simplificada. Si funciona, el problema está en DocumentDetailRenderer.
                </T.Small>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  } catch (error: any) {
    console.error('DocumentPageSimple - Error:', error);
    
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <T.H4 className="text-red-800 mb-2">💥 Error fatal</T.H4>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">
              {JSON.stringify({
                message: error.message,
                stack: error.stack?.substring(0, 500),
                name: error.name
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }
}