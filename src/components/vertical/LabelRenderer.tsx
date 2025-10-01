/**
 * ARCHIVO: LabelRenderer.tsx
 * PROPÓSITO: Componente para renderizar labels dinámicos según vertical
 * ESTADO: development
 * DEPENDENCIAS: useVerticalLabel hook
 * OUTPUTS: Texto adaptado según configuración vertical
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import React from 'react';
import { useVerticalLabel } from '@/hooks/useVertical';

interface LabelRendererProps {
  labelKey: string;
  fallback?: string;
  className?: string;
  as?: React.ElementType;
}

/**
 * Componente que renderiza etiquetas dinámicas según el vertical activo
 * 
 * @param labelKey - Clave de la etiqueta (ej: 'incidents', 'communities')
 * @param fallback - Texto por defecto si no se encuentra la etiqueta
 * @param className - Clases CSS opcionales
 * @param as - Elemento HTML a renderizar (default: 'span')
 */
export function LabelRenderer({ 
  labelKey, 
  fallback, 
  className,
  as: Component = 'span'
}: LabelRendererProps) {
  const label = useVerticalLabel(labelKey);
  const displayText = label !== labelKey ? label : (fallback || labelKey);
  
  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
}

/**
 * Componente específico para títulos de página
 */
export function PageTitle({ labelKey, fallback, className }: Omit<LabelRendererProps, 'as'>) {
  return (
    <LabelRenderer 
      labelKey={labelKey} 
      fallback={fallback}
      className={`text-2xl font-bold ${className || ''}`}
      as="h1"
    />
  );
}

/**
 * Componente específico para botones
 */
export function ButtonLabel({ labelKey, fallback, className }: Omit<LabelRendererProps, 'as'>) {
  return (
    <LabelRenderer 
      labelKey={labelKey} 
      fallback={fallback}
      className={className}
      as="span"
    />
  );
}