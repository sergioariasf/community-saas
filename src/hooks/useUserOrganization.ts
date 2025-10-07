/**
 * ARCHIVO: useUserOrganization.ts
 * PROPÓSITO: Hook para obtener organización del usuario con RLS multi-tenant
 * ESTADO: development
 * DEPENDENCIAS: Supabase client, auth
 * OUTPUTS: Datos de organización del usuario autenticado
 * ACTUALIZADO: 2025-10-01
 */

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { UserOrganization, VerticalType } from '@/config/verticals/types';

interface UseUserOrganizationReturn {
  organization: UserOrganization | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUserOrganization(): UseUserOrganizationReturn {
  const [organization, setOrganization] = useState<UserOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUserOrganization = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Error de autenticación: ${userError.message}`);
      }

      if (!user) {
        setOrganization(null);
        return;
      }

      // Obtener organización del usuario a través de user_roles (tomar primera si tiene múltiples)
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name,
            vertical_type,
            vertical_config
          )
        `)
        .eq('user_id', user.id)
        .limit(1);

      if (rolesError) {
        throw new Error(`Error al obtener organización: ${rolesError.message}`);
      }

      if (!userRolesData || userRolesData.length === 0 || !userRolesData[0]?.organizations) {
        throw new Error('Usuario no tiene organización asignada');
      }

      const userRoles = userRolesData[0];
      const org = userRoles.organizations as any;
      
      setOrganization({
        id: org.id,
        name: org.name,
        vertical_type: org.vertical_type as VerticalType,
        vertical_config: org.vertical_config || {}
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en useUserOrganization:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrganization();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserOrganization();
      } else if (event === 'SIGNED_OUT') {
        setOrganization(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    organization,
    loading,
    error,
    refresh: fetchUserOrganization
  };
}