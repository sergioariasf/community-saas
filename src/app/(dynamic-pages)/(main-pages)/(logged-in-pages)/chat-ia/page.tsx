/**
 * ARCHIVO: chat-ia/page.tsx
 * PROPÓSITO: Página placeholder para Chat IA - desarrollo futuro
 * ESTADO: development
 * DEPENDENCIAS: UI components
 * OUTPUTS: Página placeholder de Chat IA
 * ACTUALIZADO: 2025-09-16
 */

import { getCachedLoggedInVerifiedSupabaseUser } from '@/rsc-data/supabase';
import { redirect } from 'next/navigation';
import { ChatIAContent } from './ChatIAContent';

export default async function ChatIAPage() {
  try {
    const { user } = await getCachedLoggedInVerifiedSupabaseUser();
    return <ChatIAContent user={user} />;
  } catch (error) {
    redirect('/auth?mode=login');
  }
}