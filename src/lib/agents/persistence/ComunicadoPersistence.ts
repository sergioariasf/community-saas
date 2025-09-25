/**
 * ARCHIVO: ComunicadoPersistence.ts
 * PROPÓSITO: Persistencia específica para datos de Comunicado Vecinal
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones saveExtractedComunicado migradas
 * ACTUALIZADO: 2025-09-24
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de comunicado en la tabla extracted_communications
 * Generado automáticamente desde schema
 */
export async function saveExtractedComunicado(
  documentId: string, 
  data: any
): Promise<boolean> {
  try {
    console.log(`[Comunicado Persistence] Saving extracted comunicado for document: ${documentId}`);
    
    const result = await insertWithOrganization(
      'extracted_communications',
      documentId,
      data,
      false // usar client normal
    );

    if (result.success) {
      console.log(`[Comunicado Persistence] Successfully saved comunicado for document: ${documentId} in ${result.metadata?.processingTime}ms`);
      return true;
    } else {
      console.error(`[Comunicado Persistence] Failed to save comunicado:`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[Comunicado Persistence] Exception saving comunicado:', error);
    return false;
  }
}

/**
 * Alias para saveExtractedComunicado - mantiene compatibilidad con ComunicadoExtractor
 */
export const saveComunicadoData = saveExtractedComunicado;