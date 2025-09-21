/**
 * ARCHIVO: ConditionalNavigation.tsx
 * PROPÓSITO: Muestra ExternalNavigation solo cuando el usuario NO está logueado
 * ESTADO: development
 * DEPENDENCIAS: Supabase client, ExternalNavigation
 * OUTPUTS: Navegación condicional basada en estado de autenticación
 * ACTUALIZADO: 2025-09-16
 */

'use client';

import { createClient } from '@/supabase-clients/client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ExternalNavigation } from '@/app/Navbar';

export function ConditionalNavigation() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setSession(session);
        setLoading(false);
      } catch (error) {
        console.error('Exception getting session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Only show ExternalNavigation if user is NOT logged in
  if (!session) {
    return <ExternalNavigation />;
  }

  // User is logged in, don't show the landing page navigation
  return null;
}