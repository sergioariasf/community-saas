/**
 * ARCHIVO: route.ts
 * PROPÓSITO: API endpoint para análisis de PDFs multi-documento
 * ESTADO: development
 * DEPENDENCIAS: NextRequest, MultiDocumentAnalyzer, Gemini Flash
 * OUTPUTS: Análisis de documentos y separación automática
 * ACTUALIZADO: 2025-09-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { MultiDocumentAnalyzer } from '@/lib/ingesta/core/multi-document/MultiDocumentAnalyzer';
import { createSupabaseClient } from '@/supabase-clients/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [MULTI-DOC API] Starting multi-document analysis...');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const outputPath = formData.get('outputPath') as string || '/tmp/multi-doc-analysis';
    const uploadToDatabase = formData.get('uploadToDatabase') === 'true';
    const communityId = formData.get('communityId') as string;
    
    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Se requiere un archivo PDF válido' },
        { status: 400 }
      );
    }

    console.log(`📄 [MULTI-DOC API] Processing file: ${file.name} (${file.size} bytes)`);
    console.log(`📁 [MULTI-DOC API] Output path: ${outputPath}`);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create analyzer instance
    const analyzer = new MultiDocumentAnalyzer();

    // Ensure output directory exists
    try {
      await fs.mkdir(outputPath, { recursive: true });
      console.log(`📁 [MULTI-DOC API] Created output directory: ${outputPath}`);
    } catch (error) {
      console.log(`📁 [MULTI-DOC API] Directory already exists or error: ${error}`);
    }

    // Perform analysis
    console.log('🤖 [MULTI-DOC API] Starting Gemini Flash analysis...');
    const analysisResult = await analyzer.analyzeDocument(buffer, file.name);

    console.log('📊 [MULTI-DOC API] Analysis completed:', {
      isMultiDocument: analysisResult.isMultiDocument,
      documentsFound: analysisResult.detectedDocuments.length,
      totalLines: analysisResult.totalLines
    });

    // If it's a multi-document, perform text separation
    let separationResult = null;
    if (analysisResult.isMultiDocument && analysisResult.detectedDocuments.length > 1) {
      console.log('✂️ [MULTI-DOC API] Performing text separation...');
      
      try {
        separationResult = await analyzer.separateDocuments(
          analysisResult.extractedText,
          file.name,
          analysisResult.detectedDocuments,
          outputPath
        );
        
        console.log('✅ [MULTI-DOC API] Documents separated successfully:', {
          outputFiles: separationResult.outputFiles.length,
          outputPath: separationResult.outputPath
        });
      } catch (separationError) {
        console.error('❌ [MULTI-DOC API] Document separation failed:', separationError);
        separationResult = {
          error: 'Error durante la separación de documentos',
          details: separationError instanceof Error ? separationError.message : 'Unknown error'
        };
      }
    }

    // Upload to database if requested
    let uploadResult = null;
    if (uploadToDatabase && analysisResult.isMultiDocument) {
      if (!communityId) {
        return NextResponse.json(
          { error: 'Se requiere communityId para subir a la base de datos' },
          { status: 400 }
        );
      }

      console.log('📤 [MULTI-DOC API] Uploading to Supabase...');
      
      try {
        const supabase = await createSupabaseClient();
        
        // Get community and organization info
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('organization_id, name')
          .eq('id', communityId)
          .single();

        if (communityError || !communityData) {
          throw new Error(`Community not found: ${communityError?.message}`);
        }

        console.log(`🏠 [MULTI-DOC API] Community: ${communityData.name} (org: ${communityData.organization_id})`);

        // Generate file hash
        const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
        
        // Upload file to Supabase Storage
        const storagePath = `multi-documents/${file.name}`;
        const { error: storageError } = await supabase.storage
          .from('documents')
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (storageError && !storageError.message.includes('already exists')) {
          throw new Error(`Storage upload failed: ${storageError.message}`);
        }

        console.log(`📁 [MULTI-DOC API] File uploaded to storage: ${storagePath}`);

        // Create parent document (the original multi-document)
        const parentDocumentData = {
          filename: file.name,
          file_path: storagePath,
          file_size: buffer.length,
          file_hash: fileHash,
          mime_type: file.type,
          organization_id: communityData.organization_id,
          community_id: communityId,
          document_type: 'multidocumento',
          extracted_text: analysisResult.extractedText,
          text_length: analysisResult.extractedText?.length || 0,
          page_count: analysisResult.totalPages || 1,
          extraction_status: 'completed',
          extraction_method: analysisResult.extractionMethod,
          extraction_completed_at: new Date().toISOString(),
          processing_level: 1,
          original_filename: file.name
        };

        const { data: parentDoc, error: parentError } = await supabase
          .from('documents')
          .insert(parentDocumentData)
          .select()
          .single();

        if (parentError) {
          throw new Error(`Failed to create parent document: ${parentError.message}`);
        }

        console.log(`✅ [MULTI-DOC API] Parent document created: ${parentDoc.id}`);

        // Create child documents for supported types
        const childDocuments = [];
        let childIndex = 1;

        for (const doc of analysisResult.detectedDocuments) {
          if (doc.isSupportedByPipeline) {
            // Patrón acordado: follon_nombre_gemini
            const baseFilename = file.name.replace('.pdf', '');
            const geminiTitle = doc.suggestedTitle
              .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Limpiar caracteres especiales
              .replace(/\s+/g, '_') // Espacios a guiones bajos
              .substring(0, 30); // Limitar longitud
            const childFilename = `${baseFilename}_${geminiTitle}.txt`;
            const childHash = crypto.createHash('md5').update(doc.textFragment + childIndex).digest('hex');
            
            const childDocumentData = {
              filename: childFilename,
              file_path: `multi-documents/children/${childFilename}`, // Separar en subcarpeta
              file_size: Math.max(1, Buffer.from(doc.textFragment).length), // Asegurar mínimo 1 byte
              file_hash: childHash,
              mime_type: 'text/plain',
              organization_id: communityData.organization_id,
              community_id: communityId,
              document_type: doc.type,
              extracted_text: doc.textFragment,
              text_length: doc.textFragment.length,
              page_count: 1,
              extraction_status: 'completed',
              extraction_method: 'multi-document-analyzer',
              extraction_completed_at: new Date().toISOString(),
              classification_status: 'completed',
              classification_completed_at: new Date().toISOString(),
              metadata_status: 'pending',
              chunking_status: 'pending',
              processing_level: 2, // Ya extraído y clasificado, listo para metadatos
              original_filename: file.name
            };

            const { data: childDoc, error: childError } = await supabase
              .from('documents')
              .insert(childDocumentData)
              .select()
              .single();

            if (childError) {
              console.error(`❌ [MULTI-DOC API] Error creating child document ${childIndex}:`, childError);
            } else {
              console.log(`✅ [MULTI-DOC API] Child document created: ${childDoc.id} (${doc.type})`);
              childDocuments.push({
                id: childDoc.id,
                filename: childFilename,
                type: doc.type,
                title: doc.suggestedTitle
              });
              childIndex++;
            }
          }
        }

        uploadResult = {
          success: true,
          parentDocumentId: parentDoc.id,
          childDocuments,
          totalChildrenCreated: childDocuments.length,
          communityName: communityData.name
        };

        console.log(`📊 [MULTI-DOC API] Database upload completed: ${childDocuments.length} child documents created`);

        // Procesar documentos hijos automáticamente con pipeline (metadatos y chunking)
        console.log('🔄 [MULTI-DOC API] Starting automatic processing of child documents...');
        
        const { SimplePipeline } = await import('@/lib/ingesta/core/progressivePipelineSimple');
        const pipeline = new SimplePipeline();
        
        let processedCount = 0;
        for (const childDoc of childDocuments) {
          try {
            console.log(`⚙️ [MULTI-DOC API] Processing child document ${childDoc.id} (${childDoc.type})...`);
            
            // Obtener documento completo de la BD
            const { data: fullDoc, error: fetchError } = await supabase
              .from('documents')
              .select('*')
              .eq('id', childDoc.id)
              .single();

            if (fetchError || !fullDoc) {
              console.error(`❌ [MULTI-DOC API] Error fetching child document ${childDoc.id}:`, fetchError);
              continue;
            }

            // Procesar metadatos
            console.log(`📊 [MULTI-DOC API] Extracting metadata for ${childDoc.id}...`);
            await pipeline.extractMetadata(fullDoc);
            
            // Procesar chunking
            console.log(`🧩 [MULTI-DOC API] Creating chunks for ${childDoc.id}...`);
            await pipeline.chunkDocument(fullDoc);
            
            // Actualizar estados finales
            await supabase
              .from('documents')
              .update({
                processing_level: 4, // Completamente procesado
                processing_completed_at: new Date().toISOString(),
                legacy_status: 'completed'
              })
              .eq('id', childDoc.id);
              
            processedCount++;
            console.log(`✅ [MULTI-DOC API] Child document ${childDoc.id} processed successfully`);
            
          } catch (processError) {
            console.error(`❌ [MULTI-DOC API] Error processing child document ${childDoc.id}:`, processError);
          }
        }
        
        console.log(`🏁 [MULTI-DOC API] Automatic processing completed: ${processedCount}/${childDocuments.length} documents processed`);

      } catch (uploadError) {
        console.error('❌ [MULTI-DOC API] Database upload failed:', uploadError);
        uploadResult = {
          success: false,
          error: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
        };
      }
    }

    // Prepare response
    const response = {
      ...analysisResult,
      separation: separationResult,
      upload: uploadResult,
      outputPath: analysisResult.isMultiDocument ? outputPath : null,
      timestamp: new Date().toISOString(),
      originalFilename: file.name,
      originalFileSize: file.size
    };

    // Save analysis report
    const reportPath = path.join(outputPath, `analysis-report-${Date.now()}.json`);
    try {
      await fs.writeFile(reportPath, JSON.stringify(response, null, 2));
      console.log(`📋 [MULTI-DOC API] Analysis report saved: ${reportPath}`);
    } catch (reportError) {
      console.warn('⚠️ [MULTI-DOC API] Could not save analysis report:', reportError);
    }

    console.log('🏁 [MULTI-DOC API] Analysis completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [MULTI-DOC API] Unexpected error during analysis:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor durante el análisis',
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
      message: 'Multi-Document Analyzer API',
      version: '1.0.0',
      endpoints: {
        'POST /api/multi-document/analyze': 'Analyze and separate multi-document PDFs'
      },
      supportedTypes: [
        'acta', 'factura', 'comunicado', 'contrato', 
        'escritura', 'albaran', 'presupuesto'
      ]
    }
  );
}