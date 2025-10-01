/**
 * ARCHIVO: index.ts
 * PROPÓSITO: Export central y gestión de configuraciones de verticales
 * ESTADO: development
 * DEPENDENCIAS: comunidades.ts, oficinas.ts, types.ts
 * OUTPUTS: Configuración unificada sistema de verticales
 * ACTUALIZADO: 2025-10-01
 */

import { VerticalConfig, VerticalType } from './types';
import { comunidadesVertical } from './comunidades';
import { oficinasVertical } from './oficinas';

// Registro central de todas las configuraciones de verticales
export const VERTICAL_CONFIGS: Record<VerticalType, VerticalConfig> = {
  comunidades: comunidadesVertical,
  oficinas: oficinasVertical,
  despachos: comunidadesVertical, // TODO: Implementar configuración específica
  educacion: comunidadesVertical  // TODO: Implementar configuración específica
};

// Configuración por defecto
export const DEFAULT_VERTICAL: VerticalType = 'comunidades';

/**
 * Obtiene la configuración de un vertical específico
 */
export function getVerticalConfig(verticalType: VerticalType): VerticalConfig {
  return VERTICAL_CONFIGS[verticalType] || VERTICAL_CONFIGS[DEFAULT_VERTICAL];
}

/**
 * Verifica si un módulo está visible para un vertical específico
 */
export function isModuleVisible(verticalType: VerticalType, moduleKey: string): boolean {
  const config = getVerticalConfig(verticalType);
  return config.modules.visible.includes(moduleKey) && 
         !config.modules.hidden.includes(moduleKey);
}

/**
 * Obtiene la etiqueta traducida para un vertical específico
 */
export function getVerticalLabel(verticalType: VerticalType, labelKey: string): string {
  const config = getVerticalConfig(verticalType);
  return config.labels[labelKey] || labelKey;
}

/**
 * Obtiene la navegación principal para un vertical específico
 */
export function getVerticalNavigation(verticalType: VerticalType) {
  const config = getVerticalConfig(verticalType);
  return config.navigation.mainMenu.filter(item => 
    isModuleVisible(verticalType, item.key)
  );
}

/**
 * Obtiene el tema de colores para un vertical específico
 */
export function getVerticalTheme(verticalType: VerticalType) {
  const config = getVerticalConfig(verticalType);
  return config.theme;
}

// Exports de tipos
export type { VerticalConfig, VerticalType, UserOrganization } from './types';

// Exports de configuraciones específicas
export { comunidadesVertical } from './comunidades';
export { oficinasVertical } from './oficinas';