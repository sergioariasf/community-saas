/**
 * ARCHIVO: ApproveModal.tsx
 * PROPÓSITO: Modal para aprobar una solicitud de registro
 * ESTADO: production
 * DEPENDENCIAS: approveRegistrationAction
 * OUTPUTS: Modal component
 * ACTUALIZADO: 2025-10-06
 */

'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { approveRegistrationAction } from '@/data/users/registrations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';

type ApproveModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: {
    id: string;
    email: string;
    full_name: string;
    company_name: string;
    estimated_communities: number | null;
  };
  onSuccess: () => void;
};

export function ApproveModal({ open, onOpenChange, registration, onSuccess }: ApproveModalProps) {
  const [subscriptionPlan, setSubscriptionPlan] = useState<'basic' | 'premium' | 'enterprise'>(
    'basic'
  );
  const [maxCommunities, setMaxCommunities] = useState(registration.estimated_communities || 5);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);

  const { execute, status, result } = useAction(approveRegistrationAction, {
    onSuccess: (result) => {
      if (result.data?.invitationCode) {
        setInvitationCode(result.data.invitationCode as string);
      }
    },
    onError: (error) => {
      toast.error('Error al aprobar solicitud');
      console.error(error);
    },
  });

  const handleApprove = () => {
    execute({
      registrationId: registration.id,
      subscriptionPlan,
      maxCommunities,
    });
  };

  const handleCopyCode = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode);
      toast.success('Código copiado al portapapeles');
    }
  };

  const handleClose = () => {
    if (invitationCode) {
      onSuccess();
    }
    onOpenChange(false);
    setInvitationCode(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aprobar Solicitud</DialogTitle>
          <DialogDescription>
            Configura los parámetros de la organización antes de aprobar
          </DialogDescription>
        </DialogHeader>

        {invitationCode ? (
          // Success state
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>

            <Alert className="bg-green-50 border-green-200">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">¡Solicitud aprobada exitosamente!</p>
                  <p className="text-sm">
                    Se ha generado el siguiente código de acceso para{' '}
                    <strong>{registration.email}</strong>:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-green-300 font-mono text-sm">
                      {invitationCode}
                    </code>
                    <Button size="sm" variant="outline" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Envía este código al usuario para que pueda activar su cuenta
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          // Approval form
          <div className="space-y-4 py-4">
            {result?.serverError && (
              <Alert variant="destructive">
                <AlertDescription>{result.serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Input value={registration.company_name} disabled />
            </div>

            <div className="space-y-2">
              <Label>Email de Contacto</Label>
              <Input value={registration.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionPlan">Plan de Suscripción</Label>
              <Select
                value={subscriptionPlan}
                onValueChange={(value: 'basic' | 'premium' | 'enterprise') =>
                  setSubscriptionPlan(value)
                }
                disabled={status === 'executing'}
              >
                <SelectTrigger id="subscriptionPlan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (hasta 5 comunidades)</SelectItem>
                  <SelectItem value="premium">Premium (hasta 20 comunidades)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (ilimitado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCommunities">Máximo de Comunidades</Label>
              <Input
                id="maxCommunities"
                type="number"
                min="1"
                max="1000"
                value={maxCommunities}
                onChange={(e) => setMaxCommunities(parseInt(e.target.value) || 1)}
                disabled={status === 'executing'}
              />
              <p className="text-xs text-gray-500">
                Número máximo de comunidades que puede gestionar esta organización
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {invitationCode ? (
            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={status === 'executing'}
              >
                Cancelar
              </Button>
              <Button onClick={handleApprove} disabled={status === 'executing'}>
                {status === 'executing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aprobando...
                  </>
                ) : (
                  'Aprobar Solicitud'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
