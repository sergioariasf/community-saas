/**
 * ARCHIVO: send-registration-notifications.ts
 * PROPÓSITO: Enviar emails de notificación para solicitudes de registro (aprobación/rechazo)
 * ESTADO: production
 * DEPENDENCIAS: Supabase Admin API
 * OUTPUTS: Envío de emails de notificación
 * ACTUALIZADO: 2025-10-06
 */

'use server';

import { createClient } from '@supabase/supabase-js';

/**
 * Envía un email cuando una solicitud es aprobada con el código de invitación
 */
export async function sendApprovalEmail({
  email,
  fullName,
  companyName,
  invitationCode,
  subscriptionPlan,
  maxCommunities,
}: {
  email: string;
  fullName: string;
  companyName: string;
  invitationCode: string;
  subscriptionPlan: string;
  maxCommunities: number;
}): Promise<{ success: boolean; error?: string }> {
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const activationUrl = `${siteUrl}/auth/activate-admin?code=${invitationCode}`;

    // Enviar Magic Link OTP (funciona aunque el usuario ya exista)
    const { data, error } = await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: activationUrl,
        data: {
          email_type: 'approval',
          full_name: fullName,
          company_name: companyName,
          invitation_code: invitationCode,
          subscription_plan: subscriptionPlan,
          max_communities: maxCommunities,
          role: 'Administrador',
          organization_name: companyName,
        },
      },
    });

    if (error) {
      console.error('❌ Error sending approval email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Approval email sent successfully to:', email);
    console.log('📧 Activation link:', activationUrl);
    console.log('🔑 Invitation code:', invitationCode);

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Unexpected error sending approval email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Envía un email cuando una solicitud es rechazada
 */
export async function sendRejectionEmail({
  email,
  fullName,
  companyName,
  reason,
}: {
  email: string;
  fullName: string;
  companyName: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const requestAccessUrl = `${siteUrl}/request-access`;

    // Preparar el contenido del email
    const emailData = {
      full_name: fullName,
      company_name: companyName,
      rejection_reason: reason,
      request_access_url: requestAccessUrl,
    };

    // Enviar Magic Link con los datos del template
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: requestAccessUrl,
        data: emailData,
      },
    });

    if (error) {
      console.error('❌ Error sending rejection email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Rejection email sent successfully to:', email);
    console.log('📧 Request access URL:', requestAccessUrl);

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Unexpected error sending rejection email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Envía un email de notificación al super admin cuando hay una nueva solicitud
 * NOTA: Esta función envía un Magic Link al admin para login rápido
 */
export async function sendNewRegistrationNotification({
  adminEmail,
  requesterEmail,
  fullName,
  companyName,
  estimatedCommunities,
}: {
  adminEmail: string;
  requesterEmail: string;
  fullName: string;
  companyName: string;
  estimatedCommunities?: number;
}): Promise<{ success: boolean; error?: string }> {
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const reviewUrl = `${siteUrl}/admin/pending-registrations`;

    // Enviar Magic Link OTP para que el admin pueda acceder rápidamente
    const { data, error } = await supabaseAdmin.auth.signInWithOtp({
      email: adminEmail,
      options: {
        emailRedirectTo: reviewUrl,
        data: {
          email_type: 'admin_notification',
          requester_email: requesterEmail,
          full_name: fullName,
          company_name: companyName,
          estimated_communities: estimatedCommunities || 'No especificado',
        },
      },
    });

    if (error) {
      console.error('❌ Error sending admin notification:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('✅ Admin notification sent successfully to:', adminEmail);
    console.log('📧 Review URL:', reviewUrl);

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Unexpected error sending admin notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
