/**
 * ARCHIVO: FacturaPersistence.ts
 * PROPÓSITO: Persistencia específica para datos de Factura Comercial
 * ESTADO: development
 * DEPENDENCIAS: BasePersistence
 * OUTPUTS: Funciones saveExtractedFactura migradas
 * ACTUALIZADO: 2025-09-24
 */

import { insertWithOrganization, PersistenceResult } from './BasePersistence';

/**
 * Guarda datos extraídos de factura en la tabla extracted_invoices
 * Generado automáticamente desde schema
 */
export async function saveExtractedFactura(
  documentId: string, 
  data: any
): Promise<boolean> {
  try {
    console.log(`[Factura Persistence] Saving extracted factura for document: ${documentId}`);
    
    const result = await insertWithOrganization(
      'extracted_invoices',
      documentId,
      data,
      false // usar client normal
    );

    if (result.success) {
      console.log(`[Factura Persistence] Successfully saved factura for document: ${documentId} in ${result.metadata?.processingTime}ms`);
      return true;
    } else {
      console.error(`[Factura Persistence] Failed to save factura:`, result.error);
      return false;
    }

  } catch (error) {
    console.error('[Factura Persistence] Exception saving factura:', error);
    return false;
  }
}

/**
 * Alias para saveExtractedFactura - mantiene compatibilidad con FacturaExtractor
 */
export const saveFacturaData = saveExtractedFactura;