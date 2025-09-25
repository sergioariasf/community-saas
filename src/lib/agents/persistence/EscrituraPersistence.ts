/**
 * ARCHIVO: EscrituraPersistence.ts
 * PROPÓSITO: Persistencia específica para datos de escrituras de compraventa
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones saveExtractedEscritura migradas
 * ACTUALIZADO: 2025-09-23
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de escrituras en la tabla extracted_property_deeds
 * Migrado desde saasAgents.ts con mejoras
 */
export async function saveExtractedEscritura(
  documentId: string, 
  data: any
): Promise<boolean> {
  try {
    console.log(`[Escritura Persistence] Saving extracted property deed for document: ${documentId}`);
    
    const result = await insertWithOrganization(
      'extracted_property_deeds',
      documentId,
      data,
      false // usar client normal para escrituras
    );

    if (result.success) {
      console.log(`[Escritura Persistence] Successfully saved property deed for document: ${documentId} in ${result.metadata?.processingTime}ms`);
      return true;
    } else {
      console.error(`[Escritura Persistence] Failed to save property deed:`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[Escritura Persistence] Exception saving property deed:', error);
    return false;
  }
}

/**
 * Alias para saveExtractedEscritura - mantiene compatibilidad con EscrituraExtractor
 */
export const saveExtractedPropertyDeed = saveExtractedEscritura;