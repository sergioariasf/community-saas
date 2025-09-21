/**
 * ARCHIVO: FacturaDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo FACTURA
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Vista detallada optimizada para facturas con campos específicos
 * ACTUALIZADO: 2025-09-16
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { CreditCard, Building2, Calendar, Euro, Tag, FileText } from 'lucide-react';

// Tipos basados en la tabla extracted_invoices
export type ExtractedInvoice = {
  id: string;
  document_id: string;
  organization_id: string;
  provider_name: string | null;
  client_name: string | null;
  amount: number | null;
  invoice_date: string | null;
  category: string | null;
  created_at: string;
};

// Tipo para metadatos adicionales de document_metadata (si existen)
export type FacturaMetadata = {
  // Información del vendedor
  vendedor_nombre?: string;
  vendedor_direccion?: string;
  vendedor_identificacion_fiscal?: string;
  vendedor_telefono?: string;
  vendedor_email?: string;
  
  // Información del cliente
  cliente_nombre?: string;
  cliente_direccion?: string;
  cliente_identificacion_fiscal?: string;
  
  // Datos de la factura
  numero_factura?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  
  // Detalles de productos/servicios
  descripcion_productos?: string[];
  cantidades?: number[];
  precios_unitarios?: number[];
  importes_linea?: number[];
  
  // Totales y métodos de pago
  subtotal?: number;
  iva?: number;
  importe_total?: number;
  forma_pago?: string;
  datos_bancarios?: string;
  
  // Campos existentes mantenidos
  document_date?: string;
  proveedor?: string;
  cliente?: string;
  importe?: number;
  moneda?: string;
  concepto?: string;
  vencimiento?: string;
  topic_keywords?: string[];
  [key: string]: any; // Para topic-xxx dinámicos
};

interface FacturaDetailViewProps {
  facturaData?: ExtractedInvoice | null;
  metadata?: FacturaMetadata | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export function FacturaDetailView({
  facturaData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: FacturaDetailViewProps) {
  // Formatear importe
  const formatAmount = (amount: number | null) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
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
  if (!facturaData) {
    return (
      <div className="space-y-6">
        <T.H3 className="mb-0">💰 Análisis de FACTURA</T.H3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <T.H4 className="text-orange-800 mb-2">Sin Datos Específicos de Factura</T.H4>
          <T.P className="text-sm text-orange-700 mb-4">
            No se encontraron datos específicos extraídos para esta factura en la tabla `extracted_invoices`.
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
        <T.H3 className="mb-0">💰 Análisis de FACTURA</T.H3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <T.Small className="text-green-700 font-medium">
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
        {/* Columna Izquierda - Información Comercial */}
        <div className="space-y-4">
          {/* Datos Principales */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">💳 Información Comercial</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span className={facturaData.provider_name ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {facturaData.provider_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className={facturaData.client_name ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {facturaData.client_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className={facturaData.category ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                    {facturaData.category || 'Sin categorizar'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos Económicos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-orange-600" />
                <T.H4 className="mb-0">💵 Información Económica</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Importe:</span>
                  <span className={facturaData.amount ? 'text-green-600 font-bold text-lg' : 'text-red-600'}>
                    {formatAmount(facturaData.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha Factura:</span>
                  <span className={facturaData.invoice_date ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {formatDate(facturaData.invoice_date)}
                  </span>
                </div>
                {/* Datos adicionales del metadata si existen */}
                {metadata?.numero_factura && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Número:</span>
                    <span className="text-blue-600 font-medium">
                      {metadata.numero_factura}
                    </span>
                  </div>
                )}
                {metadata?.vencimiento && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vencimiento:</span>
                    <span className="text-orange-600 font-medium">
                      {formatDate(metadata.vencimiento)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del Vendedor */}
          {metadata && (metadata.vendedor_nombre || metadata.vendedor_direccion || metadata.vendedor_identificacion_fiscal) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <T.H4 className="mb-0">🏢 Información del Vendedor</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {metadata.vendedor_nombre && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre/Razón social:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.vendedor_nombre}
                      </span>
                    </div>
                  )}
                  {metadata.vendedor_direccion && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Dirección:</span>
                      <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                        {metadata.vendedor_direccion}
                      </span>
                    </div>
                  )}
                  {metadata.vendedor_identificacion_fiscal && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CIF/NIF:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.vendedor_identificacion_fiscal}
                      </span>
                    </div>
                  )}
                  {metadata.vendedor_telefono && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teléfono:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.vendedor_telefono}
                      </span>
                    </div>
                  )}
                  {metadata.vendedor_email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.vendedor_email}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detalles de Productos/Servicios */}
          {metadata && (metadata.descripcion_productos || metadata.concepto) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <T.H4 className="mb-0">📋 Productos/Servicios</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {metadata.concepto && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Concepto:</span>
                      <span className="text-gray-800 bg-muted/50 rounded p-2 block">
                        {metadata.concepto}
                      </span>
                    </div>
                  )}
                  {metadata.descripcion_productos && Array.isArray(metadata.descripcion_productos) && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Productos/Servicios:</span>
                      <div className="space-y-1">
                        {metadata.descripcion_productos.map((producto: string, index: number) => (
                          <div key={index} className="text-gray-800 bg-muted/50 rounded p-2 text-xs">
                            {index + 1}. {producto}
                            {metadata.cantidades && metadata.cantidades[index] && (
                              <span className="text-muted-foreground ml-2">× {metadata.cantidades[index]}</span>
                            )}
                            {metadata.precios_unitarios && metadata.precios_unitarios[index] && (
                              <span className="text-green-600 font-medium ml-2">
                                {formatAmount(metadata.precios_unitarios[index])}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {metadata.subtotal && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="text-gray-800 font-medium">
                        {formatAmount(metadata.subtotal)}
                      </span>
                    </div>
                  )}
                  {metadata.iva && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IVA:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.iva}%
                      </span>
                    </div>
                  )}
                  {metadata.importe_total && (
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground font-semibold">Total:</span>
                      <span className="text-green-600 font-bold text-lg">
                        {formatAmount(metadata.importe_total)}
                      </span>
                    </div>
                  )}
                  {metadata.moneda && metadata.moneda !== 'EUR' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moneda:</span>
                      <span className="text-blue-600 font-medium">
                        {metadata.moneda}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Derecha - Análisis y Keywords */}
        <div className="space-y-4">
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
                    className="bg-blue-100 text-blue-800 border-blue-300"
                  >
                    {facturaData.category || 'Sin categorizar'}
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
                    <Badge variant="outline" className="text-gray-500">
                      Sin keywords detectadas
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de Pago */}
          {metadata && (metadata.forma_pago || metadata.datos_bancarios) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <T.H4 className="mb-0">💳 Información de Pago</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {metadata.forma_pago && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Forma de pago:</span>
                      <span className="text-green-600 font-medium">
                        {metadata.forma_pago}
                      </span>
                    </div>
                  )}
                  {metadata.datos_bancarios && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Datos bancarios:</span>
                      <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs font-mono">
                        {metadata.datos_bancarios}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Información de procesamiento */}
      <div className="text-center">
        <T.Small className="text-muted-foreground">
          Datos extraídos el {new Date(facturaData.created_at).toLocaleDateString('es-ES')} • 
          Documento ID: {facturaData.document_id}
        </T.Small>
      </div>
    </div>
  );
}