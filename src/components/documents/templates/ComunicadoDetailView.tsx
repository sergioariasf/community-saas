/**
 * ARCHIVO: ComunicadoDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo COMUNICADO VECINOS
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Vista detallada optimizada para comunicados con campos específicos
 * ACTUALIZADO: 2025-09-18
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calendar, Users, User, FileText, CheckCircle, Megaphone, AlertCircle, Building2 } from 'lucide-react';

// Tipos basados en la tabla extracted_communications - estructura actualizada
export type ExtractedComunicado = {
  id: string;
  document_id: string;
  organization_id: string;
  fecha: string | null;
  comunidad: string | null;
  remitente: string | null;
  resumen: string | null;
  category: string | null;
  asunto: string | null;
  tipo_comunicado: string | null;
  urgencia: string | null;
  comunidad_direccion: string | null;
  remitente_cargo: string | null;
  destinatarios: string[] | null;
  fecha_limite: string | null;
  categoria_comunicado: string | null;
  requiere_respuesta: boolean | null;
  accion_requerida: string[] | null;
  anexos: string[] | null;
  contacto_info: {
    telefono?: string;
    email?: string;
    horario_atencion?: string;
  } | null;
  created_at: string;
};

interface ComunicadoDetailViewProps {
  comunicadoData?: ExtractedComunicado | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export function ComunicadoDetailView({
  comunicadoData,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: ComunicadoDetailViewProps) {
  // Helper para obtener el color de urgencia
  const getUrgencyColor = (urgencia?: string) => {
    switch (urgencia) {
      case 'urgente': return 'text-red-600 bg-red-100';
      case 'alta': return 'text-orange-600 bg-orange-100';
      case 'media': return 'text-yellow-600 bg-yellow-100';
      case 'baja': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Si no hay datos específicos, mostrar mensaje
  if (!comunicadoData) {
    return (
      <div className="space-y-6">
        <T.H3 className="mb-0">📢 Análisis de COMUNICADO</T.H3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <T.H4 className="text-orange-800 mb-2">Sin Datos Específicos de Comunicado</T.H4>
          <T.P className="text-sm text-orange-700 mb-4">
            No se encontraron datos específicos extraídos para este comunicado.
          </T.P>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <T.H3 className="mb-0">📢 Análisis de COMUNICADO</T.H3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <T.Small className="text-green-700 font-medium">
            Datos procesados
          </T.Small>
        </div>
      </div>

      {/* Información técnica de procesamiento - Solo desarrollo */}
      {process.env.NODE_ENV === 'development' && confidence && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-2">
            <T.Small className="text-gray-600 font-medium">🔧 Información de Procesamiento (DEV)</T.Small>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confianza:</span>
                <span className="font-medium text-blue-600">{Math.round(confidence * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método:</span>
                <span className="font-medium">{extractionMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiempo:</span>
                <span className="font-medium">{processingTime || 0}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens:</span>
                <span className="font-medium">{tokensUsed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido principal en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda - Información básica */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-chart-1" />
                <T.H4 className="mb-0">📋 Información Básica</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fecha */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha:
                </span>
                <span className="font-medium text-chart-1">
                  {comunicadoData.fecha ? new Date(comunicadoData.fecha).toLocaleDateString('es-ES') : '❌ No especificada'}
                </span>
              </div>

              <Separator />

              {/* Comunidad */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Comunidad:
                </span>
                <span className="font-medium text-blue-600">
                  {comunicadoData.comunidad || '❌ No especificada'}
                </span>
              </div>

              <Separator />

              {/* Remitente */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Remitente:
                </span>
                <span className="font-medium text-green-600">
                  {comunicadoData.remitente || '❌ No especificado'}
                </span>
              </div>

              {/* Urgencia si existe */}
              {comunicadoData.urgencia && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Urgencia:
                    </span>
                    <Badge className={getUrgencyColor(comunicadoData.urgencia)}>
                      {comunicadoData.urgencia.toUpperCase()}
                    </Badge>
                  </div>
                </>
              )}

              {/* Categoría */}
              {comunicadoData.category && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                      {comunicadoData.category}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha - Contenido */}
        <div className="lg:col-span-2 space-y-4">
          {/* Resumen del comunicado */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <T.H4 className="mb-0">📄 Contenido del Comunicado</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Asunto */}
              {comunicadoData.asunto && (
                <div>
                  <T.Small className="text-muted-foreground font-medium mb-2 block">📝 Asunto</T.Small>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm font-medium">
                    {comunicadoData.asunto}
                  </div>
                </div>
              )}

              <Separator />

              {/* Resumen */}
              <div>
                <T.Small className="text-muted-foreground font-medium mb-2 block">📝 Resumen</T.Small>
                {comunicadoData.resumen ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed">
                    {comunicadoData.resumen}
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">❌ Resumen no disponible</div>
                )}
              </div>

              {/* Acciones requeridas */}
              {comunicadoData.accion_requerida && comunicadoData.accion_requerida.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <T.Small className="text-muted-foreground font-medium mb-3 block">✅ Acciones Requeridas</T.Small>
                    <div className="space-y-2">
                      {comunicadoData.accion_requerida.map((accion, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-800">{accion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información de Contacto y Anexos */}
          {(comunicadoData.contacto_info || comunicadoData.anexos) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-chart-4" />
                  <T.H4 className="mb-0">📞 Información Adicional</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información de contacto */}
                {comunicadoData.contacto_info && (
                  <div>
                    <T.Small className="text-muted-foreground font-medium mb-2 block">📞 Contacto</T.Small>
                    <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                      {comunicadoData.contacto_info.telefono && (
                        <div className="text-sm">
                          <span className="font-medium">Teléfono:</span> {comunicadoData.contacto_info.telefono}
                        </div>
                      )}
                      {comunicadoData.contacto_info.email && (
                        <div className="text-sm">
                          <span className="font-medium">Email:</span> {comunicadoData.contacto_info.email}
                        </div>
                      )}
                      {comunicadoData.contacto_info.horario_atencion && (
                        <div className="text-sm">
                          <span className="font-medium">Horario:</span> {comunicadoData.contacto_info.horario_atencion}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Anexos */}
                {comunicadoData.anexos && comunicadoData.anexos.length > 0 && (
                  <>
                    {comunicadoData.contacto_info && <Separator />}
                    <div>
                      <T.Small className="text-muted-foreground font-medium mb-2 block">📎 Anexos</T.Small>
                      <div className="flex flex-wrap gap-2">
                        {comunicadoData.anexos.map((anexo, index) => (
                          <Badge key={index} variant="outline" className="text-purple-600 border-purple-300">
                            📎 {anexo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Información de procesamiento */}
      <div className="text-center">
        <T.Small className="text-muted-foreground">
          Datos extraídos el {new Date(comunicadoData.created_at).toLocaleDateString('es-ES')} • 
          Documento ID: {comunicadoData.document_id}
        </T.Small>
      </div>
    </div>
  );
}