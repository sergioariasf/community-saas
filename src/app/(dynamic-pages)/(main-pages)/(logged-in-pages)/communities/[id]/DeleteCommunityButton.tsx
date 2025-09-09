'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useRef, useState, type JSX } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteCommunityAction } from '@/data/anon/communities';

type DeleteCommunityButtonProps = {
  communityId: string;
  communityName: string;
};

export const DeleteCommunityButton = ({
  communityId,
  communityName,
}: DeleteCommunityButtonProps): JSX.Element => {
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);

  const { execute, status } = useAction(deleteCommunityAction, {
    onExecute: () => {
      toastRef.current = toast.loading('Eliminando comunidad...');
    },
    onSuccess: () => {
      toast.success('Comunidad eliminada exitosamente', { id: toastRef.current });
      toastRef.current = undefined;
      router.refresh();
      setShowAlert(false);
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? 'Error al eliminar la comunidad';
      toast.error(errorMessage, { id: toastRef.current });
      toastRef.current = undefined;
      setShowAlert(false);
    },
  });

  const handleDelete = () => {
    execute({ id: communityId });
  };

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        className="flex items-center gap-1"
        onClick={() => setShowAlert(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la 
              comunidad <strong>"{communityName}"</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={status === 'executing'}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={status === 'executing'}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            >
              {status === 'executing' ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};