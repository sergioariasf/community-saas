/**
 * ARCHIVO: DefaultDetailView.tsx
 * PROPÓSITO: Plantilla genérica para tipos de documento sin plantilla específica
 * ESTADO: development
 * DEPENDENCIAS: @/components/ui
 * OUTPUTS: Vista detallada genérica con fallback profesional
 * ACTUALIZADO: 2025-09-16
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { T } from '@/components/ui/Typography';
import { FileText, Info, AlertTriangle } from 'lucide-react';

// Tipo genérico para metadatos
export type GenericMetadata = {
  [key: string]: any;
};

interface DefaultDetailViewProps {
  documentType: string;
  specificData?: any;
  metadata?: GenericMetadata | null;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  tokensUsed?: number;
}

export function DefaultDetailView({
  documentType,
  specificData,
  metadata,
  confidence,
  extractionMethod,
  processingTime,
  tokensUsed
}: DefaultDetailViewProps) {
  const documentTypeName = documentType?.toUpperCase() || 'DOCUMENTO';
  
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <T.H3 className="mb-0">📄 Análisis de {documentTypeName}</T.H3>
        </div>
        {confidence && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <T.Small className="text-blue-700 font-medium">
              Confianza: {Math.round(confidence * 100)}%
            </T.Small>
          </div>
        )}
      </div>

      {/* Información técnica */}
      {(extractionMethod || tokensUsed || processingTime) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-600" />
            <T.Small className="text-blue-700 font-medium">
              {extractionMethod && `Método: ${extractionMethod}`}
              {tokensUsed && ` • Tokens: ${tokensUsed}`}
              {processingTime && ` • Tiempo: ${processingTime}ms`}
            </T.Small>
          </div>
        </div>
      )}

      {/* Aviso de plantilla pendiente */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <T.H4 className="mb-0 text-orange-800">Plantilla Específica Pendiente</T.H4>
          </div>
        </CardHeader>
        <CardContent>
          <T.P className="text-sm text-orange-700 mb-3">
            Esta es una vista genérica para documentos tipo <strong>"{documentType}"</strong>. 
            Para una mejor experiencia, se recomienda crear una plantilla específica.
          </T.P>
          <div className="bg-orange-100 rounded-lg p-3">
            <T.Small className="text-orange-800 font-medium block mb-1">
              📝 Próximos pasos para mejorar:
            </T.Small>
            <ul className="text-xs text-orange-700 space-y-1 ml-4">
              <li>• Crear plantilla específica en <code>templates/{documentType}DetailView.tsx</code></li>
              <li>• Definir campos relevantes para este tipo de documento</li>
              <li>• Agregar al registro de plantillas</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda - Datos Específicos */}
        <div className="space-y-4">
          {specificData && (
            <Card>
              <CardHeader className="pb-3">
                <T.H4>📊 Datos Específicos Extraídos</T.H4>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-3">
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(specificData, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {!specificData && (
            <Card>
              <CardHeader className="pb-3">
                <T.H4>❌ Sin Datos Específicos</T.H4>
              </CardHeader>
              <CardContent>
                <T.P className="text-sm text-muted-foreground">
                  No se encontraron datos específicos extraídos para este tipo de documento.
                </T.P>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Derecha - Metadatos Genéricos */}
        <div className="space-y-4">
          {metadata && (
            <Card>
              <CardHeader className="pb-3">
                <T.H4>🔍 Metadatos Genéricos</T.H4>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Keywords si existen */}
                {metadata.topic_keywords && Array.isArray(metadata.topic_keywords) && (
                  <div>
                    <T.Small className="text-muted-foreground font-medium mb-2 block">
                      🏷️ Keywords Detectadas
                    </T.Small>
                    <div className="flex flex-wrap gap-2">
                      {metadata.topic_keywords.map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campos topic-xxx */}
                {Object.entries(metadata)
                  .filter(([key]) => key.startsWith('topic-'))
                  .length > 0 && (
                  <div>
                    <T.Small className="text-muted-foreground font-medium mb-2 block">
                      🎯 Temas Específicos
                    </T.Small>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(metadata)
                        .filter(([key]) => key.startsWith('topic-'))
                        .map(([key, value]) => {
                          const topicName = key.replace('topic-', '');
                          const isActive = value === true || value === 'true';
                          return (
                            <Badge 
                              key={key}
                              variant={isActive ? "default" : "secondary"}
                              className={isActive 
                                ? "bg-green-100 text-green-800 border-green-300" 
                                : "bg-gray-100 text-gray-600 border-gray-300"
                              }
                            >
                              {topicName} {isActive ? '✅' : '❌'}
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Otros campos importantes */}
                {(metadata.document_date || metadata.lugar || metadata.tipo_reunion) && (
                  <div>
                    <T.Small className="text-muted-foreground font-medium mb-2 block">
                      📋 Información General
                    </T.Small>
                    <div className="space-y-1 text-sm">
                      {metadata.document_date && (
                        <div className="flex justify-between">
                          <span>Fecha:</span>
                          <span className="font-medium">{metadata.document_date}</span>
                        </div>
                      )}
                      {metadata.tipo_reunion && (
                        <div className="flex justify-between">
                          <span>Tipo:</span>
                          <span className="font-medium">{metadata.tipo_reunion}</span>
                        </div>
                      )}
                      {metadata.lugar && (
                        <div className="flex justify-between">
                          <span>Lugar:</span>
                          <span className="font-medium">{metadata.lugar}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* JSON completo para debugging */}
                <div>
                  <T.Small className="text-muted-foreground font-medium mb-2 block">
                    🐛 Metadatos Completos (Debug)
                  </T.Small>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!metadata && (
            <Card>
              <CardHeader className="pb-3">
                <T.H4>❌ Sin Metadatos</T.H4>
              </CardHeader>
              <CardContent>
                <T.P className="text-sm text-muted-foreground">
                  No se encontraron metadatos genéricos para este documento.
                </T.P>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer informativo */}
      <div className="text-center pt-4 border-t">
        <T.Small className="text-muted-foreground">
          Vista genérica para documentos tipo "{documentType}" • 
          Para mejor experiencia, crear plantilla específica
        </T.Small>
      </div>
    </div>
  );
}