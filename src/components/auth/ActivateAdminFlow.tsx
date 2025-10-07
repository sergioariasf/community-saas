/**
 * ARCHIVO: ActivateAdminFlow.tsx
 * PROPÓSITO: Flujo completo de activación de admin con código + OAuth
 * ESTADO: production
 * DEPENDENCIAS: getInvitationInfoAction, activateAdminWithCodeAction, signInWithProviderAction
 * OUTPUTS: Multi-step activation flow
 * ACTUALIZADO: 2025-10-06
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { getInvitationInfoAction, activateAdminWithCodeAction } from '@/data/users/activate-admin';
import { signInWithProviderAction } from '@/data/auth/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { RenderProviders } from '@/components/Auth/RenderProviders';
import { toast } from 'sonner';

type ActivateAdminFlowProps = {
  initialCode?: string;
};

type InvitationInfo = {
  organizationName: string;
  subscriptionPlan: string;
  maxCommunities: number;
  expiresAt: string;
};

export function ActivateAdminFlow({ initialCode }: ActivateAdminFlowProps) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode || '');
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
  const [step, setStep] = useState<'code' | 'oauth' | 'activating' | 'success'>('code');

  // Verify invitation code
  const {
    execute: verifyCode,
    status: verifyStatus,
    result: verifyResult,
  } = useAction(getInvitationInfoAction, {
    onSuccess: (result) => {
      if (result.data?.valid && result.data.invitation) {
        setInvitationInfo(result.data.invitation);
        setStep('oauth');
      }
    },
  });

  // OAuth sign in
  const { execute: executeOAuth, status: oauthStatus } = useAction(signInWithProviderAction, {
    onSuccess: (result) => {
      if (result.data?.url) {
        // Save code for after OAuth callback
        sessionStorage.setItem('activation_code', code);
        window.location.href = result.data.url;
      }
    },
    onError: () => {
      toast.error('Error al iniciar sesión con OAuth');
    },
  });

  // Activate admin (after OAuth)
  const {
    execute: activateAdmin,
    status: activateStatus,
    result: activateResult,
  } = useAction(activateAdminWithCodeAction, {
    onSuccess: () => {
      setStep('success');
      sessionStorage.removeItem('activation_code');
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    },
    onError: (error) => {
      toast.error('Error al activar cuenta');
      setStep('code');
    },
  });

  // Check if user just completed OAuth
  useEffect(() => {
    const savedCode = sessionStorage.getItem('activation_code');
    if (savedCode) {
      setCode(savedCode);
      setStep('activating');
      activateAdmin({ invitationCode: savedCode });
    }
  }, []);

  const handleVerifyCode = () => {
    if (!code) {
      toast.error('Por favor ingresa un código de invitación');
      return;
    }
    verifyCode({ code });
  };

  const handleOAuthClick = (provider: 'google' | 'azure') => {
    executeOAuth({ provider });
  };

  // Step 1: Enter code
  if (step === 'code') {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Activar Cuenta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu código de invitación para comenzar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {verifyResult?.data && !verifyResult.data.valid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verifyResult.data.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Código de Invitación</Label>
            <Input
              id="code"
              placeholder="ADM-XXXXXXXXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={verifyStatus === 'executing'}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Ingresa el código que recibiste por email
            </p>
          </div>

          <Button
            onClick={handleVerifyCode}
            className="w-full"
            size="lg"
            disabled={verifyStatus === 'executing' || !code}
          >
            {verifyStatus === 'executing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar Código'
            )}
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>¿No tienes un código?</p>
            <a href="/request-access" className="text-blue-600 hover:underline">
              Solicitar acceso a la plataforma
            </a>
          </div>
        </CardContent>
      </>
    );
  }

  // Step 2: OAuth selection
  if (step === 'oauth' && invitationInfo) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Selecciona tu método de autenticación preferido
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Info */}
          <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-semibold">
              <Building2 className="h-5 w-5" />
              {invitationInfo.organizationName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p>
                Plan: <span className="font-medium">{invitationInfo.subscriptionPlan}</span>
              </p>
              <p>
                Máximo de comunidades:{' '}
                <span className="font-medium">{invitationInfo.maxCommunities}</span>
              </p>
            </div>
          </div>

          {/* OAuth Providers */}
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-600">
              Inicia sesión para crear tu organización
            </p>

            <RenderProviders
              providers={['google', 'azure']}
              isLoading={oauthStatus === 'executing'}
              onProviderLoginRequested={handleOAuthClick}
            />
          </div>

          <Button variant="outline" onClick={() => setStep('code')} className="w-full">
            Volver
          </Button>
        </CardContent>
      </>
    );
  }

  // Step 3: Activating
  if (step === 'activating') {
    return (
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <h3 className="text-xl font-semibold">Creando tu organización...</h3>
          <p className="text-gray-600 text-center">
            Estamos configurando todo para ti. Esto solo tomará un momento.
          </p>
        </div>
      </CardContent>
    );
  }

  // Step 4: Success
  if (step === 'success') {
    return (
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h3 className="text-2xl font-bold">¡Bienvenido a Fazil!</h3>
          <p className="text-gray-600">
            Tu cuenta ha sido activada exitosamente. Serás redirigido al dashboard en unos
            segundos...
          </p>
          <Button onClick={() => router.push('/dashboard')}>Ir al Dashboard Ahora</Button>
        </div>
      </CardContent>
    );
  }

  return null;
}
