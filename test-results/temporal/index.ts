/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Entry point principal del módulo de ingesta documental
 * ESTADO: production
 * DEPENDENCIAS: core/, modules/extraction/, modules/classification/
 * OUTPUTS: Exporta todas las funcionalidades del pipeline progresivo
 * ACTUALIZADO: 2025-09-14
 */

// Core exports
export * from './core';

// Módulo de extracción (ya migrado)
export * from './modules/extraction';

// TODO: Otros módulos cuando estén listos
// export * from './modules/classification';
// export * from './modules/processing';
// export * from './modules/storage';

// TODO: Procesos cuando estén implementados
// export * from './processes';

/**
 * Función de conveniencia para migración gradual
 * Mantiene compatibilidad con el código existente
 */
export { extractTextFromPDF } from './modules/extraction';