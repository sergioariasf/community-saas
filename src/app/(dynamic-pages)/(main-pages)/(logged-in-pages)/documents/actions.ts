/**
 * ARCHIVO: actions.ts
 * PROPÓSITO: Server Actions para upload y procesamiento progresivo de documentos
 * ESTADO: development
 * DEPENDENCIAS: next-safe-action, supabase, progressive pipeline system
 * OUTPUTS: Upload a Storage + Pipeline progresivo nivel 1-4 + React 19 compatibility
 * ACTUALIZADO: 2025-09-15
 */

'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Import our new libraries
import { uploadDocumentToStorage, downloadDocumentFromStorage, deleteDocumentFromStorage } from '@/lib/storage/supabaseStorage';
import { extractTextFromPDF, cleanExtractedText } from '@/lib/pdf/textExtraction';
import { callSaaSAgent } from '@/lib/agents/AgentOrchestrator';
import { saveExtractedMinutes } from '@/lib/agents/persistence/ActaPersistence';
import { saveExtractedFactura } from '@/lib/agents/persistence/FacturaPersistence';

// Import progressive pipeline system (using simplified version)
import { SimplePipeline } from '@/lib/ingesta/core/progressivePipelineSimple';
import { DocumentsStore } from '@/lib/ingesta/storage/documentsStore';
import type { ProcessingLevel } from '@/lib/ingesta/storage/types';

/**
 * PASO 4: Server Actions completas para upload y procesamiento real
 * Implementa el flujo completo según L1.7_PLAN_SIMPLE.md
 */

// Schema para el upload completo
const uploadAndProcessSchema = z.object({
  community_id: z.string().uuid().optional(),
});

export interface DocumentProcessingResult {
  success: boolean;
  documentId?: string;
  error?: string;
  processingStatus?: 'processing' | 'completed' | 'error';
  steps?: {
    upload: boolean;
    textExtraction: boolean;
    classification: boolean;
    dataExtraction: boolean;
  };
  // Progressive pipeline results
  pipelineResult?: {
    processing_level: ProcessingLevel;
    completed_steps: string[];
    failed_steps: string[];
    total_processing_time_ms: number;
    total_tokens_used: number;
    estimated_total_cost_usd: number;
  };
}

/**
 * ACCIÓN PRINCIPAL: Upload y procesamiento completo de documento
 * Implementa el proceso lineal del L1.7_PLAN_SIMPLE.md
 */
export const uploadAndProcessDocument = authActionClient
  .schema(uploadAndProcessSchema)
  .action(async ({ parsedInput }): Promise<DocumentProcessingResult> => {
    const steps = {
      upload: false,
      textExtraction: false,
      classification: false,
      dataExtraction: false,
    };

    try {
      console.log('[Upload Process] Starting document processing...');
      
      // Obtener información del usuario y organización
      const supabase = await createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole?.organization_id) {
        throw new Error('Usuario sin organización asignada');
      }

      console.log(`[Upload Process] Processing for organization: ${userRole.organization_id}`);

      return {
        success: false,
        error: 'Esta función necesita ser llamada con FormData desde el cliente. Use uploadAndProcessFormData en su lugar.',
        steps
      };

    } catch (error) {
      console.error('[Upload Process] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        steps
      };
    }
  });

/**
 * PROCESAMIENTO COMPLETO desde FormData usando Progressive Pipeline
 * Integra el nuevo sistema modular de ingesta progresiva
 */
