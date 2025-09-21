/**
 * ARCHIVO: ActaDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo ACTA
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Vista detallada optimizada para actas con campos específicos
 * ACTUALIZADO: 2025-09-16
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calendar, Users, User, FileText, CheckCircle } from 'lucide-react';

// Tipos basados en la tabla extracted_minutes
export type ExtractedMinutes = {
  id: string;
  document_id: string;
  organization_id: string;
  president_in: string | null;
  president_out: string | null;
  administrator: string | null;
  summary: string | null;
  decisions: string | null;
  created_at: string;
};

// Tipo para metadatos adicionales de document_metadata (si existen)
export type ActaMetadata = {
  document_date?: string;
  tipo_reunion?: string;
  lugar?: string;
  comunidad_nombre?: string;
  orden_del_dia?: string[];
  acuerdos?: string[];
  topic_keywords?: string[];
  estructura_detectada?: {
    quorum_alcanzado?: boolean;
    propietarios_totales?: number;
    votaciones?: any[];
    orden_del_dia?: any[];
  };
  [key: string]: any; // Para topic-xxx dinámicos
};

interface ActaDetailViewProps {
  actaData?: ExtractedMinutes | null;
  metadata?: ActaMetadata | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export function ActaDetailView({
  actaData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: ActaDetailViewProps) {
  // Si no hay datos específicos, mostrar mensaje
  if (!actaData) {
    return (
      <div className="space-y-6">
        <T.H3 className="mb-0">📋 Análisis de ACTA</T.H3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <T.H4 className="text-orange-800 mb-2">Sin Datos Específicos de Acta</T.H4>
          <T.P className="text-sm text-orange-700 mb-4">
            No se encontraron datos específicos extraídos para esta acta en la tabla `extracted_minutes`.
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
        <T.H3 className="mb-0">📋 Análisis de ACTA</T.H3>
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
        {/* Columna Izquierda - Información de la Junta */}
        <div className="space-y-4">
          {/* Información General */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">🏛️ Información de la Junta</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className={metadata?.document_date ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {metadata?.document_date || '❌ No detectada'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo de Reunión:</span>
                  <span className={metadata?.tipo_reunion ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {metadata?.tipo_reunion || '❌ No detectado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lugar:</span>
                  <span className={metadata?.lugar ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {metadata?.lugar || '❌ No detectado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Comunidad:</span>
                  <span className={metadata?.comunidad_nombre ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {metadata?.comunidad_nombre || '❌ No detectada'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personas Clave */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <T.H4 className="mb-0">👥 Personas Clave</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presidente Entrante:</span>
                  <span className={actaData.president_in ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {actaData.president_in || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presidente Saliente:</span>
                  <span className={actaData.president_out ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    {actaData.president_out || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Administrador:</span>
                  <span className={actaData.administrator ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {actaData.administrator || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estructura del Documento */}
          {metadata?.estructura_detectada && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <T.H4 className="mb-0">🏗️ Estructura del Documento</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información general */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total páginas:</span>
                    <span className="text-blue-600 font-medium">
                      📄 {metadata.estructura_detectada.total_paginas || 'No detectado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capítulos:</span>
                    <span className="text-green-600 font-medium">
                      📚 {metadata.estructura_detectada.capitulos?.length || 0} capítulos
                    </span>
                  </div>
                  {typeof metadata.estructura_detectada.quorum_alcanzado === 'boolean' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quórum:</span>
                      <span className={metadata.estructura_detectada.quorum_alcanzado ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                        {metadata.estructura_detectada.quorum_alcanzado ? '✅ Alcanzado' : '⚠️ No alcanzado'}
                      </span>
                    </div>
                  )}
                  {metadata.estructura_detectada.propietarios_totales && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Propietarios:</span>
                      <span className="text-blue-600 font-medium">
                        👥 {metadata.estructura_detectada.propietarios_totales}
                      </span>
                    </div>
                  )}
                </div>

                {/* Estructura de capítulos */}
                {metadata.estructura_detectada.capitulos && metadata.estructura_detectada.capitulos.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <T.Small className="text-muted-foreground font-medium mb-3 block">📑 Estructura por Capítulos</T.Small>
                      <div className="space-y-3">
                        {metadata.estructura_detectada.capitulos.map((capitulo: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                                  Cap. {capitulo.numero}
                                </span>
                                <T.Small className="font-medium text-gray-800">{capitulo.titulo}</T.Small>
                              </div>
                              <span className="text-xs text-muted-foreground">Pág. {capitulo.pagina}</span>
                            </div>
                            
                            {capitulo.subsecciones && capitulo.subsecciones.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {capitulo.subsecciones.map((sub: any, subIndex: number) => (
                                  <div key={subIndex} className="flex items-center justify-between text-xs text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                      {sub.titulo}
                                    </span>
                                    <span className="text-muted-foreground">Pág. {sub.pagina}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Derecha - Contenido */}
        <div className="space-y-4">
          {/* Resumen y Decisiones */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <T.H4 className="mb-0">📄 Contenido del Acta</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumen */}
              <div>
                <T.Small className="text-muted-foreground font-medium mb-2 block">📝 Resumen</T.Small>
                {actaData.summary ? (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">
                    {actaData.summary}
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">❌ Resumen no disponible</div>
                )}
              </div>

              <Separator />

              {/* Orden del día si existe */}
              {metadata?.orden_del_dia && Array.isArray(metadata.orden_del_dia) && (
                <>
                  <div>
                    <T.Small className="text-muted-foreground font-medium mb-2 block">📋 Orden del Día</T.Small>
                    <div className="space-y-1">
                      {metadata.orden_del_dia.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 font-medium">{index + 1}.</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Acuerdos específicos si existen */}
              {metadata?.acuerdos && Array.isArray(metadata.acuerdos) && (
                <>
                  <Separator />
                  <div>
                    <T.Small className="text-muted-foreground font-medium mb-2 block">✅ Acuerdos Tomados</T.Small>
                    <div className="space-y-1">
                      {metadata.acuerdos.map((acuerdo, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{acuerdo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Keywords y Temas */}
          <Card>
            <CardHeader className="pb-3">
              <T.H4 className="mb-0">🏷️ Keywords y Temas Detectados</T.H4>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Solo temas específicos */}
              <div className="flex flex-wrap gap-2 mb-3">
                {metadata && Object.entries(metadata)
                  .filter(([key, value]) => key.startsWith('topic-'))
                  .map(([key, value]) => {
                    const topicName = key.replace('topic-', '');
                    const isActive = value === true || value === 'true';
                    return (
                      <Badge 
                        key={key} 
                        variant={isActive ? "default" : "secondary"}
                        className={isActive 
                          ? "bg-green-100 text-green-800 border-green-300" 
                          : "bg-gray-100 text-gray-600 border-gray-300"
                        }
                      >
                        {topicName}
                      </Badge>
                    );
                  })}

                {/* Si no hay temas */}
                {(!metadata || !Object.keys(metadata).some(key => key.startsWith('topic-'))) && (
                  <Badge variant="outline" className="text-gray-500">
                    Sin temas detectados
                  </Badge>
                )}
              </div>
              
              {/* Leyenda del código de colores */}
              <div className="bg-gray-50 rounded-lg p-3 border">
                <T.Small className="text-muted-foreground font-medium mb-2 block">📋 Leyenda de Colores</T.Small>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">tema</Badge>
                    <span className="text-muted-foreground">Tema detectado en acta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-100 text-gray-600 border-gray-300 text-xs">tema</Badge>
                    <span className="text-muted-foreground">Tema no presente</span>
                  </div>
                  <div className="text-xs text-muted-foreground col-span-2">
                    <strong>Temas disponibles:</strong> Piscina, Jardín, Limpieza, Administración, Balance, Paquetería, Energía, Normativa, Proveedor, Dinero, Ascensor, Incendios, Portería
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Información de procesamiento */}
      <div className="text-center">
        <T.Small className="text-muted-foreground">
          Datos extraídos el {new Date(actaData.created_at).toLocaleDateString('es-ES')} • 
          Documento ID: {actaData.document_id}
        </T.Small>
      </div>
    </div>
  );
}