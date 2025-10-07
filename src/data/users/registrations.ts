/**
 * ARCHIVO: registrations.ts
 * PROPÓSITO: Server actions para gestión de solicitudes de registro (pending_registrations)
 * ESTADO: development
 * DEPENDENCIAS: Supabase, safe-action
 * OUTPUTS: Actions para aprobar/rechazar solicitudes
 * ACTUALIZADO: 2025-10-04
 */

'use server';

import { actionClient } from '@/lib/safe-action';
import { createSupabaseClient, createSupabaseServiceClient } from '@/supabase-clients/server';
import { sendApprovalEmail, sendRejectionEmail, sendNewRegistrationNotification } from '@/lib/email/send-registration-notifications';
import { z } from 'zod';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const createRegistrationSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  companyName: z.string().min(2),
  phone: z.string().optional(),
  verticalType: z.enum(['comunidades', 'oficinas', 'otro']).optional(),
  message: z.string().optional(),
  estimatedCommunities: z.number().int().positive().optional(),
});

const approveRegistrationSchema = z.object({
  registrationId: z.string().uuid(),
  subscriptionPlan: z.enum(['basic', 'premium', 'enterprise']).default('basic'),
  maxCommunities: z.number().int().min(1).max(1000).default(5),
});

const rejectRegistrationSchema = z.object({
  registrationId: z.string().uuid(),
  reason: z.string().min(10),
});

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Crear una nueva solicitud de registro
 * Función pública - cualquiera puede solicitar acceso
 */
