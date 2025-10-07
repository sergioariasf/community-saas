/**
 * ARCHIVO: auth/Auth.tsx
 * PROPÓSITO: Componente de autenticación solo con OAuth (Google y Microsoft)
 * ESTADO: production
 * DEPENDENCIAS: RenderProviders, signInWithProviderAction
 * OUTPUTS: Interface de autenticación OAuth únicamente
 * ACTUALIZADO: 2025-10-06
 */

'use client';
import { RedirectingPleaseWaitCard } from '@/components/Auth/RedirectingPleaseWaitCard';
import { RenderProviders } from '@/components/Auth/RenderProviders';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signInWithProviderAction } from '@/data/auth/auth';
import { useAction } from 'next-safe-action/hooks';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export function Auth({
  next,
  nextActionType,
  defaultMode = 'login',
}: {
  next?: string;
  nextActionType?: string;
  defaultMode?: 'login' | 'register';
}) {
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute: executeProvider, status: providerStatus } = useAction(
    signInWithProviderAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Redirigiendo a la autenticación...');
      },
      onSuccess: (payload) => {
        toast.success('Redirigiendo...', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setRedirectInProgress(true);
        window.location.href = payload.data?.url || '/';
      },
      onError: () => {
        toast.error('Error al iniciar sesión', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      {redirectInProgress ? (
        <RedirectingPleaseWaitCard
          message="Por favor espera mientras te redirigimos."
          heading="Redirigiendo"
        />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {defaultMode === 'login' ? 'Iniciar Sesión en Fazil' : 'Crear Cuenta en Fazil'}
            </CardTitle>
            <CardDescription className="text-center">
              {defaultMode === 'login'
                ? 'Inicia sesión con tu cuenta de Google o Microsoft'
                : 'Crea tu cuenta usando Google o Microsoft'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RenderProviders
              providers={['google', 'azure']}
              isLoading={providerStatus === 'executing'}
              onProviderLoginRequested={(provider: 'google' | 'azure') =>
                executeProvider({ provider, next })
              }
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Autenticación segura con OAuth 2.0
                </span>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
