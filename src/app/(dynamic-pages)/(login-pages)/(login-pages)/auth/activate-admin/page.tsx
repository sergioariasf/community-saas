/**
 * ARCHIVO: activate-admin/page.tsx
 * PROPÓSITO: Página para activar administradores con código de invitación
 * ESTADO: production
 * DEPENDENCIAS: getInvitationInfoAction, activateAdminWithCodeAction
 * OUTPUTS: Flujo de activación con OAuth
 * ACTUALIZADO: 2025-10-06
 */

import { ActivateAdminFlow } from '@/components/auth/ActivateAdminFlow';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Activar Cuenta de Administrador | Fazil',
  description: 'Activa tu cuenta de administrador usando tu código de invitación',
};

interface PageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function ActivateAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialCode = params.code;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <ActivateAdminFlow initialCode={initialCode} />
      </Card>
    </div>
  );
}
