/**
 * ARCHIVO: ContratoDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo Contrato Legal
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui/badge, @/components/ui/card, @/components/ui/separator, @/components/ui/Typography, lucide-react
 * OUTPUTS: Vista detallada optimizada para Contrato Legal
 * ACTUALIZADO: 2025-09-24
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calendar, Clock, FileText, Users, Scale, CreditCard } from 'lucide-react';

// Tipos basados en la tabla extracted_contracts
export type ExtractedContrato = {
  id: string;
  document_id: string;
  organization_id: string;
  created_at: string;
  titulo_contrato: string;
  parte_a: string;
  parte_b: string;
  objeto_contrato: string;
  duracion: string | null;
  importe_total: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  category: string | null;
  tipo_contrato: string | null;
  parte_a_direccion: string | null;
  parte_a_identificacion_fiscal: string | null;
  parte_a_representante: string | null;
  parte_b_direccion: string | null;
  parte_b_identificacion_fiscal: string | null;
  parte_b_representante: string | null;
  alcance_servicios: any[] | null;
  obligaciones_parte_a: any[] | null;
  obligaciones_parte_b: any[] | null;
  moneda: string | null;
  forma_pago: string | null;
  plazos_pago: any[] | null;
  confidencialidad: boolean | null;
  legislacion_aplicable: string | null;
  fecha_firma: string | null;
  lugar_firma: string | null;
  topic_keywords: any | null;
  topic_mantenimiento: boolean | null;
  topic_jardines: boolean | null;
  topic_ascensores: boolean | null;
  topic_limpieza: boolean | null;
  topic_emergencias: boolean | null;
  topic_instalaciones: boolean | null;
  topic_electricidad: boolean | null;
  topic_seguridad: boolean | null;
  topic_agua: boolean | null;
  topic_gas: boolean | null;
  topic_climatizacion: boolean | null;
  topic_parking: boolean | null;
};

export type ContratoMetadata = {
  titulo_contrato?: string;
  parte_a?: string;
  parte_b?: string;
  objeto_contrato?: string;
  duracion?: string;
  importe_total?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  category?: string;
  tipo_contrato?: string;
  parte_a_direccion?: string;
  parte_a_identificacion_fiscal?: string;
  parte_a_representante?: string;
  parte_b_direccion?: string;
  parte_b_identificacion_fiscal?: string;
  parte_b_representante?: string;
  alcance_servicios?: any[];
  obligaciones_parte_a?: any[];
  obligaciones_parte_b?: any[];
  moneda?: string;
  forma_pago?: string;
  plazos_pago?: any[];
  confidencialidad?: boolean;
  legislacion_aplicable?: string;
  fecha_firma?: string;
  lugar_firma?: string;
  topic_keywords?: any;
  topic_mantenimiento?: boolean;
  topic_jardines?: boolean;
  topic_ascensores?: boolean;
  topic_limpieza?: boolean;
  topic_emergencias?: boolean;
  topic_instalaciones?: boolean;
  topic_electricidad?: boolean;
  topic_seguridad?: boolean;
  topic_agua?: boolean;
  topic_gas?: boolean;
  topic_climatizacion?: boolean;
  topic_parking?: boolean;
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

interface ContratoDetailViewProps {
  contratoData: ExtractedContrato;
  metadata?: ContratoMetadata;
  confidence: number;
  extractionMethod: string;
  processingTime: number;
  tokensUsed: number;
}

export function ContratoDetailView({
  contratoData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: ContratoDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header con metadatos de extracción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📃</span>
          <T.H3>Contrato Legal</T.H3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Confianza: {(confidence * 100).toFixed(1)}%</Badge>
          <Badge variant="secondary">{extractionMethod}</Badge>
        </div>
      </div>

      <Separator />

          {/* 📃 Información Principal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">📃 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titulo Contrato:</span>
                  <span className={contratoData.titulo_contrato ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.titulo_contrato || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo Contrato:</span>
                  <span className={contratoData.tipo_contrato ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.tipo_contrato || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objeto Contrato:</span>
                  <span className={contratoData.objeto_contrato ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.objeto_contrato || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className={contratoData.category ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.category || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 👥 Partes del Contrato */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">👥 Partes del Contrato</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parte A:</span>
                  <span className={contratoData.parte_a ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.parte_a || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parte A Identificacion Fiscal:</span>
                  <span className={contratoData.parte_a_identificacion_fiscal ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.parte_a_identificacion_fiscal || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parte B:</span>
                  <span className={contratoData.parte_b ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.parte_b || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parte B Identificacion Fiscal:</span>
                  <span className={contratoData.parte_b_identificacion_fiscal ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.parte_b_identificacion_fiscal || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⏰ Duración e Importe */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">⏰ Duración e Importe</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Inicio:</span>
                  <span className={contratoData.fecha_inicio ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(contratoData.fecha_inicio)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Fin:</span>
                  <span className={contratoData.fecha_fin ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(contratoData.fecha_fin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duracion:</span>
                  <span className={contratoData.duracion ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.duracion || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Importe Total:</span>
                  <span className={contratoData.importe_total ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.importe_total || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moneda:</span>
                  <span className={contratoData.moneda ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.moneda || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⚖️ Obligaciones */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">⚖️ Obligaciones</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alcance Servicios:</span>
                  <span className="text-primary">
                    {formatArray(contratoData.alcance_servicios)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Obligaciones Parte A:</span>
                  <span className="text-primary">
                    {formatArray(contratoData.obligaciones_parte_a)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Obligaciones Parte B:</span>
                  <span className="text-primary">
                    {formatArray(contratoData.obligaciones_parte_b)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💳 Aspectos Legales y Pago */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">💳 Aspectos Legales y Pago</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forma Pago:</span>
                  <span className={contratoData.forma_pago ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.forma_pago || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plazos Pago:</span>
                  <span className="text-primary">
                    {formatArray(contratoData.plazos_pago)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Legislacion Aplicable:</span>
                  <span className={contratoData.legislacion_aplicable ? 'text-primary font-medium' : 'text-destructive'}>
                    {contratoData.legislacion_aplicable || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidencialidad:</span>
                  <span className={contratoData.confidencialidad ? 'text-green-600' : 'text-gray-500'}>
                    {contratoData.confidencialidad ? '✅ Sí' : '❌ No'}
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

export default ContratoDetailView;
