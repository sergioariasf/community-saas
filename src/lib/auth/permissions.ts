'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'manager' | 'resident';

export interface UserPermissions {
  userId: string;
  roles: Array<{
    role: UserRole;
    community_id: string | null;
    community_name?: string;
  }>;
  isAdmin: boolean;
  isManager: boolean;
  isResident: boolean;
}

// 🔐 Obtener permisos del usuario actual (server-side)
export async function getCurrentUserPermissions(): Promise<UserPermissions | null> {
  const supabase = createSupabaseClient();
  
  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  // Obtener roles del usuario
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
    console.error('Error fetching user roles:', rolesError);
    return null;
  }

  const roles = userRoles || [];
  const isAdmin = roles.some(r => r.role === 'admin');
  const isManager = roles.some(r => r.role === 'manager');
  const isResident = roles.some(r => r.role === 'resident');

  return {
    userId: user.id,
    roles: roles.map(role => ({
      role: role.role as UserRole,
      community_id: role.community_id,
      community_name: role.communities?.name,
    })),
    isAdmin,
    isManager,
    isResident,
  };
}

// 🛡️ Verificar si el usuario tiene permiso específico
export async function hasPermission(
  requiredRole: UserRole,
  communityId?: string
): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  
  if (!permissions) return false;

  // Admin siempre tiene acceso
  if (permissions.isAdmin) return true;

  // Verificar rol específico
  if (requiredRole === 'manager') {
    return permissions.roles.some(role => 
      role.role === 'manager' && 
      (!communityId || role.community_id === communityId)
    );
  }

  if (requiredRole === 'resident') {
    return permissions.roles.some(role => 
      (role.role === 'manager' || role.role === 'resident') &&
      (!communityId || role.community_id === communityId)
    );
  }

  return false;
}

// 🚨 Require: El usuario DEBE tener este permiso o se redirige
export async function requirePermission(
  requiredRole: UserRole,
  communityId?: string,
  redirectTo: string = '/dashboard'
): Promise<UserPermissions> {
  const permissions = await getCurrentUserPermissions();
  
  if (!permissions) {
    redirect('/login');
  }

  const hasAccess = await hasPermission(requiredRole, communityId);
  
  if (!hasAccess) {
    // Si no tiene acceso, redirigir con mensaje de error
    redirect(`${redirectTo}?error=insufficient_permissions`);
  }

  return permissions;
}

// 🔑 Verificar acceso a una comunidad específica
export async function canAccessCommunity(communityId: string): Promise<boolean> {
  const permissions = await getCurrentUserPermissions();
  
  if (!permissions) return false;
  if (permissions.isAdmin) return true; // Admin ve todo

  // Manager o Resident de esta comunidad específica
  return permissions.roles.some(role => 
    role.community_id === communityId &&
    (role.role === 'manager' || role.role === 'resident')
  );
}


// 📊 Helper: Obtener comunidades accesibles para el usuario actual
export async function getAccessibleCommunities() {
  const permissions = await getCurrentUserPermissions();
  
  if (!permissions) return [];

  const supabase = createSupabaseClient();

  // Admin ve todas las comunidades
  if (permissions.isAdmin) {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('name');
    
    return error ? [] : (data || []);
  }

  // Manager/Resident solo ve sus comunidades asignadas
  const communityIds = permissions.roles
    .map(role => role.community_id)
    .filter(id => id !== null) as string[];

  if (communityIds.length === 0) return [];

  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .in('id', communityIds)
    .order('name');
  
  return error ? [] : (data || []);
}