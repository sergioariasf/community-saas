/**
 * ARCHIVO: DynamicPageTitle.tsx
 * PROPÓSITO: Componente para actualizar dinámicamente el título de la pestaña
 * ESTADO: development
 * DEPENDENCIAS: useVerticalLabel hook
 * OUTPUTS: Actualización del document.title según vertical
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import { useEffect } from 'react';
import { useVerticalLabel } from '@/hooks/useVertical';

interface DynamicPageTitleProps {
  labelKey: string;
  fallback?: string;
  suffix?: string;
}

/**
 * Componente que actualiza dinámicamente el título de la pestaña del navegador
 * según la configuración del vertical activo
 */
export function DynamicPageTitle({ 
  labelKey, 
  fallback = 'Página', 
  suffix = ' - Fazil' 
}: DynamicPageTitleProps) {
  const label = useVerticalLabel(labelKey);
  
  useEffect(() => {
    const title = label !== labelKey ? label : fallback;
    document.title = `${title}${suffix}`;
    
    // Cleanup: restaurar título original al desmontar componente
    return () => {
      document.title = `Fazil${suffix}`;
    };
  }, [label, labelKey, fallback, suffix]);

  // Este componente no renderiza nada visualmente
  return null;
}