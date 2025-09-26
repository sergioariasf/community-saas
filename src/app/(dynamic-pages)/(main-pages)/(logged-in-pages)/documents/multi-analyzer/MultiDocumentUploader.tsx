/**
 * ARCHIVO: MultiDocumentUploader.tsx
 * PROPÓSITO: Componente para upload y análisis de PDFs multi-documento
 * ESTADO: development
 * DEPENDENCIAS: React, useRef, Card components
 * OUTPUTS: Interfaz de upload con análisis en tiempo real
 * ACTUALIZADO: 2025-09-25
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/supabase-clients/client';
import { 
  Upload, 
  FileText,
  AlertTriangle, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Eye,
  ChevronDown,
  ChevronUp,
  Download,
  Target,
  Scissors
} from 'lucide-react';

interface AnalysisResult {
  isMultiDocument: boolean;
  confidence: number;
  detectedDocuments: Array<{
    type: string;
    startPage: number;
    endPage: number;
    confidence: number;
    isSupportedByPipeline: boolean;
  }>;
  totalPages: number;
  analysisDetails: string;
  separationPoints: number[];
}

interface AnalysisStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description: string;
}

interface Community {
  id: string;
  name: string;
  address?: string;
  city?: string;
  organization_id: string;
}

export function MultiDocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Set<number>>(new Set());
  const [analysisStages, setAnalysisStages] = useState<AnalysisStage[]>([]);
  const [showProcessingModal, setShowProcessingModal] = useState<boolean>(false);
  const [processingConfig, setProcessingConfig] = useState<{
    communityId: string;
    processingLevel: 'extract' | 'classify' | 'metadata' | 'chunks';
  }>({
    communityId: '',
    processingLevel: 'metadata'
  });
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  
  // Nuevos estados para upload
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  const [uploadAndAnalyze, setUploadAndAnalyze] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar comunidades cuando se abre el modal de procesamiento o se activa upload
  useEffect(() => {
    if ((showProcessingModal || uploadAndAnalyze) && communities.length === 0) {
      loadCommunities();
    }
  }, [showProcessingModal, uploadAndAnalyze]);

  const loadCommunities = async () => {
    setLoadingCommunities(true);
    try {
      console.log('🏠 [MULTI-DOC UI] Loading communities from Supabase...');
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, address, city, organization_id')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Error loading communities: ${error.message}`);
      }

      setCommunities(data || []);
      console.log(`✅ [MULTI-DOC UI] Loaded ${data?.length || 0} communities`);
      
    } catch (error) {
      console.error('❌ [MULTI-DOC UI] Error loading communities:', error);
      setError(error instanceof Error ? error.message : 'Error cargando comunidades');
    } finally {
      setLoadingCommunities(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null);
    } else {
      setError('Por favor selecciona un archivo PDF válido');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    // Si uploadAndAnalyze está activo, validar que se haya seleccionado comunidad
    if (uploadAndAnalyze && !selectedCommunityId) {
      setError('Selecciona una comunidad para subir el documento');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    // Inicializar stages
    const stages: AnalysisStage[] = [
      { name: 'upload', status: 'running', description: uploadAndAnalyze ? 'Subiendo a Supabase...' : 'Preparando análisis...' },
      { name: 'extraction', status: 'pending', description: 'Extrayendo texto con OCR...' },
      { name: 'analysis', status: 'pending', description: 'Analizando con Gemini Flash...' },
      { name: 'boundaries', status: 'pending', description: 'Detectando límites de documentos...' },
      { name: 'database', status: 'pending', description: 'Creando documentos en base de datos...' }
    ];
    
    setAnalysisStages([...stages]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('outputPath', '/tmp/multi-doc-analysis');
      
      // Añadir datos para upload si está habilitado
      if (uploadAndAnalyze) {
        formData.append('uploadToDatabase', 'true');
        formData.append('communityId', selectedCommunityId);
      }

      // Simular progreso de stages
      for (let i = 0; i < stages.length; i++) {
        setTimeout(() => {
          setAnalysisStages(prev => prev.map((stage, index) => {
            if (index < i) return { ...stage, status: 'completed' };
            if (index === i) return { ...stage, status: 'running' };
            return stage;
          }));
        }, i * 1000);
      }

      const response = await fetch('/api/documents/multi-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      
      // Marcar todos los stages como completados
      setAnalysisStages(prev => prev.map(stage => ({ ...stage, status: 'completed' })));
      setAnalysisResult(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error durante el análisis');
      setAnalysisStages(prev => prev.map(stage => 
        stage.status === 'running' ? { ...stage, status: 'error' } : stage
      ));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProcessSupportedDocuments = async () => {
    // NOTA: Esta función ya no es necesaria porque los documentos se crean
    // directamente en la base de datos durante el análisis multi-documento
    if (!analysisResult) return;

    try {
      setShowProcessingModal(false);
      
      console.log('✅ [MULTI-DOC UI] Documents already created in database during analysis');
      
      // Los documentos ya fueron creados durante el análisis
      const supportedCount = analysisResult.detectedDocuments.filter(doc => doc.isSupportedByPipeline).length;
      alert(`¡Éxito! Se crearon ${supportedCount} documentos en la base de datos durante el análisis.`);
      
    } catch (err) {
      console.error('❌ [MULTI-DOC UI] Error:', err);
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const toggleDocExpansion = (index: number) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDocs(newExpanded);
  };

  const getStageIcon = (status: AnalysisStage['status']) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 📤 UPLOAD SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Seleccionar PDF Multi-Documento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              {file ? file.name : 'Haz clic para seleccionar un PDF'}
            </p>
            <p className="text-xs text-gray-500">
              Máximo 50MB • Hasta 100 páginas
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>


          {/* Upload Configuration */}
          <div className="border rounded-lg p-4 bg-blue-50/50 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="uploadAndAnalyze"
                checked={uploadAndAnalyze}
                onChange={(e) => setUploadAndAnalyze(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="uploadAndAnalyze" className="text-sm font-medium cursor-pointer">
                📤 Subir documento a Supabase y crear documentos separados
              </label>
            </div>
            
            {uploadAndAnalyze && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Seleccionar Comunidad:
                </label>
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                  disabled={loadingCommunities}
                >
                  <option value="">
                    {loadingCommunities ? 'Cargando...' : 'Selecciona una comunidad'}
                  </option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name} {community.address && `- ${community.address}`} {community.city && `(${community.city})`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-blue-600 mt-1">
                  Los documentos soportados se añadirán automáticamente para procesamiento posterior
                </p>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <Button 
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Analizar Multi-Documento
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 📊 PROGRESS STAGES */}
      {isAnalyzing && analysisStages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Progreso del Análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisStages.map((stage, index) => (
                <div key={stage.name} className="flex items-center gap-3">
                  {getStageIcon(stage.status)}
                  <span className="text-sm flex-1">{stage.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ❌ ERROR DISPLAY */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 📊 RESULTS DISPLAY */}
      {analysisResult && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card className={analysisResult.isMultiDocument ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {analysisResult.isMultiDocument ? (
                  <>
                    <Scissors className="h-5 w-5 text-green-600" />
                    ✅ Multi-Documento Detectado
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 text-blue-600" />
                    📄 Documento Individual
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Confianza:</p>
                  <p className="text-lg">{Math.round(analysisResult.confidence * 100)}%</p>
                </div>
                <div>
                  <p className="font-medium">Total Páginas:</p>
                  <p className="text-lg">{analysisResult.totalPages}</p>
                </div>
                <div>
                  <p className="font-medium">Documentos:</p>
                  <p className="text-lg">{analysisResult.detectedDocuments.length}</p>
                </div>
                <div>
                  <p className="font-medium">Soportados:</p>
                  <p className="text-lg text-green-600">
                    {analysisResult.detectedDocuments.filter(d => d.isSupportedByPipeline).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning for text truncation */}
          {analysisResult?.textTruncated && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium">Texto Truncado por Límites del Modelo</p>
                    <p className="text-amber-700 text-sm mt-1">
                      El documento es muy largo ({analysisResult.textLength?.toLocaleString()} caracteres). 
                      Solo se analizaron los primeros {analysisResult.maxSupportedLength?.toLocaleString()} caracteres.
                      Algunos documentos al final del PDF pueden no haber sido detectados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents List */}
          {analysisResult.detectedDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Documentos Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisResult.detectedDocuments.map((doc, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        doc.isSupportedByPipeline 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={doc.isSupportedByPipeline ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {doc.type}
                            </Badge>
                            <span className="text-sm font-medium">
                              Líneas {doc.startLine}-{doc.endLine}
                            </span>
                            <span className="text-xs text-gray-500">
                              Confianza: {Math.round(doc.confidence * 100)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.isSupportedByPipeline ? (
                              <Badge variant="outline" className="text-green-600">
                                ✅ Soportado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600">
                                ⚠️ No soportado
                              </Badge>
                            )}
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleDocExpansion(index)}
                              className="h-6 w-6 p-0"
                            >
                              {expandedDocs.has(index) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {doc.suggestedTitle && (
                          <p className="text-sm text-gray-600 font-medium">{doc.suggestedTitle}</p>
                        )}
                        
                        {expandedDocs.has(index) && (
                          <div className="mt-3 space-y-3">
                            {(doc.startMarker || doc.endMarker) && (
                              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <p className="text-xs text-blue-700 font-medium mb-1">🎯 Marcadores detectados:</p>
                                {doc.startMarker && (
                                  <p className="text-xs text-blue-600 mb-1">
                                    <strong>Inicio:</strong> "{doc.startMarker.substring(0, 50)}..."
                                  </p>
                                )}
                                {doc.endMarker && (
                                  <p className="text-xs text-blue-600">
                                    <strong>Final:</strong> "{doc.endMarker.substring(0, 50)}..."
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {doc.textFragment && (
                              <div className="p-3 bg-gray-50 rounded border">
                                <p className="text-xs text-gray-500 mb-2">Texto extraído:</p>
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                                  {doc.textFragment}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Descargar Informe JSON
            </Button>
            <Button 
              className="flex-1" 
              size="lg"
              disabled={!analysisResult.isMultiDocument}
            >
              <Scissors className="h-4 w-4 mr-2" />
              Separar Documentos
            </Button>
            {analysisResult.supportedDocuments > 0 && (
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                size="lg"
                onClick={() => setShowProcessingModal(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Procesar Soportados ({analysisResult.supportedDocuments})
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 🚀 MODAL PROCESAMIENTO DOCUMENTOS SOPORTADOS */}
      {showProcessingModal && analysisResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Procesar Documentos Soportados
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProcessingModal(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* Resumen de documentos a procesar */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Se procesarán {analysisResult.supportedDocuments} documento(s):
                  </p>
                  <div className="space-y-1">
                    {analysisResult.detectedDocuments
                      .filter(doc => doc.isSupportedByPipeline)
                      .map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <span className="bg-green-100 px-2 py-1 rounded text-green-700 font-medium">
                            {doc.type}
                          </span>
                          <span className="text-green-600">{doc.suggestedTitle}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Selector de comunidad */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Seleccionar Comunidad:
                  </label>
                  <select
                    value={processingConfig.communityId}
                    onChange={(e) => setProcessingConfig(prev => ({
                      ...prev,
                      communityId: e.target.value
                    }))}
                    className="w-full p-2 border rounded-lg text-sm"
                    required
                    disabled={loadingCommunities}
                  >
                    <option value="">
                      {loadingCommunities ? 'Cargando comunidades...' : 'Seleccionar comunidad...'}
                    </option>
                    {communities.map((community) => (
                      <option key={community.id} value={community.id}>
                        🏠 {community.name}
                        {community.city && ` - ${community.city}`}
                        {community.address && ` (${community.address.substring(0, 30)}${community.address.length > 30 ? '...' : ''})`}
                      </option>
                    ))}
                  </select>
                  {communities.length === 0 && !loadingCommunities && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ No se encontraron comunidades activas. Crea una comunidad primero en{' '}
                      <a href="/communities" className="underline" target="_blank">
                        /communities
                      </a>
                    </p>
                  )}
                </div>

                {/* Nivel de procesamiento */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nivel de Procesamiento:
                  </label>
                  <select
                    value={processingConfig.processingLevel}
                    onChange={(e) => setProcessingConfig(prev => ({
                      ...prev,
                      processingLevel: e.target.value as any
                    }))}
                    className="w-full p-2 border rounded-lg text-sm"
                  >
                    <option value="extract">📄 Solo Extracción de Texto</option>
                    <option value="classify">🏷️ Hasta Clasificación</option>
                    <option value="metadata">📊 Hasta Metadatos (Recomendado)</option>
                    <option value="chunks">🧩 Procesamiento Completo + Chunks</option>
                  </select>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowProcessingModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!processingConfig.communityId}
                    onClick={() => handleProcessSupportedDocuments()}
                  >
                    Procesar Ahora
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}