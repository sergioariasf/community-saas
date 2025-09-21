/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista detallada específica de la plantilla de CONTRATOS con demo completo
 * ESTADO: development
 * DEPENDENCIAS: ContratoDetailView, datos demo
 * OUTPUTS: Preview completo de plantilla de contratos
 * ACTUALIZADO: 2025-09-18
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { 
  ArrowLeft, 
  Building2,
  CheckCircle,
  Info,
  Database,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { ContratoDetailView } from '@/components/documents/templates/ContratoDetailView';

// Datos de ejemplo realistas para demostración
const DEMO_CONTRATO_DATA = {
  id: "demo-contrato-1",
  document_id: "demo-doc-contrato",
  organization_id: "demo-org",
  titulo_contrato: "Contrato de Prestación de Servicios de Mantenimiento Integral",
  parte_a: "Comunidad de Propietarios Los Olivos",
  parte_b: "Mantenimientos Integrales ABC S.L.",
  objeto_contrato: "Prestación de servicios de mantenimiento integral de zonas comunes, jardines, instalaciones eléctricas y sistemas de seguridad del edificio residencial",
  duracion: "24 meses",
  importe_total: 24600.00,
  fecha_inicio: "2024-04-01",
  fecha_fin: "2026-03-31",
  category: "servicios_mantenimiento",
  created_at: "2024-03-20T09:00:00Z"
};

const DEMO_CONTRATO_METADATA = {
  // Encabezado o título
  titulo_contrato: "Contrato de Prestación de Servicios de Mantenimiento Integral",
  tipo_contrato: "Prestación de servicios",
  
  // Identificación de las partes
  parte_a_nombre: "Comunidad de Propietarios Los Olivos",
  parte_a_direccion: "Avenida de los Olivos 123, 28015 Madrid",
  parte_a_identificacion_fiscal: "H-28765432",
  parte_a_representante: "María González Rodríguez - Presidenta",
  
  parte_b_nombre: "Mantenimientos Integrales ABC S.L.",
  parte_b_direccion: "Calle Industria 45, Polígono Los Frailes, 28850 Torrejón de Ardoz, Madrid",
  parte_b_identificacion_fiscal: "B-85426789",
  parte_b_representante: "Carlos Martín López - Administrador Único",
  
  // Objeto y alcance del acuerdo
  objeto_contrato: "Prestación de servicios de mantenimiento integral de zonas comunes, jardines, instalaciones eléctricas y sistemas de seguridad",
  descripcion_detallada: "El presente contrato tiene por objeto la prestación de servicios integrales de mantenimiento para garantizar el correcto funcionamiento de todas las instalaciones comunes del edificio residencial, incluyendo limpieza, jardinería, mantenimiento preventivo y correctivo, y servicios de emergencia 24h.",
  alcance_servicios: [
    "Mantenimiento preventivo y correctivo de ascensores",
    "Cuidado y mantenimiento de jardines y zonas verdes",
    "Limpieza de zonas comunes y portal",
    "Mantenimiento de instalaciones eléctricas",
    "Revisión y mantenimiento de sistemas de seguridad",
    "Servicio de emergencias 24 horas los 365 días del año"
  ],
  
  // Términos y condiciones
  fecha_inicio: "2024-04-01",
  fecha_fin: "2026-03-31",
  duracion: "24 meses renovables",
  obligaciones_parte_a: [
    "Facilitar el acceso a todas las instalaciones del edificio",
    "Proporcionar las llaves y códigos necesarios para el acceso",
    "Abonar las facturas mensuales en los plazos establecidos",
    "Comunicar cualquier incidencia o avería en un plazo máximo de 24 horas",
    "Facilitar espacios de almacenamiento para herramientas y materiales"
  ],
  obligaciones_parte_b: [
    "Realizar el mantenimiento conforme a la normativa vigente",
    "Proporcionar personal cualificado y con la formación adecuada",
    "Mantener un stock mínimo de repuestos y materiales",
    "Emitir informes mensuales del estado de las instalaciones",
    "Responder a emergencias en un plazo máximo de 2 horas",
    "Mantener seguros de responsabilidad civil y daños vigentes"
  ],
  
  // Condiciones económicas
  importe_total: 24600.00,
  moneda: "EUR",
  forma_pago: "Mensual mediante transferencia bancaria",
  plazos_pago: [
    "Pago mensual de 1.025€ + IVA",
    "Facturación el día 1 de cada mes",
    "Plazo de pago: 30 días desde la fecha de factura",
    "Penalización por retraso: 1% mensual sobre el importe"
  ],
  penalizaciones: "En caso de incumplimiento de las obligaciones de mantenimiento, se aplicará una penalización del 5% sobre la facturación mensual por cada día de retraso en la resolución de incidencias críticas.",
  
  // Aspectos legales
  confidencialidad: true,
  condiciones_terminacion: "Cualquiera de las partes podrá resolver el contrato con un preaviso mínimo de 3 meses. En caso de incumplimiento grave, la resolución será inmediata previa notificación fehaciente.",
  legislacion_aplicable: "Legislación española y normativa de la Comunidad de Madrid",
  jurisdiccion: "Tribunales de Madrid",
  
  // Firma
  fecha_firma: "2024-03-20",
  lugar_firma: "Madrid, España",
  firmas_presentes: true,
  
  // Campos existentes mantenidos
  document_date: "2024-03-20",
  concepto: "Contrato de mantenimiento integral - 24 meses",
  topic_keywords: ["mantenimiento", "jardines", "ascensores", "limpieza", "emergencias", "instalaciones"],
  "topic-mantenimiento": true,
  "topic-jardines": true,
  "topic-ascensores": true,
  "topic-limpieza": true,
  "topic-emergencias": true,
  "topic-instalaciones": true,
  "topic-electricidad": true,
  "topic-seguridad": true,
  "topic-agua": false,
  "topic-gas": false,
  "topic-climatizacion": false,
  "topic-parking": false
};

export default function ContratosTemplatePage() {
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
          <div className="p-4 rounded-lg bg-chart-3/10">
            <Building2 className="h-8 w-8 text-chart-3" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📝</span>
              <T.H1 className="mb-0">Plantilla de Contratos</T.H1>
              <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Implementada
              </Badge>
            </div>
            <T.Subtle>
              Vista detallada de la plantilla para documentos tipo contrato con análisis legal completo
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
              <Database className="h-5 w-5 text-chart-3" />
              <T.H4 className="mb-0">Fuente de Datos</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Tabla principal:</strong> extracted_contracts</div>
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
                <span>Identificación de partes contratantes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Extracción de términos y condiciones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Análisis de duración y fechas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Detección de aspectos legales</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-chart-3" />
              <T.H4 className="mb-0">Campos Extraídos por IA</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div>• titulo_contrato, tipo_contrato</div>
              <div>• parte_a, parte_b, representantes</div>
              <div>• objeto_contrato, alcance_servicios</div>
              <div>• fecha_inicio, fecha_fin, duracion</div>
              <div>• importe_total, forma_pago</div>
              <div>• obligaciones_*, condiciones_*</div>
              <div>• legislacion_aplicable, firmas_presentes</div>
              <div>• topic_keywords, confidencialidad</div>
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
          <Badge variant="outline" className="text-chart-3 border-chart-3/20">
            Datos de demostración
          </Badge>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <ContratoDetailView
              contratoData={DEMO_CONTRATO_DATA}
              metadata={DEMO_CONTRATO_METADATA}
              confidence={0.89}
              extractionMethod="gemini + legal parser"
              processingTime={2247}
              tokensUsed={1543}
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
              <span className="font-medium">2.0 - 3.5 segundos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tokens consumidos (promedio):</span>
              <span className="font-medium">1200 - 2000 tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Precisión de extracción:</span>
              <span className="font-medium text-chart-4">85% - 92%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Campos detectados típicos:</span>
              <span className="font-medium">18 - 25 campos</span>
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
              <span className="font-medium">Legal + Comercial</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Temperatura:</span>
              <span className="font-medium">0.1 (determinista)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fallback:</span>
              <span className="font-medium">Extracción manual + RegEx</span>
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
          Plantilla de Contratos • Implementada el 18/09/2025 • 
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </T.Small>
      </div>
    </div>
  );
}