/**
 * ARCHIVO: route.ts
 * PROPÓSITO: API v2 para procesar documentos separados usando arquitectura desacoplada
 * ESTADO: development
 * DEPENDENCIAS: MultiDocumentCoordinator (sin DB), DocumentProcessor (con DB controlada)
 * OUTPUTS: Procesamiento robusto sin problemas de build
 * ACTUALIZADO: 2025-09-28
 */

import { NextRequest, NextResponse } from 'next/server';
import { MultiDocumentCoordinator, type SeparatedDocument, type ProcessingConfig } from '@/lib/ingesta/core/multi-document/MultiDocumentCoordinator';
import { DocumentProcessor } from '@/lib/ingesta/core/multi-document/DocumentProcessor';
import { ApiUtils } from '@/lib/api/SupabaseApiHelper';

interface ProcessSeparatedRequest {
  documents: Array<{
    type: string;
    suggestedTitle: string;
    textFragment: string;
    startLine: number;
    endLine: number;
    confidence: number;
    isSupportedByPipeline: boolean;
  }>;
  communityId: string;
  processingLevel: 'extract' | 'classify' | 'metadata' | 'chunks';
  originalFilename: string;
  extractedText: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [PROCESS-SEPARATED V2] Starting separated documents processing...');
    
    const body: ProcessSeparatedRequest = await request.json();
    const { documents, communityId, processingLevel, originalFilename, extractedText } = body;

    // Convertir a formato interno
    const separatedDocuments: SeparatedDocument[] = documents.map((doc, index) => ({
      id: `temp_${index}_${Date.now()}`,
      type: doc.type,
      suggestedTitle: doc.suggestedTitle,
      textFragment: doc.textFragment,
      startLine: doc.startLine,
      endLine: doc.endLine,
      confidence: doc.confidence,
      isSupportedByPipeline: doc.isSupportedByPipeline
    }));

    const config: ProcessingConfig = {
      processingLevel,
      communityId,
      originalFilename,
      extractedText,
      batchSize: 2, // Procesar de a 2 para no sobrecargar
      timeout: 60000
    };

    console.log(`📊 [PROCESS-SEPARATED V2] Processing ${separatedDocuments.length} documents`);
    console.log(`🏠 [PROCESS-SEPARATED V2] Community: ${communityId}`);
    console.log(`⚙️ [PROCESS-SEPARATED V2] Level: ${processingLevel}`);

    // PASO 1: Validar configuración (SIN dependencias DB)
    const coordinator = new MultiDocumentCoordinator();
    const configErrors = coordinator.validateConfig(config);
    
    if (configErrors.length > 0) {
      return ApiUtils.errorResponse(
        'Invalid configuration',
        400,
        { errors: configErrors }
      );
    }

    // PASO 2: Crear procesador (CON dependencias DB controladas)
    const processor = new DocumentProcessor();
    
    // PASO 3: Procesar usando coordinador (separación de responsabilidades)
    const report = await coordinator.processBatch(
      separatedDocuments,
      config,
      // Callback que usa el procesador
      async (doc, config) => await processor.processDocument(doc, config)
    );

    // PASO 4: Calcular estadísticas
    const stats = coordinator.calculateStats(report);

    // PASO 5: Preparar respuesta
    const response = {
      success: true,
      processedDocuments: report.processedSuccessfully,
      totalRequested: report.totalDocuments,
      failed: report.failed,
      processingLevel,
      communityId,
      results: report.results,
      errors: report.errors.length > 0 ? report.errors : undefined,
      stats: {
        successRate: stats.successRate,
        avgProcessingTimeMs: stats.avgProcessingTimeMs,
        totalTimeMs: report.totalTimeMs,
        documentsPerSecond: stats.documentsPerSecond
      },
      summary: `Successfully processed ${report.processedSuccessfully} of ${report.totalDocuments} documents at level "${processingLevel}"`
    };

    console.log('🏁 [PROCESS-SEPARATED V2] Processing completed:', {
      processed: report.processedSuccessfully,
      failed: report.failed,
      totalTime: `${report.totalTimeMs}ms`,
      successRate: `${stats.successRate}%`
    });

    return ApiUtils.successResponse(response);

  } catch (error) {
    console.error('💥 [PROCESS-SEPARATED V2] Unexpected error:', error);
    
    return ApiUtils.errorResponse(
      'Error interno del servidor durante el procesamiento',
      500,
      { 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    );
  }
}

export async function GET() {
  return ApiUtils.successResponse({
    message: 'Process Separated Documents API v2',
    version: '2.0.0',
    description: 'Processes supported documents from multi-document analysis using decoupled architecture',
    architecture: {
      coordinator: 'MultiDocumentCoordinator - Pure orchestration without DB dependencies',
      processor: 'DocumentProcessor - Controlled DB operations with lazy initialization',
      benefits: [
        'Build-safe: No import-time DB initialization',
        'Testable: Pure functions for coordination logic',
        'Resilient: Controlled error handling and batching',
        'Scalable: Configurable batch processing'
      ]
    },
    levels: [
      { level: 'extract', description: 'Solo extracción de texto (ya completado)' },
      { level: 'classify', description: 'Hasta clasificación de tipo de documento' },
      { level: 'metadata', description: 'Hasta extracción de metadatos (recomendado)' },
      { level: 'chunks', description: 'Procesamiento completo incluyendo chunking para RAG' }
    ]
  });
}