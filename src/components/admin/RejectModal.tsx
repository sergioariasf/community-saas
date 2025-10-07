/**
 * ARCHIVO: RejectModal.tsx
 * PROPÓSITO: Modal para rechazar una solicitud de registro
 * ESTADO: production
 * DEPENDENCIAS: rejectRegistrationAction
 * OUTPUTS: Modal component
 * ACTUALIZADO: 2025-10-06
 */

'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { rejectRegistrationAction } from '@/data/users/registrations';
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type RejectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: {
    id: string;
    email: string;
    full_name: string;
    company_name: string;
  };
  onSuccess: () => void;
};

export function RejectModal({ open, onOpenChange, registration, onSuccess }: RejectModalProps) {
  const [reason, setReason] = useState('');

  const { execute, status, result } = useAction(rejectRegistrationAction, {
    onSuccess: () => {
      toast.success('Solicitud rechazada');
      onSuccess();
      onOpenChange(false);
      setReason('');
    },
    onError: (error) => {
      toast.error('Error al rechazar solicitud');
      console.error(error);
    },
  });

  const handleReject = () => {
    if (reason.length < 10) {
      toast.error('Por favor proporciona una razón detallada (mínimo 10 caracteres)');
      return;
    }

    execute({
      registrationId: registration.id,
      reason,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rechazar Solicitud</DialogTitle>
          <DialogDescription>
            Proporciona una razón para rechazar esta solicitud. Esto ayudará al usuario a entender
            por qué su solicitud no fue aprobada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {result?.serverError && (
            <Alert variant="destructive">
              <AlertDescription>{result.serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Empresa</Label>
            <div className="text-sm font-medium">{registration.company_name}</div>
          </div>

          <div className="space-y-2">
            <Label>Contacto</Label>
            <div className="text-sm">
              {registration.full_name} ({registration.email})
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Razón del Rechazo <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ej: La empresa no cumple con los requisitos mínimos para usar la plataforma..."
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={status === 'executing'}
            />
            <p className="text-xs text-gray-500">
              Mínimo 10 caracteres. Esta razón se guardará para referencia interna.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={status === 'executing'}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={status === 'executing' || reason.length < 10}
          >
            {status === 'executing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rechazando...
              </>
            ) : (
              'Rechazar Solicitud'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