export async function uploadAndProcessFormData(formData: FormData): Promise<DocumentProcessingResult> {
  const steps = {
    upload: false,
    textExtraction: false,
    classification: false,
    dataExtraction: false,
  };

  try {
    console.log('🚀 [Progressive Pipeline] INICIANDO PROCESAMIENTO CON SISTEMA MODULAR');
    console.log('📋 [Progressive Pipeline] FormData recibido:', {
      filePresent: !!formData.get('file'),
      communityId: formData.get('community_id'),
      processingLevel: formData.get('processing_level'),
      description: formData.get('description')
    });
    
    // 1. EXTRAER DATOS DEL FORMULARIO
    const file = formData.get('file') as File;
    const communityId = formData.get('community_id') as string | null;
    const processingLevel = parseInt(formData.get('processing_level') as string || '4') as ProcessingLevel;
    console.log('📄 [Progressive Pipeline] Archivo extraído:', file?.name, file?.size, 'bytes');
    console.log('🎯 [Progressive Pipeline] Nivel de procesamiento solicitado:', processingLevel);

    if (!file || !(file instanceof File)) {
      throw new Error('No se ha proporcionado un archivo válido');
    }

    console.log(`[Form Process] Processing file: ${file.name} (${file.size} bytes)`);

    // 2. OBTENER INFORMACIÓN DEL USUARIO
    console.log('👤 [Form Process] Obteniendo información del usuario...');
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ [Form Process] Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }
    console.log('✅ [Form Process] Usuario autenticado:', user.id, user.email);

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userRole?.organization_id) {
      throw new Error('Usuario sin organización asignada');
    }

    const organizationId = userRole.organization_id;
    console.log('🏢 [Form Process] Organization ID obtenido:', organizationId);

    // 3. SUBIR ARCHIVO A SUPABASE STORAGE
    console.log('☁️ [Form Process] PASO 1: Subiendo archivo a Supabase Storage...');
    const uploadResult = await uploadDocumentToStorage(
      file, 
      organizationId, 
      communityId || undefined
    );

    if (!uploadResult.success) {
      console.error('❌ [Form Process] Error en upload:', uploadResult.error);
      throw new Error(uploadResult.error || 'Error al subir archivo');
    }

    steps.upload = true;
    console.log('✅ [Form Process] Upload exitoso:', uploadResult.filePath);
    console.log('📁 [Form Process] Metadata del archivo:', uploadResult.metadata);

    // 4. CREAR REGISTRO EN LA BASE DE DATOS CON PROGRESSIVE PIPELINE
    console.log('💾 [Progressive Pipeline] PASO 2: Creando registro con sistema modular...');
    const documentData = {
      organization_id: organizationId,
      community_id: communityId || null,
      filename: file.name,
      file_path: uploadResult.filePath!,
      file_size: file.size,
      file_hash: uploadResult.metadata!.hash,
      processing_level: processingLevel,
      extraction_status: 'pending' as const,
      status: 'processing' as const,
    };
    console.log('📋 [Progressive Pipeline] Datos para insertar:', documentData);
    
    // Crear registro directo en Supabase usando schema real completo
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        organization_id: organizationId,
        community_id: communityId,
        filename: file.name,
        file_path: uploadResult.filePath!,
        file_size: file.size,
        file_hash: uploadResult.metadata!.hash,
        processing_level: processingLevel,
        document_type: 'acta',
        legacy_status: 'processing',
        extraction_status: 'pending',
        uploaded_by: user.id,
        mime_type: 'application/pdf',
        original_filename: file.name
      })
      .select()
      .single();

    if (dbError || !document) {
      console.error('❌ [Progressive Pipeline] Error creando registro:', {
        error: dbError?.message || 'No document returned',
        details: dbError
      });
      throw new Error(`Error al crear registro del documento: ${dbError?.message || 'Unknown error'}`);
    }

    console.log('✅ [Progressive Pipeline] Registro de documento creado:', document.id);

    // 5. EJECUTAR PROGRESSIVE PIPELINE
    console.log('🚀 [Progressive Pipeline] PASO 3: Ejecutando pipeline progresivo...');
    console.log(`🎯 [Progressive Pipeline] Procesando hasta nivel ${processingLevel}`);
    
    const pipeline = new SimplePipeline();
    const pipelineResult = await pipeline.processDocument(document.id, parseInt(processingLevel));
    
    console.log('📊 [Progressive Pipeline] Resultado del pipeline:', {
      success: pipelineResult.success,
      documentId: pipelineResult.documentId
    });

    // Map pipeline results to legacy steps format
    steps.upload = true; // Upload always successful if we reach this point
    
    if (pipelineResult.success) {
      // All levels completed successfully based on processingLevel
      steps.extraction = true;
      if (parseInt(processingLevel) >= 2) steps.classification = true;
      if (parseInt(processingLevel) >= 3) steps.metadata = true;
      if (parseInt(processingLevel) >= 4) steps.chunking = true;
    }

    if (!pipelineResult.success) {
      console.warn('⚠️ [Progressive Pipeline] Pipeline parcialmente fallido:', pipelineResult.error);
      // Don't throw error - partial success is still valuable
    }

    // 6. FINALIZAR PROCESAMIENTO
    console.log(`✅ [Progressive Pipeline] Procesamiento completado`);

    // 9. REVALIDAR CACHE
    revalidatePath('/documents');
    revalidatePath(`/documents/${document.id}`);

    return {
      success: true,
      documentId: document.id,
      processingStatus: pipelineResult?.success ? 'completed' : 'processing',
      steps,
      pipelineResult: {
        processing_level: processingLevel,
        success: pipelineResult?.success || false,
        documentId: pipelineResult?.documentId || document.id
      }
    };

  } catch (error) {
    console.error('[Progressive Pipeline] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error durante el procesamiento',
      steps
    };
  }
}

