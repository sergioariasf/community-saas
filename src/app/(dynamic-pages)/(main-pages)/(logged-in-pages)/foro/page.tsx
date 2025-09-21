/**
 * ARCHIVO: foro/page.tsx
 * PROPÓSITO: Página placeholder para Foro - desarrollo futuro
 * ESTADO: development
 * DEPENDENCIAS: UI components
 * OUTPUTS: Página placeholder de Foro
 * ACTUALIZADO: 2025-09-16
 */

import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { redirect } from 'next/navigation';
import { ForoContent } from './ForoContent';

export default async function ForoPage() {
  try {
    const user = await getCachedLoggedInVerifiedSupabaseUser();
    return <ForoContent user={user} />;
  } catch (error) {
    redirect('/auth?mode=login');
  }
}