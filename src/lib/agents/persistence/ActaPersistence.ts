/**
 * ARCHIVO: ActaPersistence.ts
 * PROPÓSITO: Persistencia específica para datos de actas de junta
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones saveExtractedMinutes migradas
 * ACTUALIZADO: 2025-09-23
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de actas en la tabla extracted_minutes
 * Migrado desde saasAgents.ts con mejoras
 */
export async function saveExtractedMinutes(
  documentId: string, 
  data: any, 
  useServiceClient = false
): Promise<boolean> {
  try {
    console.log(`[Acta Persistence] Saving extracted minutes for document: ${documentId}`);
    
    const result = await insertWithOrganization(
      'extracted_minutes',
      documentId,
      data,
      useServiceClient
    );

    if (result.success) {
      console.log(`[Acta Persistence] Successfully saved minutes for document: ${documentId} in ${result.metadata?.processingTime}ms`);
      return true;
    } else {
      console.error(`[Acta Persistence] Failed to save minutes:`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[Acta Persistence] Exception saving minutes:', error);
    return false;
  }
}

/**
 * Guarda metadatos completos de actas (función legacy mantenida por compatibilidad)
 */
export async function saveCompleteActaMetadata(
  documentId: string, 
  data: any
): Promise<boolean> {
  // Esta función puede ser simplemente un alias a saveExtractedMinutes
  // o tener lógica adicional si se necesita
  return saveExtractedMinutes(documentId, data, true); // usar service client por defecto
}