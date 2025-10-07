/**
 * ARCHIVO: send-invitation.ts
 * PROPÓSITO: Enviar emails de invitación usando Magic Links de Supabase
 * ESTADO: development
 * DEPENDENCIAS: Supabase Admin API
 * OUTPUTS: Envío de emails de invitación
 * ACTUALIZADO: 2025-10-05
 */

'use server';

import { createClient } from '@supabase/supabase-js';

/**
 * Envía un email de invitación usando el sistema de Magic Links de Supabase
 *
 * @param email - Email del usuario a invitar
 * @param invitationToken - Token único de la invitación
 * @param organizationName - Nombre de la organización
 * @param role - Rol asignado (manager o resident)
 * @param inviterName - Nombre de quien invita
 * @param customMessage - Mensaje personalizado opcional
 * @returns Promise con el resultado del envío
 */
export async function sendInvitationEmail({
  email,
  invitationToken,
  organizationName,
  role,
  inviterName,
  customMessage,
}: {
  email: string;
  invitationToken: string;
  organizationName: string;
  role: string;
  inviterName?: string;
  customMessage?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Crear cliente admin de Supabase
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

    // Construir el redirect URL con el token de invitación
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const redirectTo = `${siteUrl}/auth/accept-invitation?token=${invitationToken}`;

    // Preparar datos para el template de email
    const emailData = {
      organization_name: organizationName,
      role: role === 'manager' ? 'Gestor' : 'Residente',
      inviter_name: inviterName || 'el administrador',
      custom_message: customMessage || '',
      invitation_link: redirectTo,
    };

    // Enviar Magic Link usando Supabase
    // Supabase enviará un email usando el template configurado en el Dashboard
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: redirectTo,
        data: emailData, // Datos adicionales para el template
      },
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Invitation email sent successfully to:', email);
    console.log('📧 Magic link:', data.properties.action_link);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error sending invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Reenviar un email de invitación existente
 *
 * @param invitationId - ID de la invitación en la base de datos
 * @returns Promise con el resultado del reenvío
 */
export async function resendInvitationEmail(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
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

    // Obtener la invitación
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('user_invitations')
      .select('*, organizations(name), users!invited_by(full_name)')
      .eq('id', invitationId)
      .single();

    if (invError || !invitation) {
      return {
        success: false,
        error: 'Invitación no encontrada',
      };
    }

    // Verificar que la invitación esté pendiente
    if (invitation.status !== 'pending') {
      return {
        success: false,
        error: 'La invitación ya fue aceptada o cancelada',
      };
    }

    // Verificar que no haya expirado
    if (new Date(invitation.expires_at) < new Date()) {
      return {
        success: false,
        error: 'La invitación ha expirado',
      };
    }

    // Reenviar el email
    return await sendInvitationEmail({
      email: invitation.email,
      invitationToken: invitation.token,
      organizationName: invitation.organizations.name,
      role: invitation.role,
      inviterName: invitation.users?.full_name,
      customMessage: invitation.custom_message,
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
