/**
 * ARCHIVO: admin/pending-registrations/page.tsx
 * PROPÓSITO: Panel de administración para revisar solicitudes de registro
 * ESTADO: production
 * DEPENDENCIAS: getPendingRegistrationsAction
 * OUTPUTS: Lista de solicitudes pendientes
 * ACTUALIZADO: 2025-10-06
 */

import { PendingRegistrationsList } from '@/components/admin/PendingRegistrationsList';

export const metadata = {
  title: 'Solicitudes Pendientes | Admin',
  description: 'Panel de administración para revisar solicitudes de registro',
};

export default function PendingRegistrationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Solicitudes de Registro</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Revisa y aprueba las solicitudes de acceso a la plataforma
        </p>
      </div>

      <PendingRegistrationsList />
    </div>
  );
}
