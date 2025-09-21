'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission, getAccessibleCommunities } from '@/lib/auth/permissions';

// Types based on the progressive pipeline documents table structure
export type Document = {
  id: string;
  organization_id: string;
  community_id: string | null;
  filename: string;
  file_path: string;
  file_size: number;
  file_hash: string;
  document_type: 'acta' | 'factura' | 'comunicado' | 'contrato' | 'presupuesto' | null;
  // Progressive pipeline status fields
  processing_level: number;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed' | null;
  classification_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped' | null;
  metadata_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped' | null;
  chunking_status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped' | null;
  created_at: string;
  processed_at: string | null;
  processing_completed_at: string | null;
};

export type ExtractedMinutes = {
  id: string;
  document_id: string;
  organization_id: string;
  president_in: string | null;
  president_out: string | null;
  administrator: string | null;
  summary: string | null;
  decisions: string | null;
  created_at: string;
  
  // Campos nuevos de la migración
  document_date: string | null;
  tipo_reunion: 'ordinaria' | 'extraordinaria' | null;
  lugar: string | null;
  comunidad_nombre: string | null;
  orden_del_dia: any[] | null;
  acuerdos: any[] | null;
  topic_keywords: string[] | null;
  
  // Temas booleanos
  topic_presupuesto: boolean | null;
  topic_mantenimiento: boolean | null;
  topic_administracion: boolean | null;
  topic_piscina: boolean | null;
  topic_jardin: boolean | null;
  topic_limpieza: boolean | null;
  topic_balance: boolean | null;
  topic_paqueteria: boolean | null;
  topic_energia: boolean | null;
  topic_normativa: boolean | null;
  topic_proveedor: boolean | null;
  topic_dinero: boolean | null;
  topic_ascensor: boolean | null;
  topic_incendios: boolean | null;
  topic_porteria: boolean | null;
  
  // Estructura detectada
  estructura_detectada: any | null;
};

export type ExtractedInvoice = {
  id: string;
  document_id: string;
  organization_id: string;
  provider_name: string | null;
  client_name: string | null;
  amount: number | null;
  invoice_date: string | null;
  category: string | null;
  created_at: string;
};

// Get all documents for the user's organization
export const getAllDocuments = async (): Promise<Document[]> => {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('documents')
    .select(`
      id,
      organization_id,
      community_id,
      filename,
      file_path,
      file_size,
      file_hash,
      document_type,
      processing_level,
      extraction_status,
      classification_status,
      metadata_status,
      chunking_status,
      created_at,
      processed_at,
      processing_completed_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  return data || [];
};

// Get documents by community
export const getDocumentsByCommunity = async (communityId: string) => {
  try {
    // Verify user has access to this community
    await requirePermission('resident', communityId);

    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from('documents')
      .select(`
        id,
        organization_id,
        community_id,
        filename,
        file_path,
        file_size,
        file_hash,
        document_type,
        processing_level,
        extraction_status,
        classification_status,
        metadata_status,
        chunking_status,
        created_at,
        processed_at,
        processing_completed_at
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents by community:', error);
      throw error;
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getDocumentsByCommunity:', error);
    return { success: false, error: 'Failed to fetch documents' };
  }
};

