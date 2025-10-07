/**
 * ARCHIVO: invitations.ts
 * PROPÓSITO: Server actions para gestión de invitaciones de usuarios (user_invitations)
 * ESTADO: development
 * DEPENDENCIAS: Supabase, safe-action
 * OUTPUTS: Actions para invitar managers/residents
 * ACTUALIZADO: 2025-10-04
 */

'use server';

import { actionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { z } from 'zod';
import crypto from 'crypto';
import { sendInvitationEmail, resendInvitationEmail } from '@/lib/email/send-invitation';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const sendInvitationSchema = z.object({
  email: z.string().email(),
  organizationId: z.string().uuid(),
  role: z.enum(['manager', 'resident']),
  communityIds: z.array(z.string().uuid()).optional(),
  customMessage: z.string().optional(),
});

const cancelInvitationSchema = z.object({
  invitationId: z.string().uuid(),
});

const resendInvitationSchema = z.object({
  invitationId: z.string().uuid(),
});

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Enviar una nueva invitación a un manager o resident
 * Solo admins de la organización pueden invitar
 */
export const sendUserInvitationAction = actionClient
  .schema(sendInvitationSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar que el usuario es admin de la organización
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .eq('organization_id', parsedInput.organizationId)
      .eq('role', 'admin')
      .limit(1);

    const userRole = userRoles && userRoles.length > 0 ? userRoles[0] : null;

    if (roleError || !userRole) {
      // También verificar si es owner de la organización
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('owner_id')
        .eq('id', parsedInput.organizationId)
        .eq('owner_id', user.id)
        .single();

      if (orgError || !org) {
        throw new Error('Acceso denegado: solo admins pueden enviar invitaciones');
      }
    }

    // Verificar si ya existe una invitación pendiente con este email
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('id, status')
      .eq('email', parsedInput.email)
      .eq('organization_id', parsedInput.organizationId)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      throw new Error('Ya existe una invitación pendiente para este email');
    }

    // Verificar si el usuario ya está en la organización
    // Primero buscar el user_id por email en la tabla users (mirror de auth.users)
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', parsedInput.email)
      .maybeSingle();

    if (userData) {
      const userDataTyped = userData as any;
      // Si existe el usuario, verificar si ya está en la organización
      const { data: existingUser } = await supabase
        .from('user_roles')
        .select('id, user_id')
        .eq('organization_id', parsedInput.organizationId)
        .eq('user_id', userDataTyped.id)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Este usuario ya pertenece a la organización');
      }
    }

    // Generar token único para la invitación
    const token = crypto.randomBytes(32).toString('hex');

    // Calcular fecha de expiración (7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Crear la invitación
    const { data: newInvitation, error: createError } = await supabase
      .from('user_invitations')
      .insert({
        email: parsedInput.email,
        token: token,
        organization_id: parsedInput.organizationId,
        role: parsedInput.role,
        community_ids: parsedInput.communityIds || [],
        invited_by: user.id,
        custom_message: parsedInput.customMessage,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      } as any)
      .select()
      .single();

    if (createError) {
      throw new Error(`Error al crear invitación: ${createError.message}`);
    }

    // Construir el magic link de invitación
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const invitationLink = `${siteUrl}/auth/accept-invitation?token=${token}`;

    // Obtener nombre de la organización y del invitador
    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', parsedInput.organizationId)
      .single();

    const organizationData = organization as any;

    const { data: inviterData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const inviterTyped = inviterData as any;

    // Enviar email automático con Magic Link de Supabase
    const emailResult = await sendInvitationEmail({
      email: parsedInput.email,
      invitationToken: token,
      organizationName: organizationData?.name || 'la organización',
      role: parsedInput.role,
      inviterName: inviterTyped?.full_name || user.email?.split('@')[0],
      customMessage: parsedInput.customMessage,
    });

    if (!emailResult.success) {
      console.error('⚠️  Error sending email:', emailResult.error);
      // No fallar la invitación si el email falla, pero advertir al usuario
      return {
        success: true,
        invitation: newInvitation,
        invitationLink,
        message: 'Invitación creada. Error al enviar email. Usa el link manual.',
        emailSent: false,
      };
    }

    console.log('✅ Invitation created and email sent to:', parsedInput.email);

    return {
      success: true,
      invitation: newInvitation,
      invitationLink,
      message: 'Invitación enviada correctamente por email',
      emailSent: true,
    };
  });

/**
 * Obtener todas las invitaciones de una organización
 * Solo admins de la organización pueden ver las invitaciones
 */
