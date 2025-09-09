'use client';

import { createClient } from '@/supabase-clients/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'manager' | 'resident';

export interface Permission {
  canViewAllCommunities: boolean;
  canCreateCommunity: boolean;
  canEditCommunity: boolean;
  canDeleteCommunity: boolean;
  canManageUsers: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isResident: boolean;
  userRoles: Array<{
    role: UserRole;
    community_id: string | null;
    community_name?: string;
  }>;
}

interface UsePermissionsResult extends Permission {
  loading: boolean;
  error: string | null;
  hasRoleForCommunity: (communityId: string, role?: UserRole) => boolean;
  canAccessCommunity: (communityId: string) => boolean;
}

export function usePermissions(): UsePermissionsResult {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission>({
    canViewAllCommunities: false,
    canCreateCommunity: false,
    canEditCommunity: false,
    canDeleteCommunity: false,
    canManageUsers: false,
    isAdmin: false,
    isManager: false,
    isResident: false,
    userRoles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchUserAndPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUser(null);
          setPermissions({
            canViewAllCommunities: false,
            canCreateCommunity: false,
            canEditCommunity: false,
            canDeleteCommunity: false,
            canManageUsers: false,
            isAdmin: false,
            isManager: false,
            isResident: false,
            userRoles: [],
          });
          setLoading(false);
          return;
        }
        
        setUser(user);

        // 2. Obtener roles del usuario con información de comunidad
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            role,
            community_id,
            communities:community_id (
              name
            )
          `)
          .eq('user_id', user.id);

        if (rolesError) {
          throw rolesError;
        }

        // 3. Procesar roles y calcular permisos
        const roles = userRoles || [];
        const isAdmin = roles.some(r => r.role === 'admin');
        const isManager = roles.some(r => r.role === 'manager');
        const isResident = roles.some(r => r.role === 'resident');

        const newPermissions: Permission = {
          canViewAllCommunities: isAdmin,
          canCreateCommunity: isAdmin,
          canEditCommunity: isAdmin || isManager,
          canDeleteCommunity: isAdmin,
          canManageUsers: isAdmin,
          isAdmin,
          isManager,
          isResident,
          userRoles: roles.map(role => ({
            role: role.role as UserRole,
            community_id: role.community_id,
            community_name: undefined, // TODO: Fix type issue with communities relationship
          })),
        };

        setPermissions(newPermissions);
        
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError(err instanceof Error ? err.message : 'Error al obtener permisos');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPermissions();
  }, []); // 🔑 Dependency array vacío - solo se ejecuta una vez

  // Función helper: ¿Tiene rol específico para una comunidad?
  const hasRoleForCommunity = (communityId: string, role?: UserRole): boolean => {
    if (!user) return false;
    
    // Admin global puede acceder a todo
    if (permissions.isAdmin) return true;
    
    // Buscar rol específico para esta comunidad
    return permissions.userRoles.some(userRole => {
      const matchesCommunity = userRole.community_id === communityId;
      const matchesRole = role ? userRole.role === role : true;
      return matchesCommunity && matchesRole;
    });
  };

  // Función helper: ¿Puede acceder a esta comunidad?
  const canAccessCommunity = (communityId: string): boolean => {
    if (!user) return false;
    
    // Admin puede ver todas
    if (permissions.isAdmin) return true;
    
    // Manager o Resident de esta comunidad específica
    return hasRoleForCommunity(communityId);
  };

  return {
    ...permissions,
    loading,
    error,
    hasRoleForCommunity,
    canAccessCommunity,
  };
}

// Hook simplificado para casos específicos
export function useIsAdmin(): boolean {
  const { isAdmin, loading } = usePermissions();
  return !loading && isAdmin;
}

export function useCanEditCommunity(communityId?: string): boolean {
  const { canEditCommunity, hasRoleForCommunity, loading } = usePermissions();
  
  if (loading) return false;
  if (canEditCommunity) return true; // Admin global
  if (!communityId) return false;
  
  return hasRoleForCommunity(communityId, 'manager');
}