export const createRegistrationRequestAction = actionClient
  .schema(createRegistrationSchema)
  .action(async ({ parsedInput }) => {
    // Usar service_role client para operaciones públicas que requieren INSERT
    const supabase = createSupabaseServiceClient();

    // Verificar si ya existe una solicitud con este email
    const { data: existingRequest } = await supabase
      .from('pending_registrations')
      .select('id, status')
      .eq('email', parsedInput.email)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new Error('Ya existe una solicitud pendiente con este email');
    }

    // Crear la solicitud
    const { data: newRequest, error: createError } = await supabase
      .from('pending_registrations')
      .insert({
        email: parsedInput.email,
        full_name: parsedInput.fullName,
        company_name: parsedInput.companyName,
        phone: parsedInput.phone,
        vertical_type: parsedInput.verticalType,
        message: parsedInput.message,
        estimated_communities: parsedInput.estimatedCommunities,
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Error al crear solicitud: ${createError.message}`);
    }

    // Enviar email de notificación al super admin (no bloqueante)
    // TODO: Configurar email del super admin en variables de entorno
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'sergioariasf@gmail.com';

    sendNewRegistrationNotification({
      adminEmail,
      requesterEmail: parsedInput.email,
      fullName: parsedInput.fullName,
      companyName: parsedInput.companyName,
      estimatedCommunities: parsedInput.estimatedCommunities,
    }).catch(err => {
      console.error('Error sending admin notification (non-blocking):', err);
    });

    return {
      success: true,
      request: newRequest,
      message: 'Solicitud enviada exitosamente. Te contactaremos pronto.',
    };
  });

/**
 * Obtener todas las solicitudes de registro
 * Solo super admins pueden ver las solicitudes
 */
export const getPendingRegistrationsAction = actionClient
  .action(async () => {
    const authClient = await createSupabaseClient();

    // Verificar que el usuario está autenticado
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // TODO: Restaurar validación de permisos cuando se configure user_roles
    // const { data: userRole, error: roleError } = await authClient
    //   .from('user_roles')
    //   .select('role, organization_id')
    //   .eq('user_id', user.id)
    //   .eq('role', 'super_admin')
    //   .single();

    // if (roleError || !userRole) {
    //   throw new Error('Acceso denegado: requiere rol de super_admin');
    // }

    // Usar service_role para obtener todas las solicitudes sin restricciones RLS
    const supabase = createSupabaseServiceClient();

    // Obtener todas las solicitudes
    const { data: requests, error: requestsError } = await supabase
      .from('pending_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (requestsError) {
      throw new Error(`Error al obtener solicitudes: ${requestsError.message}`);
    }

    const requestsTyped = (requests || []) as any[];

    // Calcular estadísticas
    const stats = {
      total: requestsTyped.length,
      pending: requestsTyped.filter(r => r.status === 'pending').length,
      approved: requestsTyped.filter(r => r.status === 'approved').length,
      rejected: requestsTyped.filter(r => r.status === 'rejected').length,
      expired: requestsTyped.filter(r => r.status === 'expired').length,
    };

    return {
      success: true,
      requests,
      stats,
    };
  });

/**
 * Aprobar una solicitud de registro
 * Genera automáticamente un código de invitación usando la función de BD
 */
export const approveRegistrationAction = actionClient
  .schema(approveRegistrationSchema)
  .action(async ({ parsedInput }) => {
    const authClient = await createSupabaseClient();

    // Verificar que el usuario está autenticado
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // TODO: Restaurar validación de permisos cuando se configure user_roles
    // const { data: userRole, error: roleError } = await authClient
    //   .from('user_roles')
    //   .select('role, organization_id')
    //   .eq('user_id', user.id)
    //   .eq('role', 'super_admin')
    //   .single();

    // if (roleError || !userRole) {
    //   throw new Error('Acceso denegado: requiere rol de super_admin');
    // }

    // Usar service_role para operaciones administrativas
    const supabase = createSupabaseServiceClient();

    // Usar la función de PostgreSQL para aprobar
    const { data: result, error: approveError } = await supabase.rpc(
      'approve_pending_registration',
      {
        registration_id: parsedInput.registrationId,
        approved_by_name: user.email || 'developer',
        subscription_plan: parsedInput.subscriptionPlan,
        max_communities_limit: parsedInput.maxCommunities,
      }
    );

    if (approveError) {
      throw new Error(`Error al aprobar solicitud: ${approveError.message}`);
    }

    // Obtener los detalles de la solicitud aprobada
    const { data: registration } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('id', parsedInput.registrationId)
      .single();

    const registrationTyped = registration as any;

    // Enviar email al solicitante con el código de acceso (no bloqueante)
    if (registrationTyped) {
      sendApprovalEmail({
        email: registrationTyped.email,
        fullName: registrationTyped.full_name,
        companyName: registrationTyped.company_name,
        invitationCode: result,
        subscriptionPlan: parsedInput.subscriptionPlan,
        maxCommunities: parsedInput.maxCommunities,
      }).catch(err => {
        console.error('Error sending approval email (non-blocking):', err);
      });
    }

    return {
      success: true,
      invitationCode: result,
      registration,
      message: 'Solicitud aprobada exitosamente',
    };
  });

/**
 * Rechazar una solicitud de registro
 */
export const rejectRegistrationAction = actionClient
  .schema(rejectRegistrationSchema)
  .action(async ({ parsedInput }) => {
    const authClient = await createSupabaseClient();

    // Verificar que el usuario está autenticado
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // TODO: Restaurar validación de permisos cuando se configure user_roles
    // const { data: userRole, error: roleError } = await authClient
    //   .from('user_roles')
    //   .select('role, organization_id')
    //   .eq('user_id', user.id)
    //   .eq('role', 'super_admin')
    //   .single();

    // if (roleError || !userRole) {
    //   throw new Error('Acceso denegado: requiere rol de super_admin');
    // }

    // Usar service_role para operaciones administrativas
    const supabase = createSupabaseServiceClient();

    // Usar la función de PostgreSQL para rechazar
    const { data: result, error: rejectError } = await supabase.rpc(
      'reject_pending_registration',
      {
        registration_id: parsedInput.registrationId,
        reason: parsedInput.reason,
      }
    );

    if (rejectError) {
      throw new Error(`Error al rechazar solicitud: ${rejectError.message}`);
    }

    if (!result) {
      throw new Error('Solicitud no encontrada o ya fue procesada');
    }

    // Obtener los detalles de la solicitud rechazada
    const { data: registration } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('id', parsedInput.registrationId)
      .single();

    const registrationRejected = registration as any;

    // Enviar email al solicitante informando del rechazo (no bloqueante)
    if (registrationRejected) {
      sendRejectionEmail({
        email: registrationRejected.email,
        fullName: registrationRejected.full_name,
        companyName: registrationRejected.company_name,
        reason: parsedInput.reason,
      }).catch(err => {
        console.error('Error sending rejection email (non-blocking):', err);
      });
    }

    return {
      success: true,
      message: 'Solicitud rechazada',
    };
  });
