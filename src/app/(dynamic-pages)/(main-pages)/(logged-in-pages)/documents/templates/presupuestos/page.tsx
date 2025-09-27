/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista detallada específica de la plantilla de PRESUPUESTOS con demo completo
 * ESTADO: development
 * DEPENDENCIAS: PresupuestoDetailView, datos demo
 * OUTPUTS: Preview completo de plantilla de presupuestos
 * ACTUALIZADO: 2025-09-18
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { 
  ArrowLeft, 
  Calculator,
  CheckCircle,
  Info,
  Database,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { PresupuestoDetailView } from '@/components/documents/templates/PresupuestoDetailView';

// Datos de ejemplo realistas para demostración - compatibles con ExtractedPresupuesto
const DEMO_PRESUPUESTO_DATA = {
  id: "demo-presupuesto-1",
  document_id: "demo-doc-presupuesto",
  organization_id: "demo-org",
  created_at: "2024-03-10T08:30:00Z",
  numero_presupuesto: "PRES-2024-0087",
  emisor_name: "Reformas y Construcciones Delta S.L.",
  cliente_name: "Comunidad de Propietarios Los Olivos",
  fecha_emision: "2024-03-10",
  fecha_validez: "2024-05-10",
  total: 12523.50,
  category: "obras_reformas",
  // Campos requeridos por ExtractedPresupuesto
  titulo: "Presupuesto Reforma Zonas Comunes",
  tipo_documento: "Presupuesto",
  emisor_direccion: "Polígono Industrial Norte, Nave 12, 28823 Coslada, Madrid",
  emisor_telefono: "+34 91 345 67 89",
  emisor_email: "presupuestos@deltaconstructora.es",
  emisor_identificacion_fiscal: "B-67891234",
  cliente_direccion: "Avenida de los Olivos 123, 28015 Madrid",
  cliente_identificacion_fiscal: "G-12345678",
  subtotal: 10350.00,
  impuestos: 2173.50,
  porcentaje_impuestos: 21.0,
  moneda: "EUR",
  descripcion_servicios: [
    "Pintura exterior del edificio",
    "Impermeabilización de cubiertas",
    "Reparación de grietas en fachada"
  ],
  cantidades: [1, 1, 1],
  precios_unitarios: [4500.00, 3200.00, 2650.00],
  importes_totales: [4500.00, 3200.00, 2650.00],
  condiciones_pago: "50% al inicio, 50% al finalizar",
  plazo_ejecucion: "15 días laborables",
  garantia: "2 años en materiales y mano de obra",
  observaciones: "Presupuesto válido durante 60 días. No incluye tasas municipales.",
  descuentos_aplicados: 0.00,
  recargos_aplicados: 0.00,
  // Campos adicionales requeridos
  descripciones_detalladas: [
    "Preparación de superficie, lijado y aplicación de 2 manos de pintura",
    "Aplicación de membrana impermeabilizante multicapa",
    "Sellado de grietas con mortero especial antihumedad"
  ],
  plazos_entrega: "5 días para pintura, 8 días para impermeabilización, 2 días para grietas",
  pago_inicial_requerido: true,
  notas_adicionales: "Materiales incluidos. Seguro de obra incluido."
};

const DEMO_PRESUPUESTO_METADATA = {
  // Título
  titulo: "Presupuesto para Renovación de Fachada Principal",
  tipo_documento: "Presupuesto/Cotización",
  
  // Información del emisor
  emisor_nombre: "Reformas y Construcciones Delta S.L.",
  emisor_direccion: "Polígono Industrial Los Cerezos, Nave 23, 28840 Mejorada del Campo, Madrid",
  emisor_telefono: "+34 91 234 56 78",
  emisor_email: "presupuestos@reformasdelta.com",
  emisor_identificacion_fiscal: "B-86543210",
  
  // Información del cliente
  cliente_nombre: "Comunidad de Propietarios Los Olivos",
  cliente_direccion: "Avenida de los Olivos 123, 28015 Madrid",
  cliente_identificacion_fiscal: "H-28765432",
  
  // Detalles del presupuesto
  numero_presupuesto: "PRES-2024-0087",
  fecha_emision: "2024-03-10",
  fecha_validez: "2024-05-10",
  
  // Descripción del trabajo y costos
  descripcion_servicios: [
    "Montaje y desmontaje de andamiaje completo",
    "Limpieza y preparación de superficie",
    "Aplicación de pintura fachada (3 manos)",
    "Reparación de grietas y desperfectos",
    "Sellado de juntas y elementos",
    "Limpieza final y retirada de material"
  ],
  cantidades: [1, 180, 180, 15, 25, 1],
  precios_unitarios: [2850.00, 6.67, 25.00, 120.00, 32.00, 450.00],
  importes_totales: [2850.00, 1200.00, 4500.00, 1800.00, 800.00, 450.00],
  descripciones_detalladas: [
    "Andamiaje tubular completo con protecciones de seguridad según normativa",
    "Limpieza con hidrolavadora, lijado y preparación de superficie por m²",
    "Pintura plástica primera calidad, imprimación + 2 manos de acabado por m²",
    "Reparación de grietas con masilla específica y sellado, por metro lineal",
    "Sellado de juntas con silicona neutra alta calidad, por metro lineal",
    "Limpieza completa del área de trabajo y retirada de material sobrante"
  ],
  
  // Resumen final y condiciones
  subtotal: 10350.00,
  porcentaje_impuestos: 21,
  importe_impuestos: 2173.50,
  total: 12523.50,
  moneda: "EUR",
  
  // Notas y condiciones
  condiciones_pago: "50% al inicio de los trabajos, 50% a la finalización. Pago mediante transferencia bancaria.",
  plazos_entrega: "15 días laborables desde la firma del contrato y recepción del primer pago",
  pago_inicial_requerido: true,
  notas_adicionales: "El presupuesto incluye todos los materiales, mano de obra y medios auxiliares necesarios. No incluye posibles trabajos adicionales no contemplados que pudieran surgir durante la ejecución.",
  garantia: "2 años de garantía en materiales y mano de obra. Mantenimiento gratuito durante el primer año.",
  
  // Campos existentes mantenidos
  document_date: "2024-03-10",
  concepto: "Renovación completa de fachada principal - Edificio residencial",
  topic_keywords: ["fachada", "pintura", "renovación", "andamiaje", "obras", "construcción"],
  "topic-fachada": true,
  "topic-pintura": true,
  "topic-obras": true,
  "topic-mantenimiento": true,
  "topic-construccion": true,
  "topic-renovacion": true,
  "topic-andamiaje": true,
  "topic-sellado": true,
  "topic-limpieza": false,
  "topic-jardineria": false,
  "topic-electricidad": false,
  "topic-fontaneria": false
};

export default function PresupuestosTemplatePage() {
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
          <div className="p-4 rounded-lg bg-chart-5/10">
            <Calculator className="h-8 w-8 text-chart-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💵</span>
              <T.H1 className="mb-0">Plantilla de Presupuestos</T.H1>
              <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Implementada
              </Badge>
            </div>
            <T.Subtle>
              Vista detallada de la plantilla para documentos tipo presupuesto con análisis económico completo
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
              <Database className="h-5 w-5 text-chart-5" />
              <T.H4 className="mb-0">Fuente de Datos</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Tabla principal:</strong> extracted_budgets</div>
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
                <span>Análisis de partidas detalladas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Cálculos automáticos de IVA</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Extracción de condiciones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Validez y fechas importantes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-chart-5" />
              <T.H4 className="mb-0">Campos Extraídos por IA</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div>• numero_presupuesto, fecha_emision</div>
              <div>• emisor_name, cliente_name</div>
              <div>• fecha_validez, categoria</div>
              <div>• descripcion_servicios[], cantidades[]</div>
              <div>• precios_unitarios[], importes_totales[]</div>
              <div>• subtotal, impuestos, total</div>
              <div>• condiciones_pago, plazos_entrega</div>
              <div>• garantia, notas_adicionales</div>
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
          <Badge variant="outline" className="text-chart-5 border-chart-5/20">
            Datos de demostración
          </Badge>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <PresupuestoDetailView
              presupuestoData={DEMO_PRESUPUESTO_DATA}
              metadata={DEMO_PRESUPUESTO_METADATA}
              confidence={0.93}
              extractionMethod="gemini + financial parser"
              processingTime={1847}
              tokensUsed={1234}
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
              <span className="font-medium">1.5 - 2.5 segundos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tokens consumidos (promedio):</span>
              <span className="font-medium">800 - 1500 tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Precisión de extracción:</span>
              <span className="font-medium text-chart-4">90% - 96%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Campos detectados típicos:</span>
              <span className="font-medium">15 - 22 campos</span>
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
              <span className="font-medium">Financiero + Comercial</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Temperatura:</span>
              <span className="font-medium">0.1 (determinista)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fallback:</span>
              <span className="font-medium">Cálculo manual + RegEx</span>
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
          Plantilla de Presupuestos • Implementada el 18/09/2025 • 
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </T.Small>
      </div>
    </div>
  );
}