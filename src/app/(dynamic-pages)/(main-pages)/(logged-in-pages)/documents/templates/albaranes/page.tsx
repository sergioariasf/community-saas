/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista detallada específica de la plantilla de ALBARANES con demo completo
 * ESTADO: development
 * DEPENDENCIAS: AlbaranDetailView, datos demo
 * OUTPUTS: Preview completo de plantilla de albaranes
 * ACTUALIZADO: 2025-09-18
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { 
  ArrowLeft, 
  Truck,
  CheckCircle,
  Info,
  Database,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { AlbaranDetailView } from '@/components/documents/templates/AlbaranDetailView';

// Datos de ejemplo realistas para demostración
const DEMO_ALBARAN_DATA = {
  id: "demo-albaran-1",
  document_id: "demo-doc-albaran",
  organization_id: "demo-org",
  emisor_name: "Suministros Industriales Madrid S.L.",
  receptor_name: "Comunidad de Propietarios Los Olivos",
  numero_albaran: "ALB-2024-0892",
  fecha_emision: "2024-03-15",
  numero_pedido: "PED-2024-0156",
  category: "suministros_mantenimiento",
  created_at: "2024-03-15T14:30:00Z",
  emisor_direccion: "Polígono Industrial Los Frailes, Nave 15, 28850 Torrejón de Ardoz, Madrid",
  emisor_telefono: "916-789-0123",
  emisor_email: "pedidos@suministrosmadrid.com",
  receptor_direccion: "Calle de la Esperanza 45, 28033 Madrid",
  receptor_telefono: "915-432-1098",
  mercancia: [
    { descripcion: "Bombillas LED 12W", cantidad: 24, unidad: "uds" },
    { descripcion: "Cable eléctrico 2.5mm", cantidad: 50, unidad: "m" }
  ],
  cantidad_total: 74,
  peso_total: 15.5,
  observaciones: "Entrega urgente según pedido",
  estado_entrega: "entregado",
  firma_receptor: true,
  transportista: "Juan García",
  vehiculo_matricula: "1234-ABC"
};

const DEMO_ALBARAN_METADATA = {
  // Datos del emisor
  emisor_nombre: "Suministros Industriales Madrid S.L.",
  emisor_direccion: "Polígono Industrial Los Frailes, Nave 15, 28850 Torrejón de Ardoz, Madrid",
  emisor_identificacion_fiscal: "B-86543210",
  
  // Datos del receptor
  receptor_nombre: "Comunidad de Propietarios Los Olivos",
  receptor_direccion_entrega: "Avenida de los Olivos 123, Portal A, 28015 Madrid",
  receptor_identificacion_fiscal: "H-28765432",
  
  // Información del albarán
  numero_albaran: "ALB-2024-0892",
  fecha_emision: "2024-03-15",
  numero_pedido: "PED-2024-0156",
  referencia: "Mantenimiento Marzo - Zonas Comunes",
  
  // Detalles de la mercancía
  descripcion_productos: [
    "Bombillas LED 15W para zonas comunes - Pack 12 unidades",
    "Pintura plástica blanca para paredes - 25 litros",
    "Rodillos y brochas para pintura - Kit completo",
    "Masilla para grietas - 5kg",
    "Material eléctrico diverso - Cables y conectores"
  ],
  cantidades: [12, 25, 1, 5, 1],
  unidades_medida: ["unidades", "litros", "kit", "kg", "lote"],
  
  // Confirmación de entrega
  firma_presente: true,
  sello_presente: false,
  observaciones: "Entrega realizada en portería. Recibido por el portero Juan García. Material en perfecto estado.",
  estado_entrega: "Entregado completo",
  
  // Campos existentes mantenidos
  document_date: "2024-03-15",
  concepto: "Suministros para mantenimiento de zonas comunes - Marzo 2024",
  topic_keywords: ["suministros", "mantenimiento", "bombillas", "pintura", "material eléctrico"],
  "topic-suministros": true,
  "topic-mantenimiento": true,
  "topic-electricidad": true,
  "topic-pintura": true,
  "topic-iluminacion": true,
  "topic-limpieza": false,
  "topic-agua": false,
  "topic-gas": false,
  "topic-seguridad": false,
  "topic-jardineria": false
};

export default function AlbaranesTemplatePage() {
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
          <div className="p-4 rounded-lg bg-chart-4/10">
            <Truck className="h-8 w-8 text-chart-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <T.H1 className="mb-0">Plantilla de Albaranes</T.H1>
              <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Implementada
              </Badge>
            </div>
            <T.Subtle>
              Vista detallada de la plantilla para documentos tipo albarán con análisis de entrega completo
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
              <Database className="h-5 w-5 text-chart-4" />
              <T.H4 className="mb-0">Fuente de Datos</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Tabla principal:</strong> extracted_delivery_notes</div>
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
                <span>Análisis de entrega completo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Detección de firmas y sellos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Extracción de productos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-chart-4" />
                <span>Categorización automática</span>
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
              <div>• emisor_name, receptor_name</div>
              <div>• numero_albaran, fecha_emision</div>
              <div>• numero_pedido, category</div>
              <div>• emisor_*, receptor_*</div>
              <div>• descripcion_productos, cantidades</div>
              <div>• unidades_medida, observaciones</div>
              <div>• firma_presente, sello_presente</div>
              <div>• estado_entrega, topic_keywords</div>
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
          <Badge variant="outline" className="text-chart-4 border-chart-4/20">
            Datos de demostración
          </Badge>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <AlbaranDetailView
              albaranData={DEMO_ALBARAN_DATA as any}
              metadata={DEMO_ALBARAN_METADATA}
              confidence={0.91}
              extractionMethod="gemini + ocr"
              processingTime={1456}
              tokensUsed={876}
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
              <span className="font-medium">1.0 - 2.0 segundos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tokens consumidos (promedio):</span>
              <span className="font-medium">500 - 1000 tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Precisión de extracción:</span>
              <span className="font-medium text-chart-4">88% - 94%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Campos detectados típicos:</span>
              <span className="font-medium">10 - 15 campos</span>
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
              <span>OCR Engine:</span>
              <span className="font-medium">Google Cloud Vision</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Temperatura:</span>
              <span className="font-medium">0.1 (determinista)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fallback:</span>
              <span className="font-medium">Extracción manual</span>
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
          Plantilla de Albaranes • Implementada el 18/09/2025 • 
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </T.Small>
      </div>
    </div>
  );
}