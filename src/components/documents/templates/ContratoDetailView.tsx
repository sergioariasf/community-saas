/**
 * ARCHIVO: ContratoDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo CONTRATO
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Vista detallada optimizada para contratos con campos específicos
 * ACTUALIZADO: 2025-09-18
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Building2, Users, Calendar, Euro, Tag, FileText, PenTool, Scale, Clock } from 'lucide-react';

// Tipos basados en la tabla extracted_contracts
export type ExtractedContrato = {
  id: string;
  document_id: string;
  organization_id: string;
  titulo_contrato: string | null;
  parte_a: string | null;
  parte_b: string | null;
  objeto_contrato: string | null;
  duracion: string | null;
  importe_total: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  category: string | null;
  created_at: string;
};

// Tipo para metadatos adicionales de document_metadata
export type ContratoMetadata = {
  // Encabezado o título
  titulo_contrato?: string;
  tipo_contrato?: string;
  
  // Identificación de las partes
  parte_a_nombre?: string;
  parte_a_direccion?: string;
  parte_a_identificacion_fiscal?: string;
  parte_a_representante?: string;
  
  parte_b_nombre?: string;
  parte_b_direccion?: string;
  parte_b_identificacion_fiscal?: string;
  parte_b_representante?: string;
  
  // Objeto y alcance del acuerdo
  objeto_contrato?: string;
  descripcion_detallada?: string;
  alcance_servicios?: string[];
  
  // Términos y condiciones
  fecha_inicio?: string;
  fecha_fin?: string;
  duracion?: string;
  obligaciones_parte_a?: string[];
  obligaciones_parte_b?: string[];
  
  // Condiciones económicas
  importe_total?: number;
  moneda?: string;
  forma_pago?: string;
  plazos_pago?: string[];
  penalizaciones?: string;
  
  // Aspectos legales
  confidencialidad?: boolean;
  condiciones_terminacion?: string;
  legislacion_aplicable?: string;
  jurisdiccion?: string;
  
  // Firma
  fecha_firma?: string;
  lugar_firma?: string;
  firmas_presentes?: boolean;
  
  // Campos existentes mantenidos
  document_date?: string;
  concepto?: string;
  topic_keywords?: string[];
  [key: string]: any; // Para topic-xxx dinámicos
};

interface ContratoDetailViewProps {
  contratoData?: ExtractedContrato | null;
  metadata?: ContratoMetadata | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export function ContratoDetailView({
  contratoData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: ContratoDetailViewProps) {
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
  if (!contratoData) {
    return (
      <div className="space-y-6">
        <T.H3 className="mb-0">📝 Análisis de CONTRATO</T.H3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <T.H4 className="text-orange-800 mb-2">Sin Datos Específicos de Contrato</T.H4>
          <T.P className="text-sm text-orange-700 mb-4">
            No se encontraron datos específicos extraídos para este contrato en la tabla `extracted_contracts`.
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
        <T.H3 className="mb-0">📝 Análisis de CONTRATO</T.H3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
          <T.Small className="text-chart-3 font-medium">
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
        {/* Columna Izquierda - Identificación y Términos */}
        <div className="space-y-4">
          {/* Información Principal del Contrato */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-chart-3" />
                <T.H4 className="mb-0">📄 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Título:</span>
                  <span className={contratoData.titulo_contrato ? 'text-chart-3 font-medium' : 'text-destructive'}>
                    {contratoData.titulo_contrato || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo contrato:</span>
                  <span className={metadata?.tipo_contrato ? 'text-chart-3 font-medium' : 'text-muted-foreground'}>
                    {metadata?.tipo_contrato || 'No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className={contratoData.category ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    {contratoData.category || 'Sin categorizar'}
                  </span>
                </div>
                {contratoData.objeto_contrato && (
                  <div>
                    <span className="text-muted-foreground block mb-1 text-sm">Objeto del contrato:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-sm">
                      {contratoData.objeto_contrato}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Identificación de las Partes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">👥 Partes Contratantes</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parte A */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Parte A:</span>
                  <span className={contratoData.parte_a ? 'text-blue-600 font-medium' : 'text-destructive'}>
                    {contratoData.parte_a || '❌ No especificada'}
                  </span>
                </div>
                {metadata?.parte_a_direccion && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mb-1">
                    {metadata.parte_a_direccion}
                  </div>
                )}
                {metadata?.parte_a_identificacion_fiscal && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">CIF/NIF: </span>
                    <span className="text-blue-600 font-medium">{metadata.parte_a_identificacion_fiscal}</span>
                  </div>
                )}
                {metadata?.parte_a_representante && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Representante: </span>
                    <span className="text-blue-600">{metadata.parte_a_representante}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Parte B */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Parte B:</span>
                  <span className={contratoData.parte_b ? 'text-blue-600 font-medium' : 'text-destructive'}>
                    {contratoData.parte_b || '❌ No especificada'}
                  </span>
                </div>
                {metadata?.parte_b_direccion && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mb-1">
                    {metadata.parte_b_direccion}
                  </div>
                )}
                {metadata?.parte_b_identificacion_fiscal && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">CIF/NIF: </span>
                    <span className="text-blue-600 font-medium">{metadata.parte_b_identificacion_fiscal}</span>
                  </div>
                )}
                {metadata?.parte_b_representante && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Representante: </span>
                    <span className="text-blue-600">{metadata.parte_b_representante}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Términos Temporales y Económicos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-chart-2" />
                <T.H4 className="mb-0">⏰ Términos y Condiciones</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha inicio:</span>
                  <span className={contratoData.fecha_inicio ? 'text-chart-2 font-medium' : 'text-destructive'}>
                    {formatDate(contratoData.fecha_inicio)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha fin:</span>
                  <span className={contratoData.fecha_fin ? 'text-chart-2 font-medium' : 'text-destructive'}>
                    {formatDate(contratoData.fecha_fin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración:</span>
                  <span className={contratoData.duracion ? 'text-chart-2 font-medium' : 'text-muted-foreground'}>
                    {contratoData.duracion || 'No especificada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Importe total:</span>
                  <span className={contratoData.importe_total ? 'text-chart-4 font-bold text-lg' : 'text-destructive'}>
                    {formatAmount(contratoData.importe_total)}
                  </span>
                </div>
                {metadata?.forma_pago && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forma de pago:</span>
                    <span className="text-chart-2 font-medium">
                      {metadata.forma_pago}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha - Objeto, Obligaciones y Legales */}
        <div className="space-y-4">
          {/* Objeto y Alcance */}
          {metadata && (metadata.descripcion_detallada || metadata.alcance_servicios) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-chart-1" />
                  <T.H4 className="mb-0">🎯 Objeto y Alcance</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {metadata.descripcion_detallada && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Descripción detallada:</span>
                      <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                        {metadata.descripcion_detallada}
                      </span>
                    </div>
                  )}
                  {metadata.alcance_servicios && Array.isArray(metadata.alcance_servicios) && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Alcance de servicios:</span>
                      <div className="space-y-1">
                        {metadata.alcance_servicios.map((servicio: string, index: number) => (
                          <div key={index} className="text-gray-800 bg-muted/50 rounded p-2 text-xs">
                            • {servicio}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Obligaciones de las Partes */}
          {metadata && (metadata.obligaciones_parte_a || metadata.obligaciones_parte_b) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-chart-5" />
                  <T.H4 className="mb-0">⚖️ Obligaciones</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {metadata.obligaciones_parte_a && Array.isArray(metadata.obligaciones_parte_a) && (
                  <div>
                    <span className="text-muted-foreground block mb-1 font-medium">Obligaciones Parte A:</span>
                    <div className="space-y-1">
                      {metadata.obligaciones_parte_a.map((obligacion: string, index: number) => (
                        <div key={index} className="text-gray-800 bg-blue-50 rounded p-2 text-xs">
                          {index + 1}. {obligacion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {metadata.obligaciones_parte_b && Array.isArray(metadata.obligaciones_parte_b) && (
                  <div>
                    <span className="text-muted-foreground block mb-1 font-medium">Obligaciones Parte B:</span>
                    <div className="space-y-1">
                      {metadata.obligaciones_parte_b.map((obligacion: string, index: number) => (
                        <div key={index} className="text-gray-800 bg-chart-3/10 rounded p-2 text-xs">
                          {index + 1}. {obligacion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Aspectos Legales y Firma */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-chart-3" />
                <T.H4 className="mb-0">⚖️ Aspectos Legales</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidencialidad:</span>
                  <span className={metadata?.confidencialidad ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {metadata?.confidencialidad ? '✅ Incluida' : '❌ No especificada'}
                  </span>
                </div>
                {metadata?.legislacion_aplicable && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Legislación:</span>
                    <span className="text-chart-3 font-medium">
                      {metadata.legislacion_aplicable}
                    </span>
                  </div>
                )}
                {metadata?.jurisdiccion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jurisdicción:</span>
                    <span className="text-chart-3 font-medium">
                      {metadata.jurisdiccion}
                    </span>
                  </div>
                )}
                {metadata?.fecha_firma && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha firma:</span>
                    <span className="text-chart-4 font-medium">
                      {formatDate(metadata.fecha_firma)}
                    </span>
                  </div>
                )}
                {metadata?.lugar_firma && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lugar firma:</span>
                    <span className="text-chart-3 font-medium">
                      {metadata.lugar_firma}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Firmas presentes:</span>
                  <span className={metadata?.firmas_presentes ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {metadata?.firmas_presentes ? '✅ Sí' : '❌ No detectadas'}
                  </span>
                </div>
                {metadata?.condiciones_terminacion && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Condiciones de terminación:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.condiciones_terminacion}
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
                    {contratoData.category || 'Sin categorizar'}
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
          Datos extraídos el {new Date(contratoData.created_at).toLocaleDateString('es-ES')} • 
          Documento ID: {contratoData.document_id}
        </T.Small>
      </div>
    </div>
  );
}