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

  const supabase = createSupabaseClient();
  
  try {
    // 1. Intentar obtener TODOS los usuarios de auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      
      // FALLBACK: Crear un usuario de prueba con tu información
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return [{
          id: user.id,
          email: user.email || 'Sin email',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          roles: [] // Sin roles por ahora
        }];
      }
      
      return [];
    }

    // 2. Obtener todos los roles de usuarios
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
      console.error('Error fetching user roles:', rolesError);
      return [];
    }

    // 3. Combinar datos: usuarios + roles
    const users = authUsers.users.map(user => {
      const roles = userRoles?.filter(role => role.user_id === user.id) || [];
      
      return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        roles: roles.map(role => ({
          role: role.role,
          community_id: role.community_id,
          community_name: role.communities?.name
        }))
      };
    });

    // 4. Ordenar por email
    return users.sort((a, b) => a.email.localeCompare(b.email));

  } catch (error) {
    console.error('Error in getAllUsers:', error);
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
    const supabase = createSupabaseClient();

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

    // 2. Asignar roles al usuario
    const rolePromises = roles.map(role => 
      supabase
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
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
    const supabase = createSupabaseClient();

    // 1. Eliminar roles existentes
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Error eliminando roles: ${deleteError.message}`);
    }

    // 2. Insertar nuevos roles
    if (roles.length > 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(
          roles.map(role => ({
            user_id: userId,
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
    const supabase = createSupabaseClient();

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

  const supabase = createSupabaseClient();
  
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
    email: userRole.users?.email,
    role: userRole.role,
    created_at: userRole.users?.created_at
  })) || [];
};