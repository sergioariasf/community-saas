/**
 * ARCHIVO: useVertical.ts
 * PROPÓSITO: Hook principal para acceso al sistema de verticales
 * ESTADO: development
 * DEPENDENCIAS: VerticalProvider
 * OUTPUTS: Re-export del hook useVertical desde VerticalProvider
 * ACTUALIZADO: 2025-10-01
 */

// Re-export del hook principal desde VerticalProvider
export { 
  useVertical, 
  useModuleVisibility, 
  useVerticalLabel 
} from '@/providers/VerticalProvider';

// Re-export de tipos para conveniencia
export type { VerticalType, VerticalConfig } from '@/config/verticals';