export const getOrganizationInvitationsAction = actionClient
  .schema(z.object({ organizationId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar permisos
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', parsedInput.organizationId)
      .eq('role', 'admin')
      .single();

    if (roleError || !userRole) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('owner_id')
        .eq('id', parsedInput.organizationId)
        .eq('owner_id', user.id)
        .single();

      if (orgError || !org) {
        throw new Error('Acceso denegado');
      }
    }

    // Obtener invitaciones
    const { data: invitations, error: invitationsError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('organization_id', parsedInput.organizationId)
      .order('created_at', { ascending: false });

    if (invitationsError) {
      throw new Error(`Error al obtener invitaciones: ${invitationsError.message}`);
    }

    const invitationsTyped = (invitations || []) as any[];

    // Calcular estadísticas
    const stats = {
      total: invitationsTyped.length,
      pending: invitationsTyped.filter(i => i.status === 'pending').length,
      accepted: invitationsTyped.filter(i => i.status === 'accepted').length,
      expired: invitationsTyped.filter(i => i.status === 'expired').length,
      cancelled: invitationsTyped.filter(i => i.status === 'cancelled').length,
    };

    return {
      success: true,
      invitations,
      stats,
    };
  });

/**
 * Cancelar una invitación
 */
export const cancelInvitationAction = actionClient
  .schema(cancelInvitationSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener la invitación para verificar permisos
    const { data: invitation, error: getError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('id', parsedInput.invitationId)
      .single();

    if (getError || !invitation) {
      throw new Error('Invitación no encontrada');
    }

    const invitationTyped = invitation as any;

    // Verificar permisos sobre la organización
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', invitationTyped.organization_id)
      .eq('role', 'admin')
      .single();

    if (!userRole && invitationTyped.invited_by !== user.id) {
      throw new Error('Acceso denegado');
    }

    // Usar la función de PostgreSQL
    const { data: result, error: cancelError } = await (supabase.rpc as any)(
      'cancel_user_invitation',
      { invitation_id: parsedInput.invitationId }
    );

    if (cancelError) {
      throw new Error(`Error al cancelar invitación: ${cancelError.message}`);
    }

    if (!result) {
      throw new Error('No se pudo cancelar la invitación');
    }

    return {
      success: true,
      message: 'Invitación cancelada exitosamente',
    };
  });

/**
 * Reenviar una invitación (extiende la fecha de expiración)
 */
export const resendInvitationAction = actionClient
  .schema(resendInvitationSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener la invitación para verificar permisos
    const { data: invitation, error: getError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('id', parsedInput.invitationId)
      .single();

    if (getError || !invitation) {
      throw new Error('Invitación no encontrada');
    }

    const invitationResend = invitation as any;

    // Verificar permisos
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', invitationResend.organization_id)
      .eq('role', 'admin')
      .single();

    if (!userRole && invitationResend.invited_by !== user.id) {
      throw new Error('Acceso denegado');
    }

    // Usar la función de PostgreSQL
    const { data: result, error: resendError } = await (supabase.rpc as any)(
      'resend_user_invitation',
      { invitation_id: parsedInput.invitationId }
    );

    if (resendError) {
      throw new Error(`Error al reenviar invitación: ${resendError.message}`);
    }

    if (!result) {
      throw new Error('No se pudo reenviar la invitación');
    }

    // Reenviar email con Magic Link de Supabase
    const emailResult = await resendInvitationEmail(parsedInput.invitationId);

    if (!emailResult.success) {
      console.error('⚠️  Error resending email:', emailResult.error);
      return {
        success: true,
        message: 'Invitación actualizada pero error al enviar email',
        emailSent: false,
      };
    }

    return {
      success: true,
      message: 'Invitación reenviada correctamente por email',
      emailSent: true,
    };
  });

/**
 * Aceptar una invitación (para la página pública de aceptación)
 */
export const acceptInvitationAction = actionClient
  .schema(z.object({
    token: z.string(),
    userId: z.string().uuid(),
  }))
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();

    // Usar la función de PostgreSQL
    const { data: result, error: acceptError } = await (supabase.rpc as any)(
      'accept_user_invitation',
      {
        invitation_token: parsedInput.token,
        user_id: parsedInput.userId,
      }
    );

    if (acceptError) {
      throw new Error(`Error al aceptar invitación: ${acceptError.message}`);
    }

    if (!result) {
      throw new Error('Token inválido o expirado');
    }

    return {
      success: true,
      message: 'Invitación aceptada. Bienvenido!',
    };
  });
