/**
 * ARCHIVO: profile/page.tsx
 * PROPÓSITO: Página de perfil de usuario con información personal y roles
 * ESTADO: development
 * DEPENDENCIAS: Supabase, UI components
 * OUTPUTS: Página de perfil del usuario
 * ACTUALIZADO: 2025-09-16
 */

import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { redirect } from 'next/navigation';
import { ProfileContent } from './ProfileContent';

export default async function ProfilePage() {
  try {
    const { user } = await getCachedLoggedInVerifiedSupabaseUser();
    return <ProfileContent user={user} />;
  } catch (error) {
    redirect('/auth?mode=login');
  }
}