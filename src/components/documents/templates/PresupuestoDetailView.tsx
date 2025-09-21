/**
 * ARCHIVO: PresupuestoDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo PRESUPUESTO
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Vista detallada optimizada para presupuestos con campos específicos
 * ACTUALIZADO: 2025-09-18
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calculator, Building2, Users, Calendar, Euro, Tag, FileText, Clock, CheckCircle } from 'lucide-react';

// Tipos basados en la tabla extracted_budgets
export type ExtractedPresupuesto = {
  id: string;
  document_id: string;
  organization_id: string;
  numero_presupuesto: string | null;
  emisor_name: string | null;
  cliente_name: string | null;
  fecha_emision: string | null;
  fecha_validez: string | null;
  subtotal: number | null;
  impuestos: number | null;
  total: number | null;
  category: string | null;
  created_at: string;
};

// Tipo para metadatos adicionales de document_metadata
export type PresupuestoMetadata = {
  // Título
  titulo?: string;
  tipo_documento?: string;
  
  // Información del emisor
  emisor_nombre?: string;
  emisor_direccion?: string;
  emisor_telefono?: string;
  emisor_email?: string;
  emisor_identificacion_fiscal?: string;
  
  // Información del cliente
  cliente_nombre?: string;
  cliente_direccion?: string;
  cliente_identificacion_fiscal?: string;
  
  // Detalles del presupuesto
  numero_presupuesto?: string;
  fecha_emision?: string;
  fecha_validez?: string;
  
  // Descripción del trabajo y costos
  descripcion_servicios?: string[];
  cantidades?: number[];
  precios_unitarios?: number[];
  importes_totales?: number[];
  descripciones_detalladas?: string[];
  
  // Resumen final y condiciones
  subtotal?: number;
  porcentaje_impuestos?: number;
  importe_impuestos?: number;
  total?: number;
  moneda?: string;
  
  // Notas y condiciones
  condiciones_pago?: string;
  plazos_entrega?: string;
  pago_inicial_requerido?: boolean;
  notas_adicionales?: string;
  garantia?: string;
  
  // Campos existentes mantenidos
  document_date?: string;
  concepto?: string;
  topic_keywords?: string[];
  [key: string]: any; // Para topic-xxx dinámicos
};

interface PresupuestoDetailViewProps {
  presupuestoData?: ExtractedPresupuesto | null;
  metadata?: PresupuestoMetadata | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export function PresupuestoDetailView({
  presupuestoData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: PresupuestoDetailViewProps) {
  // Formatear importe
  const formatAmount = (amount: number | null) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: metadata?.moneda || 'EUR'
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No especificada';
    try {
      return new Date(dateStr).toLocaleDateString('es-ES');
    } catch {
      return dateStr;
    }
  };

  // Si no hay datos específicos, mostrar mensaje
  if (!presupuestoData) {
    return (
      <div className="space-y-6">
        <T.H3 className="mb-0">💵 Análisis de PRESUPUESTO</T.H3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <T.H4 className="text-orange-800 mb-2">Sin Datos Específicos de Presupuesto</T.H4>
          <T.P className="text-sm text-orange-700 mb-4">
            No se encontraron datos específicos extraídos para este presupuesto en la tabla `extracted_budgets`.
          </T.P>
          {metadata && (
            <div className="bg-white rounded-lg p-4 text-left">
              <T.Small className="font-medium block mb-2">Metadatos genéricos disponibles:</T.Small>
              <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <T.H3 className="mb-0">💵 Análisis de PRESUPUESTO</T.H3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-5 rounded-full"></div>
          <T.Small className="text-chart-5 font-medium">
            Datos procesados
          </T.Small>
        </div>
      </div>

      {/* Información técnica de procesamiento - Solo desarrollo */}
      {process.env.NODE_ENV === 'development' && (tokensUsed || processingTime) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded">DEV ONLY</div>
            <T.Small className="text-gray-600 font-medium">
              {processingTime && `Tiempo: ${processingTime}ms`}
              {tokensUsed && ` • Tokens: ${tokensUsed}`}
              {extractionMethod && ` • Método: ${extractionMethod}`}
              {confidence && ` • Confianza: ${Math.round(confidence * 100)}%`}
            </T.Small>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda - Información Principal y Partes */}
        <div className="space-y-4">
          {/* Información Principal del Presupuesto */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-chart-5" />
                <T.H4 className="mb-0">📊 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Título:</span>
                  <span className={metadata?.titulo ? 'text-chart-5 font-medium' : 'text-muted-foreground'}>
                    {metadata?.titulo || 'Presupuesto'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Número:</span>
                  <span className={presupuestoData.numero_presupuesto ? 'text-chart-5 font-medium' : 'text-destructive'}>
                    {presupuestoData.numero_presupuesto || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha emisión:</span>
                  <span className={presupuestoData.fecha_emision ? 'text-chart-5 font-medium' : 'text-destructive'}>
                    {formatDate(presupuestoData.fecha_emision)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha validez:</span>
                  <span className={presupuestoData.fecha_validez ? 'text-chart-2 font-medium' : 'text-destructive'}>
                    {formatDate(presupuestoData.fecha_validez)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className={presupuestoData.category ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    {presupuestoData.category || 'Sin categorizar'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Emisor */}
          {metadata && (metadata.emisor_nombre || metadata.emisor_direccion || metadata.emisor_identificacion_fiscal) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <T.H4 className="mb-0">🏢 Datos del Emisor</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {metadata.emisor_nombre && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre/Empresa:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.emisor_nombre}
                      </span>
                    </div>
                  )}
                  {metadata.emisor_direccion && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Dirección:</span>
                      <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                        {metadata.emisor_direccion}
                      </span>
                    </div>
                  )}
                  {metadata.emisor_identificacion_fiscal && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CIF/NIF:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.emisor_identificacion_fiscal}
                      </span>
                    </div>
                  )}
                  {metadata.emisor_telefono && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teléfono:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.emisor_telefono}
                      </span>
                    </div>
                  )}
                  {metadata.emisor_email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.emisor_email}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-chart-4" />
                <T.H4 className="mb-0">👤 Datos del Cliente</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className={presupuestoData.cliente_name ? 'text-chart-4 font-medium' : 'text-destructive'}>
                    {presupuestoData.cliente_name || '❌ No especificado'}
                  </span>
                </div>
                {metadata?.cliente_direccion && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Dirección:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.cliente_direccion}
                    </span>
                  </div>
                )}
                {metadata?.cliente_identificacion_fiscal && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CIF/NIF:</span>
                    <span className="text-chart-4 font-medium">
                      {metadata.cliente_identificacion_fiscal}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen Económico */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-chart-4" />
                <T.H4 className="mb-0">💰 Resumen Económico</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className={presupuestoData.subtotal ? 'text-gray-800 font-medium' : 'text-destructive'}>
                    {formatAmount(presupuestoData.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos:</span>
                  <span className={presupuestoData.impuestos ? 'text-chart-2 font-medium' : 'text-destructive'}>
                    {formatAmount(presupuestoData.impuestos)}
                  </span>
                </div>
                {metadata?.porcentaje_impuestos && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">% Impuestos:</span>
                    <span className="text-chart-2 font-medium">
                      {metadata.porcentaje_impuestos}%
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground font-semibold">Total a pagar:</span>
                  <span className={presupuestoData.total ? 'text-chart-4 font-bold text-lg' : 'text-destructive'}>
                    {formatAmount(presupuestoData.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha - Servicios, Condiciones y Keywords */}
        <div className="space-y-4">
          {/* Descripción del Trabajo y Costos */}
          {metadata && (metadata.descripcion_servicios || metadata.concepto) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-chart-1" />
                  <T.H4 className="mb-0">📋 Servicios/Productos</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {metadata.concepto && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Concepto general:</span>
                      <span className="text-gray-800 bg-muted/50 rounded p-2 block">
                        {metadata.concepto}
                      </span>
                    </div>
                  )}
                  {metadata.descripcion_servicios && Array.isArray(metadata.descripcion_servicios) && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Detalle de servicios:</span>
                      <div className="space-y-1">
                        {metadata.descripcion_servicios.map((servicio: string, index: number) => (
                          <div key={index} className="text-gray-800 bg-muted/50 rounded p-2 text-xs">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium">{index + 1}. {servicio}</div>
                                {metadata.descripciones_detalladas && metadata.descripciones_detalladas[index] && (
                                  <div className="text-muted-foreground text-xs mt-1">
                                    {metadata.descripciones_detalladas[index]}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-2">
                                {metadata.cantidades && metadata.cantidades[index] && (
                                  <div className="text-chart-2 font-medium">
                                    {metadata.cantidades[index]} ud.
                                  </div>
                                )}
                                {metadata.precios_unitarios && metadata.precios_unitarios[index] && (
                                  <div className="text-chart-3 font-medium">
                                    {formatAmount(metadata.precios_unitarios[index])}
                                  </div>
                                )}
                                {metadata.importes_totales && metadata.importes_totales[index] && (
                                  <div className="text-chart-4 font-bold">
                                    {formatAmount(metadata.importes_totales[index])}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Condiciones y Notas */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-chart-3" />
                <T.H4 className="mb-0">📝 Condiciones</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                {metadata?.condiciones_pago && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Condiciones de pago:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.condiciones_pago}
                    </span>
                  </div>
                )}
                {metadata?.plazos_entrega && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Plazos de entrega:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.plazos_entrega}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago inicial requerido:</span>
                  <span className={metadata?.pago_inicial_requerido ? 'text-chart-2 font-medium' : 'text-muted-foreground'}>
                    {metadata?.pago_inicial_requerido ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                {metadata?.garantia && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Garantía:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.garantia}
                    </span>
                  </div>
                )}
                {metadata?.notas_adicionales && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Notas adicionales:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.notas_adicionales}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keywords y Categorización */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">🏷️ Keywords y Categorización</T.H4>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Categoría principal */}
                <div>
                  <T.Small className="text-muted-foreground font-medium mb-2 block">
                    📂 Categoría Detectada
                  </T.Small>
                  <Badge 
                    variant="default" 
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {presupuestoData.category || 'Sin categorizar'}
                  </Badge>
                </div>

                <Separator />

                {/* Keywords principales extraídas */}
                {metadata?.topic_keywords && Array.isArray(metadata.topic_keywords) && (
                  <div>
                    <T.Small className="text-muted-foreground font-medium mb-2 block">
                      🔍 Keywords Detectadas
                    </T.Small>
                    <div className="flex flex-wrap gap-2">
                      {metadata.topic_keywords.map((keyword: string, index: number) => (
                        <Badge key={`main-${index}`} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords de tópicos específicos (topic-xxx) */}
                {metadata && Object.entries(metadata)
                  .filter(([key, value]) => key.startsWith('topic-'))
                  .length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <T.Small className="text-muted-foreground font-medium mb-2 block">
                        🎯 Temas Específicos
                      </T.Small>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(metadata)
                          .filter(([key, value]) => key.startsWith('topic-'))
                          .map(([key, value]) => {
                            const topicName = key.replace('topic-', '');
                            const isActive = value === true || value === 'true';
                            return (
                              <Badge 
                                key={key} 
                                variant={isActive ? "default" : "secondary"}
                                className={isActive 
                                  ? "bg-chart-4/10 text-chart-4 border-chart-4/20" 
                                  : "bg-muted text-muted-foreground border-border"
                                }
                              >
                                {topicName}
                              </Badge>
                            );
                          })}
                      </div>
                    </div>
                  </>
                )}

                {/* Si no hay keywords */}
                {(!metadata?.topic_keywords || metadata.topic_keywords.length === 0) &&
                 !metadata || !Object.keys(metadata).some(key => key.startsWith('topic-')) && (
                  <div className="text-center py-4">
                    <Badge variant="outline" className="text-muted-foreground">
                      Sin keywords detectadas
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Información de procesamiento */}
      <div className="text-center">
        <T.Small className="text-muted-foreground">
          Datos extraídos el {new Date(presupuestoData.created_at).toLocaleDateString('es-ES')} • 
          Documento ID: {presupuestoData.document_id}
        </T.Small>
      </div>
    </div>
  );
}