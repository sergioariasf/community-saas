/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista detallada específica de la plantilla de FACTURAS con demo completo
 * ESTADO: development
 * DEPENDENCIAS: FacturaDetailView, datos demo
 * OUTPUTS: Preview completo de plantilla de facturas
 * ACTUALIZADO: 2025-09-16
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { 
  ArrowLeft, 
  CreditCard,
  CheckCircle,
  Info,
  Database,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { FacturaDetailView } from '@/components/documents/templates/FacturaDetailView';

// Datos de ejemplo realistas para demostración - compatibles con ExtractedFactura
const DEMO_FACTURA_DATA = {
  id: "demo-factura-1",
  document_id: "demo-doc-factura",
  organization_id: "demo-org",
  created_at: "2024-03-15T10:30:00Z",
  provider_name: "Electricidad y Servicios S.L.",
  client_name: "Comunidad de Propietarios Los Olivos",
  amount: 3885.31,
  invoice_date: "2024-03-01",
  category: "suministros_electricidad",
  // Campos requeridos por ExtractedFactura
  invoice_number: "F-2024-001234",
  issue_date: "2024-03-01",
  due_date: "2024-04-01",
  subtotal: 3207.69,
  tax_amount: 677.62,
  total_amount: 3885.31,
  currency: "EUR",
  payment_method: "Transferencia bancaria",
  vendor_address: "Calle Industrial 45, 28220 Majadahonda, Madrid",
  vendor_tax_id: "B-85426789",
  vendor_phone: "+34 91 234 56 78",
  vendor_email: "facturacion@electricidadyservicios.es",
  client_address: "Avenida de los Olivos 123, 28015 Madrid",
  client_tax_id: "G-12345678",
  client_phone: "+34 91 567 89 12",
  client_email: "administracion@olivos-cp.es",
  products_summary: "Suministro eléctrico marzo 2024 - Zonas comunes",
  products_count: 1,
  products: [
    {
      descripcion: "Suministro eléctrico zonas comunes",
      cantidad: 1,
      precio_unitario: 3207.69,
      importe: 3207.69
    }
  ],
  payment_terms: "30 días desde fecha factura",
  notes: "Factura correspondiente al suministro eléctrico de zonas comunes del mes de marzo 2024",
  bank_details: "ES21 1234 5678 9012 3456 7890"
};

const DEMO_FACTURA_METADATA = {
  // Información del vendedor
  vendedor_nombre: "Electricidad y Servicios S.L.",
  vendedor_direccion: "Calle Industrial 45, 28220 Majadahonda, Madrid",
  vendedor_identificacion_fiscal: "B-85426789",
  vendedor_telefono: "+34 91 234 56 78",
  vendedor_email: "facturacion@electricidadyservicios.es",
  
  // Información del cliente
  cliente_nombre: "Comunidad de Propietarios Los Olivos",
  cliente_direccion: "Avenida de los Olivos 123, 28015 Madrid",
  cliente_identificacion_fiscal: "H-28765432",
  
  // Datos de la factura
  numero_factura: "ELE-2024-0315",
  fecha_emision: "2024-03-01",
  fecha_vencimiento: "2024-04-01",
  
  // Detalles de productos/servicios
  descripcion_productos: [
    "Suministro eléctrico zonas comunes - Marzo 2024",
    "Suministro eléctrico portal principal - Marzo 2024",
    "Alumbrado escaleras y pasillos - Marzo 2024"
  ],
  cantidades: [1, 1, 1],
  precios_unitarios: [1580.50, 980.20, 650.30],
  importes_linea: [1580.50, 980.20, 650.30],
  
  // Totales y métodos de pago
  subtotal: 3211.00,
  iva: 21,
  importe_total: 3885.31,
  forma_pago: "Transferencia bancaria",
  datos_bancarios: "ES21 1234 5678 9012 3456 7890 - Banco Ejemplo",
  
  // Campos existentes mantenidos
  document_date: "2024-03-01",
  proveedor: "Electricidad y Servicios S.L.",
  cliente: "Comunidad Los Olivos",
  importe: 3885.31,
  moneda: "EUR",
  concepto: "Suministro eléctrico marzo 2024 - Zonas comunes y portal",
  vencimiento: "2024-04-01",
  topic_keywords: ["electricidad", "suministros", "zonas comunes", "portal", "iluminacion"],
  "topic-electricidad": true,
  "topic-suministros": true,
  "topic-mantenimiento": false,
  "topic-administracion": false,
  "topic-iluminacion": true,
  "topic-agua": false,
  "topic-gas": false,
  "topic-limpieza": false,
  "topic-seguridad": false
};

export default function FacturasTemplatePage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/documents/templates"
            className="text-sm text-muted-foreground hover:text-blue-500 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> 
            <span>Volver a Plantillas</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-lg bg-green-100">
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <T.H1 className="mb-0">Plantilla de Facturas</T.H1>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Implementada
              </Badge>
            </div>
            <T.Subtle>
              Vista detallada de la plantilla para documentos tipo factura con análisis económico completo
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
              <Database className="h-5 w-5 text-green-600" />
              <T.H4 className="mb-0">Fuente de Datos</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Tabla principal:</strong> extracted_invoices</div>
              <div><strong>Tabla metadatos:</strong> document_metadata</div>
              <div><strong>Método extracción:</strong> IA</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <T.H4 className="mb-0">Campos Extraídos por IA</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Análisis económico completo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Categorización automática</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Formateo de importes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Análisis de completitud</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600" />
              <T.H4 className="mb-0">Campos Extraídos por IA</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div>• provider_name, client_name</div>
              <div>• amount, invoice_date, category</div>
              <div>• vendedor_*, cliente_*</div>
              <div>• numero_factura, fecha_emision</div>
              <div>• descripcion_productos, cantidades</div>
              <div>• subtotal, iva, importe_total</div>
              <div>• forma_pago, datos_bancarios</div>
              <div>• topic_keywords, moneda</div>
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
          <Badge variant="outline" className="text-green-600 border-green-300">
            Datos de demostración
          </Badge>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <FacturaDetailView
              facturaData={DEMO_FACTURA_DATA}
              metadata={DEMO_FACTURA_METADATA}
              confidence={0.94}
              extractionMethod="gemini + ocr"
              processingTime={1624}
              tokensUsed={987}
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
              <span className="font-medium">600 - 1200 tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Precisión de extracción:</span>
              <span className="font-medium text-green-600">92% - 97%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Campos detectados típicos:</span>
              <span className="font-medium">8 - 12 campos</span>
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
          Plantilla de Facturas • Implementada el 16/09/2025 • 
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </T.Small>
      </div>
    </div>
  );
}