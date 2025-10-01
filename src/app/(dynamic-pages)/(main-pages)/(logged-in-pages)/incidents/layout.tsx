/**
 * ARCHIVO: layout.tsx
 * PROPÓSITO: Layout específico para página de incidencias con metadata dinámico
 * ESTADO: development
 * DEPENDENCIAS: VerticalProvider, metadata API
 * OUTPUTS: Layout con título de pestaña adaptado al vertical
 * ACTUALIZADO: 2025-10-01
 */

import { Metadata } from 'next';
import { ReactNode } from 'react';

// Función para generar metadata dinámico
export async function generateMetadata(): Promise<Metadata> {
  // En el servidor no tenemos acceso directo al contexto del usuario
  // Por defecto usamos "Incidencias", se actualizará en el cliente
  return {
    title: 'Incidencias - Fazil',
    description: 'Gestión de incidencias y tickets de tu organización'
  };
}

interface IncidentsLayoutProps {
  children: ReactNode;
}

export default function IncidentsLayout({ children }: IncidentsLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}