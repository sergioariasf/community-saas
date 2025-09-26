/**
 * ARCHIVO: route.ts
 * PROPÓSITO: API para procesar documentos separados usando el pipeline existente
 * ESTADO: development
 * DEPENDENCIAS: SimplePipeline, MultiDocumentAnalyzer, Supabase
 * OUTPUTS: Procesamiento completo de documentos soportados separados
 * ACTUALIZADO: 2025-09-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { SimplePipeline } from '@/lib/ingesta/core/progressivePipelineSimple';
import { createSupabaseClient } from '@/supabase-clients/server';
import crypto from 'crypto';

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
    console.log('🚀 [PROCESS-SEPARATED API] Starting separated documents processing...');
    
    const body: ProcessSeparatedRequest = await request.json();
    const { documents, communityId, processingLevel, originalFilename, extractedText } = body;

    // Filtrar solo documentos soportados
    const supportedDocuments = documents.filter(doc => doc.isSupportedByPipeline);
    
    if (supportedDocuments.length === 0) {
      return NextResponse.json(
        { error: 'No hay documentos soportados para procesar' },
        { status: 400 }
      );
    }

    console.log(`📊 [PROCESS-SEPARATED API] Processing ${supportedDocuments.length} supported documents`);
    console.log(`🏠 [PROCESS-SEPARATED API] Community: ${communityId}`);
    console.log(`⚙️ [PROCESS-SEPARATED API] Level: ${processingLevel}`);

    const processedDocuments = [];
    const errors = [];
    
    // Inicializar pipeline
    const pipeline = new SimplePipeline();
    const supabase = await createSupabaseClient();

    // Procesar cada documento soportado
    for (let i = 0; i < supportedDocuments.length; i++) {
      const doc = supportedDocuments[i];
      
      try {
        console.log(`📄 [PROCESS-SEPARATED API] Processing document ${i + 1}: ${doc.type} - ${doc.suggestedTitle}`);

        // Crear buffer simulado para el texto del documento
        const documentText = doc.textFragment || extractedText.split('\n').slice(doc.startLine - 1, doc.endLine).join('\n');
        const textBuffer = Buffer.from(documentText, 'utf-8');
        
        // Generar hash único para el documento separado
        const contentHash = crypto.createHash('md5')
          .update(documentText + originalFilename + doc.type + Date.now())
          .digest('hex');

        // Generar filename único
        const timestamp = Date.now();
        const safeTitle = doc.suggestedTitle
          .replace(/[^a-zA-Z0-9\s\-\_]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 30);
        const filename = `separated_${i + 1}_${doc.type}_${safeTitle}_${timestamp}.txt`;

        console.log(`📁 [PROCESS-SEPARATED API] Generated filename: ${filename}`);

        // Obtener la organización de la comunidad seleccionada
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('organization_id, name')
          .eq('id', communityId)
          .single();

        if (communityError || !communityData) {
          throw new Error(`Community not found: ${communityError?.message}`);
        }

        console.log(`🏠 [PROCESS-SEPARATED API] Processing for community: ${communityData.name} (org: ${communityData.organization_id})`);

        // Crear entrada inicial en la tabla documents con campos requeridos
        const { data: documentData, error: insertError } = await supabase
          .from('documents')
          .insert({
            filename,
            file_path: `/temp/multi-document/${filename}`,
            file_size: textBuffer.length,
            file_hash: contentHash,
            mime_type: 'text/plain',
            organization_id: communityData.organization_id,
            community_id: communityId,
            document_type: doc.type === 'unknown' ? null : doc.type,
            original_filename: originalFilename,
            extraction_status: 'completed',
            extraction_method: 'google-vision-ocr',
            classification_status: doc.type !== 'unknown' ? 'completed' : 'pending',
            processing_level: 1,
            // created_at será automático
          })
          .select()
          .single();

        if (insertError || !documentData) {
          throw new Error(`Error creating document record: ${insertError?.message}`);
        }

        console.log(`✅ [PROCESS-SEPARATED API] Document record created: ${documentData.id}`);

        // Simular documento para el pipeline
        const mockDocument = {
          id: documentData.id,
          filename,
          organization_id: communityData.organization_id,
          file_size: textBuffer.length,
          mime_type: 'text/plain',
          document_type: doc.type === 'unknown' ? null : doc.type,
          created_at: new Date().toISOString(),
          // Pre-llenar con texto extraído
          extracted_text: documentText,
          extraction_status: 'completed',
          extraction_completed_at: new Date().toISOString(),
          classification_status: doc.type !== 'unknown' ? 'completed' : 'pending'
        };

        // Ejecutar pipeline según el nivel solicitado
        let processingResult = { success: true, stages: ['extract'] };

        if (processingLevel === 'classify' || processingLevel === 'metadata' || processingLevel === 'chunks') {
          if (doc.type !== 'unknown') {
            console.log(`🏷️ [PROCESS-SEPARATED API] Skipping classification for document ${documentData.id} - already classified as: ${doc.type}`);
            processingResult.stages.push('classify');
          } else {
            console.log(`🏷️ [PROCESS-SEPARATED API] Running classification for document ${documentData.id}...`);
            
            // Ejecutar clasificación real solo si es necesario
            try {
              await pipeline.classifyDocument(mockDocument);
              console.log(`✅ [PROCESS-SEPARATED API] Classification completed for document ${documentData.id}`);
              processingResult.stages.push('classify');
            } catch (classifyError) {
              console.error(`❌ [PROCESS-SEPARATED API] Classification failed for document ${documentData.id}:`, classifyError);
              throw new Error(`Classification failed: ${classifyError instanceof Error ? classifyError.message : 'Unknown error'}`);
            }
          }
        }

        if (processingLevel === 'metadata' || processingLevel === 'chunks') {
          console.log(`📊 [PROCESS-SEPARATED API] Running metadata extraction for document ${documentData.id}...`);
          
          // Ejecutar extracción de metadatos real
          try {
            await pipeline.extractMetadata(mockDocument);
            console.log(`✅ [PROCESS-SEPARATED API] Metadata extraction completed for document ${documentData.id}`);
            processingResult.stages.push('metadata');
          } catch (metadataError) {
            console.error(`❌ [PROCESS-SEPARATED API] Metadata extraction failed for document ${documentData.id}:`, metadataError);
            throw new Error(`Metadata extraction failed: ${metadataError instanceof Error ? metadataError.message : 'Unknown error'}`);
          }
        }

        if (processingLevel === 'chunks') {
          console.log(`🧩 [PROCESS-SEPARATED API] Running chunking for document ${documentData.id}...`);
          
          // Ejecutar chunking real
          try {
            await pipeline.chunkDocument(mockDocument);
            console.log(`✅ [PROCESS-SEPARATED API] Chunking completed for document ${documentData.id}`);
            processingResult.stages.push('chunks');
          } catch (chunkError) {
            console.error(`❌ [PROCESS-SEPARATED API] Chunking failed for document ${documentData.id}:`, chunkError);
            throw new Error(`Chunking failed: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`);
          }
        }

        // Actualizar estado final del documento
        await supabase
          .from('documents')
          .update({
            extracted_text: documentText,
            text_length: documentText.length,
            extraction_completed_at: new Date().toISOString(),
            processing_completed_at: new Date().toISOString(),
            legacy_status: 'completed'
          })
          .eq('id', documentData.id);

        processedDocuments.push({
          id: documentData.id,
          filename,
          type: doc.type,
          title: doc.suggestedTitle,
          stages: processingResult.stages,
          success: true
        });

        console.log(`✅ [PROCESS-SEPARATED API] Document ${documentData.id} processed successfully`);

      } catch (docError) {
        const errorMsg = `Error processing document ${i + 1} (${doc.type}): ${docError instanceof Error ? docError.message : 'Unknown error'}`;
        console.error(`❌ [PROCESS-SEPARATED API] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    const response = {
      success: true,
      processedDocuments: processedDocuments.length,
      totalRequested: supportedDocuments.length,
      processingLevel,
      communityId,
      results: processedDocuments,
      errors: errors.length > 0 ? errors : undefined,
      summary: `Successfully processed ${processedDocuments.length} of ${supportedDocuments.length} documents at level "${processingLevel}"`
    };

    console.log('🏁 [PROCESS-SEPARATED API] Processing completed:', {
      processed: processedDocuments.length,
      errors: errors.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [PROCESS-SEPARATED API] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor durante el procesamiento',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Process Separated Documents API',
      version: '1.0.0',
      description: 'Processes supported documents from multi-document analysis using existing pipeline',
      levels: [
        { level: 'extract', description: 'Solo extracción de texto (ya completado)' },
        { level: 'classify', description: 'Hasta clasificación de tipo de documento' },
        { level: 'metadata', description: 'Hasta extracción de metadatos (recomendado)' },
        { level: 'chunks', description: 'Procesamiento completo incluyendo chunking para RAG' }
      ]
    }
  );
}