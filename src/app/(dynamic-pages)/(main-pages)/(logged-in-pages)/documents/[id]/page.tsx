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
    } else if (document.document_type === 'escritura') {
      console.log('DocumentPageSimple - Document is escritura, fetching extracted_property_deeds...');
      const { data: escritura, error: escrituraError } = await supabase
        .from('extracted_property_deeds')
        .select('*')
        .eq('document_id', id)
        .single();

      console.log('DocumentPageSimple - Escritura query result:', {
        hasEscritura: !!escritura,
        error: escrituraError?.message || 'no error'
      });

      extractedData = escritura;
    } else if (document.document_type === 'albaran') {
      console.log('DocumentPageSimple - Document is albaran, fetching extracted_delivery_notes...');
      const { data: albaran, error: albaranError } = await supabase
        .from('extracted_delivery_notes')
        .select('*')
        .eq('document_id', id)
        .single();

      console.log('DocumentPageSimple - Albaran query result:', {
        hasAlbaran: !!albaran,
        error: albaranError?.message || 'no error'
      });

      extractedData = albaran;
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

              {extractedData && document.document_type === 'escritura' && (
                <div>
                  <T.H4>🏠 Datos extraídos (extracted_property_deeds)</T.H4>
                  <div className="bg-orange-50 p-3 rounded text-sm">
                    <div><strong>Vendedor:</strong> {extractedData.vendedor_nombre || 'N/A'}</div>
                    <div><strong>Comprador:</strong> {extractedData.comprador_nombre || 'N/A'}</div>
                    <div><strong>Dirección inmueble:</strong> {extractedData.direccion_inmueble || 'N/A'}</div>
                    <div><strong>Precio venta:</strong> {extractedData.precio_venta ? `${extractedData.precio_venta.toLocaleString()} €` : 'N/A'}</div>
                    <div><strong>Fecha escritura:</strong> {extractedData.fecha_escritura || 'N/A'}</div>
                    <div><strong>Notario:</strong> {extractedData.notario_nombre || 'N/A'}</div>
                    <div><strong>Referencia catastral:</strong> {extractedData.referencia_catastral || 'N/A'}</div>
                    <div><strong>Superficie:</strong> {extractedData.superficie_m2 ? `${extractedData.superficie_m2} m²` : 'N/A'}</div>
                    <div><strong>Tipo inmueble:</strong> {extractedData.tipo_inmueble || 'N/A'}</div>
                    <div><strong>Categoría:</strong> {extractedData.category || 'N/A'}</div>
                    <div><strong>Registro:</strong> {extractedData.registro_propiedad?.substring(0, 50) + '...' || 'N/A'}</div>
                    <div><strong>Moneda:</strong> {extractedData.moneda || 'N/A'}</div>
                    <div><strong>Estado conservación:</strong> {extractedData.estado_conservacion || 'N/A'}</div>
                    <div><strong>Libre de cargas:</strong> {extractedData.libre_cargas ? 'Sí' : 'No'}</div>
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

              {document.document_type === 'escritura' && !extractedData && (
                <div>
                  <T.H4>⚠️ Sin datos extraídos</T.H4>
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    Este documento es una escritura pero no tiene datos en extracted_property_deeds.
                    Necesita ser procesado por el agente escritura_extractor_v1.
                  </div>
                </div>
              )}

              {extractedData && document.document_type === 'albaran' && (
                <div>
                  <T.H4>📦 Datos extraídos (extracted_delivery_notes)</T.H4>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <div><strong>Emisor:</strong> {extractedData.emisor_name || 'N/A'}</div>
                    <div><strong>Receptor:</strong> {extractedData.receptor_name || 'N/A'}</div>
                    <div><strong>Número albarán:</strong> {extractedData.numero_albaran || 'N/A'}</div>
                    <div><strong>Fecha emisión:</strong> {extractedData.fecha_emision || 'N/A'}</div>
                    <div><strong>Número pedido:</strong> {extractedData.numero_pedido || 'N/A'}</div>
                    <div><strong>Productos:</strong> {
                      extractedData.productos && extractedData.productos.length > 0 
                        ? `${extractedData.productos.length} producto(s)`
                        : 'No especificados'
                    }</div>
                    <div><strong>Lugar entrega:</strong> {extractedData.lugar_entrega || 'N/A'}</div>
                    <div><strong>Transportista:</strong> {extractedData.transportista_nombre || 'N/A'}</div>
                    <div><strong>Observaciones:</strong> {extractedData.observaciones?.substring(0, 100) || 'Ninguna'}</div>
                    <div><strong>Estado entrega:</strong> {extractedData.estado_entrega || 'N/A'}</div>
                    <div><strong>Categoría:</strong> {extractedData.category || 'N/A'}</div>
                  </div>
                </div>
              )}

              {document.document_type === 'albaran' && !extractedData && (
                <div>
                  <T.H4>⚠️ Sin datos extraídos</T.H4>
                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    Este documento es un albarán pero no tiene datos en extracted_delivery_notes.
                    Necesita ser procesado por el agente albaran_extractor_v1.
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
                          ...extractedData  // Pasar todos los campos automáticamente
                        };
                        
                        const metadata = {
                          ...extractedData  // Pasar todos los campos automáticamente como metadata también
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
                          ...extractedData  // Pasar todos los campos automáticamente
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
                          ...extractedData  // Pasar todos los campos automáticamente
                        };

                        const facturaMetadata = {
                          ...extractedData  // Pasar todos los campos automáticamente
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
                          ...extractedData  // Pasar todos los campos automáticamente
                        };

                        const contratoMetadata = {
                          ...extractedData  // Pasar todos los campos automáticamente
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

              {/* RENDER ESCRITURA TEMPLATE si hay datos */}
              {document.document_type === 'escritura' && extractedData && (
                <div className="mt-8">
                  <div className="border-t border-gray-200 pt-6">
                    <T.H3 className="mb-4">🏠 Vista Completa de la Escritura</T.H3>
                    {(() => {
                      try {
                        const { EscrituraCompraventaDetailView } = require('@/components/documents/templates/EscrituraCompraventaDetailView');
                        
                        // Pasar TODOS los campos de la tabla directamente en escrituraData
                        const escrituraData = {
                          ...extractedData // Pasar todos los campos de la base de datos directamente
                        };

                        // Ya no necesitamos metadata, la plantilla usa directamente escrituraData
                        const escrituraMetadata = null;
                        
                        return (
                          <EscrituraCompraventaDetailView
                            escrituraData={escrituraData}
                            metadata={escrituraMetadata}
                            confidence={0.96}
                            extractionMethod="escritura_extractor_v1"
                            processingTime={8800}
                            tokensUsed={1200}
                          />
                        );
                      } catch (error) {
                        console.error('Error renderizando EscrituraCompraventaDetailView:', error);
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

              {/* RENDER ALBARAN TEMPLATE si hay datos */}
              {document.document_type === 'albaran' && extractedData && (
                <div className="mt-8">
                  <div className="border-t border-gray-200 pt-6">
                    <T.H3 className="mb-4">📦 Vista Completa del Albarán</T.H3>
                    {(() => {
                      try {
                        const { AlbaranDetailView } = require('@/components/documents/templates/AlbaranDetailView');
                        
                        const albaranData = {
                          ...extractedData  // Pasar todos los campos automáticamente
                        };

                        const albaranMetadata = {
                          ...extractedData  // Pasar todos los campos automáticamente
                        };
                        
                        return (
                          <AlbaranDetailView
                            albaranData={albaranData}
                            metadata={albaranMetadata}
                            confidence={0.95}
                            extractionMethod="albaran_extractor_v1"
                            processingTime={3000}
                            tokensUsed={750}
                          />
                        );
                      } catch (error) {
                        console.error('Error renderizando AlbaranDetailView:', error);
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