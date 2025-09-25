/**
 * ARCHIVO: AlbaranPersistence.ts
 * PROPÓSITO: Persistencia específica para datos de Albarán de Entrega
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones saveExtractedAlbaran migradas
 * ACTUALIZADO: 2025-09-24
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de albaran en la tabla extracted_delivery_notes
 * Generado automáticamente desde schema
 */
export async function saveExtractedAlbaran(
  documentId: string, 
  data: any
): Promise<boolean> {
  try {
    console.log(`[Albaran Persistence] Saving extracted albaran for document: ${documentId}`);
    
    const result = await insertWithOrganization(
      'extracted_delivery_notes',
      documentId,
      data,
      false // usar client normal
    );

    if (result.success) {
      console.log(`[Albaran Persistence] Successfully saved albaran for document: ${documentId} in ${result.metadata?.processingTime}ms`);
      return true;
    } else {
      console.error(`[Albaran Persistence] Failed to save albaran:`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[Albaran Persistence] Exception saving albaran:', error);
    return false;
  }
}

/**
 * Alias para saveExtractedAlbaran - mantiene compatibilidad con AlbaranExtractor
 */
export const saveAlbaranData = saveExtractedAlbaran;