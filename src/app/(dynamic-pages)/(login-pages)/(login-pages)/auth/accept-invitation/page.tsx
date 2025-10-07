/**
 * ARCHIVO: accept-invitation/page.tsx
 * PROPÓSITO: Server Component para cargar invitaciones usando service_role
 * ESTADO: production
 * DEPENDENCIAS: Supabase service_role, AcceptInvitationClient
 * OUTPUTS: Página de aceptación de invitación con OAuth
 * ACTUALIZADO: 2025-10-06
 */

import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import AcceptInvitationClient from '@/components/auth/AcceptInvitationClient';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  // Validar que existe el token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Invitación no válida</CardTitle>
            <CardDescription className="text-center">
              Token de invitación no proporcionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth?mode=login">
              <Button className="w-full">Ir al inicio de sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Crear cliente admin para bypass RLS (Server Component)
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

  // Cargar invitación usando service_role
  const { data: invitation, error: invError } = await supabaseAdmin
    .from('user_invitations')
    .select(
      `
      id,
      email,
      token,
      organization_id,
      role,
      community_ids,
      status,
      expires_at,
      custom_message,
      created_at,
      organizations (
        name
      )
    `
    )
    .eq('token', token)
    .eq('status', 'pending')
    .maybeSingle();

  // Manejar errores de carga
  if (invError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Invitación no válida</CardTitle>
            <CardDescription className="text-center">
              Invitación no encontrada o ya utilizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth?mode=login">
              <Button className="w-full">Ir al inicio de sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar que no ha expirado
  const expiresAt = new Date(invitation.expires_at);
  if (expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Invitación expirada</CardTitle>
            <CardDescription className="text-center">
              Esta invitación ha caducado. Contacta al administrador para obtener una nueva.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth?mode=login">
              <Button className="w-full">Ir al inicio de sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extraer nombre de organización
  const organizationName =
    (invitation.organizations as any)?.name || 'la organización';

  // Preparar datos para el Client Component
  const invitationData = {
    id: invitation.id,
    email: invitation.email,
    token: invitation.token,
    organization_id: invitation.organization_id,
    role: invitation.role,
    community_ids: invitation.community_ids,
    status: invitation.status,
    expires_at: invitation.expires_at,
    custom_message: invitation.custom_message,
    created_at: invitation.created_at,
  };

  // Renderizar Client Component con los datos cargados
  return (
    <AcceptInvitationClient
      invitation={invitationData}
      organizationName={organizationName}
    />
  );
}
