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

  const supabase = createSupabaseClient();
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

    const supabaseClient = createSupabaseClient();
    const { data, error } = await supabaseClient
      .from('communities')
      .insert(parsedInput)
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

    const supabaseClient = createSupabaseClient();
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

    const supabaseClient = createSupabaseClient();
    const { error } = await supabaseClient
      .from('communities')
      .delete()
      .match({ id });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/communities');
  });
