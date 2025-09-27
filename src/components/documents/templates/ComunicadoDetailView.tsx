/**
 * ARCHIVO: ComunicadoDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo Comunicado Vecinal
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui/badge, @/components/ui/card, @/components/ui/separator, @/components/ui/Typography, lucide-react
 * OUTPUTS: Vista detallada optimizada para Comunicado Vecinal
 * ACTUALIZADO: 2025-09-27
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calendar, Clock, Megaphone, User, Building2, FileText, Paperclip, Tags } from 'lucide-react';

// Tipos basados en la tabla extracted_communications
export type ExtractedComunicado = {
  id: string;
  document_id: string;
  organization_id: string;
  created_at: string;
  fecha: string;
  comunidad: string;
  remitente: string;
  resumen: string;
  category: string | null;
  asunto: string | null;
  tipo_comunicado: string | null;
  urgencia: string | null;
  comunidad_direccion: string | null;
  remitente_cargo: string | null;
  destinatarios: any[] | null;
  fecha_limite: string | null;
  requiere_respuesta: boolean | null;
  accion_requerida: any[] | null;
  anexos: any[] | null;
  contacto_info: any[] | null;
  topic_presupuesto: boolean | null;
  topic_mantenimiento: boolean | null;
  topic_administracion: boolean | null;
  topic_piscina: boolean | null;
  topic_jardin: boolean | null;
  topic_limpieza: boolean | null;
  topic_balance: boolean | null;
  topic_paqueteria: boolean | null;
  topic_energia: boolean | null;
  topic_normativa: boolean | null;
  topic_proveedor: boolean | null;
  topic_dinero: boolean | null;
  topic_ascensor: boolean | null;
  topic_incendios: boolean | null;
  topic_porteria: boolean | null;
};

export type ComunicadoMetadata = {
  fecha?: string;
  comunidad?: string;
  remitente?: string;
  resumen?: string;
  category?: string;
  asunto?: string;
  tipo_comunicado?: string;
  urgencia?: string;
  comunidad_direccion?: string;
  remitente_cargo?: string;
  destinatarios?: any[];
  fecha_limite?: string;
  requiere_respuesta?: boolean;
  accion_requerida?: any[];
  anexos?: any[];
  contacto_info?: any[];
  topic_presupuesto?: boolean;
  topic_mantenimiento?: boolean;
  topic_administracion?: boolean;
  topic_piscina?: boolean;
  topic_jardin?: boolean;
  topic_limpieza?: boolean;
  topic_balance?: boolean;
  topic_paqueteria?: boolean;
  topic_energia?: boolean;
  topic_normativa?: boolean;
  topic_proveedor?: boolean;
  topic_dinero?: boolean;
  topic_ascensor?: boolean;
  topic_incendios?: boolean;
  topic_porteria?: boolean;
};

// Funciones de formateo
const formatDate = (date: string | null): string => {
  if (!date) return '❌ No especificada';
  try {
    return new Date(date).toLocaleDateString('es-ES');
  } catch {
    return date;
  }
};

const formatAmount = (amount: number | null): string => {
  if (!amount) return '❌ No especificado';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatArray = (arr: any[] | null): string => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'No especificado';
  return arr.join(', ');
};

interface ComunicadoDetailViewProps {
  comunicadoData: ExtractedComunicado;
  metadata?: ComunicadoMetadata;
  confidence: number;
  extractionMethod: string;
  processingTime: number;
  tokensUsed: number;
}

export function ComunicadoDetailView({
  comunicadoData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: ComunicadoDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header con metadatos de extracción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📢</span>
          <T.H3>Comunicado Vecinal</T.H3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Confianza: {(confidence * 100).toFixed(1)}%</Badge>
          <Badge variant="secondary">{extractionMethod}</Badge>
        </div>
      </div>

      <Separator />

          {/* 📢 Información Principal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">📢 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className={comunicadoData.fecha ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(comunicadoData.fecha)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asunto:</span>
                  <span className={comunicadoData.asunto ? 'text-primary font-medium' : 'text-destructive'}>
                    {comunicadoData.asunto || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo Comunicado:</span>
                  <span className={comunicadoData.tipo_comunicado ? 'text-primary font-medium' : 'text-destructive'}>
                    {comunicadoData.tipo_comunicado || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Urgencia:</span>
                  <span className={comunicadoData.urgencia ? 'text-primary font-medium' : 'text-destructive'}>
                    {comunicadoData.urgencia || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 👤 Remitente */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">👤 Remitente</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remitente:</span>
                  <span className={comunicadoData.remitente ? 'text-primary font-medium' : 'text-destructive'}>
                    {comunicadoData.remitente || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remitente Cargo:</span>
                  <span className={comunicadoData.remitente_cargo ? 'text-primary font-medium' : 'text-destructive'}>
                    {comunicadoData.remitente_cargo || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contacto Info:</span>
                  <span className="text-primary">
                    {formatArray(comunicadoData.contacto_info)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🏢 Comunidad */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">🏢 Comunidad</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comunidad:</span>
                  <span className={comunicadoData.comunidad ? 'text-primary font-medium' : 'text-destructive'}>
                    {comunicadoData.comunidad || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comunidad Direccion:</span>
                  <span className={comunicadoData.comunidad_direccion ? 'text-primary font-medium' : 'text-destructive'}>
                    {comunicadoData.comunidad_direccion || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destinatarios:</span>
                  <span className="text-primary">
                    {formatArray(comunicadoData.destinatarios)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📝 Contenido */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">📝 Contenido</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resumen:</span>
                  <span className={comunicadoData.resumen ? 'text-primary font-medium' : 'text-destructive'}>
                    {comunicadoData.resumen || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accion Requerida:</span>
                  <span className="text-primary">
                    {formatArray(comunicadoData.accion_requerida)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Limite:</span>
                  <span className={comunicadoData.fecha_limite ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(comunicadoData.fecha_limite)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📎 Anexos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">📎 Anexos</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anexos:</span>
                  <span className="text-primary">
                    {formatArray(comunicadoData.anexos)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requiere Respuesta:</span>
                  <span className={comunicadoData.requiere_respuesta ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.requiere_respuesta ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🏷️ Temas Tratados */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">🏷️ Temas Tratados</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Presupuesto:</span>
                  <span className={comunicadoData.topic_presupuesto ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_presupuesto ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mantenimiento:</span>
                  <span className={comunicadoData.topic_mantenimiento ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_mantenimiento ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Administración:</span>
                  <span className={comunicadoData.topic_administracion ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_administracion ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Piscina:</span>
                  <span className={comunicadoData.topic_piscina ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_piscina ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jardín:</span>
                  <span className={comunicadoData.topic_jardin ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_jardin ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Limpieza:</span>
                  <span className={comunicadoData.topic_limpieza ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_limpieza ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className={comunicadoData.topic_balance ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_balance ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paquetería:</span>
                  <span className={comunicadoData.topic_paqueteria ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_paqueteria ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Energía:</span>
                  <span className={comunicadoData.topic_energia ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_energia ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Normativa:</span>
                  <span className={comunicadoData.topic_normativa ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_normativa ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span className={comunicadoData.topic_proveedor ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_proveedor ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dinero:</span>
                  <span className={comunicadoData.topic_dinero ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_dinero ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ascensor:</span>
                  <span className={comunicadoData.topic_ascensor ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_ascensor ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incendios:</span>
                  <span className={comunicadoData.topic_incendios ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_incendios ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Portería:</span>
                  <span className={comunicadoData.topic_porteria ? 'text-green-600' : 'text-gray-500'}>
                    {comunicadoData.topic_porteria ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Estadísticas de procesamiento */}
      <Card className="bg-muted/20">
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Tiempo: {processingTime}ms</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Tokens: {tokensUsed}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComunicadoDetailView;
