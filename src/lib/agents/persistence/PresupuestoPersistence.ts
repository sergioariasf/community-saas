/**
 * ARCHIVO: PresupuestoPersistence.ts
 * PROPÓSITO: Persistencia específica para datos de Presupuesto Comercial
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones saveExtractedPresupuesto migradas
 * ACTUALIZADO: 2025-09-27
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de presupuesto en la tabla extracted_budgets
 * Generado automáticamente desde schema
 */
export async function saveExtractedPresupuesto(
  documentId: string, 
  data: any
): Promise<boolean> {
  try {
    console.log(`[Presupuesto Persistence] Saving extracted presupuesto for document: ${documentId}`);
    
    const result = await insertWithOrganization(
      'extracted_budgets',
      documentId,
      data,
      false // usar client normal
    );

    if (result.success) {
      console.log(`[Presupuesto Persistence] Successfully saved presupuesto for document: ${documentId} in ${result.metadata?.processingTime}ms`);
      return true;
    } else {
      console.error(`[Presupuesto Persistence] Failed to save presupuesto:`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[Presupuesto Persistence] Exception saving presupuesto:', error);
    return false;
  }
}

/**
 * Alias para saveExtractedPresupuesto - mantiene compatibilidad con PresupuestoExtractor
 */
export const savePresupuestoData = saveExtractedPresupuesto;