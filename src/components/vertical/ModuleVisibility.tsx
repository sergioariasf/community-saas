/**
 * ARCHIVO: ModuleVisibility.tsx
 * PROPÓSITO: HOC para mostrar/ocultar módulos según configuración vertical
 * ESTADO: development
 * DEPENDENCIAS: useVertical hook
 * OUTPUTS: Componente que renderiza o oculta según vertical
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import React, { ReactNode } from 'react';
import { useModuleVisibility } from '@/hooks/useVertical';

interface ModuleVisibilityProps {
  moduleKey: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente HOC que muestra/oculta contenido según la configuración del vertical
 * 
 * @param moduleKey - Clave del módulo a verificar (ej: 'forum', 'incidents')
 * @param children - Contenido a mostrar si el módulo está visible
 * @param fallback - Contenido alternativo si el módulo está oculto (opcional)
 */
export function ModuleVisibility({ 
  moduleKey, 
  children, 
  fallback = null 
}: ModuleVisibilityProps) {
  const isVisible = useModuleVisibility(moduleKey);
  
  return isVisible ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook para uso directo en componentes funcionales
 */
export function useShowModule(moduleKey: string): boolean {
  return useModuleVisibility(moduleKey);
}