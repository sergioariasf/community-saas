/**
 * ARCHIVO: request-access/page.tsx
 * PROPÓSITO: Página pública para solicitar acceso como admin
 * ESTADO: production
 * DEPENDENCIAS: createRegistrationRequestAction
 * OUTPUTS: Formulario de solicitud de acceso
 * ACTUALIZADO: 2025-10-06
 */

import { RequestAccessForm } from '@/components/auth/RequestAccessForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Solicitar Acceso | Fazil',
  description: 'Solicita acceso a la plataforma de gestión de comunidades Fazil',
};

export default function RequestAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl font-bold text-center">
            Solicitar Acceso a Fazil
          </CardTitle>
          <CardDescription className="text-center text-base">
            Completa el formulario para solicitar acceso a nuestra plataforma de gestión de comunidades.
            Revisaremos tu solicitud y te contactaremos pronto.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RequestAccessForm />
        </CardContent>

        <div className="px-6 pb-6">
          <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300">
            <h4 className="font-semibold mb-2">¿Qué incluye Fazil?</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Gestión completa de comunidades y propiedades</li>
              <li>Sistema de incidencias con seguimiento</li>
              <li>Gestión documental inteligente con IA</li>
              <li>Portal para residentes</li>
              <li>Reportes y analíticas</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
