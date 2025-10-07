/**
 * ARCHIVO: AcceptInvitationClient.tsx
 * PROPÓSITO: Client Component para manejar botones OAuth de invitaciones
 * ESTADO: production
 * DEPENDENCIAS: Supabase Auth
 * OUTPUTS: Botones OAuth para aceptar invitaciones
 * ACTUALIZADO: 2025-10-06
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/supabase-clients/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2 } from 'lucide-react';

interface AcceptInvitationClientProps {
  invitation: {
    id: string;
    email: string;
    token: string;
    organization_id: string;
    role: string;
    community_ids: string[] | null;
    status: string;
    expires_at: string;
    custom_message: string | null;
    created_at: string;
  };
  organizationName: string;
}

export default function AcceptInvitationClient({
  invitation,
  organizationName,
}: AcceptInvitationClientProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAcceptWithGoogle = async () => {
    setProcessing(true);
    try {
      const supabase = createClient();

      // Guardar el token en sessionStorage para usarlo después del OAuth
      if (invitation.token) {
        sessionStorage.setItem('invitation_token', invitation.token);
      }

      // Iniciar OAuth con Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?invitation_token=${invitation.token}`,
        },
      });

      if (error) {
        setError(`Error al iniciar sesión: ${error.message}`);
        setProcessing(false);
      }
    } catch (err) {
      setError('Error al procesar la invitación');
      setProcessing(false);
    }
  };

  const handleAcceptWithMicrosoft = async () => {
    setProcessing(true);
    try {
      const supabase = createClient();

      // Guardar el token en sessionStorage
      if (invitation.token) {
        sessionStorage.setItem('invitation_token', invitation.token);
      }

      // Iniciar OAuth con Microsoft (Azure)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?invitation_token=${invitation.token}`,
          scopes: 'email',
        },
      });

      if (error) {
        setError(`Error al iniciar sesión: ${error.message}`);
        setProcessing(false);
      }
    } catch (err) {
      setError('Error al procesar la invitación');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-center">Invitación a unirse</CardTitle>
          <CardDescription className="text-center">
            Has sido invitado a unirte a <strong>{organizationName}</strong> como{' '}
            <strong>{invitation.role === 'manager' ? 'Manager' : 'Residente'}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {invitation.custom_message && (
            <Alert>
              <AlertDescription>
                <strong>Mensaje personalizado:</strong>
                <p className="mt-1">{invitation.custom_message}</p>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              Para aceptar esta invitación, inicia sesión con:
            </p>

            <Button
              onClick={handleAcceptWithGoogle}
              disabled={processing}
              className="w-full"
              variant="outline"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuar con Google
            </Button>

            <Button
              onClick={handleAcceptWithMicrosoft}
              disabled={processing}
              className="w-full"
              variant="outline"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z" />
                  <path fill="#00a4ef" d="M13 1h10v10H13z" />
                  <path fill="#7fba00" d="M1 13h10v10H1z" />
                  <path fill="#ffb900" d="M13 13h10v10H13z" />
                </svg>
              )}
              Continuar con Microsoft
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Esta invitación expira el{' '}
            {new Date(invitation.expires_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
