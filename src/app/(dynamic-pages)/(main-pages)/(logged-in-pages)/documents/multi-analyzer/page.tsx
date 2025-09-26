/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Prototipo independiente para análisis de multi-documentos PDF
 * ESTADO: development
 * DEPENDENCIAS: MultiDocumentUploader, GeminiFlashExtractor
 * OUTPUTS: Interfaz de análisis y separación de documentos
 * ACTUALIZADO: 2025-09-25
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { T } from '@/components/ui/Typography';
import { FileText, Target } from 'lucide-react';
import { MultiDocumentUploader } from './MultiDocumentUploader';

export const dynamic = 'force-dynamic';

export default function MultiDocumentAnalyzerPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <T.H1 className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          Analizador Multi-Documento
        </T.H1>
      </div>


      {/* 🎯 TIPOS SOPORTADOS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Tipos de Documento Soportados por el Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'acta', name: 'Actas', icon: '📋' },
              { type: 'factura', name: 'Facturas', icon: '💰' },
              { type: 'comunicado', name: 'Comunicados', icon: '📢' },
              { type: 'contrato', name: 'Contratos', icon: '📜' },
              { type: 'escritura', name: 'Escrituras', icon: '🏛️' },
              { type: 'albaran', name: 'Albaranes', icon: '📦' },
              { type: 'presupuesto', name: 'Presupuestos', icon: '💭' },
              { type: 'otros', name: 'Otros tipos', icon: '📄' }
            ].map((doc) => (
              <div 
                key={doc.type}
                className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
              >
                <span className="text-lg">{doc.icon}</span>
                <span className="text-sm font-medium text-green-800">{doc.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🚀 UPLOADER COMPONENT */}
      <MultiDocumentUploader />

      {/* 💡 INFORMACIÓN TÉCNICA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Información Técnica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            • <strong>Motor IA:</strong> Gemini Flash con configuración del pipeline actual
          </p>
          <p className="text-xs text-muted-foreground">
            • <strong>Límites:</strong> PDFs hasta 50MB, máximo 100 páginas
          </p>
          <p className="text-xs text-muted-foreground">
            • <strong>Output:</strong> Documentos procesados automáticamente en el pipeline
          </p>
        </CardContent>
      </Card>
    </div>
  );
}