// Get single document with extracted data
export const getDocument = async (id: string) => {
  try {
    const supabase = await createSupabaseClient();
    
    // First get the document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        id,
        organization_id,
        community_id,
        filename,
        file_path,
        file_size,
        file_hash,
        document_type,
        processing_level,
        extraction_status,
        classification_status,
        metadata_status,
        chunking_status,
        processing_config,
        extracted_text,
        page_count,
        chunks_count,
        created_at,
        processed_at,
        processing_completed_at
      `)
      .eq('id', id)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);
      throw docError;
    }

    // Use the processing_config from the SimplePipeline (stored as JSON in the documents table)
    const extractedData = document.processing_config;

    return { 
      success: true, 
      data: {
        ...document,
        extractedData
      }
    };
  } catch (error) {
    console.error('Error in getDocument:', error);
    return { success: false, error: 'Failed to fetch document' };
  }
};

// Get extracted minutes data for actas
export const getExtractedMinutes = async (documentId: string) => {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from('extracted_minutes')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) {
      console.log('No extracted minutes found for document:', documentId);
      return { success: false, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching extracted minutes:', error);
    return { success: false, data: null };
  }
};

// Get extracted invoice data for facturas
export const getExtractedInvoice = async (documentId: string) => {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from('extracted_invoices')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) {
      console.log('No extracted invoice found for document:', documentId);
      return { success: false, data: null };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching extracted invoice:', error);
    return { success: false, data: null };
  }
};

// Get document statistics
export const getDocumentStats = async () => {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase
      .from('documents')
      .select('extraction_status, classification_status, metadata_status, chunking_status, document_type, processing_level');

    if (error) {
      console.error('Error fetching document stats:', error);
      throw error;
    }

    const stats = {
      total: data.length,
      pending: data.filter(d => d.extraction_status === 'pending').length,
      processing: data.filter(d => 
        d.extraction_status === 'processing' || 
        d.classification_status === 'processing' || 
        d.metadata_status === 'processing' || 
        d.chunking_status === 'processing'
      ).length,
      completed: data.filter(d => {
        // Consider completed if extraction is done and all enabled levels are complete
        const extractionDone = d.extraction_status === 'completed';
        const classificationOk = d.processing_level < 2 || d.classification_status === 'completed';
        const metadataOk = d.processing_level < 3 || d.metadata_status === 'completed';
        const chunkingOk = d.processing_level < 4 || d.chunking_status === 'completed';
        return extractionDone && classificationOk && metadataOk && chunkingOk;
      }).length,
      failed: data.filter(d => 
        d.extraction_status === 'failed' || 
        d.classification_status === 'failed' || 
        d.metadata_status === 'failed' || 
        d.chunking_status === 'failed'
      ).length,
      actas: data.filter(d => d.document_type === 'acta').length,
      facturas: data.filter(d => d.document_type === 'factura').length,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error in getDocumentStats:', error);
    return { success: false, error: 'Failed to fetch document stats' };
  }
};

// Schema for document upload (basic - actual file upload will be handled separately)
const insertDocumentSchema = z.object({
  filename: z.string().min(1, 'El nombre de archivo es requerido'),
  community_id: z.string().uuid().optional(),
  file_size: z.number().int().min(1),
  file_hash: z.string().min(32),
  file_path: z.string().min(1),
});

// Create document record (after file upload)
export const insertDocumentAction = authActionClient
  .schema(insertDocumentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabaseClient = await createSupabaseClient();
      
      // Get user's organization_id
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: userRole, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (roleError || !userRole?.organization_id) {
        throw new Error('User has no organization assigned');
      }

      // If community_id is provided, verify user has access to it
      if (parsedInput.community_id) {
        await requirePermission('resident', parsedInput.community_id);
      }

      const { data, error } = await supabaseClient
        .from('documents')
        .insert({
          ...parsedInput,
          organization_id: userRole.organization_id,
          processing_level: 4, // Default to full processing
          extraction_status: 'pending' as const
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath('/documents');
      return { success: true, data: data.id };
    } catch (error) {
      console.error('Error in insertDocumentAction:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create document' };
    }
  });

// Update document pipeline status - DEPRECATED (use DocumentsStore instead)
// This is kept for backward compatibility but should use the progressive pipeline system
const updateDocumentStatusSchema = z.object({
  id: z.string().uuid(),
  extraction_status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  classification_status: z.enum(['pending', 'processing', 'completed', 'failed', 'skipped']).optional(),
  metadata_status: z.enum(['pending', 'processing', 'completed', 'failed', 'skipped']).optional(),
  chunking_status: z.enum(['pending', 'processing', 'completed', 'failed', 'skipped']).optional(),
  document_type: z.enum(['acta', 'factura', 'comunicado', 'contrato', 'presupuesto']).optional(),
});

export const updateDocumentStatusAction = authActionClient
  .schema(updateDocumentStatusSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabaseClient = await createSupabaseClient();
      
      const updateData: any = {};

      // Update progressive pipeline statuses
      if (parsedInput.extraction_status) {
        updateData.extraction_status = parsedInput.extraction_status;
        if (parsedInput.extraction_status === 'completed') {
          updateData.extraction_completed_at = new Date().toISOString();
        }
      }
      
      if (parsedInput.classification_status) {
        updateData.classification_status = parsedInput.classification_status;
        if (parsedInput.classification_status === 'completed') {
          updateData.classification_completed_at = new Date().toISOString();
        }
      }
      
      if (parsedInput.metadata_status) {
        updateData.metadata_status = parsedInput.metadata_status;
        if (parsedInput.metadata_status === 'completed') {
          updateData.metadata_completed_at = new Date().toISOString();
        }
      }
      
      if (parsedInput.chunking_status) {
        updateData.chunking_status = parsedInput.chunking_status;
        if (parsedInput.chunking_status === 'completed') {
          updateData.chunking_completed_at = new Date().toISOString();
        }
      }

      if (parsedInput.document_type) {
        updateData.document_type = parsedInput.document_type;
      }

      // Update processing_completed_at if all enabled levels are complete
      const currentDoc = await supabaseClient
        .from('documents')
        .select('processing_level, extraction_status, classification_status, metadata_status, chunking_status')
        .eq('id', parsedInput.id)
        .single();

      if (currentDoc.data) {
        const doc = { ...currentDoc.data, ...updateData };
        const extractionDone = doc.extraction_status === 'completed';
        const classificationOk = doc.processing_level < 2 || doc.classification_status === 'completed';
        const metadataOk = doc.processing_level < 3 || doc.metadata_status === 'completed';
        const chunkingOk = doc.processing_level < 4 || doc.chunking_status === 'completed';
        
        if (extractionDone && classificationOk && metadataOk && chunkingOk) {
          updateData.processing_completed_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabaseClient
        .from('documents')
        .update(updateData)
        .eq('id', parsedInput.id)
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath('/documents');
      revalidatePath(`/documents/${parsedInput.id}`);
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateDocumentStatusAction:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update document' };
    }
  });