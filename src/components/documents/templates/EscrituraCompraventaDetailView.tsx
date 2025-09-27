/**
 * ARCHIVO: EscrituraCompraventaDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo Escritura de Compraventa
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui/badge, @/components/ui/card, @/components/ui/separator, @/components/ui/Typography, lucide-react
 * OUTPUTS: Vista detallada optimizada para Escritura de Compraventa
 * ACTUALIZADO: 2025-09-27
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Calendar, Clock, Home, User, Users, MapPin, Building, Euro, Scale } from 'lucide-react';

// Tipos basados en la tabla extracted_property_deeds
export type ExtractedEscritura = {
  id: string;
  document_id: string;
  organization_id: string;
  created_at: string;
  vendedor_nombre: string | null;
  comprador_nombre: string | null;
  direccion_inmueble: string | null;
  precio_venta: number | null;
  fecha_escritura: string | null;
  notario_nombre: string | null;
  referencia_catastral: string | null;
  superficie_m2: number | null;
  category: string | null;
  vendedor_dni: string | null;
  vendedor_direccion: string | null;
  vendedor_estado_civil: string | null;
  vendedor_nacionalidad: string | null;
  vendedor_profesion: string | null;
  comprador_dni: string | null;
  comprador_direccion: string | null;
  comprador_estado_civil: string | null;
  comprador_nacionalidad: string | null;
  comprador_profesion: string | null;
  tipo_inmueble: string | null;
  superficie_util: number | null;
  numero_habitaciones: number | null;
  numero_banos: number | null;
  planta: string | null;
  orientacion: string | null;
  descripcion_inmueble: string | null;
  registro_propiedad: string | null;
  tomo: string | null;
  libro: string | null;
  folio: string | null;
  finca: string | null;
  inscripcion: string | null;
  moneda: string | null;
  forma_pago: string | null;
  precio_en_letras: string | null;
  impuestos_incluidos: boolean | null;
  gastos_a_cargo_comprador: any[] | null;
  gastos_a_cargo_vendedor: any[] | null;
  cargas_existentes: any[] | null;
  hipotecas_pendientes: string | null;
  servidumbres: string | null;
  libre_cargas: boolean | null;
  condicion_suspensiva: boolean | null;
  condiciones_especiales: any[] | null;
  clausulas_particulares: any[] | null;
  fecha_entrega: string | null;
  entrega_inmediata: boolean | null;
  estado_conservacion: string | null;
  inventario_incluido: string | null;
  notario_numero_colegiado: string | null;
  notaria_direccion: string | null;
  protocolo_numero: string | null;
  autorizacion_notarial: boolean | null;
  valor_catastral: number | null;
  coeficiente_participacion: string | null;
  itp_aplicable: number | null;
  base_imponible_itp: number | null;
  inscripcion_registro: string | null;
};

export type EscrituraMetadata = {
  vendedor_nombre?: string;
  comprador_nombre?: string;
  direccion_inmueble?: string;
  precio_venta?: number;
  fecha_escritura?: string;
  notario_nombre?: string;
  referencia_catastral?: string;
  superficie_m2?: number;
  category?: string;
  vendedor_dni?: string;
  vendedor_direccion?: string;
  vendedor_estado_civil?: string;
  vendedor_nacionalidad?: string;
  vendedor_profesion?: string;
  comprador_dni?: string;
  comprador_direccion?: string;
  comprador_estado_civil?: string;
  comprador_nacionalidad?: string;
  comprador_profesion?: string;
  tipo_inmueble?: string;
  superficie_util?: number;
  numero_habitaciones?: number;
  numero_banos?: number;
  planta?: string;
  orientacion?: string;
  descripcion_inmueble?: string;
  registro_propiedad?: string;
  tomo?: string;
  libro?: string;
  folio?: string;
  finca?: string;
  inscripcion?: string;
  moneda?: string;
  forma_pago?: string;
  precio_en_letras?: string;
  impuestos_incluidos?: boolean;
  gastos_a_cargo_comprador?: any[];
  gastos_a_cargo_vendedor?: any[];
  cargas_existentes?: any[];
  hipotecas_pendientes?: string;
  servidumbres?: string;
  libre_cargas?: boolean;
  condicion_suspensiva?: boolean;
  condiciones_especiales?: any[];
  clausulas_particulares?: any[];
  fecha_entrega?: string;
  entrega_inmediata?: boolean;
  estado_conservacion?: string;
  inventario_incluido?: string;
  notario_numero_colegiado?: string;
  notaria_direccion?: string;
  protocolo_numero?: string;
  autorizacion_notarial?: boolean;
  valor_catastral?: number;
  coeficiente_participacion?: string;
  itp_aplicable?: number;
  base_imponible_itp?: number;
  inscripcion_registro?: string;
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

interface EscrituraCompraventaDetailViewProps {
  escrituraData: ExtractedEscritura;
  metadata?: EscrituraMetadata;
  confidence: number;
  extractionMethod: string;
  processingTime: number;
  tokensUsed: number;
}

export function EscrituraCompraventaDetailView({
  escrituraData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: EscrituraCompraventaDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header con metadatos de extracción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <T.H3>Escritura de Compraventa</T.H3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Confianza: {(confidence * 100).toFixed(1)}%</Badge>
          <Badge variant="secondary">{extractionMethod}</Badge>
        </div>
      </div>

      <Separator />

          {/* 🏠 Información Principal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">🏠 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Escritura:</span>
                  <span className={escrituraData.fecha_escritura ? 'text-primary font-medium' : 'text-destructive'}>
                    {formatDate(escrituraData.fecha_escritura)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notario Nombre:</span>
                  <span className={escrituraData.notario_nombre ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.notario_nombre || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio Venta:</span>
                  <span className={escrituraData.precio_venta ? 'text-green-600 font-bold' : 'text-destructive'}>
                    {formatAmount(escrituraData.precio_venta)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Direccion Inmueble:</span>
                  <span className={escrituraData.direccion_inmueble ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.direccion_inmueble || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className={escrituraData.category ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.category || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 👤 Vendedor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">👤 Vendedor</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor Nombre:</span>
                  <span className={escrituraData.vendedor_nombre ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.vendedor_nombre || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor Dni:</span>
                  <span className={escrituraData.vendedor_dni ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.vendedor_dni || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor Direccion:</span>
                  <span className={escrituraData.vendedor_direccion ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.vendedor_direccion || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor Estado Civil:</span>
                  <span className={escrituraData.vendedor_estado_civil ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.vendedor_estado_civil || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor Nacionalidad:</span>
                  <span className={escrituraData.vendedor_nacionalidad ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.vendedor_nacionalidad || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 👥 Comprador */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">👥 Comprador</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comprador Nombre:</span>
                  <span className={escrituraData.comprador_nombre ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.comprador_nombre || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comprador Dni:</span>
                  <span className={escrituraData.comprador_dni ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.comprador_dni || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comprador Direccion:</span>
                  <span className={escrituraData.comprador_direccion ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.comprador_direccion || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comprador Estado Civil:</span>
                  <span className={escrituraData.comprador_estado_civil ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.comprador_estado_civil || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comprador Nacionalidad:</span>
                  <span className={escrituraData.comprador_nacionalidad ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.comprador_nacionalidad || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🏘️ Identificación de la Propiedad */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">🏘️ Identificación de la Propiedad</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo Inmueble:</span>
                  <span className={escrituraData.tipo_inmueble ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.tipo_inmueble || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Superficie M2:</span>
                  <span className={escrituraData.superficie_m2 ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.superficie_m2 || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Superficie Util:</span>
                  <span className={escrituraData.superficie_util ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.superficie_util || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numero Habitaciones:</span>
                  <span className={escrituraData.numero_habitaciones ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.numero_habitaciones || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numero Banos:</span>
                  <span className={escrituraData.numero_banos ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.numero_banos || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referencia Catastral:</span>
                  <span className={escrituraData.referencia_catastral ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.referencia_catastral || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 📋 Datos Registrales */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">📋 Datos Registrales</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registro Propiedad:</span>
                  <span className={escrituraData.registro_propiedad ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.registro_propiedad || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tomo:</span>
                  <span className={escrituraData.tomo ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.tomo || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Libro:</span>
                  <span className={escrituraData.libro ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.libro || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Folio:</span>
                  <span className={escrituraData.folio ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.folio || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Finca:</span>
                  <span className={escrituraData.finca ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.finca || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inscripcion:</span>
                  <span className={escrituraData.inscripcion ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.inscripcion || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 💰 Condiciones de la Compraventa */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">💰 Condiciones de la Compraventa</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio Venta:</span>
                  <span className={escrituraData.precio_venta ? 'text-green-600 font-bold' : 'text-destructive'}>
                    {formatAmount(escrituraData.precio_venta)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moneda:</span>
                  <span className={escrituraData.moneda ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.moneda || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forma Pago:</span>
                  <span className={escrituraData.forma_pago ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.forma_pago || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Catastral:</span>
                  <span className={escrituraData.valor_catastral ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.valor_catastral || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Itp Aplicable:</span>
                  <span className={escrituraData.itp_aplicable ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.itp_aplicable || '❌ No especificado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ⚖️ Aspectos Legales */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-green-600" />
                <T.H4 className="mb-0">⚖️ Aspectos Legales</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Libre Cargas:</span>
                  <span className={escrituraData.libre_cargas ? 'text-green-600' : 'text-gray-500'}>
                    {escrituraData.libre_cargas ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hipotecas Pendientes:</span>
                  <span className={escrituraData.hipotecas_pendientes ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.hipotecas_pendientes || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servidumbres:</span>
                  <span className={escrituraData.servidumbres ? 'text-primary font-medium' : 'text-destructive'}>
                    {escrituraData.servidumbres || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condicion Suspensiva:</span>
                  <span className={escrituraData.condicion_suspensiva ? 'text-green-600' : 'text-gray-500'}>
                    {escrituraData.condicion_suspensiva ? '✅ Sí' : '❌ No'}
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

export default EscrituraCompraventaDetailView;
