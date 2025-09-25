/**
 * ARCHIVO: PresupuestoDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo Presupuesto Comercial
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui/badge, @/components/ui/card, @/components/ui/separator, @/components/ui/Typography, lucide-react
 * OUTPUTS: Vista detallada optimizada para Presupuesto Comercial
 * ACTUALIZADO: 2025-09-24
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calendar, Clock, Calculator, Building2, Users, FileText, Euro } from 'lucide-react';

// Tipos basados en la tabla extracted_budgets
export type ExtractedPresupuesto = {
  id: string;
  document_id: string;
  organization_id: string;
  created_at: string;
  numero_presupuesto: string;
  emisor_name: string;
  cliente_name: string;
  fecha_emision: string;
  fecha_validez: string | null;
  total: number;
  category: string | null;
  titulo: string | null;
  tipo_documento: string | null;
  emisor_direccion: string | null;
  emisor_telefono: string | null;
  emisor_email: string | null;
  emisor_identificacion_fiscal: string | null;
  cliente_direccion: string | null;
  cliente_identificacion_fiscal: string | null;
  subtotal: number | null;
  impuestos: number | null;
  porcentaje_impuestos: number | null;
  moneda: string | null;
  descripcion_servicios: any[] | null;
  cantidades: any[] | null;
  precios_unitarios: any[] | null;
  importes_totales: any[] | null;
  descripciones_detalladas: any[] | null;
  condiciones_pago: string | null;
  plazos_entrega: string | null;
  pago_inicial_requerido: boolean | null;
  notas_adicionales: string | null;
  garantia: string | null;
};

export type PresupuestoMetadata = {
  numero_presupuesto?: string;
  emisor_name?: string;
  cliente_name?: string;
  fecha_emision?: string;
  fecha_validez?: string;
  total?: number;
  category?: string;
  titulo?: string;
  tipo_documento?: string;
  emisor_direccion?: string;
  emisor_telefono?: string;
  emisor_email?: string;
  emisor_identificacion_fiscal?: string;
  cliente_direccion?: string;
  cliente_identificacion_fiscal?: string;
  subtotal?: number;
  impuestos?: number;
  porcentaje_impuestos?: number;
  moneda?: string;
  descripcion_servicios?: any[];
  cantidades?: any[];
  precios_unitarios?: any[];
  importes_totales?: any[];
  descripciones_detalladas?: any[];
  condiciones_pago?: string;
  plazos_entrega?: string;
  pago_inicial_requerido?: boolean;
  notas_adicionales?: string;
  garantia?: string;
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

interface PresupuestoDetailViewProps {
  presupuestoData: ExtractedPresupuesto;
  metadata?: PresupuestoMetadata;
  confidence: number;
  extractionMethod: string;
  processingTime: number;
  tokensUsed: number;
}

export function PresupuestoDetailView({
  presupuestoData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: PresupuestoDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header con metadatos de extracción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <T.H3>Presupuesto Comercial</T.H3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Confianza: {(confidence * 100).toFixed(1)}%</Badge>
          <Badge variant="secondary">{extractionMethod}</Badge>
        </div>
      </div>

      <Separator />

          {/* 📊 Información Principal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">📊 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numero Presupuesto:</span>
                  <span className={presupuestoData.numero_presupuesto ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.numero_presupuesto || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Emision:</span>
                  <span className={presupuestoData.fecha_emision ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(presupuestoData.fecha_emision)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Validez:</span>
                  <span className={presupuestoData.fecha_validez ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(presupuestoData.fecha_validez)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titulo:</span>
                  <span className={presupuestoData.titulo ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.titulo || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🏢 Datos del Emisor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">🏢 Datos del Emisor</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Name:</span>
                  <span className={presupuestoData.emisor_name ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.emisor_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Direccion:</span>
                  <span className={presupuestoData.emisor_direccion ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.emisor_direccion || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Telefono:</span>
                  <span className={presupuestoData.emisor_telefono ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.emisor_telefono || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Email:</span>
                  <span className={presupuestoData.emisor_email ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.emisor_email || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Identificacion Fiscal:</span>
                  <span className={presupuestoData.emisor_identificacion_fiscal ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.emisor_identificacion_fiscal || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 👤 Datos del Cliente */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">👤 Datos del Cliente</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente Name:</span>
                  <span className={presupuestoData.cliente_name ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.cliente_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente Direccion:</span>
                  <span className={presupuestoData.cliente_direccion ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.cliente_direccion || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente Identificacion Fiscal:</span>
                  <span className={presupuestoData.cliente_identificacion_fiscal ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.cliente_identificacion_fiscal || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📋 Servicios/Productos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">📋 Servicios/Productos</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Descripcion Servicios:</span>
                  <span className="text-primary">
                    {formatArray(presupuestoData.descripcion_servicios)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cantidades:</span>
                  <span className="text-primary">
                    {formatArray(presupuestoData.cantidades)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precios Unitarios:</span>
                  <span className="text-primary">
                    {formatArray(presupuestoData.precios_unitarios)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Importes Totales:</span>
                  <span className="text-primary">
                    {formatArray(presupuestoData.importes_totales)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Descripciones Detalladas:</span>
                  <span className="text-primary">
                    {formatArray(presupuestoData.descripciones_detalladas)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💰 Resumen Económico */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">💰 Resumen Económico</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className={presupuestoData.subtotal ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.subtotal || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Porcentaje Impuestos:</span>
                  <span className={presupuestoData.porcentaje_impuestos ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.porcentaje_impuestos || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos:</span>
                  <span className={presupuestoData.impuestos ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.impuestos || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className={presupuestoData.total ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.total || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moneda:</span>
                  <span className={presupuestoData.moneda ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.moneda || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⏰ Condiciones y Plazos */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <T.H4 className="mb-0">⏰ Condiciones y Plazos</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condiciones Pago:</span>
                  <span className={presupuestoData.condiciones_pago ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.condiciones_pago || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plazos Entrega:</span>
                  <span className={presupuestoData.plazos_entrega ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.plazos_entrega || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago Inicial Requerido:</span>
                  <span className={presupuestoData.pago_inicial_requerido ? 'text-green-600' : 'text-gray-500'}>
                    {presupuestoData.pago_inicial_requerido ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Garantia:</span>
                  <span className={presupuestoData.garantia ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.garantia || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notas Adicionales:</span>
                  <span className={presupuestoData.notas_adicionales ? 'text-primary font-medium' : 'text-destructive'}>
                    {presupuestoData.notas_adicionales || '❌ No especificado'}
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

export default PresupuestoDetailView;
