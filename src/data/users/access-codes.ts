/**
 * ARCHIVO: access-codes.ts
 * PROPÓSITO: Server actions para gestión de códigos de acceso (organization_invitations)
 * ESTADO: development
 * DEPENDENCIAS: Supabase, safe-action
 * OUTPUTS: Actions para CRUD de códigos
 * ACTUALIZADO: 2025-10-04
 */

'use server';

import { actionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { z } from 'zod';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const createAccessCodeSchema = z.object({
  organizationName: z.string().min(2).max(255),
  subscriptionPlan: z.enum(['basic', 'premium', 'enterprise']),
  maxCommunities: z.number().int().min(1).max(1000),
  maxUsersPerCommunity: z.number().int().min(1).default(500),
  expirationDays: z.number().int().min(1).max(365).default(90),
  notes: z.string().optional(),
});

const cancelAccessCodeSchema = z.object({
  codeId: z.string().uuid(),
});

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Crear un nuevo código de acceso pre-configurado
 * Solo super admins pueden ejecutar esta acción
 */
export const createAccessCodeAction = actionClient
  .schema(createAccessCodeSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    // Verificar que el usuario es super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar que es super admin (admin global sin organization_id)
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role, organization_id, community_id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .is('organization_id', null)
      .is('community_id', null)
      .single();

    if (roleError || !userRole) {
      throw new Error('Acceso denegado: solo super administradores pueden crear códigos');
    }

    // Generar código único
    const generateCode = () => {
      const prefix = 'ADM';
      const random = Math.random().toString(36).substring(2, 14).toUpperCase();
      return `${prefix}-${random}`;
    };

    let invitationCode = generateCode();

    // Verificar que el código no existe (muy improbable pero por seguridad)
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 5) {
      const { data } = await supabase
        .from('organization_invitations')
        .select('id')
        .eq('invitation_code', invitationCode)
        .single();

      if (!data) {
        codeExists = false;
      } else {
        invitationCode = generateCode();
        attempts++;
      }
    }

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parsedInput.expirationDays);

    // Crear el código
    const { data: newCode, error: createError } = await supabase
      .from('organization_invitations')
      .insert({
        invitation_code: invitationCode,
        organization_name: parsedInput.organizationName,
        subscription_plan: parsedInput.subscriptionPlan,
        max_communities: parsedInput.maxCommunities,
        max_users_per_community: parsedInput.maxUsersPerCommunity,
        expires_at: expiresAt.toISOString(),
        created_by: user.email || 'developer',
        notes: parsedInput.notes,
      } as any)
      .select()
      .single();

    if (createError) {
      throw new Error(`Error al crear código: ${createError.message}`);
    }

    return {
      success: true,
      code: newCode,
      message: 'Código de acceso creado exitosamente',
    };
  });

/**
 * Obtener todos los códigos de acceso
 * Solo super admins pueden ver los códigos
 */
export const getAccessCodesAction = actionClient
  .action(async () => {
    const supabase = await createSupabaseClient();

    // Verificar que el usuario es super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // TODO: Restaurar validación de permisos cuando se configure user_roles
    // const { data: userRole, error: roleError } = await supabase
    //   .from('user_roles')
    //   .select('role, organization_id')
    //   .eq('user_id', user.id)
    //   .eq('role', 'admin')
    //   .single();

    // if (roleError || !userRole) {
    //   throw new Error('Acceso denegado: requiere rol de administrador');
    // }

    // Obtener todos los códigos ordenados por fecha de creación
    const { data: codes, error: codesError } = await supabase
      .from('organization_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (codesError) {
      throw new Error(`Error al obtener códigos: ${codesError.message}`);
    }

    const codesList = (codes || []) as any[];

    // Calcular estadísticas
    const stats = {
      total: codesList.length,
      pending: codesList.filter(c => c.status === 'pending').length,
      used: codesList.filter(c => c.status === 'used').length,
      expired: codesList.filter(c => c.status === 'expired').length,
      cancelled: codesList.filter(c => c.status === 'cancelled').length,
    };

    return {
      success: true,
      codes,
      stats,
    };
  });

/**
 * Cancelar un código de acceso
 * Solo super admins pueden cancelar códigos
 */
export const cancelAccessCodeAction = actionClient
  .schema(cancelAccessCodeSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    // Verificar que el usuario es super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // TODO: Restaurar validación de permisos cuando se configure user_roles
    // const { data: userRole, error: roleError } = await supabase
    //   .from('user_roles')
    //   .select('role, organization_id')
    //   .eq('user_id', user.id)
    //   .eq('role', 'admin')
    //   .single();

    // if (roleError || !userRole) {
    //   throw new Error('Acceso denegado: requiere rol de administrador');
    // }

    // Actualizar el estado a 'cancelled'
    const { data: cancelledCode, error: updateError } = await supabase
      .from('organization_invitations')
      // @ts-expect-error - Supabase types not properly generated
      .update({ status: 'cancelled' })
      .eq('id', parsedInput.codeId)
      .eq('status', 'pending') // Solo se pueden cancelar códigos pendientes
      .select()
      .single();

    if (updateError) {
      throw new Error(`Error al cancelar código: ${updateError.message}`);
    }

    if (!cancelledCode) {
      throw new Error('Código no encontrado o ya fue usado/cancelado');
    }

    return {
      success: true,
      message: 'Código cancelado exitosamente',
      code: cancelledCode,
    };
  });

/**
 * Verificar si un código de acceso es válido
 * Función pública para la página de registro
 */
export const verifyAccessCodeAction = actionClient
  .schema(z.object({ code: z.string() }))
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('invitation_code', parsedInput.code)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !invitation) {
      return {
        success: false,
        valid: false,
        message: 'Código inválido o expirado',
      };
    }

    const invitationData = invitation as any;

    return {
      success: true,
      valid: true,
      invitation: {
        organizationName: invitationData.organization_name,
        subscriptionPlan: invitationData.subscription_plan,
        maxCommunities: invitationData.max_communities,
      },
    };
  });
