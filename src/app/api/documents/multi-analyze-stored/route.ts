/**
 * ARCHIVO: route.ts
 * PROPÓSITO: API endpoint para procesar PDFs multi-documento ya almacenados en Supabase Storage
 * ESTADO: development
 * DEPENDENCIAS: NextRequest, MultiDocumentAnalyzer, Supabase Storage
 * OUTPUTS: Análisis de documentos sin límite de 4.5MB de Vercel
 * ACTUALIZADO: 2025-09-30
 */

import { NextRequest, NextResponse } from 'next/server';
import { MultiDocumentAnalyzer } from '@/lib/ingesta/core/multi-document/MultiDocumentAnalyzer';
import type { Database } from '@/lib/database.types';
import crypto from 'crypto';

interface ProcessStoredFileRequest {
  storagePath: string;
  originalFileName: string;
  fileSize: number;
  uploadToDatabase?: boolean;
  communityId?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [MULTI-DOC STORED API] Starting analysis of stored file...');
    
    // Parse JSON payload (much smaller than FormData)
    let requestData: ProcessStoredFileRequest;
    try {
      requestData = await request.json();
      console.log('✅ [MULTI-DOC STORED API] Request data parsed:', {
        storagePath: requestData.storagePath,
        fileName: requestData.originalFileName,
        fileSize: requestData.fileSize,
        sizeMB: (requestData.fileSize / (1024 * 1024)).toFixed(2)
      });
    } catch (parseError) {
      console.error('❌ [MULTI-DOC STORED API] JSON parsing failed:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON payload',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        },
        { status: 400 }
      );
    }

    const { storagePath, originalFileName, fileSize, uploadToDatabase, communityId } = requestData;

    // Validate required fields
    if (!storagePath || !originalFileName) {
      return NextResponse.json(
        { error: 'Missing required fields: storagePath, originalFileName' },
        { status: 400 }
      );
    }

    // PASO 1: Download file from Supabase Storage using service role
    console.log('📥 [MULTI-DOC STORED API] Downloading file from Supabase Storage...');
    console.log('📁 [MULTI-DOC STORED API] Storage path:', storagePath);

    // Use SupabaseApiHelper for service role access
    const { SupabaseApiHelper } = await import('@/lib/api/SupabaseApiHelper');
    const fileData = await SupabaseApiHelper.executeQuery(async (supabase) => {
      const { data, error: downloadError } = await supabase.storage
        .from('documents')
        .download(storagePath);

      if (downloadError || !data) {
        throw new Error(`Storage download failed: ${downloadError?.message || 'File not found'}`);
      }

      return data;
    }, { useServiceRole: true });

    // Convert blob to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());
    console.log(`📄 [MULTI-DOC STORED API] File downloaded successfully: ${buffer.length} bytes`);

    // Verify file size matches
    if (buffer.length !== fileSize) {
      console.warn(`⚠️ [MULTI-DOC STORED API] File size mismatch: expected ${fileSize}, got ${buffer.length}`);
    }

    // PASO 2: Analyze document using MultiDocumentAnalyzer
    console.log('🤖 [MULTI-DOC STORED API] Starting Gemini Flash analysis...');
    const analyzer = new MultiDocumentAnalyzer();
    const analysisResult = await analyzer.analyzeDocument(buffer, originalFileName);

    console.log('📊 [MULTI-DOC STORED API] Analysis completed:', {
      isMultiDocument: analysisResult.isMultiDocument,
      documentsFound: analysisResult.detectedDocuments.length,
      totalLines: analysisResult.totalLines
    });

    // PASO 3: Perform text separation if multi-document
    let separationResult: any = null;
    if (analysisResult.isMultiDocument && analysisResult.detectedDocuments.length > 1) {
      console.log('✂️ [MULTI-DOC STORED API] Performing text separation...');
      
      try {
        // Use a temporary path since we don't need physical files
        const outputPath = `/tmp/multi-doc-analysis-${Date.now()}`;
        
        separationResult = await analyzer.separateDocuments(
          analysisResult.extractedText,
          originalFileName,
          analysisResult.detectedDocuments,
          outputPath
        );
        
        console.log('✅ [MULTI-DOC STORED API] Documents separated successfully:', {
          outputFiles: separationResult.outputFiles?.length || 0,
          outputPath: separationResult.outputPath
        });
      } catch (separationError) {
        console.error('❌ [MULTI-DOC STORED API] Document separation failed:', separationError);
        separationResult = {
          error: 'Error durante la separación de documentos',
          details: separationError instanceof Error ? separationError.message : 'Unknown error'
        };
      }
    }

    // PASO 4: Upload to database if requested
    let uploadResult: any = null;
    if (uploadToDatabase && analysisResult.isMultiDocument) {
      if (!communityId) {
        return NextResponse.json(
          { error: 'Se requiere communityId para subir a la base de datos' },
          { status: 400 }
        );
      }

      console.log('📤 [MULTI-DOC STORED API] Creating documents in database...');
      
      try {
        // Get community and organization info
        const communityData = await SupabaseApiHelper.executeQuery(async (supabase) => {
          const { data, error: communityError } = await supabase
            .from('communities')
            .select('organization_id, name')
            .eq('id', communityId)
            .single() as { data: { organization_id: string; name: string } | null, error: any };

          if (communityError || !data) {
            throw new Error(`Community not found: ${communityError?.message}`);
          }
          return data;
        }, { useServiceRole: true });


        console.log(`🏠 [MULTI-DOC STORED API] Community: ${communityData.name} (org: ${communityData.organization_id})`);

        // Generate file hash
        const fileHash = crypto.createHash('md5').update(buffer).digest('hex');

        // Create parent document (the original multi-document) 
        // NOTE: File is already in storage at storagePath
        const parentDocumentData = {
          filename: originalFileName,
          file_path: storagePath, // Use existing storage path
          file_size: buffer.length,
          file_hash: fileHash,
          mime_type: 'application/pdf',
          organization_id: communityData.organization_id,
          community_id: communityId,
          document_type: 'multidocumento',
          extracted_text: analysisResult.extractedText,
          text_length: analysisResult.extractedText?.length || 0,
          page_count: (analysisResult as any).totalPages || 1,
          extraction_status: 'completed',
          extraction_method: (analysisResult as any).extractionMethod || 'multi-document-analyzer',
          extraction_completed_at: new Date().toISOString(),
          processing_level: 1,
          original_filename: originalFileName
        };

        const parentDoc = await SupabaseApiHelper.executeQuery(async (supabase) => {
          const { data, error: parentError } = await supabase
            .from('documents')
            // @ts-ignore - Temporal fix para problemas de tipos Supabase
            .insert(parentDocumentData)
            .select()
            .single() as { data: Database['public']['Tables']['documents']['Row'] | null, error: any };

          if (parentError || !data) {
            throw new Error(`Failed to create parent document: ${parentError?.message || 'No data returned'}`);
          }
          return data;
        }, { useServiceRole: true });

        console.log(`✅ [MULTI-DOC STORED API] Parent document created: ${parentDoc.id}`);

        // Create child documents for supported types
        const childDocuments: any[] = [];
        let childIndex = 1;

        for (const doc of analysisResult.detectedDocuments) {
          if (doc.isSupportedByPipeline) {
            // Patrón acordado: follon_nombre_gemini
            const baseFilename = originalFileName.replace('.pdf', '');
            const geminiTitle = doc.suggestedTitle
              .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Limpiar caracteres especiales
              .replace(/\s+/g, '_') // Espacios a guiones bajos
              .substring(0, 30); // Limitar longitud
            const childFilename = `${baseFilename}_${geminiTitle}.txt`;
            const childHash = crypto.createHash('md5').update((doc.textFragment || '') + childIndex).digest('hex');
            
            const childDocumentData = {
              filename: childFilename,
              file_path: `multi-documents/children/${childFilename}`, // Separar en subcarpeta
              file_size: Math.max(1, Buffer.from(doc.textFragment || '').length), // Asegurar mínimo 1 byte
              file_hash: childHash,
              mime_type: 'text/plain',
              organization_id: communityData.organization_id,
              community_id: communityId,
              document_type: doc.type,
              extracted_text: doc.textFragment || '',
              text_length: (doc.textFragment || '').length,
              page_count: 1,
              extraction_status: 'completed',
              extraction_method: 'multi-document-analyzer',
              extraction_completed_at: new Date().toISOString(),
              classification_status: 'completed',
              classification_completed_at: new Date().toISOString(),
              metadata_status: 'pending',
              chunking_status: 'pending',
              processing_level: 2, // Ya extraído y clasificado, listo para metadatos
              original_filename: originalFileName
            };

            try {
              const childDoc = await SupabaseApiHelper.executeQuery(async (supabase) => {
                const { data, error: childError } = await supabase
                  .from('documents')
                  // @ts-ignore - Temporal fix para problemas de tipos Supabase
                  .insert(childDocumentData)
                  .select()
                  .single() as { data: Database['public']['Tables']['documents']['Row'] | null, error: any };

                if (childError || !data) {
                  throw new Error(`Error creating child document ${childIndex}: ${childError?.message || 'No data returned'}`);
                }
                return data;
              }, { useServiceRole: true });

              console.log(`✅ [MULTI-DOC STORED API] Child document created: ${childDoc.id} (${doc.type})`);
              childDocuments.push({
                id: childDoc.id,
                filename: childFilename,
                type: doc.type,
                title: doc.suggestedTitle
              });
              childIndex++;
            } catch (childError) {
              console.error(`❌ [MULTI-DOC STORED API] Error creating child document ${childIndex}:`, childError instanceof Error ? childError.message : 'Unknown error');
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

        console.log(`📊 [MULTI-DOC STORED API] Database upload completed: ${childDocuments.length} child documents created`);

        // Process child documents automatically with pipeline (metadata and chunking)
        console.log('🔄 [MULTI-DOC STORED API] Starting automatic processing of child documents...');
        
        const { SimplePipeline } = await import('@/lib/ingesta/core/progressivePipelineSimple');
        const pipeline = new SimplePipeline();
        
        let processedCount = 0;
        for (const childDoc of childDocuments) {
          try {
            console.log(`⚙️ [MULTI-DOC STORED API] Processing child document ${childDoc.id} (${childDoc.type})...`);
            
            // Get complete document from DB
            const fullDoc = await SupabaseApiHelper.executeQuery(async (supabase) => {
              const { data, error: fetchError } = await supabase
                .from('documents')
                .select('*')
                .eq('id', childDoc.id)
                .single();

              if (fetchError || !data) {
                throw new Error(`Error fetching child document ${childDoc.id}: ${fetchError?.message || 'No data returned'}`);
              }
              return data;
            }, { useServiceRole: true });

            // Process metadata
            console.log(`📊 [MULTI-DOC STORED API] Extracting metadata for ${childDoc.id}...`);
            await (pipeline as any).extractMetadata(fullDoc);
            
            // Process chunking
            console.log(`🧩 [MULTI-DOC STORED API] Creating chunks for ${childDoc.id}...`);
            await (pipeline as any).chunkDocument(fullDoc);
            
            // Update final status
            await SupabaseApiHelper.executeQuery(async (supabase) => {
              const { error: updateError } = await supabase
                .from('documents')
                // @ts-ignore - Temporal fix para problemas de tipos Supabase
                .update({
                  processing_level: 4, // Completely processed
                  processing_completed_at: new Date().toISOString(),
                  legacy_status: 'completed'
                })
                .eq('id', childDoc.id);

              if (updateError) {
                throw new Error(`Error updating document ${childDoc.id}: ${updateError.message}`);
              }
            }, { useServiceRole: true });
              
            processedCount++;
            console.log(`✅ [MULTI-DOC STORED API] Child document ${childDoc.id} processed successfully`);
            
          } catch (processError) {
            console.error(`❌ [MULTI-DOC STORED API] Error processing child document ${childDoc.id}:`, processError);
          }
        }
        
        console.log(`🏁 [MULTI-DOC STORED API] Automatic processing completed: ${processedCount}/${childDocuments.length} documents processed`);

      } catch (uploadError) {
        console.error('❌ [MULTI-DOC STORED API] Database upload failed:', uploadError);
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
      timestamp: new Date().toISOString(),
      originalFilename: originalFileName,
      originalFileSize: fileSize,
      storagePath: storagePath
    };

    console.log('🏁 [MULTI-DOC STORED API] Analysis completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [MULTI-DOC STORED API] Unexpected error during analysis:', error);
    
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
      message: 'Multi-Document Stored File Analyzer API',
      version: '1.0.0',
      description: 'Processes files already stored in Supabase Storage, bypassing Vercel 4.5MB limit',
      endpoints: {
        'POST /api/documents/multi-analyze-stored': 'Analyze stored multi-document PDFs'
      },
      supportedTypes: [
        'acta', 'factura', 'comunicado', 'contrato', 
        'escritura', 'albaran', 'presupuesto'
      ]
    }
  );
}