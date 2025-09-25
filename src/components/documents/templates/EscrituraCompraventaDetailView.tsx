/**
 * ARCHIVO: EscrituraCompraventaDetailView.tsx
 * PROPÓSITO: Plantilla específica para mostrar detalles de documentos tipo ESCRITURA DE COMPRAVENTA
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Vista detallada optimizada para escrituras de compraventa con campos específicos
 * ACTUALIZADO: 2025-09-18
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { Home, Users, MapPin, Euro, Tag, FileText, PenTool, Scale, Calendar, Building } from 'lucide-react';

// Tipos basados en la tabla extracted_property_deeds - COMPLETA
export type ExtractedEscrituraCompraventa = {
  id: string;
  document_id: string;
  organization_id: string;
  // Campos principales
  vendedor_nombre: string | null;
  comprador_nombre: string | null;
  direccion_inmueble: string | null;
  precio_venta: number | null;
  fecha_escritura: string | null;
  notario_nombre: string | null;
  referencia_catastral: string | null;
  superficie_m2: number | null;
  category: string | null;
  // Campos de detalle - Vendedor
  vendedor_dni: string | null;
  vendedor_direccion: string | null;
  vendedor_estado_civil: string | null;
  vendedor_nacionalidad: string | null;
  vendedor_profesion: string | null;
  // Campos de detalle - Comprador
  comprador_dni: string | null;
  comprador_direccion: string | null;
  comprador_estado_civil: string | null;
  comprador_nacionalidad: string | null;
  comprador_profesion: string | null;
  // Campos inmueble
  tipo_inmueble: string | null;
  superficie_util: number | null;
  numero_habitaciones: number | null;
  numero_banos: number | null;
  planta: string | null;
  orientacion: string | null;
  descripcion_inmueble: string | null;
  // Campos registrales
  registro_propiedad: string | null;
  tomo: string | null;
  libro: string | null;
  folio: string | null;
  finca: string | null;
  inscripcion: string | null;
  // Campos económicos y legales
  moneda: string | null;
  forma_pago: string | null;
  precio_en_letras: string | null;
  impuestos_incluidos: boolean | null;
  gastos_a_cargo_comprador: any | null;
  gastos_a_cargo_vendedor: any | null;
  cargas_existentes: any | null;
  hipotecas_pendientes: string | null;
  servidumbres: string | null;
  libre_cargas: boolean | null;
  condicion_suspensiva: boolean | null;
  condiciones_especiales: any | null;
  clausulas_particulares: any | null;
  fecha_entrega: string | null;
  entrega_inmediata: boolean | null;
  estado_conservacion: string | null;
  inventario_incluido: string | null;
  // Campos notariales
  notario_numero_colegiado: string | null;
  notaria_direccion: string | null;
  protocolo_numero: string | null;
  autorizacion_notarial: boolean | null;
  // Campos fiscales
  valor_catastral: number | null;
  coeficiente_participacion: string | null;
  itp_aplicable: number | null;
  base_imponible_itp: number | null;
  inscripcion_registro: string | null;
  // Metadatos
  created_at: string;
};

// Tipo para metadatos adicionales de document_metadata
export type EscrituraCompraventaMetadata = {
  // Identificación y comparecencia de las partes - Vendedor
  vendedor_nombre_completo?: string;
  vendedor_estado_civil?: string;
  vendedor_nacionalidad?: string;
  vendedor_domicilio?: string;
  vendedor_dni_nie?: string;
  vendedor_capacidad_legal?: boolean;
  
  // Identificación y comparecencia de las partes - Comprador
  comprador_nombre_completo?: string;
  comprador_estado_civil?: string;
  comprador_nacionalidad?: string;
  comprador_domicilio?: string;
  comprador_dni_nie?: string;
  comprador_capacidad_legal?: boolean;
  
  // Identificación de la propiedad
  direccion_completa?: string;
  tipo_inmueble?: string;
  superficie_m2?: number;
  linderos?: string;
  descripcion_detallada?: string;
  
  // Datos registrales
  numero_finca?: string;
  tomo?: string;
  libro?: string;
  folio?: string;
  registro_propiedad?: string;
  referencia_catastral?: string;
  
  // Cargas y gravámenes
  hipotecas_existentes?: boolean;
  embargos_existentes?: boolean;
  otras_cargas?: string;
  libre_cargas?: boolean;
  
  // Condiciones de la compraventa
  precio_venta?: number;
  moneda?: string;
  forma_pago?: string;
  impuestos_aplicables?: string;
  quien_paga_impuestos?: string;
  gastos_notaria?: string;
  gastos_registro?: string;
  
  // Cláusulas legales
  titulo_propiedad_origen?: string;
  como_adquirio_vendedor?: string;
  fecha_entrega_posesion?: string;
  libre_arrendamientos?: boolean;
  al_corriente_comunidad?: boolean;
  al_corriente_ibi?: boolean;
  
  // Cierre del documento
  fecha_firma?: string;
  lugar_firma?: string;
  notaria_nombre?: string;
  notario_nombre?: string;
  firmas_presentes?: boolean;
  autorizacion_notario?: boolean;
  
  // Campos existentes mantenidos
  document_date?: string;
  concepto?: string;
  topic_keywords?: string[];
  [key: string]: any; // Para topic-xxx dinámicos
};

interface EscrituraCompraventaDetailViewProps {
  escrituraData?: ExtractedEscrituraCompraventa | null;
  metadata?: EscrituraCompraventaMetadata | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export function EscrituraCompraventaDetailView({
  escrituraData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: EscrituraCompraventaDetailViewProps) {
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
  if (!escrituraData) {
    return (
      <div className="space-y-6">
        <T.H3 className="mb-0">🏠 Análisis de ESCRITURA DE COMPRAVENTA</T.H3>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <T.H4 className="text-orange-800 mb-2">Sin Datos Específicos de Escritura</T.H4>
          <T.P className="text-sm text-orange-700 mb-4">
            No se encontraron datos específicos extraídos para esta escritura en la tabla `extracted_property_deeds`.
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
        <T.H3 className="mb-0">🏠 Análisis de ESCRITURA DE COMPRAVENTA</T.H3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
          <T.Small className="text-chart-2 font-medium">
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
        {/* Columna Izquierda - Partes y Propiedad */}
        <div className="space-y-4">
          {/* Información Principal */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-chart-2" />
                <T.H4 className="mb-0">🏠 Información Principal</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha escritura:</span>
                  <span className={escrituraData.fecha_escritura ? 'text-chart-2 font-medium' : 'text-destructive'}>
                    {formatDate(escrituraData.fecha_escritura)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Notario:</span>
                  <span className={escrituraData.notario_nombre ? 'text-chart-2 font-medium' : 'text-destructive'}>
                    {escrituraData.notario_nombre || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Precio venta:</span>
                  <span className={escrituraData.precio_venta ? 'text-chart-4 font-bold text-lg' : 'text-destructive'}>
                    {formatAmount(escrituraData.precio_venta)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className={escrituraData.category ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    {escrituraData.category || 'Sin categorizar'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identificación de las Partes - Vendedor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <T.H4 className="mb-0">👤 Vendedor</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className={escrituraData.vendedor_nombre ? 'text-blue-600 font-medium' : 'text-destructive'}>
                    {escrituraData.vendedor_nombre || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DNI/NIE:</span>
                  <span className={escrituraData.vendedor_dni ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                    {escrituraData.vendedor_dni || 'No especificado'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Dirección:</span>
                  <span className={`text-gray-800 bg-muted/50 rounded p-2 block text-xs ${
                    escrituraData.vendedor_direccion ? '' : 'text-muted-foreground'
                  }`}>
                    {escrituraData.vendedor_direccion || 'No especificada'}
                  </span>
                </div>
                {escrituraData.vendedor_estado_civil && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado civil:</span>
                    <span className="text-blue-600">
                      {escrituraData.vendedor_estado_civil}
                    </span>
                  </div>
                )}
                {escrituraData.vendedor_nacionalidad && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nacionalidad:</span>
                    <span className="text-blue-600">
                      {escrituraData.vendedor_nacionalidad}
                    </span>
                  </div>
                )}
                {escrituraData.vendedor_profesion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profesión:</span>
                    <span className="text-blue-600">
                      {escrituraData.vendedor_profesion}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacidad legal:</span>
                  <span className={metadata?.vendedor_capacidad_legal ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {metadata?.vendedor_capacidad_legal ? '✅ Certificada' : '❓ No especificada'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identificación de las Partes - Comprador */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-chart-4" />
                <T.H4 className="mb-0">👥 Comprador</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className={escrituraData.comprador_nombre ? 'text-chart-4 font-medium' : 'text-destructive'}>
                    {escrituraData.comprador_nombre || '❌ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DNI/NIE:</span>
                  <span className={escrituraData.comprador_dni ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {escrituraData.comprador_dni || 'No especificado'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Dirección:</span>
                  <span className={`text-gray-800 bg-muted/50 rounded p-2 block text-xs ${
                    escrituraData.comprador_direccion ? '' : 'text-muted-foreground'
                  }`}>
                    {escrituraData.comprador_direccion || 'No especificada'}
                  </span>
                </div>
                {escrituraData.comprador_estado_civil && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado civil:</span>
                    <span className="text-chart-4">
                      {escrituraData.comprador_estado_civil}
                    </span>
                  </div>
                )}
                {escrituraData.comprador_nacionalidad && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nacionalidad:</span>
                    <span className="text-chart-4">
                      {escrituraData.comprador_nacionalidad}
                    </span>
                  </div>
                )}
                {escrituraData.comprador_profesion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profesión:</span>
                    <span className="text-chart-4">
                      {escrituraData.comprador_profesion}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacidad legal:</span>
                  <span className={metadata?.comprador_capacidad_legal ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {metadata?.comprador_capacidad_legal ? '✅ Certificada' : '❓ No especificada'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha - Propiedad, Condiciones y Legal */}
        <div className="space-y-4">
          {/* Identificación de la Propiedad */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-chart-1" />
                <T.H4 className="mb-0">🏘️ Identificación de la Propiedad</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dirección:</span>
                  <span className={escrituraData.direccion_inmueble ? 'text-chart-1 font-medium' : 'text-destructive'}>
                    {escrituraData.direccion_inmueble || '❌ No especificada'}
                  </span>
                </div>
                {escrituraData.tipo_inmueble && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="text-chart-1 font-medium">
                      {escrituraData.tipo_inmueble}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Superficie total:</span>
                  <span className={escrituraData.superficie_m2 ? 'text-chart-1 font-medium' : 'text-muted-foreground'}>
                    {escrituraData.superficie_m2 ? `${escrituraData.superficie_m2} m²` : 'No especificada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Superficie útil:</span>
                  <span className={escrituraData.superficie_util ? 'text-chart-1 font-medium' : 'text-muted-foreground'}>
                    {escrituraData.superficie_util ? `${escrituraData.superficie_util} m²` : 'No especificada'}
                  </span>
                </div>
                {escrituraData.numero_habitaciones && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Habitaciones:</span>
                    <span className="text-chart-1 font-medium">
                      {escrituraData.numero_habitaciones}
                    </span>
                  </div>
                )}
                {escrituraData.numero_banos && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Baños:</span>
                    <span className="text-chart-1 font-medium">
                      {escrituraData.numero_banos}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ref. Catastral:</span>
                  <span className={escrituraData.referencia_catastral ? 'text-chart-1 font-medium' : 'text-muted-foreground'}>
                    {escrituraData.referencia_catastral || 'No especificada'}
                  </span>
                </div>
                {metadata?.linderos && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Linderos:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.linderos}
                    </span>
                  </div>
                )}
                {metadata?.descripcion_detallada && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Descripción:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {metadata.descripcion_detallada}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Datos Registrales */}
          {escrituraData && (escrituraData.finca || escrituraData.tomo || escrituraData.libro || escrituraData.folio || escrituraData.registro_propiedad) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-chart-3" />
                  <T.H4 className="mb-0">📋 Datos Registrales</T.H4>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {escrituraData.finca && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nº Finca:</span>
                      <span className="text-chart-3 font-medium">
                        {escrituraData.finca}
                      </span>
                    </div>
                  )}
                  {escrituraData.tomo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tomo:</span>
                      <span className="text-chart-3 font-medium">
                        {escrituraData.tomo}
                      </span>
                    </div>
                  )}
                  {escrituraData.libro && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Libro:</span>
                      <span className="text-chart-3 font-medium">
                        {escrituraData.libro}
                      </span>
                    </div>
                  )}
                  {escrituraData.folio && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Folio:</span>
                      <span className="text-chart-3 font-medium">
                        {escrituraData.folio}
                      </span>
                    </div>
                  )}
                  {escrituraData.inscripcion && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inscripción:</span>
                      <span className="text-chart-3 font-medium">
                        {escrituraData.inscripcion}
                      </span>
                    </div>
                  )}
                  {escrituraData.registro_propiedad && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Registro:</span>
                      <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                        {escrituraData.registro_propiedad}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Condiciones de la Compraventa */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-chart-4" />
                <T.H4 className="mb-0">💰 Condiciones de la Compraventa</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio:</span>
                  <span className={escrituraData.precio_venta ? 'text-chart-4 font-bold text-lg' : 'text-destructive'}>
                    {formatAmount(escrituraData.precio_venta)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moneda:</span>
                  <span className="text-chart-4 font-medium">
                    {escrituraData.moneda || 'EUR'}
                  </span>
                </div>
                {escrituraData.forma_pago && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Forma de pago:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {escrituraData.forma_pago}
                    </span>
                  </div>
                )}
                {escrituraData.valor_catastral && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor catastral:</span>
                    <span className="text-chart-4 font-medium">
                      {formatAmount(escrituraData.valor_catastral)}
                    </span>
                  </div>
                )}
                {escrituraData.itp_aplicable && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ITP aplicable:</span>
                    <span className="text-chart-4 font-medium">
                      {escrituraData.itp_aplicable}%
                    </span>
                  </div>
                )}
                {escrituraData.base_imponible_itp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base imponible ITP:</span>
                    <span className="text-chart-4 font-medium">
                      {formatAmount(escrituraData.base_imponible_itp)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cláusulas Legales y Estado */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-chart-5" />
                <T.H4 className="mb-0">⚖️ Cláusulas Legales</T.H4>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Libre de cargas:</span>
                  <span className={escrituraData.libre_cargas ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {escrituraData.libre_cargas !== null ? (escrituraData.libre_cargas ? '✅ Sí' : '❌ No') : '❓ No especificado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condición suspensiva:</span>
                  <span className={escrituraData.condicion_suspensiva ? 'text-destructive' : 'text-chart-4'}>
                    {escrituraData.condicion_suspensiva !== null ? (escrituraData.condicion_suspensiva ? '⚠️ Sí' : '✅ No') : '❓ No especificado'}
                  </span>
                </div>
                {escrituraData.hipotecas_pendientes && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Hipotecas:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {escrituraData.hipotecas_pendientes}
                    </span>
                  </div>
                )}
                {escrituraData.servidumbres && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Servidumbres:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {escrituraData.servidumbres}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entrega inmediata:</span>
                  <span className={escrituraData.entrega_inmediata ? 'text-chart-4 font-medium' : 'text-muted-foreground'}>
                    {escrituraData.entrega_inmediata !== null ? (escrituraData.entrega_inmediata ? '✅ Sí' : '❌ No') : '❓ No especificado'}
                  </span>
                </div>
                {escrituraData.fecha_entrega && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha entrega:</span>
                    <span className="text-chart-4 font-medium">
                      {formatDate(escrituraData.fecha_entrega)}
                    </span>
                  </div>
                )}
                {escrituraData.estado_conservacion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado conservación:</span>
                    <span className="text-chart-4 font-medium">
                      {escrituraData.estado_conservacion}
                    </span>
                  </div>
                )}
                {escrituraData.inscripcion_registro && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Inscripción registro:</span>
                    <span className="text-gray-800 bg-muted/50 rounded p-2 block text-xs">
                      {escrituraData.inscripcion_registro}
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
                    {escrituraData.category || 'Sin categorizar'}
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
          Datos extraídos el {new Date(escrituraData.created_at).toLocaleDateString('es-ES')} • 
          Documento ID: {escrituraData.document_id}
        </T.Small>
      </div>
    </div>
  );
}