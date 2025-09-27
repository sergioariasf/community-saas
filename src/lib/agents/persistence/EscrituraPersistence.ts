/**
 * ARCHIVO: EscrituraPersistence.ts
 * PROPÓSITO: Persistencia específica para datos de Escritura de Compraventa
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones saveExtractedEscritura migradas
 * ACTUALIZADO: 2025-09-27
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de escritura en la tabla extracted_property_deeds
 * Generado automáticamente desde schema
 */
export async function saveExtractedEscritura(
  documentId: string, 
  data: any
): Promise<boolean> {
  try {
    console.log(`[Escritura Persistence] Saving extracted escritura for document: ${documentId}`);
    
    const result = await insertWithOrganization(
      'extracted_property_deeds',
      documentId,
      data,
      false // usar client normal
    );

    if (result.success) {
      console.log(`[Escritura Persistence] Successfully saved escritura for document: ${documentId} in ${result.metadata?.processingTime}ms`);
      return true;
    } else {
      console.error(`[Escritura Persistence] Failed to save escritura:`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[Escritura Persistence] Exception saving escritura:', error);
    return false;
  }
}

/**
 * Alias para saveExtractedEscritura - mantiene compatibilidad con EscrituraExtractor
 */
export const saveEscrituraData = saveExtractedEscritura;