/**
 * ARCHIVO: AlbaranDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo ALBARÁN
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Vista detallada optimizada para albaranes con campos específicos
 * ACTUALIZADO: 2025-09-18
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Truck, Building2, Calendar, Package, Tag, FileText, PenTool } from 'lucide-react';

// Tipos basados en la tabla extracted_delivery_notes
export type ExtractedAlbaran = {
  id: string;
  document_id: string;
  organization_id: string;
  emisor_name: string | null;
  receptor_name: string | null;
  numero_albaran: string | null;
  fecha_emision: string | null;
  numero_pedido: string | null;
  category: string | null;
  created_at: string;
};

// Tipo para metadatos adicionales de document_metadata
export type AlbaranMetadata = {
  // Datos del emisor
  emisor_nombre?: string;
  emisor_direccion?: string;
  emisor_identificacion_fiscal?: string;
  
  // Datos del receptor
  receptor_nombre?: string;
  receptor_direccion_entrega?: string;
  receptor_identificacion_fiscal?: string;
  
  // Información del albarán
  numero_albaran?: string;
  fecha_emision?: string;
  numero_pedido?: string;
  referencia?: string;
  
  // Detalles de la mercancía
  descripcion_productos?: string[];
  cantidades?: number[];
  unidades_medida?: string[];
  
  // Confirmación de entrega
  firma_presente?: boolean;
  sello_presente?: boolean;
  observaciones?: string;
  estado_entrega?: string;
  
  // Campos existentes mantenidos
  document_date?: string;
  concepto?: string;
  topic_keywords?: string[];
  [key: string]: any; // Para topic-xxx dinámicos
};

interface AlbaranDetailViewProps {
  albaranData?: ExtractedAlbaran | null;
  metadata?: AlbaranMetadata | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export function AlbaranDetailView({
  albaranData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: AlbaranDetailViewProps) {
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
  if (!albaranData) {
    return (
      <div className="space-y-6">
        <T.H3 className="mb-0">📦 Análisis de ALBARÁN</T.H3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <T.H4 className="text-orange-800 mb-2">Sin Datos Específicos de Albarán</T.H4>
          <T.P className="text-sm text-orange-700 mb-4">
            No se encontraron datos específicos extraídos para este albarán en la tabla `extracted_delivery_notes`.
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
        <T.H3 className="mb-0">📦 Análisis de ALBARÁN</T.H3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
          <T.Small className="text-chart-4 font-medium">
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
        {/* Columna Izquierda - Información de Entrega */}
        <div className="space-y-4">
          {/* Datos Principales del Albarán */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">🚛 Información de Entrega</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Emisor:</span>
                  <span className={albaranData.emisor_name ? 'text-chart-4 font-medium' : 'text-destructive'}>
                    {albaranData.emisor_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Receptor:</span>
                  <span className={albaranData.receptor_name ? 'text-chart-4 font-medium' : 'text-destructive'}>
                    {albaranData.receptor_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Número Albarán:</span>
                  <span className={albaranData.numero_albaran ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    {albaranData.numero_albaran || 'Sin número'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha Emisión:</span>
                  <span className={albaranData.fecha_emision ? 'text-chart-4 font-medium' : 'text-destructive'}>
                    {formatDate(albaranData.fecha_emision)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nº Pedido:</span>
                  <span className={albaranData.numero_pedido ? 'text-chart-2 font-medium' : 'text-muted-foreground'}>
                    {albaranData.numero_pedido || 'Sin referencia'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className={albaranData.category ? 'text-chart-3 font-medium' : 'text-muted-foreground'}>
                    {albaranData.category || 'Sin categorizar'}
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
                      <span className="text-muted-foreground">Nombre/Razón social:</span>
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del Receptor */}
          {metadata && (metadata.receptor_nombre || metadata.receptor_direccion_entrega) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-chart-4" />
                  <T.H4 className="mb-0">📍 Datos del Receptor</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {metadata.receptor_nombre && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre/Razón social:</span>
                      <span className="text-chart-4 font-medium">
                        {metadata.receptor_nombre}
                      </span>
                    </div>
                  )}
                  {metadata.receptor_direccion_entrega && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Dirección de entrega:</span>
                      <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                        {metadata.receptor_direccion_entrega}
                      </span>
                    </div>
                  )}
                  {metadata.receptor_identificacion_fiscal && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CIF/NIF:</span>
                      <span className="text-chart-4 font-medium">
                        {metadata.receptor_identificacion_fiscal}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Derecha - Mercancía y Análisis */}
        <div className="space-y-4">
          {/* Detalles de la Mercancía */}
          {metadata && (metadata.descripcion_productos || metadata.concepto) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-chart-2" />
                  <T.H4 className="mb-0">📦 Detalles de Mercancía</T.H4>
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
                  {metadata.descripcion_productos && Array.isArray(metadata.descripcion_productos) && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Productos/Servicios:</span>
                      <div className="space-y-1">
                        {metadata.descripcion_productos.map((producto: string, index: number) => (
                          <div key={index} className="text-gray-800 bg-muted/50 rounded p-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span>{index + 1}. {producto}</span>
                              <div className="flex gap-2">
                                {metadata.cantidades && metadata.cantidades[index] && (
                                  <span className="text-chart-2 font-medium">
                                    {metadata.cantidades[index]}
                                  </span>
                                )}
                                {metadata.unidades_medida && metadata.unidades_medida[index] && (
                                  <span className="text-muted-foreground">
                                    {metadata.unidades_medida[index]}
                                  </span>
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

          {/* Confirmación de Entrega */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-chart-3" />
                <T.H4 className="mb-0">✍️ Confirmación de Entrega</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Firma presente:</span>
                  <span className={metadata?.firma_presente ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {metadata?.firma_presente ? '✅ Sí' : '❌ No detectada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sello presente:</span>
                  <span className={metadata?.sello_presente ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {metadata?.sello_presente ? '✅ Sí' : '❌ No detectado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado entrega:</span>
                  <span className="text-chart-3 font-medium">
                    {metadata?.estado_entrega || 'No especificado'}
                  </span>
                </div>
                {metadata?.observaciones && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Observaciones:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.observaciones}
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
                    {albaranData.category || 'Sin categorizar'}
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
          Datos extraídos el {new Date(albaranData.created_at).toLocaleDateString('es-ES')} • 
          Documento ID: {albaranData.document_id}
        </T.Small>
      </div>
    </div>
  );
}