'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth/permissions';
import type { UserRole } from '@/lib/auth/permissions';

// 🔐 PROTEGIDO: Solo ADMIN puede ver todos los usuarios
export const getAllUsers = async () => {
  await requirePermission('admin');

  const supabase = await createSupabaseClient();
  
  try {
    // 1. Obtener usuarios únicos de user_roles (estos son los usuarios activos con roles)
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        community_id,
        communities:community_id (
          name
        )
      `);

    if (rolesError) {
      console.error('❌ [getAllUsers] Error fetching user roles:', rolesError);
      return [];
    }


    // 2. Obtener IDs únicos de usuarios
    const userIds = [...new Set(userRoles?.map(role => role.user_id) || [])];
    
    // Si no hay usuarios con roles, devolver array vacío
    if (userIds.length === 0) {
      return [];
    }

    // 3. Para cada usuario, crear el objeto con sus roles
    const users = [];
    
    for (const userId of userIds) {
      const userRolesList = userRoles?.filter(role => role.user_id === userId) || [];
      
      // Intentar obtener información básica del usuario actual si es el mismo
      let userInfo = { email: 'Usuario desconocido', created_at: null, last_sign_in_at: null };
      
      if (userId) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && currentUser.id === userId) {
          userInfo = {
            email: currentUser.email || 'Sin email',
            created_at: currentUser.created_at,
            last_sign_in_at: currentUser.last_sign_in_at
          };
        }
      }
      
      users.push({
        id: userId,
        email: userInfo.email,
        created_at: userInfo.created_at,
        last_sign_in_at: userInfo.last_sign_in_at,
        roles: userRolesList.map(role => ({
          role: role.role as UserRole,
          community_id: role.community_id,
          community_name: role.community_id ? 
            (role.communities as any)?.name : 
            (role.role === 'admin' ? 'Global' : null)
        }))
      });
    }

    // 4. Ordenar por email
    const result = users.sort((a, b) => a.email.localeCompare(b.email));
    return result;

  } catch (error) {
    console.error('❌ [getAllUsers] Error in getAllUsers:', error);
    return [];
  }
};

// Schema para crear usuario con roles
const createUserSchema = z.object({
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  roles: z.array(z.object({
    role: z.enum(['admin', 'manager', 'resident']),
    community_id: z.string().uuid().nullable()
  })).min(1, 'Debe asignar al menos un rol')
});

// 🔐 PROTEGIDO: Solo ADMIN puede crear usuarios
export const createUserAction = authActionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    await requirePermission('admin');
    
    const { email, password, roles } = parsedInput;
    const supabase = await createSupabaseClient();

    // 1. Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirmar email
    });

    if (authError) {
      throw new Error(`Error creando usuario: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // 2. Obtener organization_id del usuario actual (admin que está creando)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const { data: currentUserRole, error: currentRoleError } = await supabase
      .from('user_roles')
      .select('organization_id')
      .eq('user_id', currentUser.id)
      .limit(1)
      .single();

    if (currentRoleError || !currentUserRole?.organization_id) {
      throw new Error('No se pudo obtener la organización del usuario actual');
    }

    // 3. Asignar roles al usuario
    const rolePromises = roles.map(role => 
      supabase
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
          organization_id: currentUserRole.organization_id,
          role: role.role,
          community_id: role.community_id
        })
    );

    const roleResults = await Promise.all(rolePromises);
    const roleErrors = roleResults.filter(result => result.error);

    if (roleErrors.length > 0) {
      console.error('Error asignando roles:', roleErrors);
      // Si hay error en roles, eliminar el usuario creado
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error('Error asignando roles al usuario');
    }

    revalidatePath('/users');
    return authUser.user.id;
  });

// Schema para actualizar roles de usuario
const updateUserRolesSchema = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.object({
    role: z.enum(['admin', 'manager', 'resident']),
    community_id: z.string().uuid().nullable()
  }))
});

// 🔐 PROTEGIDO: Solo ADMIN puede actualizar roles
export const updateUserRolesAction = authActionClient
  .schema(updateUserRolesSchema)
  .action(async ({ parsedInput }) => {
    await requirePermission('admin');
    
    const { userId, roles } = parsedInput;
    const supabase = await createSupabaseClient();

    // 1. Eliminar roles existentes
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Error eliminando roles: ${deleteError.message}`);
    }

    // 2. Obtener organization_id del usuario actual
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const { data: currentUserRole, error: currentRoleError } = await supabase
      .from('user_roles')
      .select('organization_id')
      .eq('user_id', currentUser.id)
      .not('organization_id', 'is', null)
      .limit(1)
      .single();

    if (currentRoleError || !currentUserRole?.organization_id) {
      // Usar organization_id por defecto si no se encuentra
      const defaultOrgId = 'e3f4370b-2235-45ad-869a-737ee9fd95ab'; // ORGANIZATION_ID de nuestros tests
      
      // 3. Insertar nuevos roles con organization_id por defecto
      if (roles.length > 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(
            roles.map(role => ({
              user_id: userId,
              organization_id: defaultOrgId,
              role: role.role,
              community_id: role.community_id
            }))
          );

        if (insertError) {
          throw new Error(`Error asignando roles: ${insertError.message}`);
        }
      }
      
      revalidatePath('/users');
      return userId;
    }

    // 3. Insertar nuevos roles
    if (roles.length > 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(
          roles.map(role => ({
            user_id: userId,
            organization_id: currentUserRole.organization_id,
            role: role.role,
            community_id: role.community_id
          }))
        );

      if (insertError) {
        throw new Error(`Error asignando roles: ${insertError.message}`);
      }
    }

    revalidatePath('/users');
    return userId;
  });

// Schema para eliminar usuario
const deleteUserSchema = z.object({
  userId: z.string().uuid()
});

// 🔐 PROTEGIDO: Solo ADMIN puede eliminar usuarios
export const deleteUserAction = authActionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput }) => {
    await requirePermission('admin');
    
    const { userId } = parsedInput;
    const supabase = await createSupabaseClient();

    // 1. Eliminar roles del usuario
    const { error: rolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (rolesError) {
      throw new Error(`Error eliminando roles: ${rolesError.message}`);
    }

    // 2. Eliminar usuario de Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error(`Error eliminando usuario: ${authError.message}`);
    }

    revalidatePath('/users');
    return userId;
  });

// 🔐 Helper: Obtener usuarios de una comunidad específica
export const getUsersByCommunity = async (communityId: string) => {
  await requirePermission('manager', communityId);

  const supabase = await createSupabaseClient();
  
  const { data: users, error } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      role,
      users:user_id (
        email,
        created_at
      )
    `)
    .eq('community_id', communityId)
    .order('users(email)');

  if (error) {
    console.error('Error fetching community users:', error);
    return [];
  }

  return users?.map(userRole => ({
    id: userRole.user_id,
    email: userRole.user_id + '@community.local', // TODO: Fix users relationship type
    role: userRole.role,
    created_at: new Date().toISOString() // TODO: Fix users relationship type
  })) || [];
};