/**
 * Actualiza el estado de un documento
 */
async function updateDocumentStatus(
  documentId: string, 
  status: 'processing' | 'completed' | 'error'
): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    const updateData: any = { status };
    if (status === 'completed') {
      updateData.processed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId);

    if (error) {
      console.error('[Status Update] Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Status Update] Error:', error);
    return false;
  }
}

/**
 * Reprocesar un documento existente
 */
const reprocessDocumentSchema = z.object({
  documentId: z.string().uuid(),
});

export const reprocessDocument = authActionClient
  .schema(reprocessDocumentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createSupabaseClient();
      
      // Obtener el documento
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', parsedInput.documentId)
        .single();

      if (error || !document) {
        throw new Error('Documento no encontrado');
      }

      // Descargar archivo desde storage
      const fileBuffer = await downloadDocumentFromStorage(document.file_path);
      if (!fileBuffer) {
        throw new Error('No se pudo descargar el archivo');
      }

      // Marcar como procesando
      await updateDocumentStatus(document.id, 'processing');

      // Repetir proceso de extracción
      const extractionResult = await extractTextFromPDF(fileBuffer);
      if (!extractionResult.success) {
        await updateDocumentStatus(document.id, 'error');
        throw new Error('No se pudo extraer texto');
      }

      const cleanText = cleanExtractedText(extractionResult.text);

      // Clasificar
      const classificationResult = await callSaaSAgent('document_classifier', {
        document_text: cleanText.substring(0, 2000)
      });

      if (classificationResult.success) {
        const documentType = classificationResult.data;
        
        // Actualizar tipo
        await supabase
          .from('documents')
          .update({ document_type: documentType })
          .eq('id', document.id);

        // Extraer datos
        if (documentType === 'acta') {
          // Eliminar datos anteriores
          await supabase.from('extracted_minutes').delete().eq('document_id', document.id);
          
          const result = await callSaaSAgent('minutes_extractor', { document_text: cleanText });
          if (result.success) {
            await saveExtractedMinutes(document.id, result.data);
          }
        } else if (documentType === 'factura') {
          // Eliminar datos anteriores
          await supabase.from('extracted_invoices').delete().eq('document_id', document.id);
          
          const result = await callSaaSAgent('invoice_extractor', { document_text: cleanText });
          if (result.success) {
            await saveExtractedFactura(document.id, result.data, document.organization_id);
          }
        }
      }

      await updateDocumentStatus(document.id, 'completed');
      
      revalidatePath('/documents');
      revalidatePath(`/documents/${parsedInput.documentId}`);

      return { success: true };
    } catch (error) {
      console.error('[Reprocess] Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al reprocesar' 
      };
    }
  });

/**
 * Eliminar documento y archivo
 */
const deleteDocumentSchema = z.object({
  documentId: z.string().uuid(),
});

export const deleteDocument = authActionClient
  .schema(deleteDocumentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createSupabaseClient();
      
      // Obtener el documento para obtener file_path
      const { data: document, error } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', parsedInput.documentId)
        .single();

      if (error || !document) {
        throw new Error('Documento no encontrado');
      }

      // Eliminar archivo de storage (necesario para evitar duplicados)
      await deleteDocumentFromStorage(document.file_path);

      // Eliminar registro de BD (esto eliminará automáticamente extracted_minutes e extracted_invoices)
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', parsedInput.documentId);

      if (deleteError) {
        throw new Error('Error al eliminar el documento');
      }

      revalidatePath('/documents');
      return { success: true };
    } catch (error) {
      console.error('[Delete] Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al eliminar' 
      };
    }
  });