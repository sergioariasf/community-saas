/**
 * ARCHIVO: SimpleSelect.tsx
 * PROPÓSITO: Select HTML nativo para bypass React 19 ref issues
 * ESTADO: development
 * DEPENDENCIAS: React
 * OUTPUTS: Componente select funcional compatible con React 19
 * ACTUALIZADO: 2025-09-15
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

interface SimpleSelectItemProps {
  value: string;
  children: React.ReactNode;
}

export function SimpleSelect({ 
  value, 
  onValueChange, 
  placeholder, 
  children, 
  className 
}: SimpleSelectProps) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}

export function SimpleSelectItem({ value, children }: SimpleSelectItemProps) {
  return <option value={value}>{children}</option>;
}