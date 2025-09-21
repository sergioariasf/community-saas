/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista detallada específica de la plantilla de COMUNICADOS VECINOS con demo completo
 * ESTADO: development
 * DEPENDENCIAS: ComunicadoDetailView, datos demo
 * OUTPUTS: Preview completo de plantilla de comunicados
 * ACTUALIZADO: 2025-09-18
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { 
  ArrowLeft, 
  Megaphone,
  CheckCircle,
  Info,
  Database,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { ComunicadoDetailView } from '@/components/documents/templates/ComunicadoDetailView';

// Datos de ejemplo realistas para demostración
const DEMO_COMUNICADO_DATA = {
  id: "demo-comunicado-1",
  document_id: "demo-doc-comunicado",
  organization_id: "demo-org",
  fecha: "2024-03-12",
  comunidad: "Comunidad de Propietarios Los Olivos",
  remitente: "María González Rodríguez - Presidenta",
  resumen: "Comunicado urgente sobre la suspensión temporal del servicio de ascensores debido a trabajos de mantenimiento preventivo obligatorio y medidas de seguridad a adoptar durante el período de reparaciones.",
  category: "mantenimiento_urgente",
  created_at: "2024-03-12T09:15:00Z"
};

const DEMO_COMUNICADO_METADATA = {
  // Información básica
  document_date: "2024-03-12",
  tipo_comunicado: "Aviso de mantenimiento",
  fecha_comunicado: "2024-03-12",
  urgencia: "alta",
  
  // Identificación
  comunidad_nombre: "Comunidad de Propietarios Los Olivos",
  comunidad_direccion: "Avenida de los Olivos 123, 28015 Madrid",
  remitente_nombre: "María González Rodríguez",
  remitente_cargo: "Presidenta",
  
  // Contenido
  asunto: "SUSPENSIÓN TEMPORAL SERVICIO ASCENSORES - MANTENIMIENTO OBLIGATORIO",
  resumen_contenido: "Se comunica a todos los propietarios la suspensión temporal del servicio de ambos ascensores del edificio debido a trabajos de mantenimiento preventivo obligatorio programados por la empresa certificada. El período de suspensión comprenderá desde el lunes 18 de marzo hasta el viernes 22 de marzo de 2024. Durante este tiempo se realizarán inspecciones técnicas, actualización de sistemas de seguridad y certificaciones requeridas por normativa.",
  destinatarios: ["Todos los propietarios", "Inquilinos", "Administrador de fincas"],
  fecha_limite: "2024-03-17",
  
  // Clasificación
  categoria_comunicado: "mantenimiento_preventivo",
  requiere_respuesta: false,
  accion_requerida: [
    "Tomar precauciones para desplazamientos durante la semana indicada",
    "Informar a familiares mayores o con movilidad reducida",
    "Organizar ayudas vecinales si fuera necesario",
    "Contactar con la administración en caso de emergencias médicas"
  ],
  
  // Información adicional
  anexos: [
    "Certificado técnico empresa mantenimiento",
    "Cronograma detallado trabajos",
    "Protocolo emergencias sin ascensor"
  ],
  contacto_info: {
    telefono: "+34 91 234 56 78",
    email: "administracion@losolivos-madrid.com",
    horario_atencion: "Lunes a viernes de 9:00 a 14:00 y de 16:00 a 18:00"
  },
  
  // Keywords y temas (mismos que actas)
  topic_keywords: ["ascensor", "mantenimiento", "seguridad", "certificación", "emergencias", "accesibilidad"],
  "topic-ascensor": true,
  "topic-mantenimiento": true,
  "topic-administracion": true,
  "topic-normativa": true,
  "topic-proveedor": true,
  "topic-incendios": true,  // protocolos de emergencia
  "topic-porteria": false,
  "topic-piscina": false,
  "topic-jardin": false,
  "topic-limpieza": false,
  "topic-balance": false,
  "topic-paqueteria": false,
  "topic-energia": false,
  "topic-dinero": false
};

export default function ComunicadosTemplatePage() {
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
          <div className="p-4 rounded-lg bg-chart-1/10">
            <Megaphone className="h-8 w-8 text-chart-1" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📢</span>
              <T.H1 className="mb-0">Plantilla de Comunicados Vecinos</T.H1>
              <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Implementada
              </Badge>
            </div>
            <T.Subtle>
              Vista detallada de la plantilla para comunicados vecinales con análisis de contenido y urgencia
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
              <Database className="h-5 w-5 text-chart-1" />
              <T.H4 className="mb-0">Fuente de Datos</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Tabla principal:</strong> extracted_communications</div>
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
                <span>Identificación de remitente y comunidad</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Clasificación de urgencia automática</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Extracción de fechas y plazos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Detección de acciones requeridas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-chart-1" />
              <T.H4 className="mb-0">Campos Extraídos por IA</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div>• fecha, comunidad, remitente</div>
              <div>• asunto, resumen, urgencia</div>
              <div>• destinatarios[], accion_requerida[]</div>
              <div>• fecha_limite, requiere_respuesta</div>
              <div>• contacto_info, anexos[]</div>
              <div>• categoria_comunicado, tipo_comunicado</div>
              <div>• topic_keywords (mismos que actas)</div>
              <div>• topic-* (comunidad temas)</div>
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
          <Badge variant="outline" className="text-chart-1 border-chart-1/20">
            Datos de demostración
          </Badge>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <ComunicadoDetailView
              comunicadoData={DEMO_COMUNICADO_DATA}
              metadata={DEMO_COMUNICADO_METADATA}
              confidence={0.91}
              extractionMethod="gemini + communication parser"
              processingTime={1567}
              tokensUsed={1123}
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
              <span className="font-medium">1.2 - 2.0 segundos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tokens consumidos (promedio):</span>
              <span className="font-medium">800 - 1400 tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Precisión de extracción:</span>
              <span className="font-medium text-chart-4">88% - 94%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Campos detectados típicos:</span>
              <span className="font-medium">10 - 18 campos</span>
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
              <span className="font-medium">Comunicación + Comunitario</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Temperatura:</span>
              <span className="font-medium">0.2 (semi-determinista)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fallback:</span>
              <span className="font-medium">Clasificación manual + RegEx</span>
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
          Plantilla de Comunicados Vecinos • Implementada el 18/09/2025 • 
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </T.Small>
      </div>
    </div>
  );
}