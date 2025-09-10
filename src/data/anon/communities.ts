'use server'; // ← Indica que este código SOLO corre en el servidor
import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { Table } from '@/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission, getAccessibleCommunities } from '@/lib/auth/permissions';

// 🔐 PROTEGIDO: Solo usuarios con permisos pueden ver comunidades
export const getAllCommunities = async (): Promise<
  Array<Table<'communities'>>
> => {
  // Usar función que respeta permisos en lugar de query directa
  return await getAccessibleCommunities();
};

// 🔐 PROTEGIDO: Verificar acceso a comunidad específica
export const getCommunity = async (
  id: string
): Promise<Table<'communities'>> => {
  // Verificar que el usuario puede acceder a esta comunidad
  await requirePermission('resident', id);

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const insertCommunitySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  admin_contact: z.string().email('Debe ser un email válido').optional(),
  max_units: z.number().int().min(1).default(100),
});

const updateCommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  admin_contact: z.string().email('Debe ser un email válido').optional(),
  max_units: z.number().int().min(1).default(100),
});

export const insertCommunityAction = authActionClient
  .schema(insertCommunitySchema)
  .action(async ({ parsedInput }) => {
    // 🔐 Solo ADMIN puede crear comunidades
    await requirePermission('admin');

    const supabaseClient = await createSupabaseClient();
    
    // Get user's organization_id from user_roles
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (roleError || !userRole?.organization_id) {
      throw new Error('User has no organization assigned');
    }

    // Include organization_id in the insert
    const { data, error } = await supabaseClient
      .from('communities')
      .insert({
        ...parsedInput,
        organization_id: userRole.organization_id
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/communities');
    return data.id;
  });

export const updateCommunityAction = authActionClient
  .schema(updateCommunitySchema)
  .action(async ({ parsedInput }) => {
    const { id, ...updateData } = parsedInput;
    
    // 🔐 Solo ADMIN o MANAGER de esta comunidad puede editar
    await requirePermission('manager', id);

    const supabaseClient = await createSupabaseClient();
    const { data, error } = await supabaseClient
      .from('communities')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/communities');
    revalidatePath(`/communities/${id}`);
    return data.id;
  });

const deleteCommunitySchema = z.object({
  id: z.string().uuid(),
});

export const deleteCommunityAction = authActionClient
  .schema(deleteCommunitySchema)
  .action(async ({ parsedInput: { id } }) => {
    // 🔐 Solo ADMIN puede eliminar comunidades (operación crítica)
    await requirePermission('admin');

    const supabaseClient = await createSupabaseClient();
    const { error } = await supabaseClient
      .from('communities')
      .delete()
      .match({ id });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/communities');
  });

// 🔐 PROTEGIDO: Obtener comunidades del usuario actual
export async function getUserCommunities() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        communities:community_id (
          id,
          name
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user communities:', error);
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const communities = (data as any)
      .map((item: any) => item.communities)
      .filter(Boolean)
      .map((community: any) => ({
        id: community.id,
        name: community.name
      }));

    return { success: true, data: communities };
  } catch (error) {
    console.error('Error in getUserCommunities:', error);
    return { success: false, error: 'Failed to fetch user communities' };
  }
}

// 🔐 PROTEGIDO: Obtener usuarios de una comunidad específica
export async function getCommunityUsers(communityId: string) {
  try {
    // Verificar que el usuario puede acceder a esta comunidad
    await requirePermission('resident', communityId);

    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role,
        user_id,
        auth_users:user_id (
          id,
          email
        )
      `)
      .eq('community_id', communityId);

    if (error) {
      console.error('Error fetching community users:', error);
      throw error;
    }

    const users = data
      .filter(item => item.auth_users)
      .map(item => ({
        id: item.auth_users.id,
        email: item.auth_users.email,
        role: item.role
      }));

    return { success: true, data: users };
  } catch (error) {
    console.error('Error in getCommunityUsers:', error);
    return { success: false, error: 'Failed to fetch community users' };
  }
}
