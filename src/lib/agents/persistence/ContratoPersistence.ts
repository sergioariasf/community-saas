/**
 * ARCHIVO: ContratoPersistence.ts
 * PROPÓSITO: Persistencia específica para datos de Contrato Legal
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones saveExtractedContrato migradas
 * ACTUALIZADO: 2025-09-27
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de contrato en la tabla extracted_contracts
 * Generado automáticamente desde schema
 */
export async function saveExtractedContrato(
  documentId: string, 
  data: any
): Promise<boolean> {
  try {
    console.log(`[Contrato Persistence] Saving extracted contrato for document: ${documentId}`);
    
    const result = await insertWithOrganization(
      'extracted_contracts',
      documentId,
      data,
      false // usar client normal
    );

    if (result.success) {
      console.log(`[Contrato Persistence] Successfully saved contrato for document: ${documentId} in ${result.metadata?.processingTime}ms`);
      return true;
    } else {
      console.error(`[Contrato Persistence] Failed to save contrato:`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[Contrato Persistence] Exception saving contrato:', error);
    return false;
  }
}

/**
 * Alias para saveExtractedContrato - mantiene compatibilidad con ContratoExtractor
 */
export const saveContratoData = saveExtractedContrato;