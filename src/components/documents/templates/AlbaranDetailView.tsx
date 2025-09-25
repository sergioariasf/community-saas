/**
 * ARCHIVO: AlbaranDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo Albarán de Entrega
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui/badge, @/components/ui/card, @/components/ui/separator, @/components/ui/Typography, lucide-react
 * OUTPUTS: Vista detallada optimizada para Albarán de Entrega
 * ACTUALIZADO: 2025-09-24
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calendar, Clock, Package, Building, User, List, Truck } from 'lucide-react';

// Tipos basados en la tabla extracted_delivery_notes
export type ExtractedAlbaran = {
  id: string;
  document_id: string;
  organization_id: string;
  created_at: string;
  emisor_name: string;
  receptor_name: string;
  numero_albaran: string;
  fecha_emision: string;
  numero_pedido: string | null;
  category: string | null;
  emisor_direccion: string | null;
  emisor_telefono: string | null;
  emisor_email: string | null;
  receptor_direccion: string | null;
  receptor_telefono: string | null;
  mercancia: any[] | null;
  cantidad_total: number | null;
  peso_total: number | null;
  observaciones: string | null;
  estado_entrega: string | null;
  firma_receptor: boolean | null;
  transportista: string | null;
  vehiculo_matricula: string | null;
};

export type AlbaranMetadata = {
  emisor_name?: string;
  receptor_name?: string;
  numero_albaran?: string;
  fecha_emision?: string;
  numero_pedido?: string;
  category?: string;
  emisor_direccion?: string;
  emisor_telefono?: string;
  emisor_email?: string;
  receptor_direccion?: string;
  receptor_telefono?: string;
  mercancia?: any[];
  cantidad_total?: number;
  peso_total?: number;
  observaciones?: string;
  estado_entrega?: string;
  firma_receptor?: boolean;
  transportista?: string;
  vehiculo_matricula?: string;
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

interface AlbaranDetailViewProps {
  albaranData: ExtractedAlbaran;
  metadata?: AlbaranMetadata;
  confidence: number;
  extractionMethod: string;
  processingTime: number;
  tokensUsed: number;
}

export function AlbaranDetailView({
  albaranData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: AlbaranDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header con metadatos de extracción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📦</span>
          <T.H3>Albarán de Entrega</T.H3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Confianza: {(confidence * 100).toFixed(1)}%</Badge>
          <Badge variant="secondary">{extractionMethod}</Badge>
        </div>
      </div>

      <Separator />

          {/* 📦 Información Principal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-600" />
                <T.H4 className="mb-0">📦 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numero Albaran:</span>
                  <span className={albaranData.numero_albaran ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.numero_albaran || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Emision:</span>
                  <span className={albaranData.fecha_emision ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(albaranData.fecha_emision)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numero Pedido:</span>
                  <span className={albaranData.numero_pedido ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.numero_pedido || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className={albaranData.category ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.category || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🏢 Datos del Emisor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-orange-600" />
                <T.H4 className="mb-0">🏢 Datos del Emisor</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Name:</span>
                  <span className={albaranData.emisor_name ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.emisor_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Direccion:</span>
                  <span className={albaranData.emisor_direccion ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.emisor_direccion || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Telefono:</span>
                  <span className={albaranData.emisor_telefono ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.emisor_telefono || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emisor Email:</span>
                  <span className={albaranData.emisor_email ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.emisor_email || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 👤 Datos del Receptor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600" />
                <T.H4 className="mb-0">👤 Datos del Receptor</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receptor Name:</span>
                  <span className={albaranData.receptor_name ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.receptor_name || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receptor Direccion:</span>
                  <span className={albaranData.receptor_direccion ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.receptor_direccion || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receptor Telefono:</span>
                  <span className={albaranData.receptor_telefono ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.receptor_telefono || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📋 Mercancía */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-orange-600" />
                <T.H4 className="mb-0">📋 Mercancía</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mercancia:</span>
                  <span className="text-primary">
                    {formatArray(albaranData.mercancia)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cantidad Total:</span>
                  <span className={albaranData.cantidad_total ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.cantidad_total || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso Total:</span>
                  <span className={albaranData.peso_total ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.peso_total || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🚚 Detalles de Entrega */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-orange-600" />
                <T.H4 className="mb-0">🚚 Detalles de Entrega</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transportista:</span>
                  <span className={albaranData.transportista ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.transportista || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehiculo Matricula:</span>
                  <span className={albaranData.vehiculo_matricula ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.vehiculo_matricula || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado Entrega:</span>
                  <span className={albaranData.estado_entrega ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.estado_entrega || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Firma Receptor:</span>
                  <span className={albaranData.firma_receptor ? 'text-green-600' : 'text-gray-500'}>
                    {albaranData.firma_receptor ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Observaciones:</span>
                  <span className={albaranData.observaciones ? 'text-primary font-medium' : 'text-destructive'}>
                    {albaranData.observaciones || '❌ No especificado'}
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

export default AlbaranDetailView;
