/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista de grid con cards de tipos de plantillas de documentos
 * ESTADO: development
 * DEPENDENCIAS: templates registry, componentes UI
 * OUTPUTS: Página principal con cards navegables por tipo
 * ACTUALIZADO: 2025-09-16
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { 
  ArrowLeft, 
  ArrowRight,
  CheckCircle, 
  Clock, 
  FileText,
  PieChart,
  CreditCard,
  Users,
  Building2,
  Megaphone,
  Calculator,
  Truck,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { 
  getAvailableTemplates, 
  getTemplateStats 
} from '@/components/documents/templates';

// Configuración de iconos y rutas para cada tipo
const TEMPLATE_CONFIG = {
  acta: {
    icon: Users,
    emoji: '📋',
    color: 'blue',
    description: 'Extrae personas clave, decisiones y estructura de juntas',
    features: ['Presidente entrante/saliente', 'Administrador', 'Orden del día', 'Acuerdos y votaciones'],
    route: 'actas'
  },
  factura: {
    icon: CreditCard,
    emoji: '💰',
    color: 'green', 
    description: 'Analiza datos comerciales, importes y categorización',
    features: ['Proveedor y cliente', 'Importe y fecha', 'Categorización automática', 'Análisis de completitud'],
    route: 'facturas'
  },
  contrato: {
    icon: Building2,
    emoji: '📝',
    color: 'purple',
    description: 'Identifica partes, términos y condiciones legales',
    features: ['Partes contratantes', 'Duración y términos', 'Condiciones legales', 'Obligaciones'],
    route: 'contratos'
  },
  comunicado: {
    icon: Megaphone,
    emoji: '📢',
    color: 'orange',
    description: 'Extrae emisor, destinatarios y información clave',
    features: ['Emisor del comunicado', 'Destinatarios', 'Asunto principal', 'Urgencia y fechas'],
    route: 'comunicados'
  },
  presupuesto: {
    icon: Calculator,
    emoji: '💵',
    color: 'indigo',
    description: 'Analiza costes, partidas y condiciones económicas',
    features: ['Proveedor y cliente', 'Partidas detalladas', 'Costes totales', 'Vigencia y condiciones'],
    route: 'presupuestos'
  },
  albaran: {
    icon: Truck,
    emoji: '📦',
    color: 'teal',
    description: 'Certifica entregas de pedidos con detalle de mercancía',
    features: ['Emisor y receptor', 'Número de albarán', 'Detalles de mercancía', 'Confirmación de entrega'],
    route: 'albaranes'
  },
  escritura: {
    icon: Home,
    emoji: '🏠',
    color: 'rose',
    description: 'Analiza escrituras de compraventa inmobiliaria con datos legales',
    features: ['Vendedor y comprador', 'Descripción del inmueble', 'Precio y condiciones', 'Datos registrales'],
    route: 'escrituras'
  }
};

export default function TemplatesPage() {
  const templates = getAvailableTemplates();
  const stats = getTemplateStats();

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/documents"
              className="text-sm text-muted-foreground hover:text-blue-500 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> 
              <span>Volver a Documentos</span>
            </Link>
          </div>
          <T.H1>🗂️ Plantillas de Documentos</T.H1>
          <T.Subtle>
            Explora todas las plantillas disponibles para diferentes tipos de documentos
          </T.Subtle>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Estadísticas */}
          <Card className="w-48">
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  <T.Small className="font-medium">Estado General</T.Small>
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.implementationRate}%</div>
                <T.Small className="text-muted-foreground">
                  {stats.implemented} de {stats.total} implementadas
                </T.Small>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grid de cards por tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const config = TEMPLATE_CONFIG[template.type as keyof typeof TEMPLATE_CONFIG];
          const isImplemented = template.status === 'implemented';
          const IconComponent = config?.icon || FileText;
          
          return (
            <Link key={template.type} href={`/documents/templates/${config?.route || template.type}`}>
              <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        config?.color === 'blue' ? 'bg-blue-100' :
                        config?.color === 'green' ? 'bg-green-100' :
                        config?.color === 'purple' ? 'bg-purple-100' :
                        config?.color === 'orange' ? 'bg-orange-100' :
                        config?.color === 'indigo' ? 'bg-indigo-100' :
                        config?.color === 'teal' ? 'bg-chart-4/10' :
                        config?.color === 'rose' ? 'bg-chart-2/10' :
                        'bg-gray-100'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          config?.color === 'blue' ? 'text-blue-600' :
                          config?.color === 'green' ? 'text-green-600' :
                          config?.color === 'purple' ? 'text-purple-600' :
                          config?.color === 'orange' ? 'text-orange-600' :
                          config?.color === 'indigo' ? 'text-indigo-600' :
                          config?.color === 'teal' ? 'text-chart-4' :
                          config?.color === 'rose' ? 'text-chart-2' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config?.emoji}</span>
                          <T.H4 className="mb-0">{template.name}</T.H4>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={isImplemented ? "default" : "secondary"}
                      className={isImplemented 
                        ? "bg-green-100 text-green-800 border-green-300" 
                        : "bg-orange-100 text-orange-800 border-orange-300"
                      }
                    >
                      {isImplemented ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Lista
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <T.P className="text-sm text-muted-foreground">
                    {config?.description || template.description}
                  </T.P>

                  {/* Features */}
                  <div>
                    <T.Small className="font-medium text-muted-foreground mb-2 block">
                      🎯 Características principales:
                    </T.Small>
                    <ul className="space-y-1">
                      {(config?.features || template.fields.slice(0, 4)).map((feature, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer con acción */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Fuente: {template.dataSource}</span>
                      <div className="flex items-center gap-1 text-blue-600 group-hover:gap-2 transition-all">
                        <span>Ver detalle</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Footer con información */}
      <Separator />
      <div className="text-center">
        <T.Small className="text-muted-foreground">
          Sistema de plantillas • {stats.total} tipos soportados • 
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </T.Small>
      </div>
    </div>
  );
}