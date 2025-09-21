/**
 * ARCHIVO: usuarios/page.tsx
 * PROPÓSITO: Página principal de gestión de usuarios y roles
 * ESTADO: development
 * DEPENDENCIAS: Supabase, UI components
 * OUTPUTS: Página de gestión de usuarios
 * ACTUALIZADO: 2025-09-16
 */

import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { redirect } from 'next/navigation';
import { UsuariosContent } from './UsuariosContent';

export default async function UsuariosPage() {
  try {
    const user = await getCachedLoggedInVerifiedSupabaseUser();
    return <UsuariosContent user={user} />;
  } catch (error) {
    redirect('/auth?mode=login');
  }
}