/**
 * ARCHIVO: BasePersistence.ts
 * PROPÓSITO: Lógica común de persistencia para todos los tipos de documentos
 * ESTADO: development
 * DEPENDENCIAS: supabase-clients
 * OUTPUTS: Funciones base de persistencia reutilizables
 * ACTUALIZADO: 2025-09-23
 */

import { createSupabaseClient, createSupabaseServiceClient } from '@/supabase-clients/server';

export interface PersistenceResult {
  success: boolean;
  error?: string;
  metadata?: {
    documentId: string;
    table: string;
    processingTime: number;
  };
}

/**
 * Obtiene información del documento (organization_id principalmente)
 */
export async function getDocumentInfo(documentId: string, useServiceClient = false): Promise<{
  organization_id: string;
  community_id?: string;
} | null> {
  try {
    const supabase = useServiceClient ? createSupabaseServiceClient() : await createSupabaseClient();
    
    const { data: document, error } = await supabase
      .from('documents')
      .select('organization_id, community_id')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      console.error('[Base Persistence] Document not found:', documentId, error);
      return null;
    }

    return document;
  } catch (error) {
    console.error('[Base Persistence] Error fetching document info:', error);
    return null;
  }
}

/**
 * Inserta datos en una tabla específica con organización
 */
export async function insertWithOrganization(
  tableName: string,
  documentId: string,
  data: any,
  useServiceClient = false
): Promise<PersistenceResult> {
  const startTime = Date.now();
  
  try {
    // Obtener información del documento
    const docInfo = await getDocumentInfo(documentId, useServiceClient);
    if (!docInfo) {
      return {
        success: false,
        error: `Document not found: ${documentId}`,
        metadata: {
          documentId,
          table: tableName,
          processingTime: Date.now() - startTime
        }
      };
    }

    // Preparar datos con información organizacional
    const recordData = {
      document_id: documentId,
      organization_id: docInfo.organization_id,
      ...data
    };

    // Insertar en la tabla especificada
    const supabase = useServiceClient ? createSupabaseServiceClient() : await createSupabaseClient();
    
    const { error } = await supabase
      .from(tableName)
      .insert(recordData);

    if (error) {
      console.error(`[Base Persistence] Error inserting into ${tableName}:`, error);
      return {
        success: false,
        error: `Database insert failed: ${error.message}`,
        metadata: {
          documentId,
          table: tableName,
          processingTime: Date.now() - startTime
        }
      };
    }

    console.log(`[Base Persistence] Successfully saved to ${tableName} for document: ${documentId}`);
    
    return {
      success: true,
      metadata: {
        documentId,
        table: tableName,
        processingTime: Date.now() - startTime
      }
    };

  } catch (error) {
    console.error(`[Base Persistence] Exception in ${tableName} insert:`, error);
    
    return {
      success: false,
      error: `Insert operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        documentId,
        table: tableName,
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * Actualiza registro existente o inserta si no existe
 */
export async function upsertWithOrganization(
  tableName: string,
  documentId: string,
  data: any,
  useServiceClient = false
): Promise<PersistenceResult> {
  const startTime = Date.now();
  
  try {
    const docInfo = await getDocumentInfo(documentId, useServiceClient);
    if (!docInfo) {
      return {
        success: false,
        error: `Document not found: ${documentId}`,
        metadata: {
          documentId,
          table: tableName,
          processingTime: Date.now() - startTime
        }
      };
    }

    const recordData = {
      document_id: documentId,
      organization_id: docInfo.organization_id,
      ...data
    };

    const supabase = useServiceClient ? createSupabaseServiceClient() : await createSupabaseClient();
    
    const { error } = await supabase
      .from(tableName)
      .upsert(recordData, {
        onConflict: 'document_id'
      });

    if (error) {
      console.error(`[Base Persistence] Error upserting into ${tableName}:`, error);
      return {
        success: false,
        error: `Database upsert failed: ${error.message}`,
        metadata: {
          documentId,
          table: tableName,
          processingTime: Date.now() - startTime
        }
      };
    }

    console.log(`[Base Persistence] Successfully upserted to ${tableName} for document: ${documentId}`);
    
    return {
      success: true,
      metadata: {
        documentId,
        table: tableName,
        processingTime: Date.now() - startTime
      }
    };

  } catch (error) {
    console.error(`[Base Persistence] Exception in ${tableName} upsert:`, error);
    
    return {
      success: false,
      error: `Upsert operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        documentId,
        table: tableName,
        processingTime: Date.now() - startTime
      }
    };
  }
}