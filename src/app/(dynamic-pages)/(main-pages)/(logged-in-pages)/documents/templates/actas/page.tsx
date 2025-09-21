/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Vista detallada específica de la plantilla de ACTAS con demo completo
 * ESTADO: development
 * DEPENDENCIAS: ActaDetailView, datos demo
 * OUTPUTS: Preview completo de plantilla de actas
 * ACTUALIZADO: 2025-09-16
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { 
  ArrowLeft, 
  Users,
  CheckCircle,
  Info,
  Database,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { ActaDetailView } from '@/components/documents/templates/ActaDetailView';

// Datos de ejemplo realistas para demostración
const DEMO_ACTA_DATA = {
  id: "demo-acta-1",
  document_id: "demo-doc-acta",
  organization_id: "demo-org",
  president_in: "María González Rodríguez",
  president_out: "Juan Pérez Martín",
  administrator: "Administraciones ABC S.L.",
  summary: "Reunión extraordinaria para aprobar el presupuesto anual 2024 y la renovación del contrato de limpieza. Se presentaron tres propuestas de empresas de limpieza y se votó por mayoría la opción más económica.",
  decisions: "1. Aprobado presupuesto 2024 por unanimidad. 2. Contratación de Limpiezas Delta S.L. por 18 meses. 3. Instalación de nuevos buzones en el portal principal.",
  created_at: "2024-03-15T10:30:00Z"
};

const DEMO_ACTA_METADATA = {
  document_date: "2024-03-15",
  tipo_reunion: "extraordinaria",
  lugar: "Salón de actos - Calle Ejemplo 123",
  comunidad_nombre: "Comunidad Residencial Los Olivos",
  orden_del_dia: [
    "Presentación presupuesto 2024",
    "Renovación contrato limpieza", 
    "Instalación nuevos buzones",
    "Ruegos y preguntas"
  ],
  acuerdos: [
    "Presupuesto 2024 aprobado por unanimidad",
    "Contratación Limpiezas Delta S.L.",
    "Instalación buzones antes del 30/04/2024"
  ],
  topic_keywords: ["presupuesto", "limpieza", "buzones", "votación", "administracion"],
  "topic-presupuesto": true,
  "topic-mantenimiento": true,
  "topic-administracion": true,
  "topic-piscina": false,
  "topic-jardin": true,
  "topic-limpieza": true,
  "topic-balance": false,
  "topic-paqueteria": false,
  "topic-energia": true,
  "topic-normativa": false,
  "topic-proveedor": true,
  "topic-dinero": true,
  "topic-ascensor": false,
  "topic-incendios": false,
  "topic-porteria": false,
  estructura_detectada: {
    quorum_alcanzado: true,
    propietarios_totales: 45,
    capitulos: [
      {
        numero: 1,
        titulo: "Apertura y Verificación de Quórum",
        pagina: 1,
        subsecciones: [
          { titulo: "Lista de asistentes", pagina: 1 },
          { titulo: "Verificación del quórum", pagina: 2 }
        ]
      },
      {
        numero: 2,
        titulo: "Orden del Día",
        pagina: 2,
        subsecciones: [
          { titulo: "Punto 1: Presupuesto 2024", pagina: 3 },
          { titulo: "Punto 2: Contrato de limpieza", pagina: 5 },
          { titulo: "Punto 3: Instalación buzones", pagina: 7 }
        ]
      },
      {
        numero: 3,
        titulo: "Votaciones y Acuerdos",
        pagina: 8,
        subsecciones: [
          { titulo: "Votación presupuesto", pagina: 8 },
          { titulo: "Votación empresa limpieza", pagina: 9 }
        ]
      },
      {
        numero: 4,
        titulo: "Cierre de la Sesión",
        pagina: 10,
        subsecciones: [
          { titulo: "Ruegos y preguntas", pagina: 10 },
          { titulo: "Próxima convocatoria", pagina: 11 }
        ]
      }
    ],
    total_paginas: 12,
    votaciones: [
      { tema: "Presupuesto 2024", resultado: "aprobado", votos: "unanimidad", pagina: 8 },
      { tema: "Empresa limpieza", resultado: "aprobado", votos: "mayoría", pagina: 9 }
    ]
  }
};

export default function ActasTemplatePage() {
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
          <div className="p-4 rounded-lg bg-blue-100">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <T.H1 className="mb-0">Plantilla de Actas</T.H1>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Implementada
              </Badge>
            </div>
            <T.Subtle>
              Vista detallada de la plantilla para documentos tipo acta con extracción completa de metadatos
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
              <Database className="h-5 w-5 text-blue-600" />
              <T.H4 className="mb-0">Fuente de Datos</T.H4>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Tabla principal:</strong> extracted_minutes</div>
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
                <span>Extracción de personas clave</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Identificación de acuerdos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Análisis de estructura</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Detección de temas principales</span>
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
              <div>• president_in, president_out</div>
              <div>• administrator, summary</div>
              <div>• decisions, orden_del_dia</div>
              <div>• topic_keywords, estructura_detectada</div>
              <div>• quorum, votaciones, lugar</div>
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
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            Datos de demostración
          </Badge>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <ActaDetailView
              actaData={DEMO_ACTA_DATA}
              metadata={DEMO_ACTA_METADATA}
              confidence={0.92}
              extractionMethod="gemini"
              processingTime={1847}
              tokensUsed={1205}
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
              <span className="font-medium">1.2 - 2.5 segundos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tokens consumidos (promedio):</span>
              <span className="font-medium">800 - 1500 tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Precisión de extracción:</span>
              <span className="font-medium text-green-600">89% - 95%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Campos detectados típicos:</span>
              <span className="font-medium">12 - 18 campos</span>
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
              <span>Temperatura:</span>
              <span className="font-medium">0.1 (determinista)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Max tokens salida:</span>
              <span className="font-medium">1000 tokens</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fallback:</span>
              <span className="font-medium">RegEx + manual</span>
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
          Plantilla de Actas • Implementada el 16/09/2025 • 
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </T.Small>
      </div>
    </div>
  );
}