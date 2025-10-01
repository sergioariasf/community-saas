/**
 * ARCHIVO: VerticalProvider.tsx
 * PROPÓSITO: Context provider para sistema de verticales multi-industria
 * ESTADO: development
 * DEPENDENCIAS: useUserOrganization, vertical configs
 * OUTPUTS: Contexto global de configuración vertical
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  VerticalConfig, 
  VerticalType, 
  getVerticalConfig,
  isModuleVisible,
  getVerticalLabel,
  getVerticalNavigation,
  getVerticalTheme,
  DEFAULT_VERTICAL
} from '@/config/verticals';
import { useUserOrganization } from '@/hooks/useUserOrganization';

interface VerticalContextValue {
  // Datos de la organización
  verticalType: VerticalType;
  config: VerticalConfig;
  loading: boolean;
  error: string | null;
  
  // Utilidades de configuración
  isModuleVisible: (moduleKey: string) => boolean;
  getLabel: (labelKey: string) => string;
  getNavigation: () => VerticalConfig['navigation']['mainMenu'];
  getTheme: () => VerticalConfig['theme'];
  
  // Función de recarga
  refresh: () => Promise<void>;
}

const VerticalContext = createContext<VerticalContextValue | undefined>(undefined);

interface VerticalProviderProps {
  children: ReactNode;
}

export function VerticalProvider({ children }: VerticalProviderProps) {
  const { organization, loading, error, refresh } = useUserOrganization();
  
  // Determinar vertical type (con fallback)
  const verticalType: VerticalType = organization?.vertical_type || DEFAULT_VERTICAL;
  
  // Obtener configuración
  const config = getVerticalConfig(verticalType);
  
  // Crear funciones helper con el vertical type actual
  const contextValue: VerticalContextValue = {
    verticalType,
    config,
    loading,
    error,
    
    // Utilidades que usan el vertical type actual
    isModuleVisible: (moduleKey: string) => isModuleVisible(verticalType, moduleKey),
    getLabel: (labelKey: string) => getVerticalLabel(verticalType, labelKey),
    getNavigation: () => getVerticalNavigation(verticalType),
    getTheme: () => getVerticalTheme(verticalType),
    
    refresh
  };

  return (
    <VerticalContext.Provider value={contextValue}>
      {children}
    </VerticalContext.Provider>
  );
}

/**
 * Hook para usar el contexto vertical
 * Debe ser usado dentro de un VerticalProvider
 */
export function useVertical(): VerticalContextValue {
  const context = useContext(VerticalContext);
  
  if (context === undefined) {
    throw new Error('useVertical debe ser usado dentro de un VerticalProvider');
  }
  
  return context;
}

/**
 * Hook simplificado para verificar si un módulo está visible
 */
export function useModuleVisibility(moduleKey: string): boolean {
  const { isModuleVisible } = useVertical();
  return isModuleVisible(moduleKey);
}

/**
 * Hook simplificado para obtener labels
 */
export function useVerticalLabel(labelKey: string): string {
  const { getLabel } = useVertical();
  return getLabel(labelKey);
}