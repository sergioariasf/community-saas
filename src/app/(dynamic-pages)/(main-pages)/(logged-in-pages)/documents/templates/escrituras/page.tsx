/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista detallada específica de la plantilla de ESCRITURAS DE COMPRAVENTA con demo completo
 * ESTADO: development
 * DEPENDENCIAS: EscrituraCompraventaDetailView, datos demo
 * OUTPUTS: Preview completo de plantilla de escrituras de compraventa
 * ACTUALIZADO: 2025-09-18
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { 
  ArrowLeft, 
  Home,
  CheckCircle,
  Info,
  Database,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { EscrituraCompraventaDetailView } from '@/components/documents/templates/EscrituraCompraventaDetailView';

// Datos de ejemplo realistas para demostración
const DEMO_ESCRITURA_DATA = {
  id: "demo-escritura-1",
  document_id: "demo-doc-escritura",
  organization_id: "demo-org",
  vendedor_nombre: "José María González Fernández",
  comprador_nombre: "Ana Isabel Martín Rodríguez",
  direccion_inmueble: "Calle Gran Vía 125, 3º Izquierda, 28013 Madrid",
  precio_venta: 385000.00,
  fecha_escritura: "2024-03-15",
  notario_nombre: "María del Carmen Ruiz-Tagle Sánchez",
  referencia_catastral: "9872023VH4897S0001WX",
  superficie_m2: 95.00,
  category: "vivienda_urbana",
  created_at: "2024-03-15T10:30:00Z"
};

const DEMO_ESCRITURA_METADATA = {
  // Identificación y comparecencia de las partes
  vendedor_nombre: "José María González Fernández",
  vendedor_dni: "12345678-A",
  vendedor_direccion: "Avenida de América 45, 4º B, 28028 Madrid",
  vendedor_estado_civil: "Casado en régimen de gananciales",
  vendedor_nacionalidad: "Española",
  vendedor_profesion: "Ingeniero Industrial",
  
  comprador_nombre: "Ana Isabel Martín Rodríguez",
  comprador_dni: "87654321-B",
  comprador_direccion: "Calle Serrano 89, 2º Derecha, 28006 Madrid",
  comprador_estado_civil: "Soltera",
  comprador_nacionalidad: "Española",
  comprador_profesion: "Arquitecta",
  
  // Descripción del inmueble
  direccion_inmueble: "Calle Gran Vía 125, 3º Izquierda, 28013 Madrid",
  tipo_inmueble: "Vivienda urbana",
  superficie_m2: 95.00,
  superficie_util: 85.00,
  numero_habitaciones: 3,
  numero_banos: 2,
  planta: "Tercera",
  orientacion: "Sur-Este",
  referencia_catastral: "9872023VH4897S0001WX",
  descripcion_inmueble: "Vivienda exterior de tres dormitorios, dos baños completos, salón-comedor, cocina independiente equipada, terraza de 10 m², calefacción central, aire acondicionado, armarios empotrados y plaza de garaje incluida.",
  
  // Datos registrales
  registro_propiedad: "Registro de la Propiedad nº 4 de Madrid",
  tomo: "2847",
  libro: "1205",
  folio: "89",
  finca: "45672",
  inscripcion: "3ª",
  
  // Condiciones económicas y de pago
  precio_venta: 385000.00,
  moneda: "EUR",
  forma_pago: "Transferencia bancaria",
  precio_en_letras: "Trescientos ochenta y cinco mil euros",
  impuestos_incluidos: false,
  gastos_a_cargo_comprador: ["Impuesto de Transmisiones Patrimoniales", "Gastos de notaría", "Gastos de registro", "Gestoría"],
  gastos_a_cargo_vendedor: ["Plusvalía municipal", "Comisión inmobiliaria"],
  
  // Cargas y gravámenes
  cargas_existentes: [],
  hipotecas_pendientes: "Ninguna",
  servidumbres: "Servidumbre de paso en planta baja para acceso al garaje comunitario",
  libre_cargas: true,
  
  // Condiciones especiales y pactos
  condicion_suspensiva: false,
  condiciones_especiales: [
    "La vivienda se entrega libre de inquilinos y totalmente vacía",
    "Se incluyen todos los electrodomésticos de la cocina en el precio",
    "La plaza de garaje nº 23 se incluye en la venta"
  ],
  clausulas_particulares: [
    "El comprador declara conocer el estado de conservación del inmueble",
    "La entrega de llaves se realizará el mismo día del otorgamiento",
    "Los gastos de comunidad están al corriente de pago hasta la fecha"
  ],
  
  // Entrega y posesión
  fecha_entrega: "2024-03-15",
  entrega_inmediata: true,
  estado_conservacion: "Bueno",
  inventario_incluido: "Cocina equipada con electrodomésticos Siemens, armarios empotrados en dormitorios, sistema de aire acondicionado por conductos",
  
  // Aspectos notariales y legales
  fecha_escritura: "2024-03-15",
  notario_nombre: "María del Carmen Ruiz-Tagle Sánchez",
  notario_numero_colegiado: "2847",
  notaria_direccion: "Calle Alcalá 234, 28028 Madrid",
  protocolo_numero: "1247",
  autorizacion_notarial: true,
  
  // Información fiscal y registral
  valor_catastral: 298450.00,
  coeficiente_participacion: "1,25%",
  itp_aplicable: 6.0,
  base_imponible_itp: 385000.00,
  inscripcion_registro: "Pendiente",
  
  // Campos existentes mantenidos
  document_date: "2024-03-15",
  concepto: "Escritura de compraventa de vivienda urbana en Madrid centro",
  topic_keywords: ["compraventa", "vivienda", "madrid", "escritura", "notario", "registro"],
  "topic-compraventa": true,
  "topic-vivienda": true,
  "topic-madrid": true,
  "topic-urbano": true,
  "topic-notario": true,
  "topic-registro": true,
  "topic-hipoteca": false,
  "topic-obra-nueva": false,
  "topic-local-comercial": false,
  "topic-rustico": false,
  "topic-industrial": false,
  "topic-parking": true
};

export default function EscriturasTemplatePage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/documents/templates"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> 
            <span>Volver a Plantillas</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-lg bg-chart-2/10">
            <Home className="h-8 w-8 text-chart-2" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏠</span>
              <T.H1 className="mb-0">Plantilla de Escrituras de Compraventa</T.H1>
              <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Implementada
              </Badge>
            </div>
            <T.Subtle>
              Vista detallada de la plantilla para escrituras de compraventa inmobiliaria con análisis legal completo
            </T.Subtle>
          </div>
        </div>
      </div>

      {/* Información técnica - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded">DEV ONLY</div>
            <T.Small className="text-gray-600 font-medium">Información técnica para desarrolladores</T.Small>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-chart-2" />
              <T.H4 className="mb-0">Fuente de Datos</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Tabla principal:</strong> extracted_property_deeds</div>
              <div><strong>Tabla metadatos:</strong> document_metadata</div>
              <div><strong>Método extracción:</strong> IA</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-chart-4" />
              <T.H4 className="mb-0">Campos Extraídos por IA</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Identificación completa de partes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Descripción detallada del inmueble</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Datos registrales y catastrales</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Análisis de cargas y gravámenes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-chart-2" />
              <T.H4 className="mb-0">Campos Extraídos por IA</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div>• vendedor_nombre, comprador_nombre</div>
              <div>• direccion_inmueble, superficie_m2</div>
              <div>• referencia_catastral, registro_propiedad</div>
              <div>• precio_venta, forma_pago</div>
              <div>• notario_nombre, fecha_escritura</div>
              <div>• cargas_existentes, hipotecas_pendientes</div>
              <div>• condiciones_especiales, clausulas_particulares</div>
              <div>• valor_catastral, itp_aplicable</div>
            </div>
          </CardContent>
        </Card>
        </div>
        </div>
      )}

      {/* Vista previa completa */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <T.H3 className="mb-0">🎯 Vista Previa Completa</T.H3>
          <Badge variant="outline" className="text-chart-2 border-chart-2/20">
            Datos de demostración
          </Badge>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <EscrituraCompraventaDetailView
              escrituraData={DEMO_ESCRITURA_DATA}
              metadata={DEMO_ESCRITURA_METADATA}
              confidence={0.95}
              extractionMethod="gemini + legal real estate parser"
              processingTime={2847}
              tokensUsed={1876}
            />
          </CardContent>
        </Card>
      </div>

      {/* Información adicional - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded">DEV ONLY</div>
            <T.Small className="text-gray-600 font-medium">Métricas y configuración técnica</T.Small>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <T.H4>📊 Métricas de Rendimiento</T.H4>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Tiempo promedio extracción:</span>
              <span className="font-medium">2.5 - 4.0 segundos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tokens consumidos (promedio):</span>
              <span className="font-medium">1500 - 2500 tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Precisión de extracción:</span>
              <span className="font-medium text-chart-4">92% - 98%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Campos detectados típicos:</span>
              <span className="font-medium">25 - 35 campos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <T.H4>🔧 Configuración Técnica</T.H4>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Modelo IA:</span>
              <span className="font-medium">Gemini 1.5 Flash</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Parser especializado:</span>
              <span className="font-medium">Legal + Inmobiliario</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Temperatura:</span>
              <span className="font-medium">0.05 (ultra determinista)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fallback:</span>
              <span className="font-medium">Extracción registral + RegEx</span>
            </div>
          </CardContent>
        </Card>
        </div>
        </div>
      )}

      {/* Footer */}
      <Separator />
      <div className="text-center">
        <T.Small className="text-muted-foreground">
          Plantilla de Escrituras de Compraventa • Implementada el 18/09/2025 • 
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </T.Small>
      </div>
    </div>
  );
}