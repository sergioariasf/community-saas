'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteUserAction } from '@/data/anon/users';
import { toast } from 'sonner';

interface DeleteUserButtonProps {
  userId: string;
  userEmail: string;
}

export const DeleteUserButton = ({ userId, userEmail }: DeleteUserButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteUserAction({ userId });
        toast.success(`Usuario ${userEmail} eliminado correctamente`);
        setIsOpen(false);
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(
          error instanceof Error 
            ? error.message 
            : 'Error al eliminar usuario'
        );
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              ¿Estás seguro de que quieres eliminar el usuario{' '}
              <span className="font-semibold">{userEmail}</span>?
            </p>
            <p className="text-red-600 text-sm font-medium">
              ⚠️ Esta acción no se puede deshacer. Se eliminarán:
            </p>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• El usuario del sistema de autenticación</li>
              <li>• Todos los roles asignados</li>
              <li>• El acceso a todas las comunidades</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Usuario
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};