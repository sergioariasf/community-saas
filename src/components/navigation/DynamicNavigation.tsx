/**
 * ARCHIVO: DynamicNavigation.tsx
 * PROPÓSITO: Navegación dinámica que se adapta según el vertical activo
 * ESTADO: development
 * DEPENDENCIAS: useVertical hook, vertical configuration
 * OUTPUTS: Navegación adaptada con labels dinámicos
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import { Home, Building2, AlertTriangle, FileText, MessageSquare, Users, UserCog } from 'lucide-react';
import Link from 'next/link';
import { useVertical, useVerticalLabel } from '@/hooks/useVertical';

export function DynamicNavigation() {
  const { isModuleVisible } = useVertical();
  const communitiesLabel = useVerticalLabel('communities');
  const incidentsLabel = useVerticalLabel('incidents');

  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      
      <Link
        href="/communities"
        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <Building2 className="h-4 w-4" />
        <span>{communitiesLabel}</span>
      </Link>
      
      <Link
        href="/incidents"
        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>{incidentsLabel}</span>
      </Link>
      
      <Link
        href="/documents"
        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <FileText className="h-4 w-4" />
        <span>Documentos</span>
      </Link>
      
      <Link
        href="/chat-ia"
        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Chat IA</span>
      </Link>
      
      {isModuleVisible('foro') && (
        <Link
          href="/foro"
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Users className="h-4 w-4" />
          <span>Foro</span>
        </Link>
      )}
      
      <Link
        href="/usuarios"
        className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <UserCog className="h-4 w-4" />
        <span>Usuarios</span>
      </Link>
    </nav>
  );
}