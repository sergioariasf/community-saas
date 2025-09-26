/**
 * ARCHIVO: auth/Auth.tsx
 * PROPÓSITO: Componente unificado de autenticación con toggle login/registro
 * ESTADO: development
 * DEPENDENCIAS: Auth components, data/auth/auth, UI components
 * OUTPUTS: Interface de autenticación unificada
 * ACTUALIZADO: 2025-09-16
 */

'use client';
import { Email } from '@/components/Auth/Email';
import { EmailAndPassword } from '@/components/Auth/EmailAndPassword';
import { EmailConfirmationPendingCard } from '@/components/Auth/EmailConfirmationPendingCard';
import { RedirectingPleaseWaitCard } from '@/components/Auth/RedirectingPleaseWaitCard';
import { RenderProviders } from '@/components/Auth/RenderProviders';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  signInWithMagicLinkAction,
  signInWithPasswordAction,
  signInWithProviderAction,
  signUpAction,
} from '@/data/auth/auth';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
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
  const [emailSentSuccessMessage, setEmailSentSuccessMessage] = useState<
    string | null
  >(null);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>(defaultMode);
  const toastRef = useRef<string | number | undefined>(undefined);

  const router = useRouter();

  function redirectToDashboard() {
    if (next) {
      router.push(`/auth/callback?next=${next}`);
    } else {
      router.push('/dashboard');
    }
  }

  const { execute: executeMagicLink, status: magicLinkStatus } = useAction(
    signInWithMagicLinkAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Sending magic link...');
      },
      onSuccess: () => {
        toast.success('A magic link has been sent to your email!', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setEmailSentSuccessMessage('A magic link has been sent to your email!');
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Send magic link failed ${String(error)}`;
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  const { execute: executeSignIn, status: signInStatus } = useAction(
    signInWithPasswordAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Logging in...');
      },
      onSuccess: () => {
        toast.success('Logged in!', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        redirectToDashboard();
        setRedirectInProgress(true);
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Sign in failed ${String(error)}`;
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  const { execute: executeSignUp, status: signUpStatus } = useAction(
    signUpAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Creating account...');
      },
      onSuccess: () => {
        toast.success('Account created! Please check your email for confirmation.', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        setEmailSentSuccessMessage('Please check your email to confirm your account.');
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Sign up failed ${String(error)}`;
        toast.error(errorMessage, {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  const { execute: executeProvider, status: providerStatus } = useAction(
    signInWithProviderAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Requesting login...');
      },
      onSuccess: (payload) => {
        toast.success('Redirecting...', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        window.location.href = payload.data?.url || '/';
      },
      onError: () => {
        toast.error('Failed to login', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  const isLoading = signInStatus === 'executing' || signUpStatus === 'executing';

  return (
    <div
      data-success={emailSentSuccessMessage}
      className="container data-success:flex items-center data-success:justify-center text-left max-w-lg mx-auto overflow-auto data-success:h-full min-h-[470px]"
    >
      {emailSentSuccessMessage ? (
        <EmailConfirmationPendingCard
          type={authMode === 'login' ? 'login' : 'sign-up'}
          heading={authMode === 'login' ? 'Confirmation Link Sent' : 'Account Created'}
          message={emailSentSuccessMessage}
          resetSuccessMessage={setEmailSentSuccessMessage}
        />
      ) : redirectInProgress ? (
        <RedirectingPleaseWaitCard
          message="Please wait while we redirect you to your dashboard."
          heading="Redirecting to Dashboard"
        />
      ) : (
        <div className="space-y-8 bg-background p-6 rounded-lg shadow-sm dark:border">
          {/* Toggle de Login/Registro */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={authMode === 'login' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setAuthMode('login')}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant={authMode === 'register' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setAuthMode('register')}
            >
              Registrarse
            </Button>
          </div>

          <Tabs defaultValue="password" className="md:min-w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              <TabsTrigger value="social-login">Social Login</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>
                    {authMode === 'login' ? 'Iniciar Sesión en Fazil' : 'Crear Cuenta en Fazil'}
                  </CardTitle>
                  <CardDescription>
                    {authMode === 'login'
                      ? 'Ingresa con la cuenta que usaste para registrarte.'
                      : 'Crea una nueva cuenta para gestionar tu comunidad.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <EmailAndPassword
                    isLoading={isLoading}
                    onSubmit={(data) => {
                      if (authMode === 'login') {
                        executeSignIn({
                          email: data.email,
                          password: data.password,
                        });
                      } else {
                        executeSignUp({
                          email: data.email,
                          password: data.password,
                        });
                      }
                    }}
                    view={authMode === 'login' ? 'sign-in' : 'sign-up'}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="magic-link">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>
                    {authMode === 'login' ? 'Iniciar Sesión en Fazil' : 'Crear Cuenta en Fazil'}
                  </CardTitle>
                  <CardDescription>
                    {authMode === 'login'
                      ? 'Recibirás un enlace mágico en tu correo para iniciar sesión.'
                      : 'Recibirás un enlace mágico en tu correo para crear tu cuenta.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <Email
                    onSubmit={(email) => executeMagicLink({ email, next })}
                    isLoading={magicLinkStatus === 'executing'}
                    view={authMode === 'login' ? 'sign-in' : 'sign-up'}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social-login">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>
                    {authMode === 'login' ? 'Iniciar Sesión en Fazil' : 'Crear Cuenta en Fazil'}
                  </CardTitle>
                  <CardDescription>
                    {authMode === 'login'
                      ? 'Inicia sesión con tu cuenta social.'
                      : 'Crea tu cuenta usando tu cuenta social.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <RenderProviders
                    providers={['google', 'github', 'twitter']}
                    isLoading={providerStatus === 'executing'}
                    onProviderLoginRequested={(
                      provider: 'google' | 'github' | 'twitter'
                    ) => executeProvider({ provider, next })}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}