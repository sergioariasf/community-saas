/**
 * ARCHIVO: settings/page.tsx
 * PROPÓSITO: Página de configuración de la herramienta y preferencias de usuario
 * ESTADO: development
 * DEPENDENCIAS: Supabase, UI components
 * OUTPUTS: Página de configuración del sistema
 * ACTUALIZADO: 2025-09-16
 */

import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { redirect } from 'next/navigation';
import { SettingsContent } from './SettingsContent';

export default async function SettingsPage() {
  try {
    const { user } = await getCachedLoggedInVerifiedSupabaseUser();
    return <SettingsContent user={user} />;
  } catch (error) {
    redirect('/auth?mode=login');
  }
}