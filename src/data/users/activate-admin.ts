/**
 * ARCHIVO: activate-admin.ts
 * PROPÓSITO: Server actions para activar nuevos admins con código de invitación
 * ESTADO: production
 * DEPENDENCIAS: Supabase, safe-action
 * OUTPUTS: Actions para activar admin y crear organización
 * ACTUALIZADO: 2025-10-06
 */

'use server';

import { actionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const activateAdminSchema = z.object({
  invitationCode: z.string().min(1),
});

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Activar admin con código de invitación
 * Crea la organización y asigna el rol de admin al usuario
 * Se ejecuta después de que el usuario complete el OAuth
 */
export const activateAdminWithCodeAction = actionClient
  .schema(activateAdminSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    // Verificar que el usuario está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado. Por favor inicia sesión primero.');
    }

    // Verificar que el código de invitación es válido
    const { data: invitation, error: invError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('invitation_code', parsedInput.invitationCode)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (invError || !invitation) {
      throw new Error('Código de invitación inválido o expirado');
    }

    const invitationData = invitation as any;

    // Verificar que el usuario no tiene ya una organización
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();

    if (existingRole) {
      throw new Error('Este usuario ya pertenece a una organización');
    }

    // Crear la organización con los datos pre-configurados
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: invitationData.organization_name,
        subscription_plan: invitationData.subscription_plan,
        max_communities: invitationData.max_communities,
        max_users_per_community: invitationData.max_users_per_community,
        approval_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      } as any)
      .select()
      .single();

    if (orgError) {
      throw new Error(`Error al crear organización: ${orgError.message}`);
    }

    const newOrgData = newOrg as any;

    // Asegurar que el usuario existe en la tabla users
    const { error: userInsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      } as any, {
        onConflict: 'id',
      });

    if (userInsertError) {
      console.error('Error al crear/actualizar usuario:', userInsertError);
      // No lanzamos error aquí porque no es crítico
    }

    // Asignar rol de admin al usuario (admin de toda la organización)
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        organization_id: newOrgData.id,
        role: 'admin',
        community_id: null, // null significa admin de toda la organización
      } as any);

    if (roleError) {
      // Si falla, intentamos eliminar la organización para mantener consistencia
      await supabase
        .from('organizations')
        .delete()
        .eq('id', newOrgData.id);

      throw new Error(`Error al asignar rol de admin: ${roleError.message}`);
    }

    // Marcar el código de invitación como usado usando service_role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error: updateError } = await supabaseAdmin
      .from('organization_invitations')
      .update({
        status: 'used',
        used_by_user_id: user.id,
        used_at: new Date().toISOString(),
        created_organization_id: newOrgData.id,
      })
      .eq('id', invitationData.id);

    if (updateError) {
      console.error('Error al marcar invitación como usada:', updateError);
      // No lanzamos error porque la organización ya fue creada
    }

    return {
      success: true,
      organization: newOrg,
      message: '¡Bienvenido! Tu organización ha sido creada exitosamente',
    };
  });

/**
 * Obtener información de una invitación sin activarla
 * Para mostrar en la UI de confirmación antes del OAuth
 */
export const getInvitationInfoAction = actionClient
  .schema(z.object({ code: z.string() }))
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .select('organization_name, subscription_plan, max_communities, expires_at, status')
      .eq('invitation_code', parsedInput.code)
      .single();

    if (error || !invitation) {
      return {
        success: false,
        valid: false,
        message: 'Código de invitación no encontrado',
      };
    }

    const invitationData = invitation as any;

    // Verificar si está expirado
    if (new Date(invitationData.expires_at) < new Date()) {
      return {
        success: false,
        valid: false,
        message: 'Este código de invitación ha expirado',
      };
    }

    // Verificar si ya fue usado
    if (invitationData.status !== 'pending') {
      return {
        success: false,
        valid: false,
        message: 'Este código ya fue utilizado',
      };
    }

    return {
      success: true,
      valid: true,
      invitation: {
        organizationName: invitationData.organization_name,
        subscriptionPlan: invitationData.subscription_plan,
        maxCommunities: invitationData.max_communities,
        expiresAt: invitationData.expires_at,
      },
    };
  });
